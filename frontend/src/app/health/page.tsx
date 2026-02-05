"use client";

import { useEffect, useState } from "react";

export default function HealthPage() {
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${url}/health`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setStatus(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>System Health</h1>
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {!error && !status && <div>Loading...</div>}
      {status && (
        <pre
          style={{
            background: "#f0f0f0",
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          {JSON.stringify(status, null, 2)}
        </pre>
      )}
    </div>
  );
}
