import { isAbsolute } from 'path';
import * as fs from 'fs';

import { PathHelper } from './';

describe('PathHelper()', () => {
  let pathHelper: PathHelper;

  beforeEach(() => pathHelper = new PathHelper());

  describe('.getAbsolutePath()', () => {
    it('leaves absolute paths intact.', () => {
      expect(pathHelper.getAbsolutePath('/var/log')).toBe('/var/log');
    });

    it('returns a path without trailing slashes.', () => {
      expect(pathHelper.getAbsolutePath('/var/log/')).toBe('/var/log');
    });

    it('makes relative directories absolute.', () => {
      expect(isAbsolute(pathHelper.getAbsolutePath('foo/bar'))).toBe(true);
    });
  });

  describe('.mkdirIfNotExists()', () => {
    it('creates the directory if it doesn\'t exist.', (done) => {
      spyOn(fs, 'stat').and.callFake((path: string, callback: Function) =>
        callback(new Error('file not found...')));

      spyOn(fs, 'mkdir').and.callFake((path: string, opts: object, callback: Function) =>
        callback());

      pathHelper
        .mkdirIfNotExists('/my/path')
        .then(() => {
          expect(fs.stat).toHaveBeenCalled();
          expect(fs.mkdir).toHaveBeenCalled();
          done();
        });
    });
  });
});

