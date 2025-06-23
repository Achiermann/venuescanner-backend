import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js"; // your DB connection

const router = express.Router();
const SECRET = "your_super_secret_key"; // replace with env var in production

console.log("✅ auth.js loaded");


// ✅ REGISTER
router.post("/register", async (req, res) => {
const { email, username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool
    .promise()
    .query("INSERT INTO users (email, username, password) VALUES (?, ?, ?)", [
      email,
      username,
      hashedPassword,
    ]);

    res.status(201).json({ message: "User registered!" });
  } catch (err) {
console.log("Register error caught");
  console.error("Register error:", err);

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(400).json({ error: "Username or email already exists" });
  }

  res.status(500).json({ error: "Registration failed", details: err.message });
}
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body; // ✅ first

  console.log("🔍 Attempting login for:", username);

  try {
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    console.log("🔍 Found rows:", rows);

    const user = rows[0];
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // ✅ Declare it here first

  // ✅ Only log it AFTER it's declared
  console.log("🔐 Token received:", token);
  console.log("🔐 Using secret:", SECRET);

  if (!token) {
    console.warn("No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      console.warn("Invalid token");
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  });
}

router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is protected data", user: req.user });
});

// ✅ POST BOOKMARKS
router.post("/bookmarks", verifyToken, async (req, res) => {
  console.log("✅ POST /bookmarks hit");
  console.log("Incoming token user:", req.user);
  console.log("Request body:", req.body);

  const { item_id } = req.body;
  const userId = req.user.id;

  try {
    const [result] = await pool
      .promise()
      .query("INSERT INTO bookmarks (user_id, item_id) VALUES (?, ?)", [userId, item_id]);

    console.log("✅ Bookmark inserted:", result);
    res.status(201).json({ message: "Bookmark saved" });
  } catch (err) {
    console.error("❌ Error inserting bookmark:", err); // <-- ADD THIS
    res.status(500).json({ error: "Failed to save bookmark", detail: err.message });
  }
});



// ✅ GET BOOKMARKS
router.get("/bookmarks", verifyToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const [rows] = await pool
    .promise()
    .query("SELECT item_id FROM bookmarks WHERE user_id = ?", [userId]);
    
    res.json({ bookmarks: rows.map(r => r.item_id) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

console.log("✅ Exporting auth router with routes:",
  router.stack
    .filter(r => r.route && r.route.path)
    .map(r => r.route.path)
);

// ✅ DELETE BOOKMARK
router.delete("/bookmarks/:item_id", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.item_id;

  try {
    await pool
      .promise()
      .query("DELETE FROM bookmarks WHERE user_id = ? AND item_id = ?", [userId, itemId]);

    res.status(200).json({ message: "Bookmark deleted" });
  } catch (err) {
    console.error("Delete bookmark error:", err);
    res.status(500).json({ error: "Failed to delete bookmark" });
  }
});

export default router;