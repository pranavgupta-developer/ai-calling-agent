"use client";

import { supabase } from "@/lib/supabase";

export default function Home() {
  async function testConnection() {
    const { data, error } = await supabase
      .from("test")
      .select("*");

    console.log("Data:", data);
    console.log("Error:", error);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Connected Successfully!");
    }
  }

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <button
        onClick={testConnection}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        Test Supabase
      </button>
    </main>
  );
}