const express = require("express");
const mysql = require("mysql2");
const db = require("../db/db.js");

const searchRouter = express.Router();

// Route to search for a place by name
searchRouter.post("/search-user", (req, res) => {
  const { nom } = req.body;
  const searchPattern = "%" + nom + "%"; // Add "%" to search pattern for LIKE query

  // To prevent empty requests
  if (!nom) {
    return res.render("admin", {
      lieux: [],
      error: "Veuillez entrer un nom de lieu", // Error if no name is entered
    });
  }

  // db.query() is a method commonly used in Node.js to interact with a database
  const query = "SELECT * FROM t_lieu WHERE nom LIKE ?"; // We use "?" as a parameter to avoid SQL injections.
  db.query(query, [searchPattern], (err, results) => {
    if (err) {
      console.error("Erreur lors de la recherche :", err);
      return res.render("admin", {
        lieux: [],
        error: "Erreur interne du serveur", // Error in case of a server issue
      });
    }

    // If no place is found
    if (results.length === 0) {
      return res.render("admin", {
        lieux: [],
        error: "Lieu non trouvé", // Error when place is not found
      });
    }

    // Render the page with the found places
    res.render("admin", {
      lieux: results, // Pass the list of places to the template
      error: "", // Clear error message
    });
  });
});

// Route to provide suggestions for place names
searchRouter.get("/suggest-lieu", (req, res) => {
  const query = req.query.query;
  const searchPattern = "%" + query + "%";

  const suggestionQuery = "SELECT nom FROM t_lieu WHERE nom LIKE ? LIMIT 10";
  db.query(suggestionQuery, [searchPattern], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des suggestions :", err);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }

    res.json(results);
  });
});

module.exports = searchRouter;
