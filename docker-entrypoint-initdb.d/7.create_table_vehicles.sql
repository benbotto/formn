CREATE TABLE vehicles (
  make VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  
  PRIMARY KEY (make, model));

INSERT INTO vehicles (make, model) VALUES ('Chevrolet', 'Blazer');
INSERT INTO vehicles (make, model) VALUES ('Volkswagon', 'Westfalia');
INSERT INTO vehicles (make, model) VALUES ('Ford', 'Focus');
INSERT INTO vehicles (make, model) VALUES ('Toyota', 'Tacoma');

