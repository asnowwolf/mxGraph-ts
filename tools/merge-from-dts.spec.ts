import { MergeFromDts } from './merge-from-dts';

describe('auto import', () => {
  it('load', () => {
    const importer = new MergeFromDts();
    importer.loadDts();
  });
});
