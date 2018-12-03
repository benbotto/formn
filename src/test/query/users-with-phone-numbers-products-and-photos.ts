import { createConnection } from 'mysql2/promise';

const connOpts = {
  host: 'formn-db',
  user: 'formn-user',
  password: 'formn-password',
  database: 'formn_test_db',
};

async function runQuery() {
  const conn = await createConnection(connOpts);
  const [users, fields] = await conn
    .query(`
      SELECT  u.userID, u.firstName, u.lastName,
              pn.phoneNumberID, pn.phoneNumber,
              uxp.userXProductID,
              p.productID, p.description,
              ph.photoID, ph.photoURL
      FROM    users u
      LEFT OUTER JOIN phone_numbers pn ON u.userID = pn.userID
      LEFT OUTER JOIN users_x_products uxp ON u.userID = uxp.userID
      LEFT OUTER JOIN products p ON uxp.productID = p.productID
      LEFT OUTER JOIN photos ph ON p.productID = ph.prodID
        AND ph.largeThumbnailID IS NOT NULL
        AND ph.smallThumbnailID IS NOT NULL
      ORDER BY u.userID, pn.phoneNumberID, p.productID, ph.photoID
    `);

  console.log(JSON.stringify(users, null, 2));
  await conn.end();
}

runQuery();

