CREATE TABLE vehicle_packages (
  vehiclePackageID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  interior VARCHAR(255) NOT NULL,
  heatedSeats BOOLEAN NOT NULL,
  make VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,

  CONSTRAINT fk__vehicle_packages__make_model__vehicles
    FOREIGN KEY (make, model) REFERENCES vehicles(make, model)
    ON DELETE CASCADE);
  
INSERT INTO vehicle_packages (interior, heatedSeats, make, model) VALUES ('Leather', 1, 'Chevrolet', 'Blazer');
INSERT INTO vehicle_packages (interior, heatedSeats, make, model) VALUES ('Nylon', 0, 'Chevrolet', 'Blazer');
INSERT INTO vehicle_packages (interior, heatedSeats, make, model) VALUES ('Polyester', 0, 'Volkswagon', 'Westfalia');
INSERT INTO vehicle_packages (interior, heatedSeats, make, model) VALUES ('Polyester', 0, 'Ford', 'Focus');
INSERT INTO vehicle_packages (interior, heatedSeats, make, model) VALUES ('Polyester', 0, 'Toyota', 'Tacoma');
INSERT INTO vehicle_packages (interior, heatedSeats, make, model) VALUES ('Leather', 1, 'Toyota', 'Tacoma');

