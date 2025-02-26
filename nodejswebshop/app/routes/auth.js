/*const express = require("express");
const router = express.Router();

const controller = require("../controllers/AuthController");
router.get("/", controller.get);
module.exports = router;

app.use("/auth", userRoute);
/////*/
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db"); // Assure-toi que c'est bien la connexion à ta base de données
require("dotenv").config(); // Pour utiliser les variables d'environnement

const app = express();
app.use(express.json()); // Pour parser les requêtes JSON

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Nom d'utilisateur et mot de passe sont requis." });
  }

  try {
    // Requête SQL pour récupérer l'utilisateur
    const query = "SELECT * FROM Users WHERE username = ?";

    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error("Erreur lors de la recherche de l'utilisateur :", err);
        return res.status(500).json({ message: "Erreur de base de données" });
      }

      if (results.length === 0) {
        return res
          .status(400)
          .json({ message: "Utilisateur ou mot de passe incorrect" });
      }

      const user = results[0];

      // Vérifier le mot de passe haché
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res
          .status(400)
          .json({ message: "Utilisateur ou mot de passe incorrect" });
      }

      // Générer un token JWT avec le rôle de l'utilisateur
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET_KEY || "yourSecretKey",
        { expiresIn: "1000h" }
      );

      // Réponse JSON avec message et redirection côté client
      res.json({
        message: "Connexion réussie ✅",
        token,
        role: user.role, // On envoie la role pour gérer la redirection côté client
      });
    });
  } catch (err) {
    console.error("Erreur lors de la tentative de connexion :", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la tentative de connexion" });
  }
});

module.exports = app;
