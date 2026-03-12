"use client";

import { useEffect, useState, useRef } from "react";
import { X, Crown, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

// Confetti particle
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
  opacity: number;
  shape: "square" | "circle" | "triangle" | "star";
}

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#f43f5e", "#14b8a6",
  "#a855f7", "#eab308", "#22c55e", "#ef4444",
];

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles in bursts
    const createBurst = (count: number) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          id: Math.random(),
          x: Math.random() * canvas.width,
          y: -20 - Math.random() * 200,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 4 + Math.random() * 8,
          rotation: Math.random() * 360,
          speedX: (Math.random() - 0.5) * 6,
          speedY: 2 + Math.random() * 4,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1,
          shape: (["square", "circle", "triangle", "star"] as const)[Math.floor(Math.random() * 4)],
        });
      }
    };

    // Initial burst
    createBurst(80);

    // Additional bursts
    const burst1 = setTimeout(() => createBurst(40), 300);
    const burst2 = setTimeout(() => createBurst(40), 700);
    const burst3 = setTimeout(() => createBurst(30), 1200);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.speedY += 0.05; // gravity
        p.speedX *= 0.99; // air resistance
        p.opacity -= 0.003;

        if (p.opacity <= 0 || p.y > canvas.height + 50) return false;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        switch (p.shape) {
          case "square":
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            break;
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "triangle":
            ctx.beginPath();
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.closePath();
            ctx.fill();
            break;
          case "star":
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
              const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
              const r = j === 0 ? p.size / 2 : p.size / 2;
              ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();
            break;
        }

        ctx.restore();
        return true;
      });

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(burst1);
      clearTimeout(burst2);
      clearTimeout(burst3);
      window.removeEventListener("resize", handleResize);
      particlesRef.current = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[60] pointer-events-none"
    />
  );
}

export function CelebrationModal({ isOpen, onClose, planName }: CelebrationModalProps) {
  const [show, setShow] = useState(false);
  const { locale, t } = useLocale();

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    }
  }, [isOpen]);

  if (!show) return null;

  const features = [
    t("celebration", "feat1"),
    t("celebration", "feat2"),
    t("celebration", "feat3"),
    t("celebration", "feat4"),
    t("celebration", "feat5"),
    t("celebration", "feat6"),
    t("celebration", "feat7"),
    t("celebration", "feat8"),
  ];

  return (
    <>
      <ConfettiCanvas />
      <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md text-center animate-in fade-in zoom-in duration-300 relative overflow-hidden">
          {/* Decorative gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

          <button
            onClick={() => { setShow(false); onClose(); }}
            className="absolute top-4 right-4 text-muted hover:text-foreground z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Crown Icon with glow */}
          <div className="relative mb-4 mt-2">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
              <Crown className="w-10 h-10 text-white" />
            </div>
            {/* Sparkle dots */}
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute top-2 right-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: "0.3s" }} />
            <div className="absolute bottom-0 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0.6s" }} />
          </div>

          {/* Party icon */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <PartyPopper className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">{t("celebration", "congratulations")}</span>
            <PartyPopper className="w-5 h-5 text-primary scale-x-[-1]" />
          </div>

          {/* Main text */}
          <h2 className="text-xl font-bold mb-2">
            {locale === "th" ? `อัปเกรดเป็น${planName}สำเร็จ!` : `${planName} ${t("celebration", "activated")}`}
          </h2>

          <p className="text-muted text-sm leading-relaxed mb-4">
            {locale === "th"
              ? `ขอบคุณที่เลือกใช้ Finlance ${planName} คุณได้ปลดล็อคฟีเจอร์ทั้งหมดแล้ว ใช้งานได้เต็มที่ทุกฟังก์ชัน ไม่ว่าจะเป็นใบแจ้งหนี้ รายงาน ประมาณภาษี และอีกมากมาย`
              : `Thank you for choosing Finlance ${planName}! You've unlocked all features — invoices, reports, tax estimation, and much more.`}
          </p>

          {/* Feature highlights */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-5 text-left">
            <p className="text-xs font-semibold text-primary mb-2.5">{t("celebration", "unlocked")}:</p>
            <div className="grid grid-cols-2 gap-2">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-foreground">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <Link
              href="/dashboard"
              onClick={() => { setShow(false); onClose(); }}
              className="block w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition"
            >
              {t("celebration", "startUsing")}
            </Link>
            <button
              onClick={() => { setShow(false); onClose(); }}
              className="w-full py-2 text-sm text-muted hover:text-foreground transition"
            >
              {t("common", "close")}
            </button>
          </div>

          <p className="text-xs text-muted mt-3">
            {locale === "th" ? "หากมีคำถามหรือข้อเสนอแนะ ติดต่อเราได้ตลอดเวลา" : "Questions or feedback? Contact us anytime."}
          </p>
        </div>
      </div>
    </>
  );
}
