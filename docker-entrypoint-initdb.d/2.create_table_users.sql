CREATE TABLE users (
  userID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  createdOn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);

INSERT INTO users (firstName, lastName) VALUES ('Joe', 'Shmo');
INSERT INTO users (firstName, lastName) VALUES ('Rand', 'AlThore');
INSERT INTO users (firstName, lastName) VALUES ('Holly', 'Davis');
INSERT INTO users (firstName, lastName) VALUES ('Jenny', 'Mather');
