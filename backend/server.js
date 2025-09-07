import express from "express";
import multer from "multer";
import cors from "cors";
import fetch from "node-fetch"; // Only needed if Node <18

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for file uploads (in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Upload resume endpoint
app.post("/api/resumes/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Example: sending the PDF buffer to an external API
    const response = await fetch("https://api.example.com/parse-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/pdf",
        "Authorization": "Bearer YOUR_API_KEY", // if needed
      },
      body: req.file.buffer, // send raw file
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();

    // Return parsed resume data to frontend
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to parse resume" });
  }
});

// Start backend on port 4000
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
