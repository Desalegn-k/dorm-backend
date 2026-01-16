const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const studentController = require("../controllers/studentController");

router.get("/me", auth, studentController.getProfile);
router.get("/my-room", auth, studentController.getMyRoom);
router.post("/reports", auth, studentController.createReport);
router.get("/my-report",auth,studentController.getStudentReports)
// router.get("/my-reports", auth, studentController.getReports);

module.exports = router;
