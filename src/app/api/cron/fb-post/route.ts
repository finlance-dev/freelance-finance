import { NextResponse } from "next/server";

const PAGE_ID = process.env.FB_PAGE_ID;
const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

const allPosts = [
  { slug: "how-to-start-freelancing-thailand", caption: "เริ่มต้นเป็นฟรีแลนซ์ยังไง? คู่มือฉบับสมบูรณ์ 2569\n\nครอบคลุมทุกขั้นตอน ตั้งแต่หาทักษะ สร้าง Portfolio ตั้งราคา หาลูกค้า จัดการภาษี" },
  { slug: "quit-job-to-freelance-preparation", caption: "ลาออกมาเป็นฟรีแลนซ์ เตรียมตัวยังไงไม่ให้เจ๊ง?\n\n- เงินสำรอง 6-12 เดือน\n- ลูกค้าอย่างน้อย 2-3 ราย\n- สมัคร ม.39 ภายใน 6 เดือน" },
  { slug: "freelance-average-income-thailand-2026", caption: "รายได้ฟรีแลนซ์ไทยเฉลี่ยเท่าไหร่ 2569?\n\nDeveloper: 40K-200K+/เดือน\nDesigner: 30K-150K/เดือน\nMarketing: 25K-120K/เดือน" },
  { slug: "freelance-social-security-33-resignation", caption: "ลาออกจากงานประจำ ประกันสังคม ม.33 ต้องทำอะไร?\n\n1. สมัคร ม.39 ภายใน 6 เดือน\n2. ขึ้นทะเบียนว่างงาน 30 วัน\n3. โอนกองทุนสำรองไป RMF" },
  { slug: "essential-skills-for-freelancing", caption: "ทักษะที่ฟรีแลนซ์ต้องมี นอกจากทักษะหลัก\n\n- การเงิน: ตั้งราคา วางแผนภาษี\n- สื่อสาร: Proposal เจรจา\n- Marketing: Personal Brand" },
  { slug: "best-freelance-careers-thailand-2026", caption: "10 อาชีพฟรีแลนซ์ที่เหมาะกับคนไทย 2569\n\n1. Developer\n2. Designer\n3. นักเขียน\n4. ช่างภาพ\n5. Video Editor" },
  { slug: "financial-runway-before-freelancing", caption: "เตรียมเงินเท่าไหร่ก่อนลาออกมาฟรีแลนซ์?\n\n6 เดือน = 180,000 บาท\n9 เดือน = 270,000 บาท\n12 เดือน = 360,000 บาท" },
  { slug: "employee-to-freelancer-mindset-shift", caption: "เปลี่ยน Mindset จากพนักงานสู่ฟรีแลนซ์\n\nรอคำสั่ง → ริเริ่มเอง\nขายเวลา → ขายคุณค่า\nบริษัทรับเสี่ยง → รับเสี่ยงเอง" },
  { slug: "freelancing-pros-cons-honest-review", caption: "ข้อดีข้อเสียฟรีแลนซ์ ความจริงที่ไม่มีใครบอก\n\nข้อดี: อิสระ รายได้ไม่จำกัด\nข้อเสีย: รายได้ไม่แน่นอน ไม่มีสวัสดิการ" },
  { slug: "freelance-beginner-mistakes-avoid", caption: "10 ผิดพลาดที่ฟรีแลนซ์มือใหม่ทำ\n\n1. ตั้งราคาต่ำเกินไป\n2. ไม่ทำสัญญา\n3. ไม่แยกบัญชี\n4. ลืมภาษี\n5. ไม่มี Emergency Fund" },
  { slug: "freelance-tax-calculation-2026", caption: "วิธีคำนวณภาษีสำหรับฟรีแลนซ์ 2569\n\nหักค่าใช้จ่ายเหมาได้ 60%\nรายได้ 600,000 บ./ปี ภาษีแค่ 1,500 บาท!" },
  { slug: "freelance-pricing-strategy", caption: "ตั้งราคาค่าบริการฟรีแลนซ์ยังไงไม่ขาดทุน?\n\nสูตร: (ค่าใช้จ่าย + ออม + ภาษี) / ชม.ทำงานจริง\nขั้นต่ำ 410 บ./ชม." },
  { slug: "emergency-fund-6-months-guide", caption: "ฟรีแลนซ์ต้องมี Emergency Fund เท่าไหร่?\n\nขั้นต่ำ: 6 เดือนค่าใช้จ่าย\nแนะนำ: 9-12 เดือน" },
  { slug: "withholding-tax-freelance-guide", caption: "ภาษีหัก ณ ที่จ่าย 3% ฟรีแลนซ์ต้องรู้!\n\nลูกค้าหัก 3% ก่อนจ่าย แต่เงินนี้ไม่ได้หายไป!\nเอามาเครดิตภาษีตอนยื่น ภ.ง.ด.90 ได้" },
  { slug: "freelance-contract-template-guide", caption: "สัญญาจ้างงานฟรีแลนซ์ ต้องมีอะไรบ้าง?\n\n1. Scope of Work\n2. ราคาและเงื่อนไขจ่าย\n3. จำนวน Revision\n4. สิทธิ์ในผลงาน" },
  { slug: "freelance-cashflow-management-irregular-income", caption: "บริหารเงินยังไง เมื่อรายได้ไม่สม่ำเสมอ?\n\n1. จ่ายเงินเดือนตัวเองคงที่\n2. เงินส่วนเกินเข้า Buffer\n3. กัน 15-20% ไว้จ่ายภาษี" },
  { slug: "freelance-social-security-section-39-40-guide", caption: "ประกันสังคม ม.39 vs ม.40 เลือกแบบไหนดี?\n\nม.39: 432 บ./เดือน สิทธิ์ครบ\nม.40: 70-300 บ./เดือน จำกัด" },
  { slug: "freelance-retirement-planning-ssf-rmf-guide", caption: "ฟรีแลนซ์วางแผนเกษียณยังไง?\n\nSSF: สูงสุด 200,000 บ. ลดหย่อนภาษี\nRMF: สูงสุด 500,000 บ. ลดหย่อนภาษี" },
  { slug: "freelance-burnout-work-life-balance", caption: "Burnout ฟรีแลนซ์ สัญญาณเตือนและวิธีรับมือ\n\nหมดแรงจูงใจ นอนไม่หลับ คุณภาพงานลดลง\n\nวิธีแก้: ตั้งเวลาทำงานชัดเจน พักผ่อน" },
  { slug: "freelance-build-online-portfolio", caption: "Portfolio ฟรีแลนซ์ ต้องมีอะไรบ้าง?\n\n1. ผลงาน 5-8 ชิ้นที่ดีที่สุด\n2. คำอธิบาย: ปัญหา > แก้ยังไง > ผลลัพธ์\n3. Testimonial จากลูกค้า" },
];

async function postToFacebook(message: string, link: string) {
  const params = new URLSearchParams({
    message,
    link,
    access_token: TOKEN!,
  });

  const res = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  return res.json();
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!PAGE_ID || !TOKEN) {
    return NextResponse.json({ error: "Missing FB credentials" }, { status: 500 });
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((+now - +start) / 86400000);
  const hour = now.getUTCHours();

  let slot = 0;
  if (hour >= 10) slot = 1;
  if (hour >= 14) slot = 2;

  const postIndex = (dayOfYear * 3 + slot) % allPosts.length;
  const post = allPosts[postIndex];
  const link = `https://finlance.co/blog/${post.slug}`;
  const message = post.caption + "\n\nอ่านบทความเต็ม";

  try {
    const result = await postToFacebook(message, link);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      postId: result.id,
      slug: post.slug,
      dayOfYear,
      slot,
      postIndex,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
