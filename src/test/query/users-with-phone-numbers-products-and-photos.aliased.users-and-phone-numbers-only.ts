import { runSelect } from './run-select';

const sql = `
  SELECT  \`u\`.\`userID\` AS \`u.id\`,
          \`u\`.\`firstName\` AS \`u.first\`,
          \`u\`.\`lastName\` AS \`u.last\`,
          \`pn\`.\`phoneNumberID\` AS \`pn.id\`,
          \`pn\`.\`phoneNumber\` AS \`pn.phoneNumber\`
  FROM    \`users\` AS \`u\`
  LEFT OUTER JOIN \`phone_numbers\` AS \`pn\` ON \`u\`.\`userID\` = \`pn\`.\`userID\`
  LEFT OUTER JOIN \`users_x_products\` AS \`uxp\` ON \`u\`.\`userID\` = \`uxp\`.\`userID\`
  LEFT OUTER JOIN \`products\` AS \`p\` ON \`uxp\`.\`productID\` = \`p\`.\`productID\`
  LEFT OUTER JOIN \`photos\` AS \`ph\` ON (\`p\`.\`productID\` = \`ph\`.\`prodID\` AND \`ph\`.\`largeThumbnailID\` IS NOT NULL AND \`ph\`.\`smallThumbnailID\` IS NOT NULL)
  ORDER BY \`u\`.\`userID\` ASC, \`pn\`.\`phoneNumberID\` ASC, \`p\`.\`productID\` ASC, \`ph\`.\`photoID\` ASC`;

runSelect(sql, {});

