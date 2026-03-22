const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
}

const PAGE_ID = process.env.FB_PAGE_ID;
const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

const allPosts = [
  { slug: "how-to-start-freelancing-thailand", title: "เริ่มต้นเป็นฟรีแลนซ์ยังไง?", subtitle: "คู่มือฉบับสมบูรณ์ 2569", points: ["หาทักษะที่ตลาดต้องการ", "สร้าง Portfolio ดึงดูดลูกค้า", "ตั้งราคาค่าบริการ", "หาลูกค้า 3 คนแรก", "จัดการภาษีและการเงิน"], color: "#a78bfa", icon: "🚀", caption: "เริ่มต้นเป็นฟรีแลนซ์ยังไง? คู่มือฉบับสมบูรณ์ 2569\n\nครอบคลุมทุกขั้นตอน ตั้งแต่หาทักษะ สร้าง Portfolio ตั้งราคา หาลูกค้า จัดการภาษี" },
  { slug: "quit-job-to-freelance-preparation", title: "ลาออกมาเป็นฟรีแลนซ์", subtitle: "เตรียมตัวยังไงไม่ให้เจ๊ง", points: ["เงินสำรอง 6-12 เดือน", "ลูกค้าอย่างน้อย 2-3 ราย", "สมัคร ม.39 ภายใน 6 เดือน", "สัญญาจ้างงาน + Invoice", "แยกบัญชีธุรกิจ-ส่วนตัว"], color: "#f59e0b", icon: "💼", caption: "ลาออกมาเป็นฟรีแลนซ์ เตรียมตัวยังไงไม่ให้เจ๊ง?\n\n- เงินสำรอง 6-12 เดือน\n- ลูกค้าอย่างน้อย 2-3 ราย\n- สมัคร ม.39 ภายใน 6 เดือน" },
  { slug: "freelance-average-income-thailand-2026", title: "รายได้ฟรีแลนซ์ไทย", subtitle: "เฉลี่ยเท่าไหร่ 2569", points: ["Developer: 40K-200K+", "Designer: 30K-150K", "Marketing: 25K-120K", "นักเขียน: 15K-80K", "ช่างภาพ: 20K-100K"], color: "#34d399", icon: "💰", caption: "รายได้ฟรีแลนซ์ไทยเฉลี่ยเท่าไหร่ 2569?\n\nDeveloper: 40K-200K+/เดือน\nDesigner: 30K-150K/เดือน\nMarketing: 25K-120K/เดือน" },
  { slug: "freelance-social-security-33-resignation", title: "ประกันสังคม ม.33", subtitle: "ลาออกมาฟรีแลนซ์ ทำยังไง", points: ["สมัคร ม.39 ภายใน 6 เดือน", "จ่าย 432 บ./เดือน สิทธิ์ครบ", "ขึ้นทะเบียนว่างงาน 30 วัน", "โอนกองทุนสำรองไป RMF", "พลาด = เสียสิทธิ์ตลอด!"], color: "#60a5fa", icon: "🏥", caption: "ลาออกจากงานประจำ ประกันสังคม ม.33 ต้องทำอะไร?\n\n1. สมัคร ม.39 ภายใน 6 เดือน\n2. ขึ้นทะเบียนว่างงาน 30 วัน\n3. โอนกองทุนสำรองไป RMF" },
  { slug: "essential-skills-for-freelancing", title: "ทักษะที่ฟรีแลนซ์ต้องมี", subtitle: "นอกจากทักษะหลัก", points: ["การเงิน: ตั้งราคา วางแผนภาษี", "สื่อสาร: Proposal เจรจา", "บริหารเวลา: Time Management", "Marketing: Personal Brand", "Mindset: Self-Discipline"], color: "#a78bfa", icon: "🧠", caption: "ทักษะที่ฟรีแลนซ์ต้องมี นอกจากทักษะหลัก\n\nเก่งแค่ coding หรือ design ไม่พอ\n- การเงิน: ตั้งราคา วางแผนภาษี\n- สื่อสาร: Proposal เจรจา\n- Marketing: Personal Brand" },
  { slug: "best-freelance-careers-thailand-2026", title: "10 อาชีพฟรีแลนซ์", subtitle: "ที่เหมาะกับคนไทย 2569", points: ["Developer — รายได้สูงสุด", "Designer — ตลาดกำลังโต", "นักเขียน — เริ่มต้นง่ายสุด", "Digital Marketing — Retainer", "Consultant — ต้องมี exp สูง"], color: "#34d399", icon: "🏆", caption: "10 อาชีพฟรีแลนซ์ที่เหมาะกับคนไทย 2569\n\n1. Developer\n2. Designer\n3. นักเขียน\n4. ช่างภาพ\n5. Video Editor" },
  { slug: "financial-runway-before-freelancing", title: "เตรียมเงินเท่าไหร่", subtitle: "ก่อนลาออกมาฟรีแลนซ์", points: ["สูตร: ค่าใช้จ่าย x เดือน + 20%", "6 เดือน = 180,000 บาท", "9 เดือน = 270,000 บาท", "12 เดือน = 360,000 บาท", "ยิ่งยาว ยิ่งมีอิสระเลือกงาน"], color: "#f59e0b", icon: "🏦", caption: "เตรียมเงินเท่าไหร่ก่อนลาออกมาฟรีแลนซ์?\n\nสูตร: ค่าใช้จ่าย/เดือน x จำนวนเดือน + 20%\n\n6 เดือน = 180,000\n9 เดือน = 270,000\n12 เดือน = 360,000" },
  { slug: "employee-to-freelancer-mindset-shift", title: "เปลี่ยน Mindset", subtitle: "จากพนักงานสู่ฟรีแลนซ์", points: ["รอคำสั่ง → ริเริ่มเอง", "ขายเวลา → ขายคุณค่า", "บริษัทรับเสี่ยง → รับเสี่ยงเอง", "แข่งเพื่อนร่วมงาน → Collaborate", "กลัวถูกไล่ออก → กลัวไม่มีงาน"], color: "#ec4899", icon: "🔄", caption: "เปลี่ยน Mindset จากพนักงานสู่ฟรีแลนซ์\n\nรอคำสั่ง → ริเริ่มเอง\nขายเวลา → ขายคุณค่า\nบริษัทรับเสี่ยง → รับเสี่ยงเอง" },
  { slug: "freelancing-pros-cons-honest-review", title: "ข้อดีข้อเสียฟรีแลนซ์", subtitle: "ความจริงที่ไม่มีใครบอก", points: ["✅ อิสระ เลือกงานเลือกเวลา", "✅ รายได้ไม่มีเพดาน", "❌ รายได้ไม่แน่นอน", "❌ ไม่มีสวัสดิการ", "❌ หาลูกค้าตลอดเวลา"], color: "#60a5fa", icon: "⚖️", caption: "ข้อดีข้อเสียฟรีแลนซ์ ความจริงที่ไม่มีใครบอก\n\nข้อดี: อิสระ รายได้ไม่จำกัด\nข้อเสีย: รายได้ไม่แน่นอน ไม่มีสวัสดิการ" },
  { slug: "freelance-beginner-mistakes-avoid", title: "10 ผิดพลาด", subtitle: "ที่ฟรีแลนซ์มือใหม่ทำ", points: ["ตั้งราคาต่ำเกินไป → เสีย 180K/ปี", "ไม่ทำสัญญา → โดนเบี้ยว", "ไม่แยกบัญชี → ไม่รู้กำไร", "ลืมภาษี → โดนค่าปรับ", "ไม่มี Emergency Fund"], color: "#ef4444", icon: "⚠️", caption: "10 ผิดพลาดที่ฟรีแลนซ์มือใหม่ทำ\n\n1. ตั้งราคาต่ำเกินไป\n2. ไม่ทำสัญญา\n3. ไม่แยกบัญชี\n4. ลืมภาษี\n5. ไม่มี Emergency Fund" },
  { slug: "freelance-tax-calculation-2026", title: "วิธีคำนวณภาษี", subtitle: "สำหรับฟรีแลนซ์ 2569", points: ["หักค่าใช้จ่ายเหมาได้ 60%", "ค่าลดหย่อนส่วนตัว 60,000", "อัตราภาษีก้าวหน้า 0-35%", "รายได้ 600K ภาษีแค่ 1,500!", "ยื่น ภ.ง.ด.94 + ภ.ง.ด.90"], color: "#a78bfa", icon: "🧮", caption: "วิธีคำนวณภาษีสำหรับฟรีแลนซ์ 2569\n\nหักค่าใช้จ่ายเหมาได้ 60%\nรายได้ 600,000 บ./ปี ภาษีแค่ 1,500 บาท!" },
  { slug: "freelance-pricing-strategy", title: "ตั้งราคาค่าบริการ", subtitle: "ฟรีแลนซ์ยังไงไม่ขาดทุน", points: ["สูตร: ต้นทุน / ชม.ทำงานจริง", "ค่าใช้จ่าย 30K + ออม + ภาษี", "หาร 100 ชม. = 410 บ./ชม.ขั้นต่ำ", "ราคาจริงควร +30-50%", "Value-based pricing ดีกว่า"], color: "#f59e0b", icon: "💎", caption: "ตั้งราคาค่าบริการฟรีแลนซ์ยังไงให้ไม่ขาดทุน?\n\nสูตร: (ค่าใช้จ่าย + ออม + ภาษี) / ชม.ทำงานจริง\nขั้นต่ำ 410 บ./ชม." },
  { slug: "emergency-fund-6-months-guide", title: "Emergency Fund", subtitle: "ฟรีแลนซ์ต้องมีเท่าไหร่", points: ["ขั้นต่ำ: 6 เดือนค่าใช้จ่าย", "แนะนำ: 9-12 เดือน", "เก็บในบัญชีออมทรัพย์", "ถอนได้ทันที", "อย่าเอาไปลงทุนเสี่ยง!"], color: "#34d399", icon: "🛟", caption: "ฟรีแลนซ์ต้องมี Emergency Fund เท่าไหร่?\n\nขั้นต่ำ: 6 เดือนค่าใช้จ่าย\nแนะนำ: 9-12 เดือน" },
  { slug: "withholding-tax-freelance-guide", title: "ภาษีหัก ณ ที่จ่าย 3%", subtitle: "ฟรีแลนซ์ต้องรู้", points: ["ลูกค้าหัก 3% ก่อนจ่าย", "งาน 10,000 ได้รับ 9,700", "เงินนี้ไม่ได้หายไป!", "เอาเครดิตภาษีตอนยื่น ภ.ง.ด.90", "อย่าลืมขอ 50 ทวิ ทุกครั้ง"], color: "#60a5fa", icon: "🧾", caption: "ภาษีหัก ณ ที่จ่าย 3% ฟรีแลนซ์ต้องรู้!\n\nลูกค้าหัก 3% ก่อนจ่าย แต่เงินนี้ไม่ได้หายไป!\nเอามาเครดิตภาษีได้" },
  { slug: "freelance-contract-template-guide", title: "สัญญาจ้างงานฟรีแลนซ์", subtitle: "ต้องมีอะไรบ้าง", points: ["Scope of Work ชัดเจน", "ราคาและเงื่อนไขจ่ายเงิน", "จำนวน Revision", "สิทธิ์ในผลงาน", "เงื่อนไขยกเลิก"], color: "#ec4899", icon: "📝", caption: "สัญญาจ้างงานฟรีแลนซ์ ต้องมีอะไรบ้าง?\n\n1. Scope of Work\n2. ราคาและเงื่อนไขจ่าย\n3. จำนวน Revision\n4. สิทธิ์ในผลงาน" },
  { slug: "freelance-cashflow-management-irregular-income", title: "บริหารกระแสเงินสด", subtitle: "เมื่อรายได้ไม่สม่ำเสมอ", points: ["จ่ายเงินเดือนตัวเองคงที่", "เงินส่วนเกินเข้า Buffer", "เดือนน้อยดึงจาก Buffer", "กัน 15-20% ไว้จ่ายภาษี", "แยกบัญชีธุรกิจ-ส่วนตัว"], color: "#34d399", icon: "💸", caption: "บริหารเงินยังไง เมื่อรายได้ไม่สม่ำเสมอ?\n\n1. จ่ายเงินเดือนตัวเองคงที่\n2. เงินส่วนเกินเข้า Buffer\n3. กัน 15-20% ไว้จ่ายภาษี" },
  { slug: "freelance-social-security-section-39-40-guide", title: "ประกันสังคม ม.39 vs ม.40", subtitle: "เลือกแบบไหนดี", points: ["ม.39: 432 บ./เดือน สิทธิ์ครบ", "ม.40: 70-300 บ./เดือน จำกัด", "ม.39 ได้ OPD IPD คลอด บำนาญ", "ม.40 ได้แค่ชดเชยรายวัน", "เคยเป็นพนักงาน เลือก ม.39!"], color: "#a78bfa", icon: "🏥", caption: "ประกันสังคม ม.39 vs ม.40 เลือกแบบไหนดี?\n\nม.39: 432 บ./เดือน สิทธิ์ครบ\nม.40: 70-300 บ./เดือน จำกัด" },
  { slug: "freelance-retirement-planning-ssf-rmf-guide", title: "วางแผนเกษียณ", subtitle: "SSF RMF สำหรับฟรีแลนซ์", points: ["ไม่มีกองทุนสำรองจากนายจ้าง", "SSF: สูงสุด 200,000 บ.", "RMF: สูงสุด 500,000 บ.", "ทั้งสองลดหย่อนภาษีได้", "ยิ่งเริ่มเร็ว ยิ่งสบาย"], color: "#f59e0b", icon: "🎯", caption: "ฟรีแลนซ์วางแผนเกษียณยังไง?\n\nSSF: สูงสุด 200,000 บ. ลดหย่อนภาษี\nRMF: สูงสุด 500,000 บ. ลดหย่อนภาษี" },
  { slug: "freelance-burnout-work-life-balance", title: "Burnout ฟรีแลนซ์", subtitle: "สัญญาณเตือนและวิธีรับมือ", points: ["หมดแรงจูงใจ ทำงานไม่ไหว", "นอนไม่หลับ กังวลตลอด", "คุณภาพงานลดลง", "ตั้งเวลาทำงานชัดเจน", "ปฏิเสธงานที่ไม่จำเป็น"], color: "#ef4444", icon: "🔥", caption: "Burnout ฟรีแลนซ์ สัญญาณเตือนและวิธีรับมือ\n\n- หมดแรงจูงใจ\n- นอนไม่หลับ\n\nวิธีแก้: ตั้งเวลาทำงานชัดเจน พักผ่อน" },
  { slug: "freelance-build-online-portfolio", title: "สร้าง Portfolio ออนไลน์", subtitle: "ให้ลูกค้าประทับใจ", points: ["ผลงาน 5-8 ชิ้นที่ดีที่สุด", "คำอธิบาย: ปัญหา → แก้ → ผลลัพธ์", "Testimonial จากลูกค้า", "ข้อมูลติดต่อชัดเจน", "อัปเดตสม่ำเสมอ"], color: "#60a5fa", icon: "🎨", caption: "Portfolio ฟรีแลนซ์ ต้องมีอะไรบ้าง?\n\n1. ผลงาน 5-8 ชิ้นที่ดีที่สุด\n2. คำอธิบาย: ปัญหา > แก้ยังไง > ผลลัพธ์\n3. Testimonial จากลูกค้า" },
];

