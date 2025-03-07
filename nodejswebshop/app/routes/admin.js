const express = require("express");

const { Console } = require("console");

const adminRouter = express.Router();

const controller = require("../controllers/AdminController");
adminRouter.get("/", controller.get);

// Route to view admin page
adminRouter.get("/admin", (req, res) => {
  res.render("admin", { users: [], error: "" }); //No users displayed on initial load. No error messages at start.
});

module.exports = adminRouter;
