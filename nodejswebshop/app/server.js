const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const userRoute = require("./routes/User");
const db = require("./db/db.js");
/*const path = require("path");*/
const app = express();
//const jwt = require("jsonwebtoken");  ---problem when installed "npm install jsonwebtoken" i had 13 vulnerabilities so i couldn't impliment this, FIX!

///////////////////////////////////////////
app.set("view engine", "ejs");

//Static files support:
app.use(express.static("public"));

// Middleware for parsing data from the form
app.use(express.urlencoded({ extended: true }));

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

app.get("/details", (req, res) => {
  const token = req.headers["authorization"]; // Get token from the header or query

  if (!token) {
    return res.redirect("/login"); // If token is not present, redirect to login
  }

  jwt.verify(token, "yourSecretKey", (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid or expired token");
    }

    const userId = decoded.userId;

    const query = "SELECT * FROM Users WHERE id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching user details:", err);
        return res.status(500).send("Database error");
      }

      if (results.length === 0) {
        return res.status(404).send("User not found");
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
    // Generating salt for bcrypt
    const salt = await bcrypt.genSalt(4); // 4 — nombre de tours

    // Password Hashing(even if two users have the same password, their hashes will be different.)
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert data into the database (with encrypted password)
    const query =
      "INSERT INTO Users (username, password, role) VALUES (?, ?, ?)";
    db.query(query, [username, hashedPassword, role], (err, results) => {
      //error: Database error
      if (err) {
        console.error("Erreur lors de l'ajout de l'utilisateur :", err);
        return res.status(500).send("Erreur de base de données");
      }

      //After successful registration, we redirect to the login page
      res.redirect("/login");
    });
    //error: Password hashing error
  } catch (err) {
    console.error("Erreur lors du hachage du mot de passe :", err);
    res.status(500).send("Erreur lors du hachage du mot de passe");
  }
});

//to logining in your account
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  //Search for a user in the database
  const query = "SELECT * FROM Users WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    //error: Database error
    if (err) {
      console.error("Erreur lors de la recherche de l'utilisateur :", err);
      return res.status(500).send("Erreur de base de données");
    }
    //error: Utilisateur non trouvé
    if (results.length === 0) {
      return res.status(400).send("Utilisateur non trouvé");
    }

    const user = results[0];
    // Compare the entered password with the encrypted password in the database
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // Generate a token with user data
      const token = jwt.sign({ userId: user.id }, "yourSecretKey", {
        expiresIn: "1h",
      });

      // Send the token to the client (can be stored in localStorage or sent as a header)
      res.json({ token: token });
    } else {
      res.status(400).send("Mot de passe incorrect");
    }
  });
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
