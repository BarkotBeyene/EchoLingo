const { bucket } = require("../config/firebaseAdmin");
const multer = require("multer");
const { LearningMaterial } = require("../models");

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Allowed file types
const ALLOWED_TYPES = {
  "text/plain": "text",
  "application/pdf": "text",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "video/mp4": "video",
  "video/quicktime": "video",
};

// AI-generated placeholder materials
const aiGeneratedMaterials = [
  {
    id: "ai_1",
    url: "https://ai-content.example.com/intro-to-grammar.pdf",
    type: "text",
    category: "Grammar",
    source: "AI-Generated",
  },
  {
    id: "ai_2",
    url: "https://ai-content.example.com/grammar-tutorial.mp4",
    type: "video",
    category: "Grammar",
    source: "AI-Generated",
  },
  {
    id: "ai_3",
    url: "https://ai-content.example.com/vocabulary-practice.mp3",
    type: "audio",
    category: "Vocabulary",
    source: "AI-Generated",
  },
];

// Upload File to Firebase Storage
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileType = ALLOWED_TYPES[req.file.mimetype];
    if (!fileType) return res.status(400).json({ error: "Invalid file type" });

    if (!req.body.category) return res.status(400).json({ error: "Category is required" });

    const fileName = `${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    // Upload file to Firebase Storage
    const blobStream = file.createWriteStream({
      metadata: { contentType: req.file.mimetype },
    });

    blobStream.on("error", (err) => res.status(500).json({ error: err.message }));

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Store metadata in the database
      const newMaterial = await LearningMaterial.create({
        url: publicUrl,
        type: fileType,
        category: req.body.category,
        source: "Student Upload",
      });

      res.status(200).json({
        message: "File uploaded successfully",
        material: newMaterial,
      });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch Learning Materials (Student Uploads + AI-Generated)
const getMaterials = async (req, res) => {
  try {
    const { type, category } = req.query;
    let whereClause = {};

    if (type) whereClause.type = type;
    if (category) whereClause.category = category;
    if (language) whereClause.language = language; 

    // Fetch student-uploaded materials from DB
    const studentMaterials = await LearningMaterial.findAll({ where: whereClause });

    // Filter AI-generated materials based on query
    const filteredAiMaterials = aiGeneratedMaterials.filter(
      (item) => (!type || item.type === type) && (!category || item.category === category)
    );

    // Combine both sources
    const allMaterials = [...studentMaterials, ...filteredAiMaterials];

    res.status(200).json(allMaterials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { upload, uploadFile, getMaterials };