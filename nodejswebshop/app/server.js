//require("dotenv").config({ path: "../.env" }); // config() Load environment variables from .env file
//const http = require("http");
const https = require("https");
const fs = require("fs");
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("express");
const bcrypt = require("bcrypt"); // for password hashing
const jwt = require("jsonwebtoken"); // JWT for authentication
//const userRoute = require("./routes/user.js");   - -DONT NEED IT, WE ARE USING THE ROUTES IN THE SAME FILE
const db = require("./db/db.js");
const { Console } = require("console");
const app = express();

// Load SSL certificates
const options = {
  key: fs.readFileSync("key.pem"), // ../../key.pem  Path to your private key
  cert: fs.readFileSync("cert.pem"), // ../../cert.pem Path to your certificate
};

app.use(bodyParser.urlencoded({ extended: true })); // parser to interact with form-data
app.use(bodyParser.json()); // for JSON-requests

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

// Import and use routes
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const searchRouter = require("./routes/search-user");
const userRoute = require("./routes/user.js");

app.use(adminRoute);
app.use(searchRouter);
app.use(authRoute);
app.use(userRoute);

//404. If no route matches the URL requested by the consumer
app.use((req, res) => {
  const message =
    "Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
  res.status(404).json(message); //json attends l'objet
});

// HTTPS server butting
const server = https.createServer(options, app);

server.listen(8443, () => {
  console.log("HTTPS server running on https://localhost:8443 ✅");
});
