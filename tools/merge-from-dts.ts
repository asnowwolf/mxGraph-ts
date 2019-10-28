import 'core-js';
import { readFileSync } from 'fs';
import { sync as globby } from 'globby';
import {
  ClassDeclaration,
  createProperty,
  createSourceFile,
  isClassDeclaration,
  isPropertyDeclaration,
  ScriptTarget,
  SourceFile,
  Statement,
  visitNode,
} from 'typescript';
import { toText } from '../config/rules/utils/ts-utils';

function getClasses(statements: readonly Statement[]): ClassDeclaration[] {
  return statements.filter(it => isClassDeclaration(it)).map(it => it as ClassDeclaration);
}

function loadSourceFile(filename: string): SourceFile {
  return createSourceFile(filename, readFileSync(filename, 'utf-8'), ScriptTarget.ES2015);
}

export class MergeFromDts {
  private classes: ClassDeclaration[] = [];

  loadDts(): void {
    const fileNames = globby('dts/mxgraph-types/*.d.ts');
    const files = fileNames.map(file => loadSourceFile(file));
    this.classes = files.map(file => getClasses(file.statements)).flat();
    console.log(this.classes);
  }

  fixTypes(sourceFile: SourceFile): void {
    sourceFile.statements.forEach(statement => {
      if (isClassDeclaration(statement)) {
        this.fixClass(statement);
      }
    });
  }

  private fixClass(decl: ClassDeclaration): void {
    const target = decl.members.map(it => visitNode(it, (node) => {
      if (isPropertyDeclaration(node)) {
        return createProperty(node.decorators, node.modifiers, '_' + node.name.getText(), node.questionToken, node.type, node.initializer);
      }
      return node;
    })).map(it => toText(it));
    console.log(target.join('\n'));
  }
}

function debug(): void {
  const importer = new MergeFromDts();
  importer.loadDts();
  importer.fixTypes(loadSourceFile('./auto-ts/editor/mxDefaultKeyHandler.ts'));
}

debug();
