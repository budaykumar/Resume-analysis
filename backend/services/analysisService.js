// backend/services/analysisService.js
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function parsePdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath); // read from disk
    const data = await pdfParse(dataBuffer);
    return data.text; // raw text from PDF
  } catch (err) {
    console.error("PDF parsing failed:", err);
    throw new Error("Failed to parse resume PDF");
  }
}

async function callGemini(resumeText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Extract structured JSON from this resume text:
      ${resumeText}
      
      Required fields:
      {
        "name": "",
        "email": "",
        "phone": "",
        "linkedin_url": "",
        "portfolio_url": "",
        "summary": "",
        "work_experience": [],
        "education": [],
        "technical_skills": [],
        "soft_skills": [],
        "projects": [],
        "certifications": [],
        "resume_rating": "",
        "improvement_areas": "",
        "upskill_suggestions": []
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Ensure valid JSON
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini call failed:", err);
    throw new Error("Failed to analyze resume with Gemini");
  }
}

module.exports = {
  parsePdf,
  callGemini,
};
