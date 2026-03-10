"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Calculator,
  BarChart3,
  Users,
  ArrowRight,
  Check,
  DollarSign,
  PieChart,
  Shield,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { HeroIllustration } from "@/components/illustrations";

const features = [
  {
    icon: TrendingUp,
    title: "ติดตามรายได้",
    description:
      "ติดตามทุกบาทจากทุกลูกค้าและโปรเจกต์ ดูแนวโน้มรายได้ได้ทันทีผ่านกราฟที่เข้าใจง่าย",
  },
  {
    icon: Calculator,
    title: "ประมาณภาษี",
    description:
      "คำนวณภาษีรายไตรมาสอัตโนมัติ ไม่ต้องตกใจกับยอดภาษีอีกต่อไป",
  },
  {
    icon: BarChart3,
    title: "พยากรณ์กระแสเงินสด",
    description:
      "รู้ว่าเงินจะพอใช้อีกกี่เดือน วางแผนล่วงหน้าได้อย่างมั่นใจแม้รายได้ไม่สม่ำเสมอ",
  },
  {
    icon: Users,
    title: "จัดการลูกค้าและโปรเจกต์",
    description:
      "ดูว่าลูกค้าและโปรเจกต์ไหนทำกำไรมากที่สุด หยุดแลกเวลากับเงินที่น้อยเกินไป",
  },
  {
    icon: PieChart,
    title: "หมวดหมู่ค่าใช้จ่าย",
    description:
      "จัดหมวดหมู่ค่าใช้จ่ายอัตโนมัติ ใช้สิทธิ์ลดหย่อนภาษีได้เต็มที่ และรู้ว่าเงินหายไปไหน",
  },
  {
    icon: Shield,
    title: "คะแนนสุขภาพการเงิน",
    description:
      "รับคะแนนง่ายๆ ที่บอกว่าการเงินฟรีแลนซ์ของคุณแข็งแรงแค่ไหน พร้อมคำแนะนำที่ทำได้จริง",
  },
];

const painPoints = [
  "ไม่รู้ว่าต้องจ่ายภาษีเท่าไหร่ในแต่ละไตรมาส",
  "รายได้ขึ้นลงไม่แน่นอนในแต่ละเดือน",
  "ไม่รู้ว่าโปรเจกต์ไหนทำกำไรจริง",
  "ปนเงินส่วนตัวกับเงินธุรกิจ",
  "เสียเวลาหลายชั่วโมงกับ spreadsheet แทนที่จะทำงาน",
];

