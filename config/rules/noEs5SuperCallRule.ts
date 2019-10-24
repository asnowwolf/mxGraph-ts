import * as Lint from 'tslint';
import { WalkContext } from 'tslint';
import { ClassDeclaration, ConstructorDeclaration, forEachChild, SourceFile, SyntaxKind } from 'typescript';
import { createTsSuperCall, findEs5SuperCalls, toText } from './utils/ts-utils';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

function walk(ctx: WalkContext): void {
  forEachChild(ctx.sourceFile, (node) => {
    if (node.kind === SyntaxKind.ClassDeclaration) {
      const cls = node as ClassDeclaration;
      const constructor = cls.members.filter(it => it.kind === SyntaxKind.Constructor)[0] as ConstructorDeclaration;
      if (constructor && constructor.body) {
        const es5SuperCall = findEs5SuperCalls(constructor.body.statements)[0];
        if (es5SuperCall) {
          const superCall = createTsSuperCall(es5SuperCall);
          ctx.addFailureAtNode(es5SuperCall, 'ES5 super class call', [
            new Lint.Replacement(es5SuperCall.getStart(), es5SuperCall.getWidth(), toText(superCall)),
          ]);
        }
      }
    }
  });
}

