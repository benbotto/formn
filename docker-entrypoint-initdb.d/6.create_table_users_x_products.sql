CREATE TABLE users_x_products (
  userXProductID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  userID INT NOT NULL,
  productID INT NOT NULL,

  CONSTRAINT fk__users_x_products__userID__users
    FOREIGN KEY (userID) REFERENCES users(userID)
    ON DELETE CASCADE,

  CONSTRAINT fk__users_x_products__productID__products
    FOREIGN KEY (productID) REFERENCES products(productID)
    ON DELETE CASCADE);

INSERT INTO users_x_products (userID, productID) VALUES (1, 1);
INSERT INTO users_x_products (userID, productID) VALUES (1, 3);

INSERT INTO users_x_products (userID, productID) VALUES (2, 2);

INSERT INTO users_x_products (userID, productID) VALUES (3, 1);
