import React, { useState } from "react";

export default function App() {
  const [input, setInput] = useState("我完全零基础，但想转前端开发");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userInput: input
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "-apple-system", maxWidth: 800, margin: "0 auto" }}>
      <h1>AI Career Copilot</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "100%", height: 100, padding: 12, borderRadius: 10 }}
      />

      <button
        onClick={handleGenerate}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          borderRadius: 10,
          cursor: "pointer"
        }}
      >
        {loading ? "生成中..." : "生成推荐"}
      </button>

      {result && (
        <>
          <div style={{ marginTop: 30 }}>
            <h2>推荐路径</h2>
            <p><b>主推荐：</b> {result.mainPath}</p>
            <p><b>备选：</b> {result.backupPath}</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <h2>推荐策略</h2>
            <p>{result.strategy}</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <h2>Trade-off</h2>
            <ul>
              {result.tradeoffs?.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 20 }}>
            <h2>下一步</h2>
            <ul>
              {result.steps?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 20 }}>
            <h2>风险</h2>
            <ul>
              {result.risks?.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
