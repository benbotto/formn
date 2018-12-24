import { MySQLExecuter, ParameterType, SelectResultType } from '../../query/';

import { MySQLConnectionManager, ConnectionOptions } from '../../connection/';

export function runSelect(
  query: string,
  params: ParameterType,
  connOpts?: ConnectionOptions): Promise<SelectResultType> {

  if (!connOpts) {
    connOpts = {
      host: 'formn-db',
      user: 'formn-user',
      password: 'formn-password',
      database: 'formn_test_db',
      poolSize: 1,
    };
  }

  const connMan = new MySQLConnectionManager();

  return connMan
    .connect(connOpts)
    .then(() => {
      return new MySQLExecuter(connMan.getPool())
        .select(query, params);
    })
    .then(results => {
      connMan.end();
      console.log(JSON.stringify(results, null, 2));
      return results;
    })
    .catch(err => {
      console.error(err);
      connMan.end();
      return Promise.reject(err);
    });
}

