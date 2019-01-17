import { isAbsolute, resolve } from 'path';

import { ConnectionOptions } from './';

/**
 * Helper for reading a connections JSON file.
 */
export class ConnectionsFileReader {
  /**
   * Get the absolute path to a connections.json file.  If the path provided is
   * not absolute then it's assumed relative to the current working directory.
   * @param connFile - Absolute or relative path to a connections file.
   */
  getConnectionsFilePath(connFile: string): string {
    return isAbsolute(connFile) ?
      resolve(connFile) : resolve(`${process.cwd()}/${connFile}`);
  }

  /**
   * Get (and verify) the connection options in a file.  The file should
   * contain an array of [[ConnectionOptions]].  Alternatively,
   * [[ConnectionOptions]] keys in the file may be objects in the form {ENV:
   * "&lt;ENV_VAR_NAME&gt;"}, which allows for the use of environment
   * variables.
   * @param connFile - A path to a connections.json file containing an array of
   * connection details.
   * @return An array of [[ConnectionOptions]] objects.
   */
  readConnectionOptions(connFile: string): ConnectionOptions[] {
    const connOpts  = [];

    // Ensure the path is absolute.
    connFile = this.getConnectionsFilePath(connFile);

    // require throws an error if the file is not found.
    let settingsArr = require(connFile);

    if (!Array.isArray(settingsArr))
      settingsArr = [settingsArr];

    return settingsArr
      .map((settings: object) => {
        const connOpts = new ConnectionOptions();

        connOpts.host     = getSetting('host', settings) as string;
        connOpts.user     = getSetting('user', settings) as string;
        connOpts.password = getSetting('password', settings) as string;
        connOpts.database = getSetting('database', settings) as string;
        connOpts.poolSize = +getSetting('poolSize', settings);

        if ((settings as any).port)
          connOpts.port = +getSetting('port', settings);

        return connOpts;
      });

    function getSetting(prop: string, settings: any): any {
      if (!settings[prop])
        throw new Error(`"${prop}" property not set in connections settings file.`);

      if (typeof settings[prop] === 'object') {
        if (!settings[prop].ENV)
          throw new Error(`Malformed connection file at property "${prop}."`);

        if (!process.env[settings[prop].ENV])
          throw new Error(`Environment variable "${settings[prop].ENV}" not set.`);

        return process.env[settings[prop].ENV];
      }

      return settings[prop];
    }
  }
}

