const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const User = require("./user");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(__dirname));

// MongoDB Connection
mongoose.connect("mongodb+srv://steffisequeira494_db_user:*Yellow0307@cluster0.dsom17y.mongodb.net/myUserDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
// Routes

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Add user
app.post("/add", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("User Added ✅");
  } catch (err) {
    res.send("Error ❌");
  }
});

// Get users
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});