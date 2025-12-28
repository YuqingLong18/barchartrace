import { RaceSpec, RaceSpecSchema } from './schema';

const SYSTEM_PROMPT = `
You are a data visualization assistant. Your goal is to generate a valid "RaceSpec" JSON for a bar chart race animation based on the user's prompt.

You MUST access real-time data using the available search tool (if provided) or your internal knowledge.
When you output the JSON, it must strictly adhere to the following schema:
{
  "title": "Topic Title",
  "title_zh": "主题标题 (Chinese)",
  "subtitle": "Time range and unit",
  "subtitle_zh": "时间范围和单位 (Chinese)",
  "unit": "Unit string",
  "valueFormat": "shortScale" | "shortCurrency" | "percent" | "number",
  "timeField": "year",
  "entityField": "name",
  "valueField": "value",
  "topN": 10,
  "framesPerStep": 12,
  "stepDurationMs": 1000,
  "notes": "Caveats...",
  "sources": [{ "title": "Source Name", "url": "https://...", "accessed": "YYYY-MM-DD" }],
  "data": [
    { "year": 1960, "name": "Entity A", "value": 100 },
    ...
  ],
  "translations": {
    "Entity A": "实体A",
    "Entity B": "实体B"
  }
}

CRITICAL DATA RULES:
1. **Target Top 10**: The user wants to see a Top 10 race. Set "topN" to 10.
2. **Oversample Data**: For every time step, try to return the **top 15-20 entities**. This is crucial. We need extra data below the top 10 so that bars don't just "pop" into existence; they should rise from the bottom.
3. **Bilingual Support**: 
   - You MUST provide \`title_zh\` and \`subtitle_zh\` (Chinese translations).
   - You MUST provide a \`translations\` object mapping EVERY unique English entity name in \`data\` to its Chinese name.
4. "data" must be a flat array of objects with year, name, and value.
5. "year" must be monotonically increasing.
6. Normalize entity names (e.g. "USA" vs "United States", "China" vs "PRC"). Use standard short names.
7. Return ONLY valid JSON. No markdown formatting.
`;

export async function generateRaceSpec(prompt: string, apiKey: string): Promise<RaceSpec> {
    // Use the user-specified model from env or fallback
    const MODEL_ID = process.env.OPENROUTER_MODEL || "openai/gpt-5.2-chat:online";

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: `Generate a bar chart race for: ${prompt}. Remember to include Chinese translations.` }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error("No content received from LLM");
        }

        // cleaning markdown block if present
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse and validate
        const rawData = JSON.parse(jsonStr);
        const validated = RaceSpecSchema.parse(rawData);

        return validated;

    } catch (error) {
        console.error("LLM Generation Error:", error);
        throw error;
    }
}
