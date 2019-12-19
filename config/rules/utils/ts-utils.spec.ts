import { cloneNode, parseScript } from './ts-utils';

describe('ts-utils', () => {
  it('clone node', () => {
    const node = parseScript('var a = 1;');
    const result = cloneNode(node);
    console.log(result);
  });
});
