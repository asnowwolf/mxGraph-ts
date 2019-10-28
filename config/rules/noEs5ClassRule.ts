import * as Lint from 'tslint';
import {
  BinaryExpression,
  BindingName,
  ClassElement,
  createClassDeclaration,
  createConstructor,
  createExpressionWithTypeArguments,
  createHeritageClause,
  createIdentifier,
  createMethod,
  createModifiersFromModifierFlags,
  createProperty,
  Expression,
  forEachChild,
  FunctionDeclaration,
  FunctionExpression,
  HeritageClause,
  Identifier,
  isBinaryExpression,
  isExpressionStatement,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isNewExpression,
  isVariableStatement,
  MethodDeclaration,
  ModifierFlags,
  PropertyAccessExpression,
  PropertyDeclaration,
  SourceFile,
  Statement,
  SyntaxKind,
} from 'typescript';
import {
  cloneNode,
  copyJsDoc,
  findEs5SuperCalls,
  findExtendCalls,
  getMembers,
  getPrototypeAssignments,
  isStaticMember,
  superCallPattern,
  toText,
} from './utils/ts-utils';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walkForClass);
  }
}

function walkForClass(ctx: Lint.WalkContext): void {
  forEachChild(ctx.sourceFile, (node) => {
    // 一旦碰到符合特征的函数表达式，则将其移除并改写为相应的 es6 形式
    // 一旦碰到符合特征的 .prototype.xxx = function 表达式，则将其添加到相应的 es6 类中作为方法
    // 一旦碰到符合特征的 .xxx = function 表达式，则将其添加到相应的 es6 类中作为静态方法
    // 找到所有对未声明的 this.xxx 属性的赋值，则将其作为属性添加到相应的 es6 类中
    if (isVariableStatement(node)) {
      const decl = node.declarationList.declarations[0];
      if (decl && decl.initializer && isFunctionExpression(decl.initializer)) {
        if (isClassName(decl.name)) {
          const fix = [
            new Lint.Replacement(node.getStart(), node.getWidth(), generateClass(decl.initializer, decl.name.getText(), ctx)),
          ];
          ctx.addFailureAtNode(node, `ES5 class - ${decl.name.getText()}`, fix);
        }
      }
    } else if (isExpressionStatement(node)) {
      const expression = node.expression;
      if (isBinaryExpression(expression) && expression.operatorToken.kind === SyntaxKind.EqualsToken) {
        const left = expression.left as Identifier;
        if (isIdentifier(left) && isClassName(left)) {
          const body = expression.right;
          if (isFunctionExpression(body)) {
            const name = left.text;
            const fix = [
              new Lint.Replacement(node.getStart(), node.getWidth(), generateClass(body, name, ctx)),
            ];
            ctx.addFailureAtNode(node, `ES5 class - ${name}`, fix);
          }
        }
      }
    } else if (isFunctionDeclaration(node)) {
      if (!node.name) {
        return;
      }
      const fix = [
        new Lint.Replacement(node.getStart(), node.getWidth(), generateClass(node, node.name.text, ctx)),
      ];
      if (isClassName(node.name)) {
        ctx.addFailureAtNode(node, `ES5 class - ${node.name.getText()}`, fix);
      }
    } else {
      // console.debug('Unprocessed node kind: ', node.kind);
    }
  });
}

function generateClass(node: FunctionDeclaration | FunctionExpression, className: string, ctx: Lint.WalkContext): string {
  const statements = node.getSourceFile().statements;
  const members = generateMembers(statements, className);
  const constructor = createConstructor(undefined, undefined, node.parameters, cloneNode(node.body));
  copyJsDoc(node, constructor);
  const cls = createClassDeclaration(undefined, createModifiersFromModifierFlags(ModifierFlags.Export), className, undefined, getHeritageClauses(node), [constructor, ...members]);
  return toText(cls);
}

function generateMember(it: BinaryExpression, className: string): ClassElement {
  if (isFunctionExpression(it.right)) {
    return functionToMethod(it, className);
  } else {
    return assignmentToProperty(it, className);
  }
}

function generateMembers(statements: readonly Statement[], className: string): ClassElement[] {
  return getMembers(statements, className)
      .filter(it => !new RegExp(`^${className}\.prototype(\.constructor)?$`).test(it.left.getText()))
      .map(it => generateMember(it, className));
}

function functionToMethod(expression: BinaryExpression, className: string): MethodDeclaration {
  const left = expression.left as PropertyAccessExpression;
  const right = expression.right as FunctionExpression;
  const modifierFlags = isStaticMember(left, className) ? ModifierFlags.Static : ModifierFlags.None;
  const method = createMethod(undefined, createModifiersFromModifierFlags(modifierFlags), undefined, left.name.text, undefined, undefined, right.parameters, undefined, cloneNode(right.body));
  copyJsDoc(expression.parent, method);
  return method;
}

function assignmentToProperty(expression: BinaryExpression, className: string): PropertyDeclaration {
  const left = expression.left as PropertyAccessExpression;
  const right = expression.right as Expression;
  const modifierFlags = isStaticMember(left, className) ? ModifierFlags.Static : ModifierFlags.None;
  const property = createProperty(undefined, createModifiersFromModifierFlags(modifierFlags), left.name.text, undefined, undefined, cloneNode(right));
  copyJsDoc(expression.parent, property);
  return property;
}

function findByExtend(statements: readonly Statement[], className: string): string | undefined {
  const calls = findExtendCalls(statements, className);
  if (!calls.length) {
    return;
  }
  const lastCall = calls[calls.length - 1];
  return lastCall.arguments[1].getText();
}

function findNameBySuperCall(statements: readonly Statement[]): string | undefined {
  const calls = findEs5SuperCalls(statements)
      .map(it => it.expression.getText().match(superCallPattern))
      .filter(it => !!it)
      .map(it => it![1]);
  return calls[0];
}

function findPrototype(statements: readonly Statement[], className: string): string | undefined {
  const assignments = getPrototypeAssignments(statements, className);
  if (assignments.length) {
    const right = assignments[assignments.length - 1].right;
    if (isNewExpression(right)) {
      return right.expression.getText();
    }
  }
}

function getHeritageClauses(node: FunctionDeclaration | FunctionExpression): HeritageClause[] | undefined {
  if (!node.name || !node.body) {
    return;
  }
  const className = node.name.text;
  const sourceFile = node.getSourceFile();
  const name = findByExtend(sourceFile.statements, className) ||
      findPrototype(sourceFile.statements, className) ||
      findNameBySuperCall(node.body.statements);
  if (!name) {
    return;
  }
  return [createHeritageClause(SyntaxKind.ExtendsKeyword, [createExpressionWithTypeArguments(undefined, createIdentifier(name))])];
}

function isClassName(name?: Identifier | BindingName): boolean {
  return !!name && /^(mx)?[A-Z]\w+$/.test(name.getText());
}
