const puppeteer = require('puppeteer');
const path = require('path');

async function renderImage(html, outputPath, width = 800, height = 400) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();
}

function generateImageHTML({ title, color, sections }) {
  const sectionsHTML = sections.map(s => {
    if (s.type === 'list') {
      const items = s.items.map(i => `<div class="list-item"><div class="li-dot" style="background:${s.color || color}"></div><span>${i}</span></div>`).join('');
      return `<div class="section" style="border-color:${s.color || color}30"><div class="section-title" style="color:${s.color || color}">${s.title}</div>${items}</div>`;
    }
    if (s.type === 'stats') {
      const stats = s.items.map(i => `<div class="stat"><div class="stat-val" style="color:${i.color || color}">${i.value}</div><div class="stat-label">${i.label}</div></div>`).join('');
      return `<div class="stats-row">${stats}</div>`;
    }
    if (s.type === 'comparison') {
      const left = s.left.items.map(i => `<div class="cmp-item">${i}</div>`).join('');
      const right = s.right.items.map(i => `<div class="cmp-item">${i}</div>`).join('');
      return `<div class="comparison"><div class="cmp-col" style="border-color:${s.left.color}40"><div class="cmp-title" style="color:${s.left.color}">${s.left.title}</div>${left}</div><div class="cmp-col" style="border-color:${s.right.color}40"><div class="cmp-title" style="color:${s.right.color}">${s.right.title}</div>${right}</div></div>`;
    }
    if (s.type === 'table') {
      const rows = s.rows.map(r => `<div class="table-row"><span class="table-label">${r.label}</span><span class="table-val" style="color:${r.color || color}">${r.value}</span></div>`).join('');
      return `<div class="table-card" style="border-color:${s.color || color}30"><div class="section-title" style="color:${s.color || color}">${s.title}</div>${rows}</div>`;
    }
    if (s.type === 'tip') {
      return `<div class="tip" style="border-color:${s.color || '#f59e0b'}40;background:${s.color || '#f59e0b'}08"><span class="tip-icon">💡</span><span style="color:${s.color || '#f59e0b'}">${s.text}</span></div>`;
    }
    return '';
  }).join('');

  return `<!DOCTYPE html>
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 800px; height: 400px; background: #0f172a; font-family: 'Prompt', sans-serif; overflow: hidden; position: relative; }
  .gradient-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, ${color}, ${color}88, transparent); }
  .bg-grid { position: absolute; inset: 0; background-image:
    linear-gradient(rgba(167,139,250,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(167,139,250,0.02) 1px, transparent 1px);
    background-size: 40px 40px; }
  .bg-glow { position: absolute; width: 400px; height: 400px; border-radius: 200px; background: radial-gradient(circle, ${color}12, transparent 65%); top: -100px; left: -100px; }
  .fd { position: absolute; border-radius: 50%; }
  .fd1 { width: 4px; height: 4px; background: ${color}; top: 50px; right: 120px; box-shadow: 0 0 8px ${color}80; }
  .fd2 { width: 3px; height: 3px; background: #34d399; bottom: 80px; left: 200px; box-shadow: 0 0 6px #34d39980; }
  .fd3 { width: 5px; height: 5px; background: #60a5fa60; top: 200px; right: 50px; box-shadow: 0 0 10px #60a5fa40; }
  .corner1 { position: absolute; bottom: 12px; left: 12px; width: 30px; height: 30px; border-left: 1.5px solid ${color}15; border-bottom: 1.5px solid ${color}15; border-radius: 0 0 0 8px; }
  .corner2 { position: absolute; top: 12px; right: 12px; width: 20px; height: 20px; border-right: 1.5px solid ${color}10; border-top: 1.5px solid ${color}10; border-radius: 0 6px 0 0; }
  .content { position: relative; z-index: 1; padding: 28px 30px 20px; height: 100%; display: flex; flex-direction: column; }
  .main-title { font-size: 18px; font-weight: 800; color: #f8fafc; margin-bottom: 16px; text-align: center; }
  .body { flex: 1; display: flex; gap: 14px; }
  .section { flex: 1; padding: 14px; border-radius: 10px; background: rgba(15,23,42,0.9); border: 1px solid rgba(100,116,139,0.15); }
  .section-title { font-size: 13px; font-weight: 700; margin-bottom: 10px; }
  .list-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
  .li-dot { width: 6px; height: 6px; border-radius: 3px; flex-shrink: 0; }
  .list-item span { font-size: 11px; color: #cbd5e1; }
  .stats-row { display: flex; gap: 10px; margin-bottom: 12px; }
  .stat { flex: 1; padding: 10px; border-radius: 8px; background: rgba(30,41,59,0.9); border: 1px solid rgba(100,116,139,0.12); text-align: center; }
  .stat-val { font-size: 18px; font-weight: 800; }
  .stat-label { font-size: 9px; color: #64748b; margin-top: 2px; }
  .comparison { display: flex; gap: 14px; flex: 1; }
  .cmp-col { flex: 1; padding: 14px; border-radius: 10px; background: rgba(15,23,42,0.9); border: 1px solid; }
  .cmp-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; text-align: center; }
  .cmp-item { font-size: 11px; color: #cbd5e1; padding: 3px 0; }
  .table-card { flex: 1; padding: 14px; border-radius: 10px; background: rgba(15,23,42,0.9); border: 1px solid; }
  .table-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(100,116,139,0.08); }
  .table-row:last-child { border: none; }
  .table-label { font-size: 11px; color: #94a3b8; }
  .table-val { font-size: 12px; font-weight: 700; }
  .tip { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 8px; border: 1px solid; margin-top: 10px; font-size: 11px; }
  .tip-icon { font-size: 14px; }
  .branding { display: flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 8px; }
  .brand-dot { width: 18px; height: 18px; border-radius: 5px; background: linear-gradient(135deg, #7c3aed, #6d28d9); display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: 900; }
  .brand-text { font-size: 10px; color: #64748b; }
</style>
</head><body>
<div class="gradient-bar"></div>
<div class="bg-grid"></div>
<div class="bg-glow"></div>
<div class="fd fd1"></div>
<div class="fd fd2"></div>
<div class="fd fd3"></div>
<div class="corner1"></div>
<div class="corner2"></div>
<div class="content">
  <div class="main-title">${title}</div>
  <div class="body">${sectionsHTML}</div>
  <div class="branding"><div class="brand-dot">F</div><div class="brand-text">finlance.co</div></div>
</div>
</body></html>`;
}

