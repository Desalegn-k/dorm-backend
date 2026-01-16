const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const verifyadmin = require("../middlewares/verifyadmin");
const adminController = require("../controllers/adminController");
const verifyProctorOrAdmin = require("../middlewares/verifyProctorOrAdmin");
const verifiyProctor = require("../middlewares/verifiyProctor");


// Student Management common
router.get("/students", auth,verifyProctorOrAdmin, adminController.getStudents);
// router.post("/assign-room", auth, verifyadmin, adminController.assignRoom);
// router.post("/auto-assign", roomController.autoAssignByDepartment);



// Dorm/Room Management
router.post("/dorm", auth, verifyadmin, adminController.addDorm);
router.post("/room", auth, verifyadmin, adminController.addRoom);
router.get("/users/:role",auth,verifyadmin,adminController.getUsersByRole);
router.put("/users/:id", auth, verifyadmin, adminController.updateUser);
router.delete("/users/:id", auth, verifyadmin, adminController.deleteUser);
//get reports // proctor
router.post("/auto-assign", auth, adminController.autoAssignRooms);
router.post("/manual-assign", auth,verifiyProctor, adminController.manualAssignRoom);
router.post("/manual-assign", auth,verifiyProctor, adminController.manualAssignRoom);
router.get("/unassigned",auth,verifiyProctor,adminController.getUnassignedStudents)
router.get("/get-reports",auth,verifiyProctor,adminController.getAllReports);
router.put("/get-reports/:id/respond",auth,verifiyProctor,adminController.respondToReport);
router.get("/assigned",auth,verifiyProctor, adminController.getAssignedStudents)
router.delete("/unassigned/:id",auth,verifiyProctor,adminController.unassignStudent);
router.put("/edit-r/:id",auth,verifiyProctor,adminController.editAssignment)
router.put("/unassign-all",auth,verifiyProctor,adminController.unassignAll)





 

module.exports = router;
