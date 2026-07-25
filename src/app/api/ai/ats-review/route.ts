import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { docText, jobText, docType } = await req.json();

    if (!docText || !jobText) {
      return NextResponse.json(
        { success: false, error: 'Document text and job description are required.' },
        { status: 400 }
      );
    }

    const provider = req.headers.get('x-provider') || 'gemini';
    let apiKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY;
    const clientKey = req.headers.get('x-api-key');
    if (!apiKey && clientKey && clientKey.trim() !== '') {
      apiKey = clientKey;
    }

    // If no API key is available, return simulated response for local testing
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        simulated: true,
        data: getSimulatedAtsResult(docText, jobText, docType),
      });
    }

    const prompt = `
You are an expert recruiter and Applicant Tracking System (ATS) optimization engine.
Analyze the following candidate document (${docType}) against the target Job Description or university Program Requirements provided below.

Candidate Document:
"""
${docText}
"""

Job / Program Description:
"""
${jobText}
"""

Analyze and evaluate:
1. A match score (0-100%) based on skills, academic focus, or job duties matching.
2. A list of critical keywords, concepts, or methodologies missing from the candidate's text.
3. A list of 3 bullet points or sentences that can be rewritten to improve tailoring.

Return ONLY a raw JSON object with this exact structure (do not wrap in markdown or code blocks):
{
  "score": 75,
  "missingKeywords": ["Keywords 1", "Keyword 2"],
  "bulletRewrites": [
    {
      "original": "Original text from document",
      "rewritten": "Improved tailored text incorporating keywords",
      "reason": "Why this rewrite helps pass filters"
    }
  ]
}
`;

    if (provider === 'openai') {
      const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        }),
      });
      
      if (!openAiResponse.ok) {
        const errorText = await openAiResponse.text();
        throw new Error(`OpenAI API error: ${errorText}`);
      }
      
      const openAiData = await openAiResponse.json();
      const responseText = openAiData.choices[0].message.content.trim();
      const data = JSON.parse(responseText);
      return NextResponse.json({ success: true, data });
    }

    // Initialize Gemini SDK
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Clean code blocks if LLM wraps in json codeblock
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    const data = JSON.parse(responseText);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('ATS AI review error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI parsing failure.' },
      { status: 500 }
    );
  }
}

function getSimulatedAtsResult(docText: string, jobText: string, docType: string) {
  // Simple heuristic keywords match simulation
  const keywords = ['react', 'next.js', 'typescript', 'prisma', 'database', 'research', 'machine learning', 'python', 'scholarship', 'academic', 'management'];
  const jobLower = jobText.toLowerCase();
  const docLower = docText.toLowerCase();
  
  const matched = keywords.filter(k => docLower.includes(k));
  const jobNeeds = keywords.filter(k => jobLower.includes(k));
  const missing = jobNeeds.filter(k => !matched.includes(k));

  let score = 65;
  if (jobNeeds.length > 0) {
    score = Math.round((matched.filter(k => jobNeeds.includes(k)).length / jobNeeds.length) * 100);
    if (score < 40) score = 40;
    if (score > 95) score = 95;
  }

  // Create simulated rewrites
  const rewrites = [
    {
      original: "Collaborated with team members to deliver technical projects under deadlines.",
      rewritten: `Utilized ${jobNeeds[0] || 'modern technologies'} and collaborative software patterns to architect and deliver engineering pipelines, meeting strict project schedules.`,
      reason: "Adds active technical verbs and integrates key stack names mentioned in requirements."
    },
    {
      original: "Responsible for writing clean documentation and preparing review files.",
      rewritten: `Drafted technical documentation, project proposals, and review materials, ensuring clean code structure and knowledge sharing.`,
      reason: "Reframes simple tasks into structured professional outcomes."
    }
  ];

  return {
    score,
    missingKeywords: missing.length > 0 ? missing : ['REST APIs', 'Cloud deployment', 'Unit testing'],
    bulletRewrites: rewrites,
  };
}
