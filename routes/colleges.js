const express = require("express");
const router = express.Router();
const collegeController = require("../controllers/collegeController");

// GET all colleges
router.get("/", collegeController.getAllColleges);

// GET departments for a specific college
router.get(
  "/:collegeId/departments",
  collegeController.getDepartmentsByCollege
);

module.exports = router;
