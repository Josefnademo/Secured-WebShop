const https = require("https");
const fs = require("fs");
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("express");
const bcrypt = require("bcrypt");
const userRoute = require("./routes/User");
const db = require("./db/db.js");
/*const path = require("path");*/
const app = express();
//const jwt = require("jsonwebtoken");  ---problem when installed "npm install jsonwebtoken" i had 13 vulnerabilities so i couldn't impliment this, FIX!

/*
// Load SSL certificates
const options = {
  key: fs.readFileSync("key.pem"), // Path to your private key
  cert: fs.readFileSync("cert.pem"), // Path to your certificate
};*/

app.use(bodyParser.urlencoded({ extended: true })); // parser to interact with form-data
app.use(bodyParser.json()); // for JSON-requests

///////////////////////////////////////////
app.set("view engine", "ejs");

//Static files support:
app.use(express.static("public"));

// Middleware for parsing data from the form
app.use(express.urlencoded({ extended: true }));
/*
// Create HTTPS server with Middleware
https.createServer(options, app).listen(8443, () => {
  console.log("HTTPS server running on https://localhost:8443 ✅");
});

// Redirige les requêtes HTTP vers HTTPS
app.use((req, res, next) => {
  if (req.protocol !== "https") {
    return res.redirect(
      "https://" + req.headers.host.replace(8080, 8443) + req.url
    );
  }
  next();
});*/

//Default route
app.get(["/", "/home", "/accueil"], (req, res) => {
  res.render("home", { name: "Invité" });
});

// Other routes and middleware
app.get("/login", (req, res) => {
  res.render("login", { name: "Mon  cœur " });
});

// Other routes and middleware
app.get("/registration", (req, res) => {
  res.render("registration");
});

app.get("/admin", (req, res) => {
  res.render("admin");
});

/* app.get("/admin", (req, res) => {
  const searchQuery = req.query.search || ""; // Obtenir le paramètre de recherche à partir de l'URL

  let query = "SELECT * FROM Users";
  let params = [];

  if (searchQuery) {
    query += " WHERE username = ?";
    params.push(searchQuery);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
      return res.status(500).send("Erreur de base de données");
    }

    db.query("SELECT username FROM Users", [], (err, allUsers) => {
      if (err) {
        console.error("Erreur lors de la récupération des noms:", err);
        return res.status(500).send("Erreur de base de données");
      }
      res.render("admin", { users: results, searchQuery, allUsers });
    });
  });
});
*/

// Route for fetching and displaying user details
app.get("/details", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Get token from the header (Bearer token format)

  if (!token) {
    return res.redirect("/home"); // If token is not present, redirect to login
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("Invalid or expired token:", err);
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

//Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    //error: Disconnection error
    if (err) {
      return res.status(500).send("Erreur de déconnexion");
    }
    res.redirect("/login");
  });
});

// Route for handling POST request for registration
app.post("/registration", async (req, res) => {
  const { username, password, role = "user" } = req.body;

  try {
    // Check if the username already exists
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
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query to get the user by username
    const query = "SELECT * FROM Users WHERE username = ?";

    db.query(query, [username], async (err, results) => {
      // Error: Database query error
      if (err) {
        console.error("Erreur lors de la recherche de l'utilisateur :", err);
        return res.status(500).send("Erreur de base de données");
      }

      // If no user found
      if (results.length === 0) {
        return res.status(400).send("Utilisateur ou mot de passe incorrect");
      }

      const user = results[0];

      // Compare the entered password with the stored hashed password
      const match = await bcrypt.compare(password, user.password);

      // If password doesn't match
      if (!match) {
        return res.status(400).send("Utilisateur ou mot de passe incorrect");
      }

      // If login is successful, you can generate a JWT token or set a session
      const token = jwt.sign({ userId: user.id }, "yourSecretKey", {
        expiresIn: "1000h",
      });

      // Send the token as a response or redirect
      res.json({ message: "Connexion réussie ✅", token });
    });
  } catch (err) {
    console.error("Erreur lors de la tentative de connexion :", err);
    res.status(500).send("Erreur lors de la tentative de connexion");
  }
});

//404. If no route matches the URL requested by the consumer
app.use((req, res) => {
  const message =
    "Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
  res.status(404).json(message); //json attends l'objet
});

// server butting
app.listen(8080, () => {
  console.log("Serveur fonctionnant sur le port 8080✅ ");
});
