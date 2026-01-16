
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");

// ROUTES
const collegeRoutes = require("./routes/colleges");
const userRoutes = require("./routes/users"); // student register + login (your existing)
// const authRoutes = require("./routes/auth"); // new login API (JWT)
const studentRoutes = require("./routes/students"); // student dashboard APIs
const adminRoutes = require("./routes/admin"); // admin dashboard APIs
// const departmentRoutes = require("./routes/department"); // get departments

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test DB route
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({
      success: true,
      message: "Database connected!",
      result: rows[0].result,
    });
  } catch (err) {
    console.error("DB Connection Error:", err);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ---------------------------
// REGISTER ALL ROUTES
// ---------------------------

// Colleges API
app.use("/api/colleges", collegeRoutes);

// // Departments API
// app.use("/api/departments", departmentRoutes);

// Student registration + login (old route)
app.use("/api/sturegister", userRoutes);

// New JWT login route
// app.use("/api/auth", authRoutes);

// Student dashboard (requires token)
app.use("/api/students", studentRoutes);

// Admin dashboard
app.use("/api/admin", adminRoutes);

// ---------------------------
// START THE SERVER
// ---------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    const conn = await pool.getConnection();
    console.log(" MySQL Connected Successfully!");
    conn.release();
    console.log(` Server running on port ${PORT}`);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
});





// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const pool = require("./config/db");
// const collegeRoutes = require("./routes/colleges");
// const studentRoutes = require("./routes/students");

// const session = require("express-session");
// const MySQLStore = require("express-mysql-session")(session);

// const app = express();
// app.use(
//   cors({
//     origin: true,
//     credentials: true, // IMPORTANT FOR SESSION COOKIES
//   })
// );

// app.use(express.json());

// // ⭐ SESSION STORE inside your existing database ⭐
// const sessionStore = new MySQLStore(
//   {
//     host: "localhost",
//     user: "3desalegn",
//     password: "123456",
//     database: "webdms", // <-- your DB
//   },
//   pool  // use same MySQL pool
// );

// // ⭐ SESSION MIDDLEWARE ⭐
// app.use(
//   session({
//     key: "session_id",
//     secret: "myStrongSecretKey",
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//     },
//   })
// );

// // Test route
// app.get("/api/test-db", async (req, res) => {
//   try {
//     const [rows] = await pool.query("SELECT 1 + 1 AS result");
//     res.json({
//       success: true,
//       message: "Database connected!",
//       result: rows[0].result,
//     });
//   } catch (err) {
//     console.error("DB Connection Error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Database connection failed" });
//   }
// });

// // Routes
// app.use("/api/colleges", collegeRoutes);
// app.use("/api/students", studentRoutes);

// // Start server
// const PORT = process.env.PORT || 5003;
// app.listen(PORT, async () => {
//   try {
//     const connection = await pool.getConnection();
//     console.log("✅ DB connection successful");
//     connection.release();
//     console.log(`Server running on port ${PORT}`);
//   } catch (err) {
//     console.error("❌ Failed to connect to DB:", err);
//   }
// });
