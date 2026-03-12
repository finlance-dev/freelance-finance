import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Finlance - ผู้ช่วยการเงินอัจฉริยะสำหรับฟรีแลนซ์";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            $
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            Finlance
          </span>
        </div>

        <h1
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            lineHeight: 1.2,
            margin: "0 0 20px 0",
          }}
        >
          ผู้ช่วยการเงินอัจฉริยะ
          <br />
          <span style={{ color: "#818cf8" }}>สำหรับฟรีแลนซ์</span>
        </h1>

        <p
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.5,
          }}
        >
          ติดตามรายได้ ประมาณภาษี พยากรณ์กระแสเงินสด
        </p>

        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "40px",
          }}
        >
          {["ติดตามรายได้", "ประมาณภาษี", "กระแสเงินสด"].map((text) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#a5b4fc",
                fontSize: "20px",
              }}
            >
              <span style={{ color: "#22c55e" }}>✓</span>
              {text}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "18px",
            color: "#64748b",
          }}
        >
          finlance.co — เริ่มใช้ฟรี ไม่ต้องใช้บัตรเครดิต
        </div>
      </div>
    ),
    { ...size }
  );
}
