import * as Lint from 'tslint';
import {
  addSyntheticLeadingComment,
  BinaryExpression,
  BindingName,
  createClassDeclaration,
  createConstructor,
  createMethod,
  createModifiersFromModifierFlags,
  createProperty,
  createSourceFile,
  Expression,
  ExpressionStatement,
  forEachChild,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  MethodDeclaration,
  ModifierFlags,
  Node,
  PropertyAccessExpression,
  PropertyDeclaration,
  ScriptTarget,
  SourceFile,
  SyntaxKind,
  VariableStatement,
} from 'typescript';
import { isGlobalMember, isStaticMember, toText } from './utils/ts-utils';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

function copyJsDoc(from: Node, to: Node): void {
  const comments = (from as any).jsDoc || [];
  comments.forEach(comment => addSyntheticLeadingComment(to, SyntaxKind.MultiLineCommentTrivia, `*\n${comment.comment}\n`, true));
}

function parseText<T extends Node>(fullText: string): T {
  const sourceFile = createSourceFile('anonymous.js', fullText, ScriptTarget.ES2015);
  const statement = sourceFile.statements[0];
  if (statement.kind === SyntaxKind.ExpressionStatement) {
    return (statement as ExpressionStatement).expression as any as T;
  } else {
    return statement as any as T;
  }
}

function cloneNode<T extends Node>(body?: T): T {
  return parseText<T>(body!.getFullText());
}

function functionToMethod(expression: BinaryExpression, className: string): MethodDeclaration | undefined {
  const left = expression.left as PropertyAccessExpression;
  const right = expression.right as FunctionExpression;
  if (isGlobalMember(left, className)) {
    return;
  }

  const modifierFlags = isStaticMember(left, className) ? ModifierFlags.Static : ModifierFlags.None;
  const method = createMethod(undefined, createModifiersFromModifierFlags(modifierFlags), undefined, left.name.text, undefined, undefined, right.parameters, undefined, cloneNode(right.body));
  copyJsDoc(expression.parent, method);
  return method;
}

function initializerToProperty(expression: BinaryExpression, className: string): PropertyDeclaration | undefined {
  const left = expression.left as PropertyAccessExpression;
  const right = expression.right as Expression;
  if (isGlobalMember(left, className)) {
    return;
  }
  const modifierFlags = isStaticMember(left, className) ? ModifierFlags.Static : ModifierFlags.None;
  const property = createProperty(undefined, createModifiersFromModifierFlags(modifierFlags), left.name.text, undefined, undefined, cloneNode(right));
  copyJsDoc(expression.parent, property);
  return property;
}

function generateClass(node: FunctionDeclaration | FunctionExpression, name: string): string {
  const members = node.getSourceFile().statements.map(statement => {
    if (statement.kind === SyntaxKind.ExpressionStatement) {
      const expression = (statement as ExpressionStatement).expression;
      if (expression.kind === SyntaxKind.BinaryExpression) {
        const { left, right } = expression as BinaryExpression;
        if (left.kind === SyntaxKind.PropertyAccessExpression) {
          if (right.kind === SyntaxKind.FunctionExpression) {
            return functionToMethod(expression as BinaryExpression, name);
          } else {
            return initializerToProperty(expression as BinaryExpression, name);
          }
        }
      }
    }
  }).filter(it => !!it).map(it => it!);
  const constructor = createConstructor(undefined, undefined, node.parameters, cloneNode(node.body));
  copyJsDoc(node, constructor);
  const cls = createClassDeclaration(undefined, createModifiersFromModifierFlags(ModifierFlags.Export), name, undefined, undefined, [constructor, ...members]);
  return toText(cls);
}

function isClassName(name?: Identifier | BindingName): boolean {
  return !!name && /^(mx)?[A-Z]\w+$/.test(name.getText());
}

function walk(ctx: Lint.WalkContext): void {
  forEachChild(ctx.sourceFile, (node) => {
    // 一旦碰到符合特征的函数表达式，则将其移除并改写为相应的 es6 形式
    // 一旦碰到符合特征的 .prototype.xxx = function 表达式，则将其添加到相应的 es6 类中作为方法
    // 一旦碰到符合特征的 .xxx = function 表达式，则将其添加到相应的 es6 类中作为静态方法
    // 找到所有对未声明的 this.xxx 属性的赋值，则将其作为属性添加到相应的 es6 类中
    switch (node.kind) {
      case SyntaxKind.VariableStatement:
        const n = node as VariableStatement;
        const decl = n.declarationList.declarations[0];
        if (decl && decl.initializer && decl.initializer.kind === SyntaxKind.FunctionExpression) {
          if (isClassName(decl.name)) {
            const fn = decl.initializer as FunctionExpression;
            const fix = [
              new Lint.Replacement(node.getStart(), node.getEnd() - node.getStart(), generateClass(fn, decl.name.getText())),
            ];
            ctx.addFailureAtNode(node, `ES5 class - ${decl.name.getText()}`, fix);
          }
        }
        break;
      case SyntaxKind.FunctionDeclaration:
        const fn = (node as FunctionDeclaration);
        if (!fn.name) {
          return;
        }
        const fix = [
          new Lint.Replacement(node.getStart(), node.getEnd() - node.getStart(), generateClass(fn, fn.name.text)),
        ];
        if (isClassName(fn.name)) {
          ctx.addFailureAtNode(node, `ES5 class - ${fn.name.getText()}`, fix);
        }
        break;
      case SyntaxKind.ExpressionStatement:
        const statement = node as ExpressionStatement;
        if (statement.expression.kind) {
          const assign = statement.expression as BinaryExpression;
          if (!assign.right) {
            return;
          }
          if (assign.left.kind === SyntaxKind.PropertyAccessExpression) {
            const left = assign.left as PropertyAccessExpression;
            if (!left.name) {
              return;
            }
            const removeIt = [
              new Lint.Replacement(node.getFullStart(), node.getFullWidth(), ''),
            ];

            if (assign.right.kind === SyntaxKind.FunctionDeclaration || assign.right.kind === SyntaxKind.FunctionExpression) {
              ctx.addFailureAtNode(assign, `ES5 method - ${left.name.text}`, removeIt);
            } else {
              ctx.addFailureAtNode(assign, `ES5 property - ${left.name.text}`, removeIt);
            }
          }
        }
        break;
      default:
        // console.debug('Unprocessed node kind: ', node.kind);
    }
  });
}
