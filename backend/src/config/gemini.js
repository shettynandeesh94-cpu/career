const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini AI initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error.message);
  }
} else {
  console.warn('WARNING: GEMINI_API_KEY is not defined in the environment. AI features will run in Mock Mode.');
}

const getAIResponse = async (prompt, systemInstruction = '') => {
  if (!genAI) {
    console.log('Running in Mock Mode because GEMINI_API_KEY is missing.');
    return getMockAIResponse(prompt);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemInstruction || undefined,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API call failed, falling back to mock response:', error.message);
    return getMockAIResponse(prompt, error.message);
  }
};

const getMockAIResponse = (prompt, errorMessage = '') => {
  const promptLower = prompt.toLowerCase();

  // Mock response for ATS resume analysis
  if (promptLower.includes('ats') || promptLower.includes('resume')) {
    return JSON.stringify({
      score: 78,
      grammarScore: 85,
      impactScore: 72,
      summary: "The resume shows strong experience in full-stack development, but has some areas for optimization. This analysis was generated in fallback Mock Mode because the Gemini API key is not configured.",
      matchingKeywords: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML", "CSS"],
      missingKeywords: ["TypeScript", "Docker", "CI/CD", "Jest", "Cloudinary", "Vercel"],
      grammarFeedback: [
        { issue: "Passive voice in first experience entry.", suggestion: "Change 'Responsible for building code' to 'Built and maintained code'." },
        { issue: "Missing action verbs in project descriptions.", suggestion: "Start each bullet point with strong action verbs like 'Architected', 'Implemented', or 'Designed'." }
      ],
      structuralImprovements: [
        { section: "Header", tip: "Add LinkedIn profile link and GitHub portfolio link." },
        { section: "Experience", tip: "Quantify metrics. e.g., 'Improved load times by 30%' instead of 'Optimized web pages'." }
      ],
      aiSuggestions: "1. Incorporate missing keywords like TypeScript and Docker.\n2. Rewrite bullet points using the STAR method (Situation, Task, Action, Result) and include metrics.\n3. Make sure to define your GEMINI_API_KEY in the backend .env file to enable live AI analysis!"
    });
  }

  // Mock response for Cover Letter / Email / Bio generators
  if (promptLower.includes('cover letter')) {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position. With my background in full-stack JavaScript development (React, Node.js, Express, MongoDB), I am confident that I can contribute effectively to your team.

Throughout my projects, I have focused on building clean, high-performance user interfaces and robust server architectures. I enjoy solving complex engineering challenges and creating product experiences that users love.

Thank you for your time and consideration. I look forward to the possibility of discussing how my skills align with your engineering goals.

Sincerely,
[Your Name]
(Note: This cover letter was generated in Mock Mode. Set your GEMINI_API_KEY to generate personalized AI cover letters.)`;
  }

  if (promptLower.includes('linkedin') || promptLower.includes('summary')) {
    return `🚀 Full Stack Engineer | React & Node.js Developer | Building Scalable Web Products

Passionate about creating modern, responsive applications using JavaScript, Tailwind CSS, and the MERN stack. Experienced in writing clean backend APIs and designing intuitive user interfaces. Always eager to learn new architectures and solve real-world problems.

(Note: This bio was generated in Mock Mode. Please add GEMINI_API_KEY for dynamic AI summaries.)`;
  }

  if (promptLower.includes('email') || promptLower.includes('follow-up')) {
    return `Subject: Follow-up on Software Engineer Application - [Your Name]

Dear [Hiring Manager Name],

I hope this email finds you well.

I am writing to briefly follow up on my application for the Software Engineer position. I remain very enthusiastic about the opportunity to join your team and contribute to your current projects.

Please let me know if there are any additional details or references I can provide. Thank you for your time.

Best regards,
[Your Name]
[Your Phone Number]

(Note: This email was generated in Mock Mode.)`;
  }

  // Mock response for interview coach
  if (promptLower.includes('interview') || promptLower.includes('question') || promptLower.includes('answer')) {
    return JSON.stringify({
      feedback: "Great initial explanation. To make your response stronger, structure it using the STAR method. Talk about the exact technical choices you made (e.g., using useEffect or Redux) and how you measured the results.",
      correctnessScore: 80,
      communicationScore: 85,
      confidenceScore: 75,
      overallScore: 80,
      improvedAnswer: "An improved response would start by explaining the core concept directly, followed by a specific example from your experience. For instance: 'In my last project, I resolved performance issues by implementing lazy loading and code splitting, which reduced initial bundle sizes by 40%...'",
      nextQuestion: "Can you explain the difference between state and props in React, and when you would use a Context vs a Redux state?"
    });
  }

  return `This is a mock AI response. Please configure GEMINI_API_KEY in backend/.env to access real AI evaluations.
Original Prompt context: "${prompt.substring(0, 100)}..."`;
};

module.exports = {
  getAIResponse,
  getMockAIResponse,
};
