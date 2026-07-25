import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Application details text is required.' },
        { status: 400 }
      );
    }

    const provider = req.headers.get('x-provider') || 'gemini';
    let apiKey = provider === 'openai' 
      ? process.env.OPENAI_API_KEY 
      : provider === 'groq'
        ? process.env.GROQ_API_KEY
        : process.env.GEMINI_API_KEY;
    const clientKey = req.headers.get('x-api-key');
    if (!apiKey && clientKey && clientKey.trim() !== '') {
      apiKey = clientKey;
    }

    // If no API key is available, return simulated response for local testing
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        simulated: true,
        data: getSimulatedParseResult(text),
      });
    }

    const prompt = `
Analyze the following text copy-pasted from a job post, university admission site, scholarship page, or internship listing.
Identify whether this is primarily a Job / Internship position or a University / Scholarship application.

Extract the relevant details into a raw JSON object with the following schema depending on the application type.
Do not wrap the output in markdown or code blocks. Return ONLY the raw JSON.

If it is a JOB or INTERNSHIP:
{
  "applicationType": "job" or "internship",
  "organization": "Company Name",
  "title": "Job Title",
  "locationType": "ON_SITE", "HYBRID", or "REMOTE",
  "url": "URL if found, else empty string",
  "salary": "numerical value or range if found, e.g. '120000', else empty string",
  "currency": "three-letter code e.g. 'USD', 'EUR', 'GBP', else 'USD'",
  "notes": "Short summary of responsibilities, requirements, and candidate expectations"
}

If it is a UNIVERSITY program or SCHOLARSHIP:
{
  "applicationType": "scholarship",
  "organization": "University or Institution Name",
  "title": "Program or Scholarship Name",
  "degreeLevel": "Bachelors", "Masters", or "PhD",
  "deadline": "deadline date formatted as YYYY-MM-DD if found, else empty string",
  "fundingType": "fully funded", "partial tuition", or "no funding",
  "stipendAmount": "stipend or scholarship value if found, else empty string",
  "notes": "Short summary of program description, required documents, or research focus"
}

Text to analyze:
"""
${text}
"""
`;

    if (provider === 'openai' || provider === 'groq') {
      const endpoint = provider === 'groq' 
        ? 'https://api.groq.com/openai/v1/chat/completions' 
        : 'https://api.openai.com/v1/chat/completions';
      
      const modelName = provider === 'groq'
        ? 'llama-3.3-70b-versatile'
        : 'gpt-4o-mini';

      const openAiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        }),
      });
      
      if (!openAiResponse.ok) {
        const errorText = await openAiResponse.text();
        throw new Error(`${provider.toUpperCase()} API error: ${errorText}`);
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
    console.error('AI application parsing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI parsing failure.' },
      { status: 500 }
    );
  }
}

function getSimulatedParseResult(text: string) {
  const lower = text.toLowerCase();
  const isScholarship = lower.includes('phd') || 
                        lower.includes('master') || 
                        lower.includes('bachelor') || 
                        lower.includes('university') || 
                        lower.includes('scholarship') || 
                        lower.includes('admission') ||
                        lower.includes('degree');

  if (isScholarship) {
    // School simulation
    let school = 'Stanford University';
    if (lower.includes('mit') || lower.includes('massachusetts')) school = 'MIT';
    else if (lower.includes('harvard')) school = 'Harvard University';
    else if (lower.includes('oxford')) school = 'University of Oxford';

    let degree = 'Masters';
    if (lower.includes('phd') || lower.includes('doctoral')) degree = 'PhD';
    else if (lower.includes('bachelor') || lower.includes('undergraduate')) degree = 'Bachelors';

    let title = 'Computer Science Program';
    if (lower.includes('biology')) title = 'Biology Research fellowship';
    else if (lower.includes('physics')) title = 'Physics Scholarship';
    else if (lower.includes('mba') || lower.includes('business')) title = 'MBA Graduate Program';

    return {
      applicationType: 'scholarship',
      organization: school,
      title: title,
      degreeLevel: degree,
      deadline: '2026-12-15',
      fundingType: lower.includes('fully') || lower.includes('full') ? 'fully funded' : 'partial tuition',
      stipendAmount: '35000',
      notes: 'AI Extraction simulated: Extracted program details and documents checklist.'
    };
  } else {
    // Job simulation
    let company = 'Google';
    if (lower.includes('microsoft')) company = 'Microsoft';
    else if (lower.includes('amazon')) company = 'Amazon';
    else if (lower.includes('apple')) company = 'Apple';
    else if (lower.includes('meta') || lower.includes('facebook')) company = 'Meta';

    let title = 'Software Engineer';
    if (lower.includes('product manager') || lower.includes('pm')) title = 'Product Manager';
    else if (lower.includes('designer') || lower.includes('ui')) title = 'Product Designer';
    else if (lower.includes('data scientist')) title = 'Data Scientist';

    let locType = 'HYBRID';
    if (lower.includes('remote') || lower.includes('work from home')) locType = 'REMOTE';
    else if (lower.includes('on-site') || lower.includes('office')) locType = 'ON_SITE';

    return {
      applicationType: lower.includes('intern') ? 'internship' : 'job',
      organization: company,
      title: title,
      locationType: locType,
      url: 'https://careers.example.com',
      salary: '135000',
      currency: 'USD',
      notes: 'AI Extraction simulated: Extracted from job post details.'
    };
  }
}
