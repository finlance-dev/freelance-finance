const puppeteer = require('puppeteer');
const path = require('path');

async function renderCover(html, outputPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();
}

function generateCoverHTML(post) {
  const pointsHTML = post.points.map(p =>
    `<div class="point"><div class="dot" style="background:${post.color}"></div><span>${p}</span></div>`
  ).join('');

  const statsHTML = post.stats ? post.stats.map(s =>
    `<div class="stat"><div class="stat-value" style="color:${s.color || post.color}">${s.value}</div><div class="stat-label">${s.label}</div></div>`
  ).join('') : '';

  return `<!DOCTYPE html>
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #0f172a; font-family: 'Prompt', sans-serif; overflow: hidden; position: relative; }

  /* Background effects */
  .gradient-bar { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${post.color}, ${post.color}88, transparent); }
  .gradient-bar-b { position: absolute; bottom: 0; right: 0; width: 40%; height: 3px; background: linear-gradient(90deg, transparent, ${post.color}66); }
  .bg-grid { position: absolute; inset: 0; background-image:
    linear-gradient(rgba(167,139,250,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(167,139,250,0.025) 1px, transparent 1px);
    background-size: 50px 50px; }
  .bg-glow { position: absolute; width: 600px; height: 600px; border-radius: 300px; background: radial-gradient(circle, ${post.color}18, transparent 65%); top: -150px; left: -150px; }
  .bg-glow2 { position: absolute; width: 450px; height: 450px; border-radius: 225px; background: radial-gradient(circle, ${post.color}0a, transparent 60%); bottom: -120px; right: 80px; }
  .bg-ring { position: absolute; width: 350px; height: 350px; border-radius: 175px; border: 1px solid ${post.color}10; top: 140px; left: 350px; }
  .bg-ring2 { position: absolute; width: 200px; height: 200px; border-radius: 100px; border: 1px solid ${post.color}08; top: -40px; right: 120px; }
  .fd { position: absolute; border-radius: 50%; }
  .fd1 { width: 6px; height: 6px; background: ${post.color}; top: 80px; right: 200px; box-shadow: 0 0 12px ${post.color}80; }
  .fd2 { width: 4px; height: 4px; background: #34d399; top: 180px; left: 320px; box-shadow: 0 0 10px #34d39980; }
  .fd3 { width: 5px; height: 5px; background: #60a5fa; bottom: 120px; left: 280px; box-shadow: 0 0 10px #60a5fa80; }
  .fd4 { width: 3px; height: 3px; background: #f59e0b; bottom: 80px; right: 480px; box-shadow: 0 0 8px #f59e0b80; }
  .fd5 { width: 7px; height: 7px; background: ${post.color}60; top: 300px; right: 50px; box-shadow: 0 0 15px ${post.color}40; }
  .corner1 { position: absolute; bottom: 20px; left: 20px; width: 60px; height: 60px; border-left: 2px solid ${post.color}20; border-bottom: 2px solid ${post.color}20; border-radius: 0 0 0 12px; }
  .corner2 { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-right: 2px solid ${post.color}15; border-top: 2px solid ${post.color}15; border-radius: 0 8px 0 0; }
  .line1 { position: absolute; top: 50%; left: 0; width: 100%; height: 1px; background: linear-gradient(90deg, transparent, ${post.color}06, transparent); }
  .line2 { position: absolute; top: 30%; left: 0; width: 100%; height: 1px; background: linear-gradient(90deg, transparent, ${post.color}04, transparent); }

  /* Content */
  .content { position: relative; z-index: 1; display: flex; height: 100%; padding: 50px 60px; }
  .left { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-right: 50px; }
  .right { width: 420px; display: flex; flex-direction: column; justify-content: center; }

  .icon-badge { display: inline-flex; align-items: center; gap: 10px; padding: 8px 20px; border-radius: 24px; background: ${post.color}15; border: 1px solid ${post.color}30; margin-bottom: 24px; width: fit-content; }
  .icon-badge .emoji { font-size: 24px; }
  .icon-badge .label { font-size: 14px; color: ${post.color}; font-weight: 600; }

  .title { font-size: 48px; font-weight: 900; color: #f8fafc; line-height: 1.15; margin-bottom: 8px; }
  .subtitle { font-size: 36px; font-weight: 700; background: linear-gradient(135deg, ${post.color}, ${post.color}cc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px; line-height: 1.2; }

  .url { font-size: 16px; color: #64748b; margin-top: auto; }
  .url span { color: ${post.color}; font-weight: 700; }
  .url .free { display: inline-block; padding: 4px 12px; border-radius: 6px; background: ${post.color}; color: white; font-size: 13px; font-weight: 700; margin-left: 10px; }

  /* Right card */
  .card { background: rgba(15,23,42,0.9); border: 1px solid rgba(100,116,139,0.2); border-radius: 16px; padding: 28px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .card-title { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; font-weight: 500; }
  .point { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid rgba(100,116,139,0.1); }
  .point:last-child { border: none; }
  .dot { width: 8px; height: 8px; border-radius: 4px; flex-shrink: 0; }
  .point span { font-size: 16px; color: #e2e8f0; font-weight: 500; }

  .stats-row { display: flex; gap: 12px; margin-bottom: 16px; }
  .stat { flex: 1; padding: 12px; border-radius: 10px; background: rgba(30,41,59,0.8); border: 1px solid rgba(100,116,139,0.15); text-align: center; }
  .stat-value { font-size: 22px; font-weight: 800; line-height: 1.2; }
  .stat-label { font-size: 10px; color: #64748b; margin-top: 2px; }

  .branding { display: flex; align-items: center; gap: 10px; margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(100,116,139,0.15); }
  .brand-icon { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #7c3aed, #6d28d9); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 16px; }
  .brand-name { font-size: 16px; font-weight: 800; color: #f8fafc; }
  .brand-desc { font-size: 10px; color: #64748b; }
</style>
</head><body>
<div class="gradient-bar"></div>
<div class="gradient-bar-b"></div>
<div class="bg-grid"></div>
<div class="bg-glow"></div>
<div class="bg-glow2"></div>
<div class="bg-ring"></div>
<div class="bg-ring2"></div>
<div class="fd fd1"></div>
<div class="fd fd2"></div>
<div class="fd fd3"></div>
<div class="fd fd4"></div>
<div class="fd fd5"></div>
<div class="corner1"></div>
<div class="corner2"></div>
<div class="line1"></div>
<div class="line2"></div>
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
      ${statsHTML ? `<div class="stats-row">${statsHTML}</div>` : ''}
      <div class="card-title">${post.cardTitle || 'สิ่งที่คุณจะได้เรียนรู้'}</div>
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

// Export for use by other scripts
module.exports = { generateCoverHTML, renderCover };

// Run directly
if (require.main === module) {
  const covers = [
    { file: "home-loan-mortgage", title: "ฟรีแลนซ์กู้บ้าน", subtitle: "ยังไงให้ผ่าน", icon: "🏠", color: "#34d399", stats: [{ value: "80-90%", label: "วงเงินกู้", color: "#34d399" }, { value: "3.5-6.5%", label: "ดอกเบี้ย/ปี", color: "#60a5fa" }], points: ["เตรียม Statement ย้อนหลัง 12 เดือน", "มีรายได้เข้าบัญชีสม่ำเสมอ", "จดทะเบียนพาณิชย์เพิ่มโอกาสผ่าน", "วางเงินดาวน์ 20%+ ช่วยได้เยอะ", "เปรียบเทียบดอกเบี้ยหลายธนาคาร"] },
    { file: "credit-card-application", title: "ฟรีแลนซ์สมัคร", subtitle: "บัตรเครดิตยังไงให้ผ่าน", icon: "💳", color: "#a78bfa", stats: [{ value: "15K+", label: "รายได้ขั้นต่ำ", color: "#a78bfa" }, { value: "6 เดือน", label: "Statement", color: "#60a5fa" }], points: ["รายได้เข้าบัญชีสม่ำเสมอ 15,000+", "ไม่มีประวัติค้างชำระ NCB", "เริ่มจากบัตรง่าย → อัปเกรดทีหลัง", "สมัครธนาคารที่มีบัญชีอยู่แล้ว", "จดทะเบียนพาณิชย์ช่วยเพิ่มโอกาส"] },
    { file: "car-loan", title: "ฟรีแลนซ์กู้รถ", subtitle: "เตรียมเอกสารยังไง", icon: "🚗", color: "#60a5fa", stats: [{ value: "20-25%", label: "ดาวน์ขั้นต่ำ", color: "#60a5fa" }, { value: "84 เดือน", label: "ผ่อนนานสุด", color: "#34d399" }], points: ["Statement ย้อนหลัง 6 เดือน", "50 ทวิ หรือ Invoice ย้อนหลัง", "วางดาวน์เยอะ = ผ่านง่าย", "เลือกรถมือสอง ผ่อนเบากว่า", "เปรียบเทียบไฟแนนซ์หลายเจ้า"] },
    { file: "open-business-account", title: "เปิดบัญชีธนาคาร", subtitle: "ธุรกิจสำหรับฟรีแลนซ์", icon: "🏦", color: "#f59e0b", cardTitle: "ทำไมต้องแยกบัญชี", points: ["เห็นกำไร-ขาดทุนชัดเจน", "ยื่นภาษีง่ายขึ้น", "ดูเป็นมืออาชีพกับลูกค้า", "กู้เงินง่ายขึ้น มี Statement ธุรกิจ", "ไม่ปะปนเงินส่วนตัว"] },
    { file: "credit-score", title: "สร้างเครดิตสกอร์", subtitle: "สำหรับฟรีแลนซ์", icon: "📊", color: "#34d399", stats: [{ value: "750+", label: "เป้าหมาย", color: "#34d399" }, { value: "NCB", label: "เช็คได้ที่", color: "#60a5fa" }], points: ["จ่ายบิลตรงเวลาทุกเดือน", "ใช้บัตรเครดิตไม่เกิน 30% วงเงิน", "ไม่สมัครสินเชื่อบ่อยเกินไป", "มีประวัติเครดิตยาวนาน", "เช็ค NCB ปีละครั้ง"] },
    { file: "refinance-loan", title: "รีไฟแนนซ์หนี้", subtitle: "ฟรีแลนซ์ทำได้ไหม", icon: "🔄", color: "#ef4444", stats: [{ value: "7.5→4.5%", label: "ลดดอกเบี้ย", color: "#ef4444" }, { value: "฿36K", label: "ประหยัด/ปี", color: "#34d399" }], points: ["เปรียบเทียบดอกเบี้ยใหม่กับเก่า", "คำนวณค่าธรรมเนียม refinance", "ต้องผ่อนมาแล้วอย่างน้อย 1 ปี", "เครดิตสกอร์ต้องดี", "ประหยัดได้หลักหมื่นต่อปี"] },
    { file: "savings-insurance", title: "ประกันชีวิตแบบออม", subtitle: "ฟรีแลนซ์ควรซื้อไหม", icon: "🛡️", color: "#a78bfa", stats: [{ value: "100K", label: "ลดหย่อนสูงสุด", color: "#a78bfa" }, { value: "2-3%", label: "ผลตอบแทน/ปี", color: "#34d399" }], points: ["คุ้มครองชีวิต + ออมเงินพร้อมกัน", "ลดหย่อนภาษีได้สูงสุด 100,000", "ผลตอบแทนการันตีแต่ต่ำ", "ขาดสภาพคล่อง ถอนก่อนเสียเงิน", "เหมาะกับคนไม่ชอบความเสี่ยง"] },
    { file: "mutual-fund", title: "กองทุนรวม", subtitle: "สำหรับฟรีแลนซ์มือใหม่", icon: "📈", color: "#60a5fa", cardTitle: "ประเภทกองทุน", points: ["กองทุนตลาดเงิน — ความเสี่ยงต่ำ", "กองทุนตราสารหนี้ — เสี่ยงต่ำ-กลาง", "กองทุนผสม — เสี่ยงกลาง", "กองทุนหุ้น — เสี่ยงสูง ผลตอบแทนสูง", "SSF/RMF — ลดหย่อนภาษีได้"] },
    { file: "dca-investment", title: "DCA ลงทุนสม่ำเสมอ", subtitle: "สำหรับรายได้ไม่แน่นอน", icon: "💰", color: "#f59e0b", stats: [{ value: "฿5K", label: "เริ่มต้น/เดือน", color: "#f59e0b" }, { value: "7-10%", label: "ผลตอบแทนเฉลี่ย", color: "#34d399" }], points: ["ลงทุนจำนวนเท่ากันทุกเดือน", "ไม่ต้องจับจังหวะตลาด", "เฉลี่ยต้นทุนอัตโนมัติ", "เดือนรายได้น้อย ลดจำนวนได้", "ระยะยาว 5+ ปี ผลดีมาก"] },
    { file: "stock-investment", title: "ฟรีแลนซ์ลงทุนหุ้น", subtitle: "เริ่มต้นยังไง", icon: "📊", color: "#34d399", cardTitle: "ขั้นตอนเริ่มต้น", points: ["เปิดบัญชีกับโบรกเกอร์ออนไลน์", "เรียนรู้งบการเงิน PE PBV", "เริ่ม DCA หุ้นพื้นฐานดี", "ใช้เฉพาะเงินที่ไม่ต้องใช้ 3-5 ปี", "กระจายพอร์ต อย่าทุ่มตัวเดียว"] },
  ];

  (async () => {
    for (const c of covers) {
      const html = generateCoverHTML(c);
      const outPath = path.join(__dirname, '..', 'public', 'blog', 'covers', c.file + '.png');
      await renderCover(html, outPath);
      console.log('Done:', c.file + '.png');
    }
    console.log('All 10 covers rendered!');
  })();
}
