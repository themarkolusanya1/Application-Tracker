import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, organization, title, type, question, answer } = body;

    // Try env key first, then custom header key
    let apiKey = process.env.GEMINI_API_KEY;
    const clientKey = req.headers.get('x-api-key');
    if (!apiKey && clientKey && clientKey.trim() !== '') {
      apiKey = clientKey;
    }

    if (action === 'get_questions') {
      if (!organization || !title) {
        return NextResponse.json({ success: false, error: 'Organization and title are required.' }, { status: 400 });
      }

      if (!apiKey) {
        return NextResponse.json({
          success: true,
          simulated: true,
          questions: getSimulatedQuestions(organization, title, type),
        });
      }

      const ai = new GoogleGenerativeAI(apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are an expert interviewer for ${type === 'scholarship' ? 'academic admissions and scholarship selection panels' : 'corporate recruiters'}.
Generate exactly 3 realistic interview questions (ranging from behavioral, research interest, or situational skills) for a candidate applying for the position of "${title}" at "${organization}".

Return ONLY a raw JSON array containing precisely 3 string elements (do not wrap in markdown or code blocks):
[
  "Question 1",
  "Question 2",
  "Question 3"
]
`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();
      
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      }

      const questions = JSON.parse(responseText);
      return NextResponse.json({ success: true, questions });
    }

    if (action === 'evaluate_answer') {
      if (!question || !answer) {
        return NextResponse.json({ success: false, error: 'Question and answer are required.' }, { status: 400 });
      }

      if (!apiKey) {
        return NextResponse.json({
          success: true,
          simulated: true,
          feedback: getSimulatedFeedback(question, answer, organization, title),
        });
      }

      const ai = new GoogleGenerativeAI(apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are a career development expert and professional interview coach.
Evaluate the candidate's answer to the following interview question for a "${title}" role at "${organization}".

Question:
"${question}"

Candidate Answer:
"${answer}"

Evaluate the answer using the STAR method (Situation, Task, Action, Result):
1. Grade the score (0 to 100%).
2. Rate the answer quality (e.g. "Outstanding Response", "Needs structure", etc.)
3. Check if Situation, Task, Action, and Result were each covered (boolean fields).
4. Outline key strengths and specific improvements.
5. Provide a high-quality model answer representing a perfect STAR response.

Return ONLY a raw JSON object with this exact structure (do not wrap in markdown or code blocks):
{
  "score": 85,
  "rating": "Outstanding Response",
  "starCheck": {
    "situation": true,
    "task": true,
    "action": true,
    "result": false
  },
  "strengths": "Outline candidate strengths here",
  "improvements": "Suggest actionable structural enhancements here",
  "modelResponse": "Provide a model STAR response formulation here"
}
`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();
      
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      }

      const feedback = JSON.parse(responseText);
      return NextResponse.json({ success: true, feedback });
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter.' }, { status: 400 });
  } catch (error: any) {
    console.error('Mock interview AI error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI evaluation failed.' },
      { status: 500 }
    );
  }
}

function getSimulatedQuestions(organization: string, title: string, type: string) {
  if (type === 'scholarship') {
    return [
      `What motivated you to select "${organization}" for your degree program, and how does your research focus on "${title}" align with our academic laboratory?`,
      `Describe a time you faced a research bottleneck or academic project failure. How did you resolve it?`,
      `How do you plan to utilize this fellowship or stipend to support your career and academic aspirations?`
    ];
  }

  return [
    `Tell me about a challenging engineering or project obstacle you overcame while developing systems similar to "${title}" at "${organization}".`,
    `How do you keep up-to-date with new technologies and frameworks under tight production deadlines?`,
    `Why do you want to join "${organization}" as a "${title}", and how does your experience align with our culture?`
  ];
}

function getSimulatedFeedback(question: string, answer: string, org: string, title: string) {
  // Simple heuristic simulation
  const length = answer.trim().split(/\s+/).length;
  let score = 75;
  if (length > 100) score = 88;
  if (length < 30) score = 55;

  return {
    score,
    rating: score >= 85 ? "Excellent STAR structure" : score >= 70 ? "Good draft, missing outcomes" : "Needs more details",
    starCheck: {
      situation: true,
      task: true,
      action: length > 50,
      result: length > 90,
    },
    strengths: "You clearly stated the technical context and the problem you were trying to solve.",
    improvements: "Try expanding more on the quantitative results (e.g. increase in performance, scores, or time saved) to complete the 'Result' aspect of the STAR method.",
    modelResponse: `At ${org}, I encountered a scenario where the application pipeline lacked caching. I took the initiative to set up index caches which resulted in an overall latency reduction of 35%. This experience aligns directly with the requirements for the "${title}" role.`,
  };
}
