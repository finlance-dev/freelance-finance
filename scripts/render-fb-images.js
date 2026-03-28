const puppeteer = require('puppeteer');
const path = require('path');

async function renderPage(html, outputPath, width, height) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();
  console.log('Done:', outputPath);
}

const profileHTML = `<!DOCTYPE html>
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 512px; height: 512px; background: #0f172a; font-family: 'Prompt', sans-serif; overflow: hidden; position: relative; }

  .bg-grid { position: absolute; inset: 0; background-image:
    linear-gradient(rgba(167,139,250,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(167,139,250,0.03) 1px, transparent 1px);
    background-size: 32px 32px; }
  .bg-glow { position: absolute; width: 400px; height: 400px; border-radius: 200px; background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 65%); top: -50px; left: 56px; }
  .bg-glow2 { position: absolute; width: 300px; height: 300px; border-radius: 150px; background: radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 60%); bottom: -30px; right: 30px; }
  .bg-ring { position: absolute; width: 420px; height: 420px; border-radius: 210px; border: 1px solid rgba(167,139,250,0.08); top: 46px; left: 46px; }
  .bg-ring2 { position: absolute; width: 300px; height: 300px; border-radius: 150px; border: 1px solid rgba(96,165,250,0.06); top: 106px; left: 106px; }

  .fd { position: absolute; border-radius: 50%; }
  .fd1 { width: 6px; height: 6px; background: #a78bfa; top: 60px; right: 80px; box-shadow: 0 0 12px #a78bfa80; }
  .fd2 { width: 4px; height: 4px; background: #34d399; bottom: 100px; left: 70px; box-shadow: 0 0 10px #34d39980; }
  .fd3 { width: 5px; height: 5px; background: #60a5fa; top: 140px; left: 50px; box-shadow: 0 0 10px #60a5fa80; }
  .fd4 { width: 3px; height: 3px; background: #f59e0b; bottom: 130px; right: 60px; box-shadow: 0 0 8px #f59e0b80; }

  .corner1 { position: absolute; top: 16px; left: 16px; width: 40px; height: 40px; border-left: 2px solid rgba(167,139,250,0.15); border-top: 2px solid rgba(167,139,250,0.15); border-radius: 8px 0 0 0; }
  .corner2 { position: absolute; bottom: 16px; right: 16px; width: 40px; height: 40px; border-right: 2px solid rgba(167,139,250,0.15); border-bottom: 2px solid rgba(167,139,250,0.15); border-radius: 0 0 8px 0; }

  .center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1; }

  .stats { display: flex; gap: 10px; margin-top: 18px; }
  .stat-card { padding: 8px 14px; border-radius: 10px; background: rgba(30,41,59,0.9); border: 1px solid rgba(167,139,250,0.15); text-align: center; }
  .stat-value { font-size: 18px; font-weight: 800; color: #f8fafc; line-height: 1; }
  .stat-label { font-size: 8px; color: #64748b; margin-top: 3px; }
  .stat-value.purple { color: #a78bfa; }
  .stat-value.green { color: #34d399; }
  .stat-value.blue { color: #60a5fa; }

  .brand { font-size: 72px; font-weight: 900; color: #f8fafc; letter-spacing: -3px; line-height: 1; }
  .brand-accent { background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .tagline { font-size: 15px; color: #94a3b8; margin-top: 8px; font-weight: 300; }

  .features { display: flex; gap: 8px; margin-top: 16px; }
  .feat { padding: 4px 12px; border-radius: 6px; background: rgba(30,41,59,0.8); border: 1px solid rgba(167,139,250,0.15); font-size: 11px; color: #94a3b8; font-weight: 500; }

  .gradient-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #7c3aed, #a78bfa, #60a5fa, #34d399); }
</style>
</head><body>
<div class="gradient-bar"></div>
<div class="bg-grid"></div>
<div class="bg-glow"></div>
<div class="bg-glow2"></div>
<div class="bg-ring"></div>
<div class="bg-ring2"></div>
<div class="fd fd1"></div>
<div class="fd fd2"></div>
<div class="fd fd3"></div>
<div class="fd fd4"></div>
<div class="corner1"></div>
<div class="corner2"></div>
<div class="center">
  <div class="brand">Fin<span class="brand-accent">lance</span></div>
  <div class="tagline">ผู้ช่วยการเงินสำหรับฟรีแลนซ์</div>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-value purple">110+</div>
      <div class="stat-label">บทความ</div>
    </div>
    <div class="stat-card">
      <div class="stat-value green">ฟรี</div>
      <div class="stat-label">เริ่มใช้</div>
    </div>
    <div class="stat-card">
      <div class="stat-value blue">24/7</div>
      <div class="stat-label">เข้าถึง</div>
    </div>
  </div>
  <div class="features">
    <div class="feat">📊 รายได้</div>
    <div class="feat">🧾 ภาษี</div>
    <div class="feat">💰 เงินสด</div>
  </div>
</div>
</body></html>`;

