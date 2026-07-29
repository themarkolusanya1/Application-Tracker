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

    let textToAnalyze = text;
    const isUrl = text.trim().startsWith('http://') || text.trim().startsWith('https://');

    if (isUrl) {
      try {
        const fetchRes = await fetch(text.trim(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          }
        });
        if (fetchRes.ok) {
          const html = await fetchRes.text();
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          const bodyHtml = bodyMatch ? bodyMatch[1] : html;
          
          textToAnalyze = bodyHtml
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 12000);
          
          if (textToAnalyze.length < 50) {
            textToAnalyze = text;
          }
        }
      } catch (err) {
        console.error('Failed to scrape URL:', err);
      }
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
        data: getSimulatedParseResult(textToAnalyze),
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
${textToAnalyze}
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
  const cleanText = text.replace(/\r/g, '').trim();
  const lower = cleanText.toLowerCase();
  
  // Clean first line of emojis and special symbols
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const firstLine = lines[0] || '';
  const firstLineClean = firstLine.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();

  // 1. Determine if it is a Scholarship/Admissions/University Application
  const isScholarship = lower.includes('phd') || 
                        lower.includes('doctor') || 
                        lower.includes('master') || 
                        lower.includes('msc') || 
                        lower.includes('bachelor') || 
                        lower.includes('bsc') ||
                        lower.includes('university') || 
                        lower.includes('scholarship') || 
                        lower.includes('admission') ||
                        lower.includes('academic') ||
                        lower.includes('student') ||
                        lower.includes('professor') ||
                        lower.includes('supervisor') ||
                        lower.includes('faculty') ||
                        lower.includes('program') ||
                        lower.includes('funding') ||
                        lower.includes('stipend') ||
                        lower.includes('degree');

  // Date parser helper
  function extractDate(str: string): string {
    const dateRegexes = [
      /deadline:?\s*([A-Za-z]+ \d{1,2},? \d{4})/i,
      /deadline:?\s*(\d{1,2} [A-Za-z]+ \d{4})/i,
      /deadline:?\s*(\d{4}-\d{2}-\d{2})/i,
      /deadline:?\s*(\d{2}\/\d{2}\/\d{4})/i,
      /(?:apply by|before|due date):?\s*([A-Za-z]+ \d{1,2},? \d{4})/i,
      /(?:apply by|before|due date):?\s*(\d{4}-\d{2}-\d{2})/i
    ];

    for (const regex of dateRegexes) {
      const match = str.match(regex);
      if (match && match[1]) {
        const parsedDate = new Date(match[1]);
        if (!isNaN(parsedDate.getTime())) {
          const yyyy = parsedDate.getFullYear();
          const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const dd = String(parsedDate.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        }
      }
    }

    const broadMatch = str.match(/([A-Za-z]+ \d{1,2},? \d{4})/);
    if (broadMatch && broadMatch[1]) {
      const parsedDate = new Date(broadMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        const yyyy = parsedDate.getFullYear();
        const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(parsedDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    }

    return '';
  }

  const extractedDeadline = extractDate(cleanText);

  if (isScholarship) {
    let degree = 'Masters';
    if (lower.includes('phd') || lower.includes('ph.d') || lower.includes('doctoral') || lower.includes('doctor')) {
      degree = 'PhD';
    } else if (lower.includes('bachelor') || lower.includes('bsc') || lower.includes('undergraduate')) {
      degree = 'Bachelors';
    }

    let school = '';
    const schools = [
      'Stanford University', 'Harvard University', 'University of Oxford', 
      'University of Cambridge', 'MIT', 'UC Berkeley', 'KU Leuven'
    ];
    for (const s of schools) {
      if (lower.includes(s.toLowerCase())) {
        school = s;
        break;
      }
    }

    if (!school) {
      const schoolMatch = cleanText.match(/(?:at|—|from)\s+([A-Z][a-zA-Z\s]+(?:University|Institution|Institute|College|School|Centre|LUCAS|KU\s+Leuven))/);
      if (schoolMatch && schoolMatch[1]) {
        school = schoolMatch[1].trim();
      } else {
        const univOfMatch = cleanText.match(/University\s+of\s+([A-Z][a-zA-Z\s]+)/i);
        if (univOfMatch) {
          school = `University of ${univOfMatch[1].trim()}`;
        } else {
          const genericSchoolMatch = cleanText.match(/([A-Z][a-zA-Z\s]+(?:University|College|Institute|LUCAS))/);
          if (genericSchoolMatch) {
            school = genericSchoolMatch[1].trim();
          } else {
            school = 'Stanford University';
          }
        }
      }
    }

    let title = firstLineClean;
    if (title.includes('—')) {
      title = title.split('—')[0].trim();
    }
    if (title.includes(':')) {
      const parts = title.split(':');
      if (parts[0].toLowerCase().includes('opportunity') || parts[0].toLowerCase().includes('scholarship')) {
        title = title.trim();
      } else if (parts[1]) {
        title = parts[1].trim();
      }
    }
    
    let funding = 'fully funded';
    if (lower.includes('no funding') || lower.includes('self-funded')) {
      funding = 'no funding';
    } else if (lower.includes('partial') || lower.includes('tuition fee waiver')) {
      funding = 'partial tuition';
    }

    let stipend = '35000';
    const stipendMatch = cleanText.match(/(?:stipend|funding|scholarship|salary|€|\$|£)\s*(\d{1,3}(?:[.,]\d{3})*)/i);
    if (stipendMatch && stipendMatch[1]) {
      stipend = stipendMatch[1].replace(/[.,]/g, '');
    }

    let notes = 'AI Extraction: Program admissions opportunity details.';
    const aboutMatch = cleanText.match(/(?:About the Project|Description|Summary)[\s\S]*$/i);
    if (aboutMatch) {
      notes = aboutMatch[0].split('\n').slice(0, 3).join(' ').trim().substring(0, 300);
    } else {
      const descriptionLines = lines.slice(1, 4).join(' ');
      if (descriptionLines) {
        notes = descriptionLines.substring(0, 300);
      }
    }

    return {
      applicationType: 'scholarship',
      organization: school,
      title: title || 'Graduate Program',
      degreeLevel: degree,
      deadline: extractedDeadline || '2026-12-15',
      fundingType: funding,
      stipendAmount: stipend,
      notes: notes
    };

  } else {
    let company = '';
    const companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Stripe', 'Airbnb'];
    for (const c of companies) {
      if (lower.includes(c.toLowerCase())) {
        company = c;
        break;
      }
    }

    if (!company) {
      const companyMatch = cleanText.match(/(?:at|with|for)\s+([A-Z][a-zA-Z0-9\s]+)/);
      if (companyMatch && companyMatch[1]) {
        company = companyMatch[1].split('\n')[0].trim();
      } else {
        company = 'Google';
      }
    }

    let title = firstLineClean;
    if (title.includes('at ')) {
      title = title.split('at ')[0].trim();
    }
    if (title.includes('—')) {
      title = title.split('—')[0].trim();
    }
    if (title.includes(':')) {
      const parts = title.split(':');
      if (parts[1]) title = parts[1].trim();
    }

    let locType = 'HYBRID';
    if (lower.includes('remote') || lower.includes('work from home') || lower.includes('wfh')) {
      locType = 'REMOTE';
    } else if (lower.includes('on-site') || lower.includes('office') || lower.includes('onsite')) {
      locType = 'ON_SITE';
    }

    let salary = '135000';
    const salaryMatch = cleanText.match(/(?:salary|compensation|pay|rate|k|\$|€|£)\s*(\d{1,3}(?:[.,]\d{3})*)/i);
    if (salaryMatch && salaryMatch[1]) {
      salary = salaryMatch[1].replace(/[.,]/g, '');
    }

    let currency = 'USD';
    if (lower.includes('€') || lower.includes('eur')) currency = 'EUR';
    else if (lower.includes('£') || lower.includes('gbp')) currency = 'GBP';

    let notes = 'AI Extraction: Job or Internship track details.';
    const descLines = lines.slice(1, 4).join(' ');
    if (descLines) {
      notes = descLines.substring(0, 300);
    }

    return {
      applicationType: lower.includes('intern') ? 'internship' : 'job',
      organization: company,
      title: title || 'Software Engineer',
      locationType: locType,
      url: 'https://careers.example.com',
      salary: salary,
      currency: currency,
      notes: notes
    };
  }
}
