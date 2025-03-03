//library ot work with db
const mysql = require("mysql2");

//create a connection to the DB
const db = mysql.createConnection({
  ///FOR BUTTING VIA - LOCALHOST SERVER Node.JS(use localhost and port 6033)
  //host: "localhost", // Use localhost instead of db_container
  // port: 6033, // Specify the port to which MySQL is forwarded
  ///FOR BUTTING VIA - DOCKER (use host name of the container)
  host: "db_container", //docker container name
  //////////////////
  user: "root",
  password: "root",
  database: "webshop183",
});

//try to connect to database (if can't connect,give a error message; else message DB is conected)
db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à MySQL : ", err);
  } else {
    console.log("Connecté à MySQL !✅");

    // Query to check the Users table   *NOT NESSESARY*
    const query = "SELECT * FROM Users"; // Adjust with your actual table name

    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur de récupération des données : ", err);
      } else {
        console.log("Données de la table Users : ", results);
      }
    });
  }
});
// Export db for use in other files
module.exports = db;

/* 
-- Create a database
CREATE database webshop183;
USE webshop183;

-- 1: Create roles
CREATE ROLE 'user';
CREATE ROLE 'admin';

-- 2: Grant permissions to roles
GRANT SELECT, INSERT, UPDATE, DELETE ON webshop183.* TO 'user';
GRANT ALL PRIVILEGES ON webshop183.* TO 'admin';

-- 3: Assign roles to users
GRANT 'user' TO 'username'@'localhost';    -- Regular user
GRANT 'admin' TO 'admin_username'@'localhost';   -- Admin user

-- 4: Activate roles for users (optional)
SET DEFAULT ROLE 'user' TO 'username'@'localhost';
SET DEFAULT ROLE 'admin' TO 'admin_username'@'localhost';

-- 5: Verify the grants
SHOW GRANTS FOR 'username'@'localhost';
SHOW GRANTS FOR 'admin_username'@'localhost';

CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,        -- User's unique ID
  username VARCHAR(255) NOT NULL UNIQUE,    -- Username (unique for each user)
  password VARCHAR(255) NOT NULL,           -- Password (hashed and salted)
  role ENUM('user', 'admin') DEFAULT 'user', -- Role: 'user' or 'admin', default is 'user'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Creation timestamp
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Updated timestamp
);

*/

///////code to recraeate table Users///////
/*
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,        -- User's unique ID
  username VARCHAR(255) NOT NULL UNIQUE,    -- Username (unique for each user)
  password VARCHAR(255) NOT NULL,           -- Password (hashed and salted)
  role ENUM('user', 'admin') DEFAULT 'user', -- Role: 'user' or 'admin', default is 'user'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Creation timestamp
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Updated timestamp
);
*/

//Insert
/*
 -- Insert a new user
INSERT INTO Users (username, password, role)
VALUES ('john_doe', 'hashed_password_here', 'user');

-- Insert an admin user
INSERT INTO Users (username, password, role)
VALUES ('admin_user', 'hashed_password_here', 'admin');
 */
