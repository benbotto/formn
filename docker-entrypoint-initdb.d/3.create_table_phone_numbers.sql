CREATE TABLE phone_numbers (
  phoneNumberID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  phoneNumber VARCHAR(255) NOT NULL,
  type VARCHAR(255),
  userID INT NOT NULL,

  CONSTRAINT fk__phone_numbers__userID__users
    FOREIGN KEY (userID) REFERENCES users(userID)
    ON DELETE CASCADE);

INSERT INTO phone_numbers (userID, phoneNumber, type) VALUES (1, '530-307-8810', 'mobile');
INSERT INTO phone_numbers (userID, phoneNumber, type) VALUES (1, '916-200-1440', 'home');
INSERT INTO phone_numbers (userID, phoneNumber, type) VALUES (1, '916-293-4667', 'office');
INSERT INTO phone_numbers (userID, phoneNumber, type) VALUES (2, '666-451-4412', 'mobile');