function generatePostImage(post) {
  const pointsHTML = post.points.map(p =>
    `<div class="point"><div class="point-dot" style="background:${post.color}"></div><span>${p}</span></div>`
  ).join('');

  return `<!DOCTYPE html>
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #0f172a; font-family: 'Prompt', sans-serif; overflow: hidden; position: relative; }
  .gradient-bar { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${post.color}, ${post.color}88, #0f172a); }
  .gradient-bar-bottom { position: absolute; bottom: 0; right: 0; width: 40%; height: 3px; background: linear-gradient(90deg, transparent, ${post.color}66); }
  .bg-grid { position: absolute; inset: 0; background-image:
    linear-gradient(rgba(167,139,250,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(167,139,250,0.025) 1px, transparent 1px);
    background-size: 50px 50px; }
  .bg-glow { position: absolute; width: 600px; height: 600px; border-radius: 300px; background: radial-gradient(circle, ${post.color}18, transparent 65%); top: -150px; left: -150px; }
  .bg-glow2 { position: absolute; width: 450px; height: 450px; border-radius: 225px; background: radial-gradient(circle, ${post.color}0a, transparent 60%); bottom: -120px; right: 80px; }
  .bg-ring { position: absolute; width: 350px; height: 350px; border-radius: 175px; border: 1px solid ${post.color}10; top: 140px; left: 350px; }
  .bg-ring2 { position: absolute; width: 200px; height: 200px; border-radius: 100px; border: 1px solid ${post.color}08; top: -40px; right: 120px; }
  .float-dot { position: absolute; border-radius: 50%; }
  .fd1 { width: 6px; height: 6px; background: ${post.color}; top: 80px; right: 200px; box-shadow: 0 0 12px ${post.color}80; }
  .fd2 { width: 4px; height: 4px; background: #34d399; top: 180px; left: 320px; box-shadow: 0 0 10px #34d39980; }
  .fd3 { width: 5px; height: 5px; background: #60a5fa; bottom: 120px; left: 280px; box-shadow: 0 0 10px #60a5fa80; }
  .fd4 { width: 3px; height: 3px; background: #f59e0b; bottom: 80px; right: 480px; box-shadow: 0 0 8px #f59e0b80; }
  .fd5 { width: 7px; height: 7px; background: ${post.color}60; top: 300px; right: 50px; box-shadow: 0 0 15px ${post.color}40; }
  .corner-deco { position: absolute; bottom: 20px; left: 20px; width: 60px; height: 60px; border-left: 2px solid ${post.color}20; border-bottom: 2px solid ${post.color}20; border-radius: 0 0 0 12px; }
  .corner-deco2 { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-right: 2px solid ${post.color}15; border-top: 2px solid ${post.color}15; border-radius: 0 8px 0 0; }
  .line-deco { position: absolute; top: 50%; left: 0; width: 100%; height: 1px; background: linear-gradient(90deg, transparent, ${post.color}06, transparent); }
  .line-deco2 { position: absolute; top: 30%; left: 0; width: 100%; height: 1px; background: linear-gradient(90deg, transparent, ${post.color}04, transparent); }
  .content { position: relative; z-index: 1; display: flex; height: 100%; padding: 50px 60px; }
  .left { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-right: 50px; }
  .right { width: 420px; display: flex; flex-direction: column; justify-content: center; }

  .icon-badge { display: inline-flex; align-items: center; gap: 10px; padding: 8px 20px; border-radius: 24px; background: ${post.color}15; border: 1px solid ${post.color}30; margin-bottom: 24px; width: fit-content; }
  .icon-badge .emoji { font-size: 24px; }
  .icon-badge .label { font-size: 14px; color: ${post.color}; font-weight: 600; letter-spacing: 0.5px; }

  .title { font-size: 48px; font-weight: 900; color: #f8fafc; line-height: 1.15; margin-bottom: 8px; }
  .subtitle { font-size: 36px; font-weight: 700; background: linear-gradient(135deg, ${post.color}, ${post.color}cc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px; line-height: 1.2; }
  .url { font-size: 16px; color: #64748b; margin-top: auto; }
  .url span { color: ${post.color}; font-weight: 700; }
  .url .free { display: inline-block; padding: 4px 12px; border-radius: 6px; background: ${post.color}; color: white; font-size: 13px; font-weight: 700; margin-left: 10px; }

  .card { background: rgba(15,23,42,0.9); border: 1px solid rgba(100,116,139,0.2); border-radius: 16px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .card-title { font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; font-weight: 500; }
  .point { display: flex; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid rgba(100,116,139,0.1); }
  .point:last-child { border: none; }
  .point-dot { width: 8px; height: 8px; border-radius: 4px; flex-shrink: 0; }
  .point span { font-size: 18px; color: #e2e8f0; font-weight: 500; }

  .branding { display: flex; align-items: center; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(100,116,139,0.15); }
  .brand-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #6d28d9); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 18px; }
  .brand-name { font-size: 18px; font-weight: 800; color: #f8fafc; }
  .brand-desc { font-size: 11px; color: #64748b; }
</style>
</head><body>
<div class="gradient-bar"></div>
<div class="gradient-bar-bottom"></div>
<div class="bg-grid"></div>
<div class="bg-glow"></div>
<div class="bg-glow2"></div>
<div class="bg-ring"></div>
<div class="bg-ring2"></div>
<div class="float-dot fd1"></div>
<div class="float-dot fd2"></div>
<div class="float-dot fd3"></div>
<div class="float-dot fd4"></div>
<div class="float-dot fd5"></div>
<div class="corner-deco"></div>
<div class="corner-deco2"></div>
<div class="line-deco"></div>
<div class="line-deco2"></div>
<div class="content">
  <div class="left">
    <div class="icon-badge">
      <span class="emoji">${post.icon}</span>
      <span class="label">finlance.co</span>
    </div>
    <div class="title">${post.title}</div>
    <div class="subtitle">${post.subtitle}</div>
    <div class="url"><span>finlance.co</span><span class="free">อ่านฟรี</span></div>
  </div>
  <div class="right">
    <div class="card">
      <div class="card-title">สิ่งที่คุณจะได้เรียนรู้</div>
      ${pointsHTML}
      <div class="branding">
        <div class="brand-icon">F</div>
        <div>
          <div class="brand-name">Finlance</div>
          <div class="brand-desc">ผู้ช่วยการเงินสำหรับฟรีแลนซ์</div>
        </div>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

async function renderImage(html) {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
  const buf = await page.screenshot({ type: 'png' });
  await browser.close();
  return buf;
}

function postPhoto(pngBuffer, message) {
  return new Promise((resolve, reject) => {
    const boundary = 'boundary' + Date.now() + Math.random().toString(36);
    let body = '';
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="message"\r\n\r\n';
    body += message + '\r\n';
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="access_token"\r\n\r\n';
    body += TOKEN + '\r\n';
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="source"; filename="cover.png"\r\n';
    body += 'Content-Type: image/png\r\n\r\n';
    const bodyEnd = '\r\n--' + boundary + '--\r\n';
    const bodyBuf = Buffer.concat([Buffer.from(body, 'utf8'), pngBuffer, Buffer.from(bodyEnd, 'utf8')]);

    const req = https.request({
      hostname: 'graph.facebook.com',
      path: `/v25.0/${PAGE_ID}/photos`,
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary, 'Content-Length': bodyBuf.length }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { const r = JSON.parse(d); if (r.error) reject(r.error); else resolve(r); });
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

async function main() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const hour = now.getUTCHours();
  let slot = 0;
  if (hour >= 10) slot = 1;
  if (hour >= 14) slot = 2;

  const postIndex = (dayOfYear * 3 + slot) % allPosts.length;
  const post = allPosts[postIndex];
  const link = `https://finlance.co/blog/${post.slug}`;
  const message = post.caption + `\n\nอ่านบทความเต็ม: ${link}`;

  console.log(`Day ${dayOfYear}, Slot ${slot} -> Post #${postIndex}: ${post.slug}`);
  console.log('Generating custom image...');

  const html = generatePostImage(post);
  const pngBuffer = await renderImage(html);
  console.log(`Image rendered: ${pngBuffer.length} bytes`);

  const result = await postPhoto(pngBuffer, message);
  console.log('Posted! ID:', result.post_id || result.id);
}

main().catch(e => { console.error(e); process.exit(1); });
