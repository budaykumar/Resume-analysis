// backend/controllers/resumeController.js
const db = require("../db");
const analysisService = require("../services/analysisService");

async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path; // multer stores file on disk
    const fileName = req.file.originalname;

    // 1. Parse PDF (from disk path)
    const resumeText = await analysisService.parsePdf(filePath);

    // 2. Call Gemini to extract structured JSON
    const extracted = await analysisService.callGemini(resumeText);

    // 3. Save to DB (JSONB for nested data)
    const query = `
      INSERT INTO resumes
      (file_name, name, email, phone, linkedin_url, portfolio_url, summary,
       work_experience, education, technical_skills, soft_skills, projects,
       certifications, resume_rating, improvement_areas, upskill_suggestions)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *;
    `;

    const values = [
      fileName,
      extracted.name || null,
      extracted.email || null,
      extracted.phone || null,
      extracted.linkedin_url || null,
      extracted.portfolio_url || null,
      extracted.summary || null,
      JSON.stringify(extracted.work_experience || []),
      JSON.stringify(extracted.education || []),
      JSON.stringify(extracted.technical_skills || []),
      JSON.stringify(extracted.soft_skills || []),
      JSON.stringify(extracted.projects || []),
      JSON.stringify(extracted.certifications || []),
      extracted.resume_rating || null,
      extracted.improvement_areas || null,
      JSON.stringify(extracted.upskill_suggestions || [])
    ];

    const result = await db.query(query, values);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

async function getAllResumes(req, res) {
  try {
    const result = await db.query(
      "SELECT id, file_name, uploaded_at, name, email FROM resumes ORDER BY uploaded_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Get all resumes error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function getResumeById(req, res) {
  try {
    const id = req.params.id;
    const result = await db.query("SELECT * FROM resumes WHERE id=$1", [id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Get resume by ID error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  uploadResume,
  getAllResumes,
  getResumeById,
};
