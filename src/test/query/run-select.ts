import { createConnection, Connection } from 'mysql2/promise';

import { MySQLExecuter, ParameterType, SelectResultType } from '../../query/';

const connOpts = {
  host: 'formn-db',
  user: 'formn-user',
  password: 'formn-password',
  database: 'formn_test_db',
};

export function runSelect(query: string, params: ParameterType): Promise<SelectResultType> {
  let conn: Connection;

  return createConnection(connOpts)
    .then(c => {
      conn = c;

      return new MySQLExecuter(conn)
        .select(query, params);
    })
    .then(results => {
      conn.end();
      console.log(JSON.stringify(results, null, 2));
      return results;
    })
    .catch(err => {
      console.error(err);
      conn.end();
      return Promise.reject(err);
    });
}