module.exports = { generateImageHTML, renderImage };

if (require.main === module) {
  const images = [
    { file: "home-loan-document-checklist", title: "เอกสารกู้บ้านสำหรับฟรีแลนซ์", color: "#34d399", sections: [
      { type: "list", title: "📋 เอกสารส่วนตัว", color: "#34d399", items: ["สำเนาบัตรประชาชน", "สำเนาทะเบียนบ้าน", "สำเนาทะเบียนสมรส (ถ้ามี)", "ใบเปลี่ยนชื่อ-สกุล (ถ้ามี)"] },
      { type: "list", title: "💰 เอกสารการเงิน", color: "#60a5fa", items: ["Statement ย้อนหลัง 12 เดือน", "50 ทวิ / Invoice ย้อนหลัง", "ทะเบียนพาณิชย์ (เพิ่มโอกาส)", "สัญญาจ้างงาน / Retainer"] },
      { type: "list", title: "⭐ เคล็ดลับกู้ผ่าน", color: "#f59e0b", items: ["รายได้เข้าบัญชีสม่ำเสมอ 12 เดือน", "วางดาวน์ 20-30%", "จดทะเบียนพาณิชย์", "กู้ร่วมกับคู่สมรส"] },
    ]},
    { file: "credit-card-comparison", title: "บัตรเครดิตที่ฟรีแลนซ์สมัครง่าย", color: "#a78bfa", sections: [
      { type: "stats", items: [{ value: "15K+", label: "รายได้ Classic", color: "#34d399" }, { value: "30K+", label: "รายได้ Gold", color: "#60a5fa" }, { value: "50K+", label: "รายได้ Platinum", color: "#f59e0b" }] },
      { type: "comparison", left: { title: "✅ ควรทำ", color: "#34d399", items: ["สมัครธนาคารที่มีบัญชี", "เริ่มจาก Classic ก่อน", "จ่ายเต็มทุกเดือน", "ใช้ไม่เกิน 30% วงเงิน", "จดทะเบียนพาณิชย์"] }, right: { title: "❌ ห้ามทำ", color: "#ef4444", items: ["แต่งรายได้เกินจริง", "สมัครหลายที่พร้อมกัน", "จ่ายแค่ขั้นต่ำ", "กด cash advance", "ใช้เกินวงเงิน"] } },
    ]},
    { file: "car-loan-calculator", title: "คำนวณค่างวดรถ — กฎ 20%", color: "#60a5fa", sections: [
      { type: "stats", items: [{ value: "20-25%", label: "ดาวน์ขั้นต่ำ", color: "#60a5fa" }, { value: "84 เดือน", label: "ผ่อนนานสุด", color: "#34d399" }, { value: "3-5%", label: "ดอกเบี้ย/ปี", color: "#f59e0b" }] },
      { type: "table", title: "ตัวอย่าง: รถ ฿800,000 ดาวน์ 25%", color: "#60a5fa", rows: [
        { label: "ยอดกู้", value: "฿600,000", color: "#f8fafc" },
        { label: "48 เดือน (ดอก 4%)", value: "฿13,800/เดือน", color: "#f59e0b" },
        { label: "60 เดือน (ดอก 4%)", value: "฿11,050/เดือน", color: "#60a5fa" },
        { label: "84 เดือน (ดอก 4%)", value: "฿8,550/เดือน", color: "#34d399" },
      ]},
      { type: "tip", text: "ค่างวดไม่ควรเกิน 20% ของรายได้ รายได้ 40K → งวดไม่เกิน 8K", color: "#f59e0b" },
    ]},
    { file: "business-account-comparison", title: "เปรียบเทียบบัญชีธุรกิจ 4 ธนาคาร", color: "#f59e0b", sections: [
      { type: "table", title: "🏦 ค่าใช้จ่าย", color: "#f59e0b", rows: [
        { label: "กสิกร — ค่ารักษา", value: "ฟรี", color: "#34d399" },
        { label: "กรุงเทพ — ค่ารักษา", value: "200 บ./ปี", color: "#f8fafc" },
        { label: "ไทยพาณิชย์ — ค่ารักษา", value: "200 บ./ปี", color: "#f8fafc" },
        { label: "กรุงไทย — ค่ารักษา", value: "ฟรี", color: "#34d399" },
        { label: "โอนออนไลน์ทุกธนาคาร", value: "ฟรี", color: "#34d399" },
      ]},
      { type: "list", title: "ทำไมต้องแยกบัญชี", color: "#60a5fa", items: ["เห็นกำไร-ขาดทุนชัด", "ยื่นภาษีง่ายขึ้น", "กู้เงินง่ายขึ้น", "ดูเป็นมืออาชีพ"] },
      { type: "tip", text: "เลือกธนาคารที่ลูกค้าส่วนใหญ่ใช้ → โอนฟรี สะดวก", color: "#34d399" },
    ]},
    { file: "credit-score-factors", title: "ปัจจัยที่ส่งผลต่อเครดิตสกอร์", color: "#34d399", sections: [
      { type: "table", title: "📊 สัดส่วนปัจจัย", color: "#34d399", rows: [
        { label: "ประวัติชำระเงิน", value: "35%", color: "#34d399" },
        { label: "ยอดหนี้คงค้าง", value: "30%", color: "#60a5fa" },
        { label: "ความยาวประวัติ", value: "15%", color: "#a78bfa" },
        { label: "ประเภทสินเชื่อ", value: "10%", color: "#f59e0b" },
        { label: "สมัครสินเชื่อใหม่", value: "10%", color: "#ef4444" },
      ]},
      { type: "list", title: "✅ วิธีเพิ่มคะแนน", color: "#34d399", items: ["จ่ายบิลตรงเวลาทุกเดือน", "ใช้บัตรไม่เกิน 30% วงเงิน", "อย่าปิดบัตรเก่า", "ไม่สมัครสินเชื่อบ่อย", "เช็ค NCB ปีละครั้ง"] },
    ]},
    { file: "refinance-comparison", title: "ก่อน vs หลังรีไฟแนนซ์", color: "#ef4444", sections: [
      { type: "comparison", left: { title: "❌ ก่อน (7.5%)", color: "#ef4444", items: ["ค่างวด ฿15,000/เดือน", "ดอกเบี้ย 5 ปี ฿180,000", "จ่ายรวม ฿900,000"] }, right: { title: "✅ หลัง (4.5%)", color: "#34d399", items: ["ค่างวด ฿12,000/เดือน", "ดอกเบี้ย 5 ปี ฿108,000", "จ่ายรวม ฿828,000"] } },
      { type: "tip", text: "ประหยัด ฿72,000 ใน 5 ปี (฿3,000/เดือน) — ต้องหักค่าธรรมเนียม refinance ด้วย", color: "#34d399" },
    ]},
    { file: "savings-insurance-comparison", title: "ประกันออม vs กองทุน vs ฝากประจำ", color: "#a78bfa", sections: [
      { type: "table", title: "ผลตอบแทน & ความเสี่ยง", color: "#a78bfa", rows: [
        { label: "ประกันออม", value: "2-3%/ปี เสี่ยงต่ำ", color: "#a78bfa" },
        { label: "กองทุนรวม", value: "5-15%/ปี เสี่ยงกลาง-สูง", color: "#60a5fa" },
        { label: "ฝากประจำ", value: "1.5-2%/ปี เสี่ยงต่ำมาก", color: "#34d399" },
      ]},
      { type: "table", title: "เปรียบเทียบอื่นๆ", color: "#60a5fa", rows: [
        { label: "ลดหย่อนภาษี", value: "ประกัน ✅ กองทุน ✅ ฝาก ❌", color: "#f8fafc" },
        { label: "สภาพคล่อง", value: "ประกัน ❌ กองทุน ✅ ฝาก ⚠", color: "#f8fafc" },
        { label: "คุ้มครองชีวิต", value: "ประกัน ✅ กองทุน ❌ ฝาก ❌", color: "#f8fafc" },
      ]},
      { type: "tip", text: "คำตอบที่ดี: ผสมทั้ง 3 ตามเป้าหมาย", color: "#a78bfa" },
    ]},
    { file: "mutual-fund-types", title: "ประเภทกองทุนรวม เรียงตามความเสี่ยง", color: "#60a5fa", sections: [
      { type: "stats", items: [{ value: "1-2%", label: "ตลาดเงิน", color: "#34d399" }, { value: "4-8%", label: "ผสม", color: "#a78bfa" }, { value: "7-15%", label: "หุ้นไทย", color: "#f59e0b" }, { value: "10-20%", label: "หุ้นโลก", color: "#ef4444" }] },
      { type: "list", title: "🎯 พอร์ตแนะนำ มือใหม่", color: "#34d399", items: ["ตลาดเงิน 40%", "ตราสารหนี้ 40%", "กองทุนผสม 20%"] },
      { type: "list", title: "🎯 พอร์ตแนะนำ ระดับกลาง", color: "#60a5fa", items: ["ตราสารหนี้ 30%", "กองทุนผสม 30%", "กองทุนหุ้น 40%"] },
    ]},
    { file: "dca-vs-lump-sum", title: "DCA vs Lump Sum — เปรียบเทียบ", color: "#f59e0b", sections: [
      { type: "comparison", left: { title: "DCA (ทยอยลงทุน)", color: "#f59e0b", items: ["✅ ไม่ต้องจับจังหวะ", "✅ เฉลี่ยต้นทุนอัตโนมัติ", "✅ เหมาะรายได้ไม่แน่นอน", "❌ อาจผลตอบแทนน้อยกว่า"] }, right: { title: "Lump Sum (ลงก้อน)", color: "#a78bfa", items: ["✅ ผลตอบแทนสูงกว่า (ถ้าจังหวะดี)", "✅ เงินทำงานเร็วกว่า", "❌ ต้องมีเงินก้อน", "❌ เสี่ยงถ้าเข้าผิดจังหวะ"] } },
      { type: "tip", text: "DCA ฿5,000/เดือน × 10 ปี (8%/ปี) = ฿913,000+ (กำไร +52%)", color: "#34d399" },
    ]},
    { file: "stock-beginner-steps", title: "5 ขั้นตอนเริ่มลงทุนหุ้น", color: "#34d399", sections: [
      { type: "stats", items: [{ value: "1", label: "เปิดบัญชี", color: "#60a5fa" }, { value: "2", label: "เรียนรู้", color: "#a78bfa" }, { value: "3", label: "เริ่ม DCA", color: "#34d399" }, { value: "4", label: "กระจายพอร์ต", color: "#f59e0b" }, { value: "5", label: "ถือยาว", color: "#ef4444" }] },
      { type: "list", title: "⚠ กฎเหล็กฟรีแลนซ์", color: "#ef4444", items: ["มี Emergency Fund 6 เดือนก่อน", "ใช้เงินที่ไม่ต้องใช้ 3-5 ปี", "แยกบัญชีลงทุนต่างหาก", "ใช้ SSF/RMF ลดหย่อนภาษี", "ห้ามกู้เงินมาลงทุน"] },
      { type: "list", title: "📊 เริ่มต้น", color: "#34d399", items: ["เปิดบัญชีโบรกเกอร์ออนไลน์ ฟรี", "เรียน PE PBV ROE Dividend", "DCA ฿3K-5K/เดือน หุ้นพื้นฐานดี", "กระจาย 3-5 ตัว ต่างอุตสาหกรรม", "ถือยาว 5-10+ ปี"] },
    ]},
  ];

  (async () => {
    for (const img of images) {
      const html = generateImageHTML(img);
      const outPath = path.join(__dirname, '..', 'public', 'blog', 'images', img.file + '.png');
      await renderImage(html, outPath);
      console.log('Done:', img.file + '.png');
    }
    console.log('All 10 in-content images rendered!');
  })();
}
