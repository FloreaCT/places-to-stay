DROP TABLE IF EXISTS acc_dates;
DROP TABLE IF EXISTS acc_bookings;
DROP TABLE IF EXISTS acc_images;
DROP TABLE IF EXISTS acc_amenities;
DROP TABLE IF EXISTS accommodation;
DROP TABLE IF EXISTS acc_users;

CREATE TABLE IF NOT EXISTS acc_users (ID INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(255), password VARCHAR(255), admin TINYINT DEFAULT 0);

INSERT INTO acc_users(username,password,admin) VALUES ('admin','admin123',1),('tim','tim123',0),('kate','kate123',0),('visithampshire','vh123',0), ('floreact','admin',1);

CREATE TABLE IF NOT EXISTS `accommodation` (`ID` int(11) AUTO_INCREMENT, `accID`int(11) DEFAULT NULL, `name` varchar(255) DEFAULT NULL, `type` varchar(255) DEFAULT NULL, `county` varchar(255) DEFAULT NULL, `city` varchar(255) DEFAULT NULL, `longitude` float DEFAULT NULL, `latitude` float DEFAULT NULL, `description` text, PRIMARY KEY (`ID`), FOREIGN KEY (accID) REFERENCES acc_users(id)
) ENGINE=InnoDB;

INSERT INTO `accommodation` (accID,name,type,county, city,longitude,latitude,description) VALUES (1, 'Pikes Peak Inn','hotel','Colorado', 'Colorado Springs',-104.913,38.8578,'A nice place to stay'),(2,'Fireside Inn','BandB','Colorado', 'Denver',-106.045,39.4821,'A nice place to stay'),(3, 'Fawlty Towers','hotel','Torquay','Abbot County',-3.4963,50.4601,'Classy hotel with charming owner'),(4, 'The Boar Inn','pub','Hampshire','Lake District',-1,51,'A nice place to stay'),(5, 'The Dales Inn','pub','Yorkshire','The Dalles',-2.0462,54.1465,'A nice place to stay'),(1,  'Jurys Inn','hotel','Hampshire','Romsey',-1.401,50.9106,'A nice place to stay'),(2,'Premier Inn','hotel','Hampshire','Adover',-1.3985,50.9071,'A nice place to stay'),(3,'Hollands Wood','campsite','Hampshire','Chineham',-1.57,50.83,'A nice place to stay'),(4, 'Ashurst','campsite','Hampshire','Medsted',-1.53,50.887,'A nice place to stay'),(5, 'Hotel Mirto','hotel','Greece','Propela',22.5023,40.105,'A nice place to stay');

CREATE TABLE IF NOT EXISTS acc_users (ID INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(255), password VARCHAR(255), admin TINYINT DEFAULT 0);

CREATE TABLE IF NOT EXISTS acc_dates (ID INT PRIMARY KEY AUTO_INCREMENT, accID INT, thedate INT, availability INT DEFAULT 20, FOREIGN KEY (accID) REFERENCES accommodation(ID));

CREATE TABLE IF NOT EXISTS acc_bookings (ID INT PRIMARY KEY AUTO_INCREMENT, accID INT, thedate INT, username VARCHAR(255), npeople INT, FOREIGN KEY (accID) REFERENCES acc_users(ID)); 

CREATE TABLE IF NOT EXISTS acc_images (ID INT PRIMARY KEY AUTO_INCREMENT, accID INT, approved INT DEFAULT 0, imagePath VARCHAR(255) DEFAULT '/images/nophoto.jpg', FOREIGN KEY (accID) REFERENCES accommodation(ID));

CREATE TABLE IF NOT EXISTS acc_amenities (ID INT PRIMARY KEY AUTO_INCREMENT, accID INT, wifi boolean, air boolean, breakfast boolean, animals boolean, parking boolean, toiletries boolean, FOREIGN KEY (accID) REFERENCES accommodation(ID));

INSERT INTO acc_users(username,password,admin) VALUES ('admin','admin123',1),('tim','tim123',0),('kate','kate123',0),('visithampshire','vh123',0);

INSERT INTO acc_dates(accID,thedate) VALUES (1,220901),(1,220904),(1,220906),(2,220907),(2,2209012),(2,220913),(3,220901),(3,220902),(3,220903),(4,220903),(4,220910),(4,220920),(5,220901),(5,220902),(5,220903),(6,220903),(6,220905),(6,220906),(7,220901),(7,220902),(7,220903),(8,220920),(8,220921),(8,220925),(9,220901),(9,220910),(9,220920),(10,220901),(10,220902),(10,220903);

INSERT INTO acc_images(accID, approved) VALUES (2,1),(5,1),(6,1),(7,1),(8,1),(9,1);

INSERT INTO acc_images(ID, accID, approved, imagePath) VALUES (11,3,1,"/images/uploadedImages/3/file-1660906311906.jpeg"),(12,3,1,"/images/uploadedImages/3/file-1660906316673.jpeg"),(13,10,1,"/images/uploadedImages/10/file-1660906331345.jpeg"),(14,10,1,"/images/uploadedImages/10/file-1660906334241.jpeg"),(15,10,1,"/images/uploadedImages/10/file-1660906336793.jpeg"),(16,1,1,"/images/uploadedImages/1/file-1660906344913.jpeg"),(17,1,1,"/images/uploadedImages/1/file-1660906347729.jpeg"),(18,1,1,"/images/uploadedImages/1/file-1660906350337.jpeg"),(19,4,1,"/images/uploadedImages/4/file-1660906361801.jpeg"),(20,4,1,"/images/uploadedImages/4/file-1660906364385.jpeg"),(21,4,1,"/images/uploadedImages/4/file-1660906368120.jpeg")