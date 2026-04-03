import React, { useState } from "react";

export default function App() {
  const [input, setInput] = useState("我完全零基础，但想转前端开发");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput: input }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "接口没有返回合法 JSON");
      }

      if (!res.ok) {
        throw new Error(data.error || data.detail || "接口调用失败");
      }

      setResult(data);
    } catch (err) {
      console.error("Request error:", err);
      setError(err.message || "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>AI Career Copilot</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "100%",
          height: 120,
          padding: 12,
          borderRadius: 12,
          fontSize: 16,
        }}
      />

      <button
        onClick={handleGenerate}
        style={{
          marginTop: 16,
          padding: "10px 18px",
          borderRadius: 12,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        {loading ? "生成中..." : "生成推荐"}
      </button>

      {error && (
        <div style={{ marginTop: 20, color: "red", fontWeight: 500 }}>
          错误：{error}
        </div>
      )}

      {result && (
        <>
          <div style={{ marginTop: 30 }}>
            <h2> 推荐路径</h2>
            <p>
              <b>主推荐：</b> {result.mainPath || "暂无"}
            </p>
            <p>
              <b>备选：</b> {result.backupPath || "暂无"}
            </p>
          </div>

          <div style={{ marginTop: 24 }}>
            <h2> 推荐策略</h2>
            <p>{result.strategy || "暂无"}</p>
          </div>

          <div style={{ marginTop: 24 }}>
            <h2>⚖️ Trade-off</h2>
            <ul>
              {(result.tradeoffs || []).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 24 }}>
            <h2> 下一步</h2>
            <ul>
              {(result.steps || []).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 24 }}>
            <h2> 风险</h2>
            <ul>
              {(result.risks || []).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {result.raw && (
            <div style={{ marginTop: 24 }}>
              <h2>🧪 Raw Response（调试用）</h2>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  background: "#f5f5f5",
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                {result.raw}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}