"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DollarSign, Eye, EyeOff } from "lucide-react";
import { LoginIllustration } from "@/components/illustrations";
import { signIn } from "@/lib/supabase-store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(authError.message || "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="hidden lg:flex items-center justify-center flex-1 max-w-md">
        <LoginIllustration className="w-full max-w-sm h-auto opacity-90" />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <DollarSign className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">FreelanceFlow</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">ยินดีต้อนรับกลับ</h1>
          <p className="text-muted">เข้าสู่ระบบบัญชีของคุณ</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card border border-border rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-danger/10 text-danger border border-danger/30 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="อีเมลของคุณ"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          <p className="text-center text-sm text-muted">
            ยังไม่มีบัญชี?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              สมัครฟรี
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-muted mt-4">
          โหมดทดลอง: ใช้อีเมลและรหัสผ่านอะไรก็ได้เพื่อเข้าสู่ระบบ
        </p>
      </div>
    </div>
  );
}
