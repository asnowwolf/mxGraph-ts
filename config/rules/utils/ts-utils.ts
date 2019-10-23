import * as ts from 'typescript';
import { EmitHint, PropertyAccessExpression, ScriptTarget } from 'typescript';

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
