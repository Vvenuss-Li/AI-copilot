// api/recommend.js

export default async function handler(req, res) {
  // 只允许 POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userInput } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: "Missing userInput" });
    }

    // 🔥 强制 Gemini 只返回 JSON
    const prompt = `
你是职业路径推荐AI。

你必须只输出JSON，不允许输出任何解释、说明、前缀文字。

JSON必须从 { 开始，以 } 结束。

格式如下：

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

    // 👉 拿到 Gemini 输出
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("🔍 Gemini raw output:", text);

    // 🔥 关键：提取 JSON（防止 Gemini 乱说话）
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(200).json({
        mainPath: "解析失败（模型未返回JSON）",
        backupPath: "",
        strategy: text,
        tradeoffs: [],
        steps: [],
        risks: []
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("❌ JSON parse error:", err);

      return res.status(200).json({
        mainPath: "解析失败（JSON错误）",
        backupPath: "",
        strategy: text,
        tradeoffs: [],
        steps: [],
        risks: []
      });
    }

    // ✅ 成功返回
    return res.status(200).json(parsed);

  } catch (error) {
    console.error("🔥 Gemini API error:", error);

    return res.status(500).json({
      error: "Gemini API error",
      detail: error.message,
    });
  }
}