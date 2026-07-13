const pdfParse = require('pdf-parse');
const { getAIResponse } = require('../config/gemini');

// Helper to clean up JSON string returned by LLM
const parseJSONFromResponse = (text) => {
  try {
    // If it starts with markdown code block formatting, clean it
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error parsing JSON from Gemini response:', error.message);
    console.log('Original response was:', text);
    // Return a structured error fallback
    return {
      error: true,
      rawText: text,
      score: 60,
      summary: "Could not structure the AI feedback automatically. Please find raw output below.",
      aiSuggestions: text
    };
  }
};

// @desc    Analyze a resume PDF against a job description
// @route   POST /api/ai/analyze-resume
// @access  Private
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume file' });
    }

    const { jobDescription, jobTitle = 'Software Engineer' } = req.body;

    // Parse PDF (handles both standard legacy and class-based 2.x+ forks of pdf-parse)
    let resumeText = '';
    if (typeof pdfParse === 'function') {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } else if (pdfParse && typeof pdfParse.PDFParse === 'function') {
      const parser = new pdfParse.PDFParse(new Uint8Array(req.file.buffer));
      const pdfData = await parser.getText();
      resumeText = pdfData.text;
    } else {
      throw new Error('Could not initialize PDF parser structure');
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract text from the PDF file' });
    }

    const systemInstruction = `You are an expert recruiter and an ATS (Applicant Tracking System) optimization algorithm. 
Analyze the provided resume text against the target job title and job description. 
You MUST respond with a valid JSON object only. Do not output any markdown annotations outside of the JSON block.
The JSON object MUST contain the following keys:
- score: (Number, 0-100 score indicating resume compatibility with the target role)
- grammarScore: (Number, 0-100 rating for grammar, writing quality, and spelling)
- impactScore: (Number, 0-100 rating for impact, action verbs, and quantified achievements)
- summary: (String, a high-level constructive overview of the resume, around 3 sentences)
- matchingKeywords: (Array of Strings, key technical terms, methodologies, or tools found in both the resume and the job requirements)
- missingKeywords: (Array of Strings, critical keywords or skills present in the job description that are missing from the resume)
- grammarFeedback: (Array of Objects, each having 'issue' and 'suggestion' strings)
- structuralImprovements: (Array of Objects, each having 'section' and 'tip' strings)
- aiSuggestions: (String, structured markdown list of concrete steps the candidate should take to improve their resume)`;

    const prompt = `Target Job Title: ${jobTitle}
Target Job Description: ${jobDescription || 'Not specified'}

Resume Text:
---
${resumeText}
---`;

    console.log(`Analyzing resume for role: ${jobTitle}`);
    const aiResponse = await getAIResponse(prompt, systemInstruction);
    const analysisResult = parseJSONFromResponse(aiResponse);

    res.json({
      success: true,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error('Resume Analysis Error:', error.message);
    res.status(500).json({ success: false, message: `Analysis Error: ${error.message}` });
  }
};

// @desc    Generate Cover Letter based on resume/profile and job details
// @route   POST /api/ai/cover-letter
// @access  Private
const generateCoverLetter = async (req, res) => {
  try {
    const { resumeData, jobTitle, company, jobDescription } = req.body;

    if (!jobTitle || !company) {
      return res.status(400).json({ success: false, message: 'Job title and company name are required' });
    }

    const systemInstruction = "You are a professional career coach and expert copywriter. Write a compelling, highly professional cover letter tailored to the job description using details from the user's resume.";

    const prompt = `Job Details:
Role: ${jobTitle}
Company: ${company}
Description: ${jobDescription || 'Not specified'}

Candidate Resume Details:
${JSON.stringify(resumeData || {})}

Write a highly personalized cover letter. Keep it under 400 words. Address the hiring manager professionally. Use placeholders like [Your Name] for contact info if not provided in the resume.`;

    const coverLetter = await getAIResponse(prompt, systemInstruction);

    res.json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error('Cover Letter Generation Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating cover letter' });
  }
};

// @desc    Generate LinkedIn Headline & About summary
// @route   POST /api/ai/linkedin-summary
// @access  Private
const generateLinkedInSummary = async (req, res) => {
  try {
    const { skills, experience, summary } = req.body;

    const systemInstruction = "You are a professional LinkedIn branding expert. Write an eye-catching headline and a compelling 'About' section for a LinkedIn profile.";

    const prompt = `Candidate Details:
Current Summary: ${summary || ''}
Key Skills: ${JSON.stringify(skills || [])}
Work Experience Summary: ${JSON.stringify(experience || [])}

Generate:
1. A LinkedIn Headline (under 220 characters, professional, incorporating key keywords, using emojis/spacers).
2. A compelling 'About/Summary' section (written in 1st person, engaging, highlighting strengths, specifying technologies, ending with a Call-to-action).
Provide both clearly labeled.`;

    const summaryResponse = await getAIResponse(prompt, systemInstruction);

    res.json({
      success: true,
      summary: summaryResponse,
    });
  } catch (error) {
    console.error('LinkedIn Summary Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating LinkedIn summary' });
  }
};

// @desc    Generate Professional Bio
// @route   POST /api/ai/bio
// @access  Private
const generateBio = async (req, res) => {
  try {
    const { profileInfo, tone = 'professional' } = req.body;

    const systemInstruction = `You are a public relations expert. Write a professional bio suitable for portfolios, speaking engagements, or website bios. Tone should be: ${tone}.`;

    const prompt = `Candidate Profile:
${JSON.stringify(profileInfo || {})}

Create a professional bio. Write three versions:
1. Short version (1-2 sentences)
2. Medium version (1 paragraph)
3. Long version (2-3 paragraphs)`;

    const bio = await getAIResponse(prompt, systemInstruction);

    res.json({
      success: true,
      bio,
    });
  } catch (error) {
    console.error('Bio Generation Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating bio' });
  }
};

// @desc    Generate professional emails (follow-up, cold reachout, referral request)
// @route   POST /api/ai/email
// @access  Private
const generateEmail = async (req, res) => {
  try {
    const { type, recipientRole, companyName, jobTitle, customNotes } = req.body;

    if (!type || !companyName) {
      return res.status(400).json({ success: false, message: 'Email type and company name are required' });
    }

    const systemInstruction = "You are a professional writer. Write a concise, high-conversion email for job networking. The email should be polite, short (under 150 words), and make it extremely easy for the recipient to reply.";

    const prompt = `Email Type: ${type} (e.g. cold outreach, follow-up, referral request)
Recipient: ${recipientRole || 'Recruiter / Engineering Manager'} at ${companyName}
Target Job Title: ${jobTitle || 'Software Engineer'}
Additional Context: ${customNotes || 'None'}

Draft a complete professional email including a Subject Line.`;

    const emailText = await getAIResponse(prompt, systemInstruction);

    res.json({
      success: true,
      email: emailText,
    });
  } catch (error) {
    console.error('Email Generation Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating email' });
  }
};

module.exports = {
  analyzeResume,
  generateCoverLetter,
  generateLinkedInSummary,
  generateBio,
  generateEmail,
};
