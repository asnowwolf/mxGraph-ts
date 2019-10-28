import * as Lint from 'tslint';
import { forEachChild, isClassDeclaration, SourceFile } from 'typescript';
import {
  findExtendCalls,
  getConstructorAssignments,
  getMembers,
  getPrototypeAssignments,
  removeNode,
} from './utils/ts-utils';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

function walk(ctx: Lint.WalkContext): void {
  forEachChild(ctx.sourceFile, (node) => {
    const statements = ctx.sourceFile.statements;
    statements.forEach(statement => {
      if (isClassDeclaration(statement) && statement.name) {
        const className = statement.name.text;
        [
          ...getConstructorAssignments(statements, className),
          ...getPrototypeAssignments(statements, className),
          ...getMembers(statements, className),
          ...findExtendCalls(statements, className),
        ].forEach(it => ctx.addFailureAtNode(it, 'ES5 member removed', [removeNode(it)]));
      }
    });
  });
}
