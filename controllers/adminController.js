const pool = require("../config/db");

exports.getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const keyword = `%${search}%`;

    // 1️⃣ Count filtered students
    const [countResult] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM students s
      JOIN colleges c ON s.college_id = c.id
      JOIN departments d ON s.department_id = d.id
      LEFT JOIN room_assignments ra 
        ON ra.student_id = s.id AND ra.status = 'active'
      LEFT JOIN rooms r ON ra.room_id = r.id
      LEFT JOIN dorms dm ON r.dorm_id = dm.id
      WHERE
        s.full_name LIKE ?
        OR s.studentId LIKE ?
        OR c.name LIKE ?
        OR d.name LIKE ?
        OR dm.name LIKE ?
        OR r.room_number LIKE ?
      `,
      [keyword, keyword, keyword, keyword, keyword, keyword]
    );

    const total = countResult[0].total;

    // 2️⃣ Get filtered students
    const [rows] = await pool.execute(
      `
      SELECT 
        s.id,
        s.studentId,
        s.full_name,
        s.gender,
        s.email,
        s.year,
        c.name AS college,
        d.name AS department,
        dm.name AS dorm_number,
        r.room_number,
        ra.status AS assignment_status
      FROM students s
      JOIN colleges c ON s.college_id = c.id
      JOIN departments d ON s.department_id = d.id
      LEFT JOIN room_assignments ra 
        ON ra.student_id = s.id AND ra.status = 'active'
      LEFT JOIN rooms r ON ra.room_id = r.id
      LEFT JOIN dorms dm ON r.dorm_id = dm.id
      WHERE
        s.full_name LIKE ?
        OR s.studentId LIKE ?
        OR c.name LIKE ?
        OR d.name LIKE ?
        OR dm.name LIKE ?
        OR r.room_number LIKE ?
      LIMIT ? OFFSET ?
      `,
      [keyword, keyword, keyword, keyword, keyword, keyword, limit, offset]
    );

    res.json({
      students: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Get Students Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Admin gets all student reports
exports.getAllReports = async (req, res) => {
  try {
    const [reports] = await pool.execute(
      `SELECT r.id, r.description, r.admin_response, r.status, r.created_at,
              s.full_name AS student_name
       FROM reports r
       JOIN students s ON r.student_id = s.id
       ORDER BY r.created_at DESC`
    );

    res.json(reports);
  } catch (err) {
    console.error("Get Reports Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// Admin responds to a report
exports.respondToReport = async (req, res) => {
  try {
    const { response } = req.body;
    const reportId = req.params.id;

    if (!response || response.trim() === "") {
      return res.status(400).json({ message: "Response is required" });
    }

    await pool.execute(
      `UPDATE reports
       SET admin_response = ?, status = 'responded', responded_at = NOW()
       WHERE id = ?`,
      [response, reportId]
    );

    res.json({ message: "Response sent successfully" });
  } catch (err) {
    console.error("Respond Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// exports.assignRoom = async (req, res) => {
//   try {
//     const { student_id, room_id } = req.body;

//     if (!student_id || !room_id) {
//       return res.status(400).json({
//         message: "student_id and room_id required",
//       });
//     }

//     // 1️⃣ Get student gender
//     const [student] = await pool.execute(
//       "SELECT gender FROM students WHERE id = ?",
//       [student_id]
//     );

//     if (student.length === 0) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     const studentGender = student[0].gender;

//     // 2️⃣ Get room + dorm_id
//     const [room] = await pool.execute(
//       `SELECT dorms.id AS dorm_id
//        FROM rooms
//        JOIN dorms ON rooms.dorm_id = dorms.id
//        WHERE rooms.id = ?`,
//       [room_id]
//     );

//     if (room.length === 0) {
//       return res.status(404).json({ message: "Room not found" });
//     }

//     const dormId = room[0].dorm_id;

//     // 3️⃣ Determine dorm gender
//     const dormGender = dormId % 2 === 0 ? "female" : "male";

//     if (studentGender !== dormGender) {
//       return res.status(400).json({
//         message: `Cannot assign ${studentGender} student to dorm ${dormId} (${dormGender} dorm).`,
//       });
//     }

