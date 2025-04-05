const express = require("express");
const cors = require("cors");
const learningRoutes = require("./routes/learningRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Register learning materials API routes
app.use("/api", learningRoutes);

app.listen(5000, () => console.log("🚀 Server running on port 5000"));