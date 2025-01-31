const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const userRoute = require("./routes/User");
const db = require("./db/db");
/*const path = require("path");*/
const app = express();
///////////////////////////////////////////
app.set("view engine", "ejs");

//static files support:
app.use(express.static("public"));
// Middleware for parsing data from the form
app.use(express.urlencoded({ extended: true }));

//default route
app.get("/", (req, res) => {
  res.render("home", { name: "" });
});

// Other routes and middleware
app.get("/login", (req, res) => {
  res.render("login", { name: "Yosef" });
});

// Other routes and middleware
app.get("/registration", (req, res) => {
  res.render("registration");
});

// Route for handling POST request for registration
app.post("/registration", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Generating salt for bcrypt
    const salt = await bcrypt.genSalt(10); // 10 — количество раундов

    // Password Hashing
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert data into the database (with encrypted password)
    const query = "INSERT INTO Users (username, password) VALUES (?, ?)";
    db.query(query, [username, hashedPassword], (err, results) => {
      if (err) {
        console.error("Erreur lors de l'ajout de l'utilisateur :", err);
        return res.status(500).send("Erreur de base de données");
      }

      //After successful registration, we redirect to the login page
      res.redirect("/login");
    });
  } catch (err) {
    console.error("Erreur lors du hachage du mot de passe :", err);
    res.status(500).send("Erreur lors du hachage du mot de passe");
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Rechercher un utilisateur dans la base de données
  const query = "SELECT * FROM Users WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Erreur lors de la recherche de l'utilisateur :", err);
      return res.status(500).send("Erreur de base de données");
    }

    if (results.length === 0) {
      return res.status(400).send("Utilisateur non trouvé");
    }

    const user = results[0];

    // Compare the entered password with the encrypted password in the database
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.send("Connexion réussie");
    } else {
      res.status(400).send("Mot de passe incorrect");
    }
  });
});

//404. If no route matches the URL requested by the consumer
app.use((req, res) => {
  const message =
    "Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
  res.status(404).json({ message }); //json attends l'objet
});

// server butting
app.listen(8080, () => {
  console.log("Server running on port 8080✅ ");
});
