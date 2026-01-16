const pool = require("./config/db");

async function seedDormsAndRooms() {
  try {
    for (let i = 1; i <= 20; i++) {
      const dormName = ` ${i}`;
      const gender = i % 2 === 0 ? "male" : "female";

      // Insert dorm
      const [result] = await pool.execute(
        "INSERT INTO dorms (name, gender) VALUES (?, ?)",
        [dormName, gender]
      );

      const dormId = result.insertId;
      console.log(`Created ${dormName} (ID: ${dormId})`);

      // Prepare bulk rooms array
      let rooms = [];
      for (let r = 1; r <= 20; r++) {
        const roomNumber = `${r}`;
        rooms.push([dormId, roomNumber, 6]);
      }

      // Bulk insert rooms
      await pool.query(
        "INSERT INTO rooms (dorm_id, room_number, capacity) VALUES ?",
        [rooms]
      );

      console.log(` → Inserted 20 rooms for ${dormName}`);
    }

    console.log("✔ DONE! Fast insert completed.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedDormsAndRooms();
