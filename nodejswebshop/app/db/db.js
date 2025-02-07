//library ot work with db
const mysql = require("mysql2");

//create a connection to the DB
const db = mysql.createConnection({
  host: "db_container", //docker container name
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
  }
});

// Export db for use in other files
module.exports = db;

///////code to recraeate table Users///////
/*CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
*/
