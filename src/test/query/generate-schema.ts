import { runSelect } from './run-select';

const sql = `
  SELECT  \`t\`.\`TABLE_NAME\` AS \`t.name\`,
          \`t\`.\`TABLE_SCHEMA\` AS \`t.schema\`,
          \`t\`.\`TABLE_TYPE\` AS \`t.type\`,
          \`c\`.\`COLUMN_NAME\` AS \`c.name\`,
          \`c\`.\`TABLE_NAME\` AS \`c.tableName\`,
          \`c\`.\`TABLE_SCHEMA\` AS \`c.schema\`,
          \`c\`.\`DATA_TYPE\` AS \`c.dataType\`,
          \`c\`.\`COLUMN_TYPE\` AS \`c.columnType\`,
          \`c\`.\`IS_NULLABLE\` AS \`c.isNullable\`,
          \`c\`.\`CHARACTER_MAXIMUM_LENGTH\` AS \`c.maxLength\`,
          \`c\`.\`COLUMN_KEY\` AS \`c.isPrimary\`,
          \`c\`.\`COLUMN_DEFAULT\` AS \`c.default\`,
          \`c\`.\`EXTRA\` AS \`c.isGenerated\`,
          \`k\`.\`CONSTRAINT_NAME\` AS \`k.constraintName\`,
          \`k\`.\`COLUMN_NAME\` AS \`k.columnName\`,
          \`k\`.\`TABLE_NAME\` AS \`k.tableName\`,
          \`k\`.\`TABLE_SCHEMA\` AS \`k.schema\`,
          \`k\`.\`REFERENCED_TABLE_NAME\` AS \`k.referencedTableName\`,
          \`k\`.\`REFERENCED_COLUMN_NAME\` AS \`k.referencedColumnName\`
  FROM    \`TABLES\` AS \`t\`
  INNER JOIN \`COLUMNS\` AS \`c\` ON (\`t\`.\`TABLE_NAME\` = \`c\`.\`TABLE_NAME\` AND \`t\`.\`TABLE_SCHEMA\` = \`c\`.\`TABLE_SCHEMA\`)
  LEFT OUTER JOIN \`KEY_COLUMN_USAGE\` AS \`k\` ON (\`c\`.\`TABLE_NAME\` = \`k\`.\`TABLE_NAME\` AND \`c\`.\`TABLE_SCHEMA\` = \`k\`.\`TABLE_SCHEMA\` AND \`c\`.\`COLUMN_NAME\` = \`k\`.\`COLUMN_NAME\`)
  WHERE   \`t\`.\`TABLE_SCHEMA\` = :db AND \`t\`.\`TABLE_NAME\` = :table
  ORDER BY \`t\`.\`TABLE_NAME\` ASC, \`c\`.\`COLUMN_NAME\` ASC, \`k\`.\`CONSTRAINT_NAME\` ASC
`;

const connOpts = {
  host: 'formn-db',
  user: 'root',
  password: 'formn-password',
  database: 'INFORMATION_SCHEMA',
  poolSize: 1,
};

runSelect(sql, {db: 'formn_test_db', table: 'phone_numbers'}, connOpts);

