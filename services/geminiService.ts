import { GoogleGenAI } from "@google/genai";
import { APIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchETFHistory = async (query: string): Promise<APIResponse> => {
  const today = new Date().toISOString().split('T')[0];

  // We use the googleSearch tool to get REAL data, so we cannot use strict responseSchema.
  // Instead, we ask for a JSON code block and parse it manually.
  const prompt = `You are a financial data expert specializing in China A-Share ETFs.
  
  User Query: "${query}"

  Task:
  1. **SEARCH**: Use Google Search to find the EXACT 6-digit code and official "Short Name" (证券简称) for the requested ETF.
  2. **FETCH DATA**: Use Google Search to find the **actual historical daily closing prices** for this ETF for the last 60 trading days up to ${today}.
     - Search for terms like: "${query} 历史净值", "${query} historical data", "sina finance ${query}".
     - **CRITICAL**: The data must be REAL. Do not simulate or hallucinate prices. If you cannot find 60 days, find as many as possible (at least 30) and ensure the dates are correct.
  3. **FORMAT**: Output the data strictly in the following JSON format inside a markdown code block.

  JSON Format Requirement:
  \`\`\`json
  {
    "code": "The 6-digit code (e.g., 510300)",
    "name": "The Chinese Short Name (e.g., 300ETF)",
    "history": [
      { "date": "YYYY-MM-DD", "close": 1.234 },
      ... (sorted by date ascending)
    ]
  }
  \`\`\`
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // responseSchema is NOT used here because it conflicts with Search tool output in some cases.
      // We parse the text manually.
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No data returned from Gemini");
  }

  // Extract Grounding Metadata (Sources)
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map(chunk => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || ''
    }))
    .filter(s => s.uri) || [];

  try {
    // 1. Try to find JSON within markdown code blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonString = '';

    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    } else {
      // 2. If no code block, try to find the first '{' and last '}'
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = text.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error("No JSON found in response");
      }
    }

    const data = JSON.parse(jsonString) as APIResponse;
    
    // Attach sources to the response object
    data.sources = sources;

    return data;
  } catch (e) {
    console.error("Failed to parse Gemini response", text, e);
    throw new Error("无法解析数据，请重试");
  }
};