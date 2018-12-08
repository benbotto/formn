import { runSelect } from './run-select';

const sql = `
  SELECT  \`u\`.\`userID\` AS \`u.id\`,
          \`u\`.\`firstName\` AS \`u.first\`,
          \`u\`.\`lastName\` AS \`u.last\`,
          \`u\`.\`createdOn\` AS \`u.createdOn\`
  FROM    \`users\` AS \`u\``;

runSelect(sql, {});
