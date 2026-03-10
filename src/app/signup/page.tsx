"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DollarSign, Eye, EyeOff } from "lucide-react";
import { SignupIllustration } from "@/components/illustrations";
import { signUp } from "@/lib/supabase-store";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await signUp(email, password, name);
      if (authError) {
        setError(authError.message || "สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง");
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
        <SignupIllustration className="w-full max-w-sm h-auto opacity-90" />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <DollarSign className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">FreelanceFlow</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">สร้างบัญชีของคุณ</h1>
          <p className="text-muted">เริ่มติดตามการเงินฟรีแลนซ์ของคุณ</p>
        </div>

        <form onSubmit={handleSignup} className="bg-card border border-border rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-danger/10 text-danger border border-danger/30 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">ชื่อ</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อของคุณ"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

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
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
                minLength={6}
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
            {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
          </button>

          <p className="text-center text-sm text-muted">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-muted mt-4">
          โหมดทดลอง: ไม่มีการสร้างบัญชีจริง ข้อมูลจะถูกเก็บในเบราว์เซอร์ของคุณ
        </p>
      </div>
    </div>
  );
}
