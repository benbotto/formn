import { mkdir, stat, readdir } from 'fs';
import { resolve, isAbsolute, join } from 'path';
import { promisify } from 'util';

/**
 * Various helper functions for directory and file paths.
 */
export class PathHelper {
  /**
   * Get the absolute path to a file or directory, resolved.  If path is not
   * absolute, it's considered to be relative to the current working directory.
   * The resulting path will not have a trailing slash.
   * @param path The path to resolve.
   */
  getAbsolutePath(path: string): string {
    if (!isAbsolute(path))
      path = join(process.cwd(), path);

    return resolve(path);
  }

  /**
   * Create a directory if it doesn't exist.
   * @param dir To-be-created directory path.
   */
  async mkdirIfNotExists(dir: string): Promise<void> {
    const statP   = promisify(stat);
    const mkdirP  = promisify(mkdir);
    const absPath = this.getAbsolutePath(dir);

    try {
      await statP(absPath);
    }
    catch (err) {
      await mkdirP(absPath, {recursive: true});
    }
  }

  /**
   * Get a list of files in a directory, matching a pattern and ordered by
   * name.
   * @param dir - The directory to list, which is resolved using
   * getAbsolutePath.
   * @param match - A regex pattern that files must match.
   * @param order - The order direction: 1 ascending: -1 descending.
   */
  ls(dir: string, match: RegExp = /.*/, order: number = 1): Promise<string[]> {
    const readdirP = promisify(readdir);
    const absDir   = this.getAbsolutePath(dir);

    return readdirP(absDir)
      .then(files => files
        .sort((l, r) => l.localeCompare(r) * order)
        .filter(file => !!file.match(match)));
  }
}
