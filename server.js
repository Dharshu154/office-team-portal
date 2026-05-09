const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const app = express();

// =============================
// ENV SETTINGS (IMPORTANT)
// =============================
const PORT = process.env.PORT || 3000;

// =============================
// MIDDLEWARE
// =============================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// =============================
// ROOT ROUTE (FIX FOR "Cannot GET /")
// =============================
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// =============================
// UPLOADS FOLDER CHECK
// =============================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// =============================
// MONGODB CONNECTION (FIXED)
// =============================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

// =============================
// MULTER SETUP
// =============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// =============================
// USER SCHEMA
// =============================
const UserSchema = new mongoose.Schema({
  username: String,
  mobile: String,
  role: { type: String, default: "user" }
});

const User = mongoose.model("User", UserSchema);

// =============================
// ADD USER
// =============================
app.post("/addUser", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: "User Added" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================
// GET USERS
// =============================
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// =============================
// UPDATE USER
// =============================
app.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Updated",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================
// DELETE USER
// =============================
app.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================
// MAKE ADMIN
// =============================
app.put("/make-admin/:id", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { role: "admin" });
    res.json({ message: "User promoted to admin" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================
// MAKE USER
// =============================
app.put("/make-user/:id", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { role: "user" });
    res.json({ message: "Admin changed to user" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================
// LOGIN API (FIXED)
// =============================
app.post("/login", async (req, res) => {
  try {
    let { username, mobile } = req.body;

    // ADMIN LOGIN
    if (username === "admin" && mobile === "1234") {
      return res.json({
        status: "admin_ok",
        user: { username: "admin", role: "admin" }
      });
    }

    // FIND USER
    const user = await User.findOne({
      username: { $regex: new RegExp("^" + username.trim() + "$", "i") },
      mobile: mobile.trim()
    });

    if (!user) {
      return res.json({ status: "fail" });
    }

    const role = (user.role || "").toLowerCase();

    if (role === "admin") {
      return res.json({ status: "admin_ok", user });
    }

    return res.json({ status: "user_ok", user });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// =============================
// MESSAGE SCHEMA
// =============================
const MessageSchema = new mongoose.Schema({
  from: { type: String, default: "admin" },
  username: String,
  message: String,
  image: String,
  imageUrl: { type: String, default: "" },
  confidential: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", MessageSchema);

// =============================
// GET MESSAGES
// =============================
app.get("/messages/:username", async (req, res) => {
  const username = req.params.username.trim().toLowerCase();

  const messages = await Message.find({
    username: username
  }).sort({ createdAt: -1 });

  res.json(messages);
});

// =============================
// START SERVER
// =============================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});host:"+PORT);
});
