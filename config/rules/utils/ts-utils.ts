import * as Lint from 'tslint';
import * as ts from 'typescript';
import {
  addSyntheticLeadingComment,
  BinaryExpression,
  CallExpression,
  createCall,
  createSourceFile,
  createSpread,
  createSuper,
  EmitHint,
  Expression,
  ExpressionStatement,
  isBinaryExpression,
  isCallExpression,
  isExpressionStatement,
  isPropertyAccessExpression,
  Node,
  PropertyAccessExpression,
  ScriptTarget,
  Statement,
  SyntaxKind,
} from 'typescript';

export function toText(node: ts.Node): string {
  const sourceFile = ts.createSourceFile('no-name.js', '', ScriptTarget.ES2015);
  return ts.createPrinter().printNode(EmitHint.Unspecified, node, sourceFile);
}

export function toFunctionDeclaration(decl: ts.VariableDeclaration): string {
  const fn = decl.initializer as ts.FunctionExpression;
  const name = decl.name;
  return fn.getText().replace(/^function\b\s*/, `function ${name.getText()}`);
}

export function isInstanceMember(expression: PropertyAccessExpression, className: string): boolean {
  return expression.parent && expression.parent.getText() === 'prototype' &&
      expression.parent.parent && expression.parent.parent.getText() === className;
}

export function isStaticMember(expression: PropertyAccessExpression, className: string): boolean {
  return expression.parent && expression.parent.getText() === className;
}

export function isGlobalMember(expression: PropertyAccessExpression, className: string): boolean {
  return !expression.parent;
}

export function copyJsDoc(from: Node, to: Node): void {
  const comments = (from as any).jsDoc || [];
  comments.forEach(comment => addSyntheticLeadingComment(to, SyntaxKind.MultiLineCommentTrivia, `*\n${comment.comment}\n`, true));
}

export function parseScript<T extends Node>(script: string): T {
  const sourceFile = createSourceFile('anonymous.js', script, ScriptTarget.ES2015);
  const statement = sourceFile.statements[0];
  if (isExpressionStatement(statement)) {
    return statement.expression as any as T;
  } else {
    return statement as any as T;
  }
}

export function cloneNode<T extends Node>(body?: T): T {
  return parseScript<T>(body!.getFullText());
}

export function removeNode(node: Node): Lint.Replacement {
  return new Lint.Replacement(node.getFullStart(), node.getFullWidth(), '');
}

export function getMembers(statements: readonly Statement[], className: string): BinaryExpression[] {
  return statements
      .filter(it => isExpressionStatement(it))
      .map(it => (it as ExpressionStatement).expression)
      .filter(it => isBinaryExpression(it))
      .map(it => it as BinaryExpression)
      .filter(it => isPropertyAccessExpression(it.left))
      .filter(it => !isGlobalMember(it.left as PropertyAccessExpression, className))
      .filter(it => !!it)
      .map(it => it!);
}

export const superCallPattern = /^(\w+)\.(call|apply)$/;

export function findEs5SuperCalls(statements: readonly Statement[]): CallExpression[] {
  return statements
      .filter(it => isExpressionStatement(it))
      .map(it => it as ExpressionStatement)
      .map(it => it.expression)
      .filter(it => isCallExpression(it))
      .map(it => it as CallExpression)
      .filter(it => superCallPattern.test(it.expression.getText()))
      .filter(it => it.arguments[0].kind === SyntaxKind.ThisKeyword);
}

const expArrayFromArguments = parseScript<Expression>('Array.from(arguments)');

export function createTsSuperCall(fn: CallExpression): CallExpression {
  const restArgs = fn.arguments.slice(1).map(it => {
    if (it.getText() === 'arguments') {
      return createSpread(expArrayFromArguments);
    } else {
      return it;
    }
  });
  return createCall(createSuper(), [], restArgs);
}
