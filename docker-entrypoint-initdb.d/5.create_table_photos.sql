CREATE TABLE photos (
  photoID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  photoURL VARCHAR(1000) NOT NULL,
  largeThumbnailID INT,
  smallThumbnailID INT,
  prodID INT NOT NULL,

  CONSTRAINT fk__photos__largeThumbnailID__photos
    FOREIGN KEY (largeThumbnailID) REFERENCES photos(photoID)
    ON DELETE CASCADE,

  CONSTRAINT fk__photos__smallThumbnailID__photos
    FOREIGN KEY (smallThumbnailID) REFERENCES photos(photoID)
    ON DELETE CASCADE,

  CONSTRAINT fk__photos__prodID__products
    FOREIGN KEY (prodID) REFERENCES products(productID)
    ON DELETE CASCADE);

INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/nike_small.jpg', 1, NULL, NULL);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/nike_large.jpg', 1, NULL, NULL);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/nike.jpg', 1, 1, 2);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/MJ_small.jpg', 1, NULL, NULL);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/MJ_large.jpg', 1, NULL, NULL);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/MJ.jpg', 1, 4, 5);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/hoops_small.jpg', 1, NULL, NULL);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/hoops_large.jpg', 1, NULL, NULL);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/hoops.jpg', 1, 7, 8);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/rebok_small.jpg', 3, NULL, NULL);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/rebok_large.jpg', 3, NULL, NULL);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/rebok.jpg', 3, 10, 11);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/mma_small.jpg', 3, NULL, NULL);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/mma_large.jpg', 3, NULL, NULL);
INSERT INTO photos (photoURL, prodID, smallThumbnailID, largeThumbnailID) VALUES ('https://photos.com/mma.jpg', 3, 13, 14);

ALTER TABLE products
  ADD CONSTRAINT fk__products__primaryPhotoID__photos
  FOREIGN KEY (primaryPhotoID) REFERENCES photos(photoID);

UPDATE products SET primaryPhotoID = 3 WHERE productID = 1;
UPDATE products SET primaryPhotoID = 12 WHERE productID = 3;

