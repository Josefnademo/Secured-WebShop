const express = require("express");

///////////////////////////////////////////

const mysql = require("mysql2");
const bodyParser = require("express");
const bcrypt = require("bcrypt"); // for password hashing
const jwt = require("jsonwebtoken"); // JWT for authentication
const db = require("../db/db.js");
const { Console } = require("console");

const authRouter = express.Router();
authRouter.use(express.json()); // Pour parser les requêtes JSON
///////////////////////////////////////////

// Route to view registration page
authRouter.get("/registration", (req, res) => {
  res.render("registration");
});

// Route to view login page
authRouter.get("/login", (req, res) => {
  res.render("login", { name: "Mon  cœur " });
});

//Logout route
authRouter.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    //error: Disconnection error
    if (err) {
      return res.status(500).send("Erreur de déconnexion");
    }
    res.redirect("/login");
  });
});

// Route for handling POST request for registration
authRouter.post("/registration", async (req, res) => {
  const { username, password, role = "user" } = req.body;

  // Check if the username already exists
  try {
    const checkQuery = "SELECT * FROM Users WHERE username = ?";
    db.query(checkQuery, [username], async (err, results) => {
      if (err) {
        console.error(
          "Erreur lors de la vérification du nom d'utilisateur :",
          err
        );
        return res.status(500).send("Erreur de base de données");
      }

      // If the username already exists, return an error message
      if (results.length > 0) {
        return res.status(400).send("Ce nom d'utilisateur est déjà pris");
      }

      try {
        // Generating salt for bcrypt
        const salt = await bcrypt.genSalt(4); // `4 — number of turns of the algorithm`

        // Password Hashing(even if two users have the same password, their hashes will be different.)
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert data into the database (with encrypted password)
        const query =
          "INSERT INTO Users (username, password, role) VALUES (?, ?, ?)";
        db.query(query, [username, hashedPassword, role], (err, results) => {
          //error: Database error
          if (err) {
            console.error("Erreur lors de l'ajout de l'utilisateur :", err);
            return res.status(500).send("Erreur de base de données");
          }
          console.log(hashedPassword);
          console.log(username);
          // After successful registration, we redirect to the details page
          res.redirect("/login");
        });
      } catch (err) {
        console.error("Erreur lors du hachage du mot de passe :", err);
        res.status(500).send("Erreur lors du hachage du mot de passe");
      }
    });
  } catch (err) {
    console.error("Erreur lors du traitement de la demande :", err);
    res.status(500).send("Erreur lors du traitement de la demande");
  }
});

// Route for handling POST request for login
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(password);
  console.log(username);
  try {
    const query = "SELECT * FROM Users WHERE username = ?";
    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error("Erreur lors de la recherche de l'utilisateur :", err);
        console.log(password);
        console.log(username);
        return res.status(500).json({ message: "Erreur de base de données" });
      }

      if (results.length === 0) {
        return res
          .status(400)
          .json({ message: "Utilisateur ou mot de passe incorrect" });
      }

      const user = results[0];

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res
          .status(400)
          .json({ message: "Utilisateur ou mot de passe incorrect" });
      }

      const token = jwt.sign(
        { userId: user.id },
        "process.env.JWT_SECRET_KEY",
        {
          expiresIn: "30m",
        }
      );

      res.json({ message: "Connexion réussie ✅", token });
      res.redirect("/details"); // After logging in, we redirect you to the details page
    });
  } catch (err) {
    console.error("Erreur lors de la tentative de connexion :", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la tentative de connexion" });
  }
});

module.exports = authRouter;
