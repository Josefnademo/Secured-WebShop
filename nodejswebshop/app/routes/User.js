const express = require("express");

const mysql = require("mysql2");
const bodyParser = require("express");
const jwt = require("jsonwebtoken"); // JWT for authentication
const db = require("../db/db.js");
const { Console } = require("console");

const UserRouter = express.Router();

const controller = require("../controllers/UserController.js");
UserRouter.get("/", controller.get);

// Route for fetching and displaying user details
UserRouter.get("/details", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Get token from the header

  if (!token) {
    const message = "Token non fourni, redirection vers la page de connexion";
    console.log(message);
    return res.redirect("/login"); // If token is not present, redirect to login
  }

  jwt.verify(token, "process.env.JWT_SECRET_KEY", (err, decoded) => {
    if (err) {
      console.error("Token invalide ou expiré:", err);
      return res.status(401).send("Token invalide ou expiré");
    }

    const userId = decoded.userId;

    const query = "SELECT * FROM Users WHERE id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error(
          "Erreur lors de la récupération des détails de l'utilisateur:",
          err
        );
        return res.status(500).send("Erreur de base de données");
      }

      if (results.length === 0) {
        return res.status(404).send("Utilisateur non trouvé");
      }

      const user = results[0];
      res.render("details", { user: user }); // Render the details page with user data
    });
  });
});

module.exports = UserRouter;
