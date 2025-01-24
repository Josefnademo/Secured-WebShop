const express = require("express");
const app = express();
const userRoute = require("./routes/User");
/*const path = require("path");*/

app.use("/user", userRoute);

app.set("view engine", "ejs");

/*// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));*/

// Other routes and middleware
app.get("/", (req, res) => {
  res.render("login", { name: "Yosef" });
});

// server butting
app.listen(8080, () => {
  console.log("Server running on port 8080");
});
