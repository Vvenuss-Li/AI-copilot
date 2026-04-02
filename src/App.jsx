import React, { useState } from "react";

export default function App() {
  const [input, setInput] = useState("我完全零基础，但想转前端开发");

  return (
    <div style={{padding:40}}>
      <h1>AI Copilot Demo</h1>
      <textarea value={input} onChange={e=>setInput(e.target.value)} style={{width:'100%',height:100}} />
      <h2>推荐结果</h2>
      <p>优先项目路径 + 补基础</p>
    </div>
  );
}
