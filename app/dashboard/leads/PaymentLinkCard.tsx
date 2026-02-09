"use client";
import { useState } from "react";

export default function PaymentLinkCard() {
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const [email, setEmail] = useState("");

  const generateLink = async () => {
    try {
      setLoading(true);

      // 🔥 Call your backend which creates Razorpay Payment Link
      const res = await fetch("/api/create-payment-link", { method: "POST" });
      const data = await res.json();

      setPaymentLink(data.link); // 👈 Razorpay link here
    } catch (err) {
      alert("Failed to generate payment link");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(paymentLink);
    alert("Link copied!");
  };

  const sendEmail = async () => {
  if (!email) return alert("Enter email");
  if (!paymentLink) return alert("Generate link first");

  try {
    const res = await fetch("/api/send-payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, link: paymentLink }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to send email");
    }

    alert("✅ Email sent successfully!");
  } catch (err: any) {
    alert("❌ Email failed: " + err.message);
  }
};


  return (
    <div
    className="glass space-y-4 rounded-2xl p-6"
    >
      <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: 12 }}>
        Generate Payment Link
      </h2>

      <button
        onClick={generateLink}
        disabled={loading}
        style={{
          padding: "10px 16px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          background: "linear-gradient(135deg, #7c3aed, #2563eb)",
          color: "white",
        }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {paymentLink && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, opacity: 0.8 }}>Payment Link</p>

          <div
            style={{
              background: "rgba(0,0,0,0.4)",
              padding: "10px",
              borderRadius: 8,
              wordBreak: "break-all",
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            {paymentLink}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={copyLink}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: "#22c55e",
                color: "black",
                fontWeight: 600,
              }}
            >
              Copy
            </button>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{
                flex: 2,
                padding: "8px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "white",
              }}
            />

            <button
              onClick={sendEmail}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: "#38bdf8",
                color: "black",
                fontWeight: 600,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
