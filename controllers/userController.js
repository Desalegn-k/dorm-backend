// backend/controllers/studentController.js
const bcrypt = require("bcrypt");
const pool = require("../config/db"); // ← import the MySQL pool here
 const jwt = require("jsonwebtoken");

exports.registerStudent = async (req, res) => {

  
  try {
    const {
      full_name,
      gender,
      email,
      password,
      
      college_id,
      department_id,
      year,
      studentId,
    } = req.body;
    if (
      !full_name ||
      !gender ||
      !email ||
      !password ||
      
      !college_id ||
      !department_id ||
      !year ||
      !studentId
    )
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });

    // Check if email already exists in users table
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    // Strong Password Rule
    // const strongPasswordRegex =
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // // Validate password
    // if (!strongPasswordRegex.test(password)) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.",
    //   });
    // }
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert into users table with role = 'user'
    const [userResult] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'user')`,
      [full_name, email, password_hash]
    );

    const userId = userResult.insertId;

    // Insert into students table
    await pool.execute(
      `INSERT INTO students
       (id, full_name, gender,studentId, email,   college_id, department_id, year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, full_name, gender, studentId,email,   college_id, department_id, year]
    );

    res.json({
      success: true,
      message: "Student registered successfully",
      studentId: userId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// controllers/userController.js
// const db = require("../config/db");
// const bcrypt = require("bcryptjs");

exports.createAdmin = async (req, res) => {
  const { name, email, password_hash } = req.body;

  if (!name || !email|| !password_hash)
    return res.status(400).json({ msg: "All fields required" });

  try {
    const hashed = bcrypt.hashSync(password_hash, 10);

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role ) 
       VALUES (?, ?, ?, 'admin')`,
      [name,email, hashed]
    );

    return res.json({ msg: "Admin account created successfully" });
  } catch (error) {
    console.log(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ msg: "Admin already exists!" });
    }

    return res.status(500).json({ msg: "Server error" });
  }
};
exports.createProctor = async (req, res) => {
  const { name, email, password_hash } = req.body;

  if (!name || !email || !password_hash)
    return res.status(400).json({ msg: "All fields required" });

  try {
    const hashed = bcrypt.hashSync(password_hash, 10);

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role ) 
       VALUES (?, ?, ?, 'staff')`,
      [name, email, hashed]
    );

    return res.json({ msg: "Proctor account created successfully" });
  } catch (error) {
    console.log(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ msg: "Proctor already exists!" });
    }

    return res.status(500).json({ msg: "Server error" });
  }
};

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "email and password required" });
//     }

//     const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
//       email,
//     ]);

//     if (rows.length === 0) {
//       return res.status(400).json({ message: "User not registered" });
//     }

//     const user = rows[0];

//     const isMatch = bcrypt.compareSync(password, user.password_hash);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Incorrect password" });
//     }

//     // ⭐ CREATE SESSION ⭐
//     req.session.user = {
//       id: user.id,
//       name: user.name,
//       role: user.role,
//       email: user.email,
//     };

//     return res.json({
//       message: "Login successful",
//       user: req.session.user, // send user data
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    // ⭐ FIX APPLIED HERE: Destructure to get the 'rows' array first ⭐
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    // Check if any user was found
    if (rows.length === 0) {
      return res.status(400).json({ message: "User not registered" });
    }

    // Get the single user object from the array
    const user = rows[0];

    // Password comparison
    const isMatch = bcrypt.compareSync(password, user.password_hash);

    if (!isMatch) {
      // Handle incorrect password
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Create JWT Token
    const role = user.role;
    const name = user.name;
    const id=user.id;

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      "secret123", // WARNING: Use process.env.JWT_SECRET in production
      { expiresIn: "1d" }
    );

    // Success response
    res.json({
      message: "Login successful",
      token,
      role,
      name,
      id,
    });
  } catch (error) {
    // Only actual server/database errors reach here
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
