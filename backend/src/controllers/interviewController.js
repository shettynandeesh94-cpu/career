const Interview = require('../models/Interview');
const { getAIResponse } = require('../config/gemini');

// Clean JSON response helper
const parseJSONFromResponse = (text) => {
  try {
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error parsing JSON from Gemini response:', error.message);
    return null;
  }
};

// @desc    Start a new mock interview session
// @route   POST /api/interviews/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const { role = 'Software Engineer', mode = 'technical' } = req.body;

    // Create session in DB
    const interview = new Interview({
      user: req.user.id,
      role,
      mode,
      status: 'active',
      messages: [],
    });

    // Request AI to generate a opening interview question
    const systemInstruction = `You are a professional HR manager or technical lead conducting a job interview for a ${role} position. 
Mode: ${mode === 'technical' ? 'Technical (focus on core skills, algorithms, architecture, coding concepts)' : 'HR / Behavioral (focus on cultural fit, situational responses, conflict resolution, past experience)'}.
Initiate the interview. Greet the candidate and ask the FIRST question. Keep the response professional, friendly, and brief (under 3 sentences).`;

    const prompt = `Conducting a ${mode} interview for ${role}. Greet the candidate and ask the first question.`;
    const aiIntro = await getAIResponse(prompt, systemInstruction);

    // Save initial AI message
    interview.messages.push({
      sender: 'ai',
      text: aiIntro,
    });

    await interview.save();

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error('Start Interview Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error starting interview session' });
  }
};

// @desc    Submit user answer and get next question
// @route   POST /api/interviews/:id/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const interviewId = req.params.id;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    const interview = await Interview.findOne({ _id: interviewId, user: req.user.id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found or unauthorized' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This interview has already been completed' });
    }

    // Save user's message
    interview.messages.push({
      sender: 'user',
      text: message,
    });

    // Ask AI to evaluate response briefly and ask the next question
    // To make it conversational, we feed the recent messages
    const chatHistory = interview.messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

    const systemInstruction = `You are a professional interviewer conducting a ${interview.mode} interview for a ${interview.role} role. 
Review the chat history and the user's latest response.
Acknowledge their answer briefly (constructively, positive reinforcement).
Then, ask the NEXT relevant question. Do not exceed 4 questions in total. (We are at question count: ${Math.floor(interview.messages.filter(m => m.sender === 'ai').length + 1)}).
Keep the tone natural, professional and engaging. Speak as the interviewer. Keep response under 100 words.`;

    const prompt = `Here is the interview transcription so far:
${chatHistory}

Acknowledge the candidate's last answer and ask the next question.`;

    const aiReply = await getAIResponse(prompt, systemInstruction);

    // Save AI's response
    interview.messages.push({
      sender: 'ai',
      text: aiReply,
    });

    await interview.save();

    res.json({
      success: true,
      messages: interview.messages,
    });
  } catch (error) {
    console.error('Send Interview Message Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error processing interview message' });
  }
};

// @desc    End the interview and evaluate performance
// @route   POST /api/interviews/:id/end
// @access  Private
const endInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;

    const interview = await Interview.findOne({ _id: interviewId, user: req.user.id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.messages.length < 2) {
      return res.status(400).json({ success: false, message: 'Not enough conversation to evaluate.' });
    }

    // Prepare history for Gemini
    const chatHistory = interview.messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

    const systemInstruction = `You are an executive recruiter analyzing a candidate's completed mock interview for a ${interview.role} position.
Review the entire conversation transcript. You MUST respond with a valid JSON object only. Do not output any markdown notes outside of the JSON block.
The JSON object MUST contain the following keys:
- overallScore: (Number, 0-100 rating of the overall performance)
- communicationScore: (Number, 0-100 rating for articulation, structure, and brevity)
- correctnessScore: (Number, 0-100 rating for technical depth/correctness)
- confidenceScore: (Number, 0-100 rating for tone, certainty, and assertiveness)
- feedbackText: (String, detailed summary of strengths and weaknesses, and how to improve)
- sampleImprovements: (Array of Objects, matching the conversation QA pairs. Each object MUST have 'question' (String, the AI question), 'userAnswer' (String, candidate answer), 'suggestedAnswer' (String, a high-quality model response), and 'critique' (String, constructive critique of the user's actual response)).`;

    const prompt = `Review the following mock interview transcript:
---
${chatHistory}
---
Please evaluate the candidate's performance.`;

    console.log(`Ending and evaluating interview: ${interviewId}`);
    const evaluationText = await getAIResponse(prompt, systemInstruction);
    const evaluation = parseJSONFromResponse(evaluationText);

    if (evaluation) {
      interview.feedback = {
        overallScore: evaluation.overallScore || 0,
        communicationScore: evaluation.communicationScore || 0,
        correctnessScore: evaluation.correctnessScore || 0,
        confidenceScore: evaluation.confidenceScore || 0,
        feedbackText: evaluation.feedbackText || '',
        sampleImprovements: evaluation.sampleImprovements || [],
      };
    } else {
      // Fallback fallback feedback structure if parse failed
      interview.feedback = {
        overallScore: 70,
        communicationScore: 75,
        correctnessScore: 65,
        confidenceScore: 70,
        feedbackText: "Your answers are a good start. Be sure to use the STAR framework and elaborate with specific technical scenarios.",
        sampleImprovements: [],
      };
    }

    interview.status = 'completed';
    await interview.save();

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error('End Interview Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating interview report' });
  }
};

// @desc    Get all completed mock interviews of user
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id, status: 'completed' }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error('Get Interviews Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving interviews list' });
  }
};

// @desc    Get details of a single interview session
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error('Get Interview ID Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving interview details' });
  }
};

module.exports = {
  startInterview,
  sendMessage,
  endInterview,
  getInterviews,
  getInterviewById,
};
