import * as Lint from 'tslint';
import * as ts from 'typescript';
import { isFunctionExpression, isVariableStatement } from 'typescript';
import { toFunctionDeclaration } from './utils/ts-utils';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

function walk(ctx: Lint.WalkContext): void {
  ts.forEachChild(ctx.sourceFile, (node) => {
    if (isVariableStatement(node)) {
      const decl = node.declarationList.declarations[0];
      if (decl && isFunctionExpression(decl.initializer)) {
        const fix = [
          new Lint.Replacement(node.getStart(), node.getEnd() - node.getStart(), toFunctionDeclaration(decl)),
        ];
        ctx.addFailureAtNode(node, `ES5 class - ${decl.name.getText()}`, fix);
      }
    }
  });
}