const pricingPlans = [
  {
    name: "ฟรี",
    price: "0",
    period: "",
    description: "เริ่มต้นใช้งานพื้นฐาน",
    features: [
      "ติดตามรายรับ-รายจ่าย",
      "แดชบอร์ดพื้นฐาน",
      "ลูกค้าได้สูงสุด 3 ราย",
      "สรุปรายเดือน",
    ],
    cta: "เริ่มใช้ฟรี",
    highlighted: false,
  },
  {
    name: "โปร",
    price: "299",
    period: "/เดือน",
    description: "ทุกอย่างที่คุณต้องการจัดการการเงิน",
    features: [
      "ทุกฟีเจอร์ในแพลนฟรี",
      "ลูกค้าและโปรเจกต์ไม่จำกัด",
      "ประมาณภาษีและแจ้งเตือน",
      "พยากรณ์กระแสเงินสด",
      "วิเคราะห์กำไรรายโปรเจกต์",
      "ส่งออกรายงาน (CSV/PDF)",
    ],
    cta: "ทดลองใช้โปร",
    highlighted: true,
  },
  {
    name: "โปรรายปี",
    price: "2,499",
    period: "/ปี",
    description: "ประหยัด 30% เมื่อจ่ายรายปี",
    features: [
      "ทุกฟีเจอร์ในแพลนโปร",
      "ซัพพอร์ตเร่งด่วน",
      "เข้าถึงฟีเจอร์ใหม่ก่อนใคร",
      "ประหยัดกว่า 1,000 บาท/ปี",
    ],
    cta: "สมัครแพลนรายปี",
    highlighted: false,
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">FreelanceFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted hover:text-foreground transition">
                ฟีเจอร์
              </a>
              <a href="#pricing" className="text-muted hover:text-foreground transition">
                ราคา
              </a>
              <Link
                href="/login"
                className="text-muted hover:text-foreground transition"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/signup"
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-medium transition"
              >
                เริ่มใช้ฟรี
              </Link>
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 flex flex-col gap-3">
              <a href="#features" className="text-muted hover:text-foreground py-2">ฟีเจอร์</a>
              <a href="#pricing" className="text-muted hover:text-foreground py-2">ราคา</a>
              <Link href="/login" className="text-muted hover:text-foreground py-2">เข้าสู่ระบบ</Link>
              <Link href="/signup" className="bg-primary text-white px-5 py-2 rounded-lg font-medium text-center">
                เริ่มใช้ฟรี
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            สร้างโดยฟรีแลนซ์ เพื่อฟรีแลนซ์
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            ผู้ช่วยการเงิน
            <span className="text-primary"> อัจฉริยะ</span>
            <br />
            สำหรับฟรีแลนซ์
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10">
            หยุดเดา เริ่มรู้จริง ติดตามรายได้ ประมาณภาษี
            และพยากรณ์กระแสเงินสด — ทั้งหมดในแดชบอร์ดเดียวที่ออกแบบมาสำหรับรายได้ไม่สม่ำเสมอ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
            >
              เริ่มใช้ฟรี — ไม่ต้องใช้บัตรเครดิต
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="border border-border hover:bg-secondary text-foreground px-8 py-3.5 rounded-xl font-semibold text-lg transition text-center"
            >
              ดูว่าทำอะไรได้บ้าง
            </a>
          </div>
          <p className="text-sm text-muted">
            เข้าร่วมกับฟรีแลนซ์กว่า 1,000 คนที่ควบคุมการเงินได้แล้ว
          </p>
          <div className="mt-12 max-w-2xl mx-auto">
            <HeroIllustration className="w-full h-auto drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 bg-secondary/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            ฟังดูคุ้นไหม?
          </h2>
          <div className="grid gap-4 max-w-2xl mx-auto">
            {painPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-card p-4 rounded-xl border border-border"
              >
                <span className="text-danger text-xl mt-0.5">&#10005;</span>
                <p className="text-lg">{point}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-lg text-muted">
            FreelanceFlow แก้ปัญหาทั้งหมดนี้ได้{" "}
            <span className="text-accent font-semibold">ในไม่กี่นาที ไม่ใช่หลายชั่วโมง</span>
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ทุกอย่างที่คุณต้องการ ไม่มีส่วนเกิน
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              ไม่ใช่ซอฟต์แวร์บัญชีที่ซับซ้อน ไม่ต้องตั้งค่ายุ่งยาก
              แค่ความชัดเจนทางการเงินที่ฟรีแลนซ์ต้องการจริงๆ
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-secondary/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ราคาเรียบง่าย โปร่งใส
            </h2>
            <p className="text-lg text-muted">
              เริ่มใช้ฟรี อัปเกรดเมื่อพร้อม
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`bg-card rounded-2xl p-8 border-2 transition-all ${
                  plan.highlighted
                    ? "border-primary shadow-xl scale-105"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {plan.highlighted && (
                  <div className="text-sm font-semibold text-primary mb-2">
                    ยอดนิยม
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-muted text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === "0" ? "ฟรี" : `฿${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-muted">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`w-full block text-center py-3 rounded-xl font-semibold transition ${
                    plan.highlighted
                      ? "bg-primary hover:bg-primary-dark text-white"
                      : "bg-secondary hover:bg-border text-foreground"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist / CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            พร้อมควบคุมการเงินแล้วหรือยัง?
          </h2>
          <p className="text-lg text-muted mb-8">
            สมัคร waitlist เพื่อเข้าถึงก่อนใคร และรับแพลนโปรฟรี 3 เดือน
          </p>
          {submitted ? (
            <div className="bg-accent/10 text-accent-dark border border-accent/30 px-6 py-4 rounded-xl font-medium">
              <Check className="w-5 h-5 inline mr-2" />
              ลงทะเบียนสำเร็จ! เราจะติดต่อกลับเร็วๆ นี้
            </div>
          ) : (
            <form
              onSubmit={handleWaitlist}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมลของคุณ"
                required
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap"
              >
                สมัคร Waitlist
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="font-semibold">FreelanceFlow</span>
          </div>
          <p className="text-sm text-muted">
            &copy; 2026 FreelanceFlow สร้างมาเพื่อฟรีแลนซ์ที่มีรายได้ไม่สม่ำเสมอ
          </p>
        </div>
      </footer>
    </div>
  );
}
