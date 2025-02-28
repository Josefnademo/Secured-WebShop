const https = require("https");
const fs = require("fs");
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("express");
const bcrypt = require("bcrypt");
//const userRoute = require("./routes/user.js");   - -DONT NEED IT, WE ARE USING THE ROUTES IN THE SAME FILE
const db = require("./db/db.js");
/*const path = require("path");*/
const app = express();

require("dotenv").config({ path: "../.env" }); // Load environment variables from .env file
const jwt = require("jsonwebtoken"); // JWT for authentication*/
const { Console } = require("console");

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

// Route to view login page
app.get("/login", (req, res) => {
  res.render("login", { name: "Mon  cœur " });
});

// Route to view registration page
app.get("/registration", (req, res) => {
  res.render("registration");
});

// Route to view admin page
app.get("/admin", (req, res) => {
  res.render("admin", { users: [], error: "" }); //No users displayed on initial load. No error messages at start.
});

// Route to search for a user
app.post("/search-user", (req, res) => {
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

// Route for fetching and displaying user details
app.get("/details", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Get token from the header

  if (!token) {
    const message = "Token non fourni, redirection vers la page de connexion";
    console.log(message);
    return res.redirect("/login"); // If token is not present, redirect to login
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
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
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(password);
  console.log(username);
  try {
    const query = "SELECT * FROM Users WHERE username = ?";
    console.log(password);
    console.log(username);
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

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "30m",
      });

      res.json({ message: "Connexion réussie ✅", token });
    });
  } catch (err) {
    console.error("Erreur lors de la tentative de connexion :", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la tentative de connexion" });
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
