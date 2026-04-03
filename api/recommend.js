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
你是一个职业路径推荐AI，请严格输出 JSON，不要输出任何解释文字。

根据用户输入，给出：

{
  "mainPath": "",
  "backupPath": "",
  "strategy": "",
  "tradeoffs": [],
  "steps": [],
  "risks": []
}

用户输入：
${userInput}
`;

    // 👉 调用 Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
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
        }),
      }
    );

    const data = await response.json();

 
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.log("⚠️ JSON parse failed, raw:", text);

      
      return res.status(200).json({
        mainPath: "解析失败（请调整prompt）",
        backupPath: "",
        strategy: text,
        tradeoffs: [],
        steps: [],
        risks: [],
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("🔥 Gemini API error:", error);

    return res.status(500).json({
      error: "Gemini API error",
      detail: error.message,
    });
  }
}