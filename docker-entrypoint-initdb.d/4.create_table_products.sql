CREATE TABLE products (
  productID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  description VARCHAR(255) NOT NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  primaryPhotoID INT);

INSERT INTO products (description) VALUES ('Nike');
INSERT INTO products (description) VALUES ('Crystals');
INSERT INTO products (description) VALUES ('Rebok');