//     // ✅ NEW STEP: Check room capacity
//     const [countRes] = await pool.execute(
//       `SELECT COUNT(*) AS total 
//        FROM room_assignments 
//        WHERE room_id = ? AND status='active'`,
//       [room_id]
//     );

//     const currentCount = countRes[0].total;

//     if (currentCount >= 6) {
//       return res.status(400).json({
//         message: "Room is full (maximum capacity = 6 students)",
//       });
//     }

//     // 5️⃣ Check if student already has active room
//     const [exists] = await pool.execute(
//       "SELECT * FROM room_assignments WHERE student_id = ? AND status='active'",
//       [student_id]
//     );

//     if (exists.length > 0) {
//       return res.status(400).json({
//         message: "Student already has an active room assignment",
//       });
//     }

//     // 6️⃣ Assign room
//     await pool.execute(
//       "INSERT INTO room_assignments (student_id, room_id) VALUES (?, ?)",
//       [student_id, room_id]
//     );

//     res.json({ message: "Room assigned successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
exports.getUsersByRole = async (req, res) => {
  const { role } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE role = ?",
      [role]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    await pool.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [
      name,
      email,
      id,
    ]);
    res.json({ msg: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};




exports.autoAssignRooms = async (req, res) => {
  try {
    console.log("⚙️ Running automatic room assignment...");

    // 1️⃣ Get all students not yet assigned
    const [students] = await pool.execute(`
      SELECT * FROM students
      WHERE id NOT IN (
        SELECT student_id FROM room_assignments WHERE status='active'
      )
    `);

    let logs = [];

    // 2️⃣ Loop each student
    for (const student of students) {
      const gender = student.gender;

      // 3️⃣ Get rooms matching gender
      const [rooms] = await pool.execute(
        `
        SELECT rooms.id, dorms.gender
        FROM rooms
        JOIN dorms ON rooms.dorm_id = dorms.id
        WHERE dorms.gender = ?
      `,
        [gender]
      );

      let assigned = false;

      // 4️⃣ Try assign student to a room
      for (const room of rooms) {
        // Check capacity
        const [countRes] = await pool.execute(
          `
          SELECT COUNT(*) AS total
          FROM room_assignments
          WHERE room_id = ? AND status='active'
        `,
          [room.id]
        );

        if (countRes[0].total < 6) {
          await pool.execute(
            `
            INSERT INTO room_assignments(student_id, room_id)
            VALUES(?, ?)
          `,
            [student.id, room.id]
          );

          logs.push(`Student ${student.id} assigned to Room ${room.id}`);
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        logs.push(`❌ No available room for student ${student.id}`);
      }
    }

    res.json({
      message: "Automatic assignment completed",
      logs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//manual assignment
exports.manualAssignRoom = async (req, res) => {
  try {
    const { studentId, dormNumber, roomNumber } = req.body;

    if (!studentId || !dormNumber || !roomNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1️⃣ Get student using INSERTED studentId (not auto ID)
    const [students] = await pool.execute(
      `SELECT * FROM students WHERE studentId = ?`,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = students[0];

    // 2️⃣ Check if student already assigned
    const [existing] = await pool.execute(
      `SELECT * FROM room_assignments 
       WHERE student_id = ? AND status = 'active'`,
      [student.id]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Student already has an active room assignment" });
    }

    // 3️⃣ Get dorm by dorm number
    const [dorms] = await pool.execute(`SELECT * FROM dorms WHERE name = ?`, [
      dormNumber,
    ]);

    if (dorms.length === 0) {
      return res.status(404).json({ message: "Dorm not found" });
    }

    const dorm = dorms[0];

    // 4️⃣ Gender check
    if (dorm.gender !== student.gender) {
      return res
        .status(400)
        .json({ message: "Dorm gender does not match student gender" });
    }

    // 5️⃣ Get room in that dorm
    const [rooms] = await pool.execute(
      `SELECT * FROM rooms 
       WHERE dorm_id = ? AND room_number = ?`,
      [dorm.id, roomNumber]
    );

    if (rooms.length === 0) {
      return res.status(404).json({ message: "Room not found in this dorm" });
    }

    const room = rooms[0];

    // 6️⃣ Check room capacity
    const [countRes] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM room_assignments
       WHERE room_id = ? AND status = 'active'`,
      [room.id]
    );

    if (countRes[0].total >= room.capacity) {
      return res.status(400).json({ message: "Room is already full" });
    }

    // 7️⃣ Assign room
    await pool.execute(
      `INSERT INTO room_assignments (student_id, room_id)
       VALUES (?, ?)`,
      [student.id, room.id]
    );

    res.json({
      message: "Room assigned successfully",
      student: student.studentId,
      dorm: dorm.name,
      room: room.room_number,
    });
  } catch (err) {
    console.error("Manual Assignment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//get an ubsigned studebts

exports.getUnassignedStudents = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.id, s.studentId, s.full_name
      FROM students s
      WHERE s.id NOT IN (
        SELECT student_id FROM room_assignments WHERE status='active'
      )
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//get assigned students

exports.getAssignedStudents = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ra.id AS assignment_id,
        s.studentId,
        s.full_name,
        d.name AS dorm_number,
        r.room_number,
        ra.status,
        ra.assigned_date
      FROM room_assignments ra
      JOIN students s ON ra.student_id = s.id
      JOIN rooms r ON ra.room_id = r.id
      JOIN dorms d ON r.dorm_id = d.id
      WHERE ra.status = 'active'
      ORDER BY s.full_name ASC
    `);
    

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//unassigned one student

exports.unassignStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      `delete from room_assignments   WHERE id=?`,
      [id]
    );

    res.json({ message: "Student unassigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//edit assign
exports.editAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { dormNumber, roomNumber } = req.body;

    // 🔒 HARD VALIDATION
    if (!id || !dormNumber || !roomNumber) {
      return res.status(400).json({
        message: "Dorm number and room number are required",
      });
    }

    // 🔹 1️⃣ Get student's gender from the assignment
    const [studentRow] = await pool.execute(
      `
      SELECT s.gender
      FROM room_assignments ra
      JOIN students s ON ra.student_id = s.id
      WHERE ra.id = ?
      `,
      [id]
    );

    if (studentRow.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentGender = studentRow[0].gender;

    // 🔹 2️⃣ Find room ONLY if dorm gender matches student gender
    const [room] = await pool.execute(
      `
      SELECT r.id
      FROM rooms r
      JOIN dorms d ON r.dorm_id = d.id
      WHERE d.name = ?
        AND d.gender = ?
        AND r.room_number = ?
      `,
      [dormNumber, studentGender, roomNumber]
    );

    if (room.length === 0) {
      return res.status(400).json({
        message: "Gender mismatch or room not found",
      });
    }

    // 🔹 3️⃣ Update assignment
    await pool.execute(`UPDATE room_assignments SET room_id = ? WHERE id = ?`, [
      room[0].id,
      id,
    ]);

    res.json({ message: "Assignment updated successfully" });
   
  } catch (err) {
    console.error("Edit Assignment Error:", err);
     console.log("REQ BODY:", req.body);
     console.log("ID:", id);
    res.status(500).json({ message: "Server error" });
  }
};

//unsigned all students

exports.unassignAll = async (req, res) => {
  try {
    await pool.execute(
      `UPDATE room_assignments SET status='ended' WHERE status='active'`
    );

    res.json({ message: "All students unassigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};









exports.addDorm = async (req, res) => {
  const { name, gender, description } = req.body;

  await pool.execute(
    "INSERT INTO dorms (name, gender ) VALUES (?, ? )",
    [name, gender]
  );

  res.json({ message: "Dorm created" });
};

exports.addRoom = async (req, res) => {
  const { dorm_id, room_number, capacity } = req.body;

  await pool.execute(
    "INSERT INTO rooms (dorm_id, room_number, capacity) VALUES (?, ?, ?)",
    [dorm_id, room_number, capacity]
  );

  res.json({ message: "Room added" });
};

exports.getsudentreports = async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT m.*, u.name, r.room_number
     FROM reports m
     JOIN users u ON u.id = m.user_id
     JOIN rooms r ON r.id = m.room_id`
  );

  res.json(rows);
};

// exports.updatestudentreport = async (req, res) => {
//   const { id, status } = req.body;

//   await pool.execute(
//     "UPDATE maintenance_requests SET status = ? WHERE id = ?",
//     [status, id]
//   );

//   res.json({ message: "Status updated" });
// };
