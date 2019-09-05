import { runSelect } from './run-select';

const sql = `
  SELECT  u.userID, u.firstName, u.lastName,
          pn.phoneNumberID, pn.phoneNumber,
          uxp.userID AS uxp_userID, uxp.productID AS uxp_productID,
          p.productID, p.description, p.isActive,
          ph.photoID, ph.photoURL
  FROM    users u
  LEFT OUTER JOIN phone_numbers pn ON u.userID = pn.userID
  LEFT OUTER JOIN users_x_products uxp ON u.userID = uxp.userID
  LEFT OUTER JOIN products p ON uxp.productID = p.productID
  LEFT OUTER JOIN photos ph ON p.productID = ph.prodID
    AND ph.largeThumbnailID IS NOT NULL
    AND ph.smallThumbnailID IS NOT NULL
  ORDER BY u.userID, pn.phoneNumberID, p.productID, ph.photoID`;

runSelect(sql, {});

