import * as Lint from 'tslint';
import * as ts from 'typescript';
import { toFunctionDeclaration } from './utils/ts-utils';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

function walk(ctx: Lint.WalkContext): void {
  ts.forEachChild(ctx.sourceFile, (node) => {
    if (node.kind === ts.SyntaxKind.VariableStatement) {
      const statement = node as ts.VariableStatement;
      const decl = statement.declarationList.declarations[0];
      if (decl && decl.initializer && decl.initializer.kind === ts.SyntaxKind.FunctionExpression) {
        const fn = decl.initializer as ts.FunctionExpression;
        const fix = [
          new Lint.Replacement(node.getStart(), node.getEnd() - node.getStart(), toFunctionDeclaration(decl.name, fn)),
        ];
        ctx.addFailureAtNode(node, `ES5 class - ${decl.name.getText()}`, fix);
      }
    }
  });
}
