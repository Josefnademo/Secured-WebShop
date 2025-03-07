const express = require("express");

const mysql = require("mysql2");
const bodyParser = require("express");
const db = require("../db/db.js");
const { Console } = require("console");

const searchRouter = express.Router();

// Route to search for a user
searchRouter.post("/search-user", (req, res) => {
  const { username } = req.body;
  const searchPattern = "%" + username + "%"; // Add "%" to search pattern for LIKE query

  // To prevent empty requests
  if (!username) {
    return res.render("admin", {
      users: [],
      error: "Veuillez entrer un nom d'utilisateur", // Error if no username is entered
    });
  }

  // db.query() is a method commonly used in Node.js to interact with a database
  const query = "SELECT * FROM Users WHERE username LIKE ?"; // We use "?" as a parameter to avoid SQL injections.
  db.query(query, [searchPattern], (err, results) => {
    if (err) {
      console.error("Erreur lors de la recherche :", err);
      return res.render("admin", {
        users: [],
        error: "Erreur interne du serveur", // Error in case of a server issue
      });
    }

    // If no user is found
    if (results.length === 0) {
      return res.render("admin", {
        users: [],
        error: "Utilisateur non trouvé", // Error when user is not found
      });
    }

    // Render the page with the found users
    res.render("admin", {
      users: results, // Pass the list of users to the template
      error: "", // Clear error message
    });
  });
});

module.exports = searchRouter;
