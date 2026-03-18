import { useState } from "react";

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#0f172a",
      color: "white",
      textAlign: "center"
    }}>
      
      {!started ? (
        <>
          <h1>🚨 PulseAI</h1>
          <p>Emergency CPR Assistant</p>

          <button
            onClick={() => setStarted(true)}
            style={{
              padding: "12px 24px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            Start Emergency
          </button>
        </>
      ) : (
        <>
          <h2>CPR Instructions</h2>
          <p>1. Call emergency services 🚑</p>
          <p>2. Push hard and fast on chest</p>
          <p>3. 100–120 compressions per minute</p>

          <button onClick={() => setStarted(false)}>
            Go Back
          </button>
        </>
      )}
    </div>
  );
}

export default App;