const coverHTML = `<!DOCTYPE html>
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 820px; height: 312px; background: #0f172a; font-family: 'Prompt', sans-serif; overflow: hidden; position: relative; }
  .gradient-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #7c3aed, #a78bfa, #60a5fa, #34d399, #f59e0b); }
  .bg-grid { position: absolute; inset: 0; background-image:
    linear-gradient(rgba(167,139,250,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(167,139,250,0.03) 1px, transparent 1px);
    background-size: 40px 40px; }
  .bg-circle { position: absolute; width: 400px; height: 400px; border-radius: 200px; background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 60%); top: -150px; right: -50px; }
  .content { position: relative; z-index: 1; display: flex; height: 100%; }
  .left { width: 310px; display: flex; flex-direction: column; justify-content: center; padding-left: 40px; }
  .right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 12px 16px 12px 0; }
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 12px; background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.2); margin-bottom: 10px; width: fit-content; }
  .badge-dot { width: 5px; height: 5px; border-radius: 3px; background: #34d399; }
  .badge-text { font-size: 9px; color: #a78bfa; font-weight: 500; }
  .headline { font-size: 28px; font-weight: 800; color: #f8fafc; line-height: 1.2; margin-bottom: 6px; }
  .highlight { background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .subtitle { font-size: 11px; color: #94a3b8; font-weight: 300; margin-bottom: 14px; }
  .features { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px; }
  .feature { padding: 4px 8px; border-radius: 5px; background: rgba(30,41,59,0.8); border: 1px solid rgba(100,116,139,0.15); color: #cbd5e1; font-size: 8px; font-weight: 500; }
  .url span { color: #a78bfa; font-weight: 700; font-size: 11px; }
  .free-badge { display: inline-block; padding: 3px 8px; border-radius: 4px; background: linear-gradient(135deg, #a78bfa, #7c3aed); color: white; font-size: 8px; font-weight: 700; margin-left: 6px; }
  .dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
  .dash-card { padding: 10px 12px; border-radius: 8px; background: rgba(15,23,42,0.95); border: 1px solid rgba(100,116,139,0.15); }
  .card-label { font-size: 7px; color: #64748b; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
  .card-value { font-size: 16px; font-weight: 800; color: #f8fafc; line-height: 1.2; }
  .card-value .unit { font-size: 8px; color: #64748b; font-weight: 400; }
  .green { color: #34d399; } .blue { color: #60a5fa; } .purple { color: #a78bfa; } .yellow { color: #f59e0b; }
  .chart-bars { display: flex; align-items: end; gap: 2px; height: 22px; margin-top: 5px; }
  .cbar { width: 10px; border-radius: 2px 2px 0 0; background: linear-gradient(180deg, #a78bfa, #7c3aed); }
  .cbar.h1{height:8px;opacity:.5} .cbar.h2{height:12px;opacity:.6} .cbar.h3{height:10px;opacity:.55}
  .cbar.h4{height:16px;opacity:.7} .cbar.h5{height:14px;opacity:.65} .cbar.h6{height:19px;opacity:.8}
  .cbar.h7{height:22px;background:linear-gradient(180deg,#34d399,#059669)}
  .tax-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 8px; }
  .tax-label { color: #94a3b8; } .tax-val { font-weight: 700; }
  .progress-bg { height: 4px; border-radius: 2px; background: rgba(100,116,139,0.2); margin-top: 4px; }
  .progress-fill { height: 4px; border-radius: 2px; }
  .client-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
  .client-name { font-size: 7px; color: #94a3b8; }
  .client-status { font-size: 6px; padding: 1px 5px; border-radius: 3px; font-weight: 600; }
  .status-paid { background: rgba(52,211,153,0.15); color: #34d399; }
  .status-pending { background: rgba(245,158,11,0.15); color: #f59e0b; }
  .status-overdue { background: rgba(239,68,68,0.15); color: #ef4444; }
  .mini-text { font-size: 7px; color: #64748b; margin-top: 3px; }
</style>
</head><body>
<div class="gradient-bar"></div>
<div class="bg-grid"></div>
<div class="bg-circle"></div>
<div class="content">
  <div class="left">
    <div class="badge"><div class="badge-dot"></div><div class="badge-text">ใช้ฟรี ไม่ต้องใช้บัตรเครดิต</div></div>
    <div class="headline">ผู้ช่วยการเงิน<br><span class="highlight">สำหรับฟรีแลนซ์ไทย</span></div>
    <div class="subtitle">ติดตามรายได้ คำนวณภาษี วางแผนอนาคต</div>
    <div class="features">
      <div class="feature">📊 ติดตามรายได้</div>
      <div class="feature">🧾 คำนวณภาษี</div>
      <div class="feature">💰 กระแสเงินสด</div>
      <div class="feature">📄 Invoice</div>
      <div class="feature">📈 เกษียณ</div>
      <div class="feature">🎯 เป้าหมาย</div>
    </div>
    <div class="url"><span>finlance.co</span><span class="free-badge">เริ่มใช้ฟรี</span></div>
  </div>
  <div class="right">
    <div class="dashboard">
      <div class="dash-card">
        <div class="card-label">รายได้เดือนนี้</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="card-value">87,500 <span class="unit">THB</span></div>
          <span class="green" style="font-size:8px;font-weight:700">↑23%</span>
        </div>
        <div class="chart-bars">
          <div class="cbar h1"></div><div class="cbar h2"></div><div class="cbar h3"></div>
          <div class="cbar h4"></div><div class="cbar h5"></div><div class="cbar h6"></div><div class="cbar h7"></div>
        </div>
      </div>
      <div class="dash-card">
        <div class="card-label">สรุปภาษีปีนี้</div>
        <div class="tax-row"><span class="tax-label">รายได้รวม</span><span class="tax-val green">฿1,050,000</span></div>
        <div class="tax-row"><span class="tax-label">หักเหมา 60%</span><span class="tax-val blue">-฿630,000</span></div>
        <div class="tax-row"><span class="tax-label">ค่าลดหย่อน</span><span class="tax-val purple">-฿160,000</span></div>
        <div class="tax-row" style="border-top:1px solid rgba(100,116,139,0.1);padding-top:3px;margin-top:2px"><span class="tax-label" style="font-weight:600;color:#cbd5e1">ภาษีจ่าย</span><span class="tax-val yellow" style="font-size:10px">฿11,000</span></div>
      </div>
      <div class="dash-card">
        <div class="card-label">Emergency Fund</div>
        <div class="card-value" style="color:#f59e0b;font-size:14px">3.5 <span class="unit">เดือน</span></div>
        <div class="progress-bg"><div class="progress-fill" style="width:58%;background:linear-gradient(90deg,#f59e0b,#ef4444)"></div></div>
        <div class="mini-text">฿77,000 / ฿132,000 (เป้า 6 เดือน)</div>
      </div>
      <div class="dash-card">
        <div class="card-label">Invoice ล่าสุด</div>
        <div class="client-row"><span class="client-name">บ.ABC — ฿35,000</span><span class="client-status status-paid">จ่ายแล้ว</span></div>
        <div class="client-row"><span class="client-name">คุณสมชาย — ฿12,500</span><span class="client-status status-pending">รอจ่าย</span></div>
        <div class="client-row"><span class="client-name">Startup XYZ — ฿40,000</span><span class="client-status status-paid">จ่ายแล้ว</span></div>
      </div>
      <div class="dash-card">
        <div class="card-label">ประกันสังคม ม.39</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="card-value" style="font-size:13px;color:#34d399">432 <span class="unit">บ./เดือน</span></div>
          <span style="font-size:6px;font-weight:600;padding:2px 5px;border-radius:3px;background:rgba(52,211,153,0.15);color:#34d399">✓ จ่ายแล้ว</span>
        </div>
        <div class="mini-text">OPD • IPD • คลอด • บำนาญ</div>
      </div>
      <div class="dash-card">
        <div class="card-label">หัก ณ ที่จ่ายสะสม</div>
        <div class="card-value" style="font-size:13px;color:#60a5fa">฿31,500</div>
        <div class="progress-bg"><div class="progress-fill" style="width:75%;background:linear-gradient(90deg,#60a5fa,#a78bfa)"></div></div>
        <div class="mini-text">50 ทวิ 12 ฉบับ • เครดิตภาษี ภ.ง.ด.90</div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

(async () => {
  const outDir = path.join(__dirname, '..', 'public');
  await renderPage(profileHTML, path.join(outDir, 'fb-profile.png'), 512, 512);
  await renderPage(coverHTML, path.join(outDir, 'fb-cover.png'), 820, 312);
})();
