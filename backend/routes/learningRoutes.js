const express = require("express");
const { upload, uploadFile, getMaterials } = require("../controllers/learningController");

const router = express.Router();

// Upload Learning Material (Students can upload)
router.post("/upload", upload.single("file"), uploadFile);

// Fetch Learning Materials (Student uploads + AI-generated)
router.get("/materials", getMaterials);

module.exports = router;