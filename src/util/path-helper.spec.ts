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

  describe('.ls()', () => {
    beforeEach(() => {
      spyOn(fs, 'readdir').and.callFake((dir:string, callback: Function) => {
        callback(null, ['dir1', 'dir2', 'file1.js', 'file2.txt', 'asdf.js']);
      });
    });

    it('lists all files in a directory.', (done) => {
      pathHelper
        .ls('dir', /^.*\.js$/)
        .then(files => {
          expect(files.length).toBe(2);
          expect(files[0]).toBe('asdf.js');
          expect(files[1]).toBe('file1.js');
          done();
        });
    });

    it('lists all files in reverse order.', (done) => {
      pathHelper
        .ls('dir', /^.*\.js$/, -1)
        .then(files => {
          expect(files.length).toBe(2);
          expect(files[0]).toBe('file1.js');
          expect(files[1]).toBe('asdf.js');
          done();
        });
    });
  });
});

