const pool = require("../config/db");

// Get all colleges
exports.getAllColleges = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM colleges");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get departments by college ID
exports.getDepartmentsByCollege = async (req, res) => {
  const { collegeId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM departments WHERE college_id = ?",
      [collegeId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
