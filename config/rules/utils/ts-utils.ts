import * as ts from 'typescript';
import { EmitHint, ScriptTarget } from 'typescript';

export function toText(node: ts.Node): string {
  const sourceFile = ts.createSourceFile('no-name.js', '', ScriptTarget.ES2015);
  return ts.createPrinter().printNode(EmitHint.Unspecified, node, sourceFile);
}

export function toFunctionDeclaration(name: ts.BindingName, fn: ts.FunctionExpression): string {
  const functionDecl = ts.createFunctionDeclaration(fn.decorators, fn.modifiers, fn.asteriskToken, name.getText(), fn.typeParameters, fn.parameters, fn.type, fn.body);
  return toText(functionDecl);
}
