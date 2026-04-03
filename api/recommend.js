// api/recommend.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userInput } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: "Missing userInput" });
    }

    const prompt = `
你是职业路径推荐AI。

请根据用户输入，输出一个职业路径推荐结果。
不要输出解释文字，只返回结构化结果。

用户输入：
${userInput}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            response_json_schema: {
              type: "object",
              properties: {
                mainPath: { type: "string" },
                backupPath: { type: "string" },
                strategy: { type: "string" },
                tradeoffs: {
                  type: "array",
                  items: { type: "string" },
                },
                steps: {
                  type: "array",
                  items: { type: "string" },
                },
                risks: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: [
                "mainPath",
                "backupPath",
                "strategy",
                "tradeoffs",
                "steps",
                "risks",
              ],
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Gemini API error",
        detail: data,
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      return res.status(500).json({
        error: "Empty Gemini response",
        detail: data,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        error: "Failed to parse Gemini JSON response",
        raw: text,
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      detail: error.message,
    });
  }
}