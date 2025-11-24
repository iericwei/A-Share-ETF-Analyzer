import { GoogleGenAI } from "@google/genai";
import { APIResponse, ETFProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to parse loose number formats (e.g., "1,234.56", "¥1.23")
const cleanNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return NaN;
  return parseFloat(val.replace(/[,¥￥\s]/g, ''));
};

// Helper to normalize date formats
const normalizeDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toISOString().split('T')[0];
  } catch (e) {
    return dateStr;
  }
};

// Helper to extract JSON from markdown text
const extractJSON = (text: string): any => {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    return JSON.parse(jsonMatch[1]);
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    return JSON.parse(text.substring(firstBrace, lastBrace + 1));
  }
  throw new Error("No JSON found");
};

export const fetchETFHistory = async (query: string, startDate?: string, endDate?: string): Promise<APIResponse> => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  let effectiveStart = startDate;
  let effectiveEnd = endDate || todayStr;

  if (!effectiveStart) {
    // Calculate date 60 days ago for precise range if not provided
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 65); 
    effectiveStart = pastDate.toISOString().split('T')[0];
  }

  const prompt = `You are a financial data expert.
  
  User Query: "${query}"
  Date Range: ${effectiveStart} to ${effectiveEnd}

  Task:
  1. **IDENTIFY**: Determine the EXACT 6-digit ETF Code and Official Short Name (证券简称) for the A-Share market.
  2. **SEARCH**: Use Google Search to find **Daily Closing Prices (收盘价)**.
     - Search keywords: "${query} 历史收盘价 ${effectiveStart} ${effectiveEnd}", "sina finance ${query} historical data", "eastmoney ${query} history", "hexun ${query} history".
     - Prefer "Closing Price" (收盘价) over NAV (净值).
  3. **EXTRACT**: Retrieve daily data strictly within ${effectiveStart} to ${effectiveEnd}.
     - Data MUST be real. Do not simulate patterns.
     - Maximize Completeness: Try to get every trading day in the range.
     - If data is missing for exact start date, find the nearest available prior date.
  4. **FORMAT**: Output strictly in COMPACT JSON format.

  JSON Format Requirement:
  \`\`\`json
  {
    "code": "6-digit code",
    "name": "Official Short Name",
    "history": [
      ["YYYY-MM-DD", 1.234],
      ["YYYY-MM-DD", 1.245]
    ]
  }
  \`\`\`
  * history: Array of [DateString, ClosePriceNumber].
  * Order: Ascending by date.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI 未返回数据，请重试");
  }

  // Extract Grounding Metadata (Sources)
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map(chunk => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || ''
    }))
    .filter(s => s.uri) || [];

  try {
    const rawData = extractJSON(text);
    
    // Transform compact array-of-arrays back to object array with robust parsing
    let history = (rawData.history || []).map((item: any) => {
      // Handle both Array [date, price] and Object {date, close} formats
      let rawDate, rawClose;
      
      if (Array.isArray(item)) {
        rawDate = String(item[0]);
        rawClose = item[1];
      } else {
        rawDate = item.date || item.time || item.day;
        rawClose = item.close || item.price || item.value;
      }

      return {
        date: normalizeDate(rawDate),
        close: cleanNumber(rawClose)
      };
    }).filter((h: any) => 
      h.date && 
      !isNaN(h.close) && 
      h.close > 0 && // Filter out zero prices
      h.date.match(/^\d{4}-\d{2}-\d{2}$/) // Ensure date format is correct
    );

    // Deduplicate dates (keep latest if duplicate)
    const uniqueHistoryMap = new Map();
    history.forEach((h: any) => uniqueHistoryMap.set(h.date, h));
    history = Array.from(uniqueHistoryMap.values());

    // Sort by date
    history.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (history.length === 0) {
      throw new Error("未找到有效的历史行情数据");
    }

    const data: APIResponse = {
      code: rawData.code || 'Unknown',
      name: rawData.name || query,
      history: history,
      sources: sources
    };

    return data;
  } catch (e) {
    console.error("Failed to parse Gemini response", text, e);
    throw new Error("数据解析异常，请稍后重试");
  }
};

export const fetchETFProfile = async (code: string, name: string): Promise<ETFProfile> => {
  const prompt = `
  Task: Search for basic information about the A-Share ETF: ${name} (Code: ${code}).
  
  Find:
  1. Fund Manager (基金经理) - Name(s)
  2. Fund Size (基金规模) - Latest available size (e.g., 100亿)
  3. Launch Date (成立日期)
  4. Fund Management Company (基金公司)
  5. Tracking Index (跟踪标的)
  6. Brief Description (基金简介) - 1 or 2 sentences summarizing what it tracks.

  Format: JSON Only.
  \`\`\`json
  {
    "manager": "Name",
    "fundSize": "Size",
    "launchDate": "YYYY-MM-DD",
    "company": "Company Name",
    "trackingIndex": "Index Name",
    "description": "Short description"
  }
  \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");

    return extractJSON(text);
  } catch (e) {
    console.error("Failed to fetch profile", e);
    // Return empty profile on failure to not break the UI
    return {
      description: "暂无详细信息",
    };
  }
};
