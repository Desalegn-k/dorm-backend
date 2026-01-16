// backend/routes/students.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware"); 
 const verifyadmin = require("../middlewares/verifyadmin");

// POST /api/students → register a student
router.post("/", authMiddleware,verifyadmin,userController.registerStudent);
router.post("/login",userController.login)
router.post(
  "/create-admin",
  authMiddleware,
  verifyadmin,
  userController.createAdmin
);
router.post(
  "/create-proctor",
  authMiddleware,
  verifyadmin,
  userController.createProctor
);


module.exports = router;
