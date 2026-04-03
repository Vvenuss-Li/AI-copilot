import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userInput } = req.body;

    const prompt = `
你是职业路径推荐AI，请给出：
1. 主路径
2. 备选路径
3. 推荐策略
4. trade-off
5. 下一步
6. 风险

用户输入：
${userInput}

输出JSON：
{
  "mainPath": "",
  "backupPath": "",
  "strategy": "",
  "tradeoffs": [],
  "steps": [],
  "risks": []
}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text;
    const parsed = JSON.parse(text);

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}