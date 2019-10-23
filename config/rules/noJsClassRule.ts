import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

function generateClass(node: ts.FunctionDeclaration | ts.FunctionExpression): string {
  return node.getText();
}

function isClassName(name?: ts.Identifier | ts.BindingName): boolean {
  return !!name && /^(mx)?[A-Z]\w+$/.test(name.getText());
}

function walk(ctx: Lint.WalkContext): void {
  ts.forEachChild(ctx.sourceFile, (node) => {
    // 一旦碰到符合特征的函数表达式，则将其移除并改写为相应的 es6 形式
    // 一旦碰到符合特征的 .prototype.xxx = function 表达式，则将其添加到相应的 es6 类中作为方法
    // 一旦碰到符合特征的 .xxx = function 表达式，则将其添加到相应的 es6 类中作为静态方法
    // 找到所有对未声明的 this.xxx 属性的赋值，则将其作为属性添加到相应的 es6 类中
    switch (node.kind) {
      case ts.SyntaxKind.VariableStatement:
        const n = node as ts.VariableStatement;
        const decl = n.declarationList.declarations[0];
        if (decl && decl.initializer && decl.initializer.kind === ts.SyntaxKind.FunctionExpression) {
          if (isClassName(decl.name)) {
            const fn = decl.initializer as ts.FunctionExpression;
            const fix = [
              new Lint.Replacement(node.getStart(), node.getEnd() - node.getStart(), generateClass(fn).replace(/^function\b ?(\w*)/, `function ${decl.name.getText()}`)),
            ];
            ctx.addFailureAtNode(node, `ES5 class - ${decl.name.getText()}`, fix);
          }
        }
        break;
      case ts.SyntaxKind.FunctionDeclaration:
        const fn = (node as ts.FunctionDeclaration);
        if (!fn.name) {
          return;
        }
        const fix = [
          new Lint.Replacement(node.getStart(), node.getEnd() - node.getStart(), generateClass(fn)),
        ];
        if (isClassName(fn.name)) {
          ctx.addFailureAtNode(node, `ES5 class - ${fn.name.getText()}`, fix);
        }
        break;
      case ts.SyntaxKind.ExpressionStatement:
        const statement = node as ts.ExpressionStatement;
        if (statement.expression.kind) {
          const assign = statement.expression as ts.BinaryExpression;
          if (!assign.right) {
            return;
          }
          if (assign.left.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const left = assign.left as ts.PropertyAccessExpression;
            if (!left.name) {
              return;
            }
            if (assign.right.kind === ts.SyntaxKind.FunctionDeclaration || assign.right.kind === ts.SyntaxKind.FunctionExpression) {
              ctx.addFailureAtNode(assign, `ES5 method - ${left.name.text}`);
            } else {
              ctx.addFailureAtNode(assign, `ES5 property - ${left.name.text}`);
            }
          }
        }
        break;
      default:
        // console.debug('Unprocessed node kind: ', node.kind);
    }
  });
}
