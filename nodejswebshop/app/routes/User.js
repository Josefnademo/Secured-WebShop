const express = require("express");

const router = express.Router();
const controller = require("../controllers/UserController");
//router.get("/", controller.get);
module.exports = router;
router.get("/login", (req, res) => {
  res.render("login", { name: "Yosef" });
  if (!res.render("login")) {
    res.status(404).send("page introuvable. Veuillez verifier votre URL");
  }
});

/*app.get("/menu", (req, res) => {
  res.render("menu");
});*/

/*app.get("/login", (req, res) => {
  res.render("login");
  if (!res.render("login")) {
    res.status(404).send("page introuvable. Veuillez verifier votre URL");
  }
});*/
