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
const POSTED_FILE = path.join(__dirname, 'fb-posted.json');

// Load posted history
function getPostedSlugs() {
  try { return JSON.parse(fs.readFileSync(POSTED_FILE, 'utf8')); }
  catch { return []; }
}
function savePostedSlug(slug) {
  const posted = getPostedSlugs();
  posted.push(slug);
  fs.writeFileSync(POSTED_FILE, JSON.stringify(posted, null, 2));
}

// Load ALL blog posts from page.tsx
function getAllSlugs() {
  const pageFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'blog', 'page.tsx'), 'utf8');
  const matches = [...pageFile.matchAll(/slug:\s*"([^"]+)"/g)];
  return matches.map(m => m[1]);
}

// Load post data from posts.ts
function getPostData(slug) {
  const postsFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'blog', '[slug]', 'posts.ts'), 'utf8');
  const titleMatch = postsFile.match(new RegExp(`"${slug}"[\\s\\S]*?title:\\s*"([^"]+)"`));
  const excerptMatch = postsFile.match(new RegExp(`"${slug}"[\\s\\S]*?excerpt:\\s*"([^"]+)"`));
  return {
    title: titleMatch ? titleMatch[1] : slug,
    excerpt: excerptMatch ? excerptMatch[1] : '',
  };
}

// Generate caption from post data
function makeCaption(data) {
  const lines = data.excerpt.split(/[,，、]/).map(s => s.trim()).filter(Boolean).slice(0, 4);
  return `${data.title}\n\n${lines.map(l => '• ' + l).join('\n')}`;
}

// Generate cover image with Puppeteer
function generatePostImage(title, subtitle, points, color, icon) {
  const pointsHTML = points.map(p =>
    `<div class="point"><div class="dot" style="background:${color}"></div><span>${p}</span></div>`
  ).join('');

  return `<!DOCTYPE html>
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#0f172a;font-family:'Prompt',sans-serif;overflow:hidden;position:relative}
  .gradient-bar{position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,${color},${color}88,transparent)}
  .gradient-bar-b{position:absolute;bottom:0;right:0;width:40%;height:3px;background:linear-gradient(90deg,transparent,${color}66)}
  .bg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(167,139,250,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,0.025) 1px,transparent 1px);background-size:50px 50px}
  .bg-glow{position:absolute;width:600px;height:600px;border-radius:300px;background:radial-gradient(circle,${color}18,transparent 65%);top:-150px;left:-150px}
  .bg-glow2{position:absolute;width:450px;height:450px;border-radius:225px;background:radial-gradient(circle,${color}0a,transparent 60%);bottom:-120px;right:80px}
  .bg-ring{position:absolute;width:350px;height:350px;border-radius:175px;border:1px solid ${color}10;top:140px;left:350px}
  .fd{position:absolute;border-radius:50%}
  .fd1{width:6px;height:6px;background:${color};top:80px;right:200px;box-shadow:0 0 12px ${color}80}
  .fd2{width:4px;height:4px;background:#34d399;top:180px;left:320px;box-shadow:0 0 10px #34d39980}
  .fd3{width:5px;height:5px;background:#60a5fa;bottom:120px;left:280px;box-shadow:0 0 10px #60a5fa80}
  .fd4{width:3px;height:3px;background:#f59e0b;bottom:80px;right:480px;box-shadow:0 0 8px #f59e0b80}
  .corner1{position:absolute;bottom:20px;left:20px;width:60px;height:60px;border-left:2px solid ${color}20;border-bottom:2px solid ${color}20;border-radius:0 0 0 12px}
  .corner2{position:absolute;top:20px;right:20px;width:40px;height:40px;border-right:2px solid ${color}15;border-top:2px solid ${color}15;border-radius:0 8px 0 0}
  .content{position:relative;z-index:1;display:flex;height:100%;padding:50px 60px}
  .left{flex:1;display:flex;flex-direction:column;justify-content:center;padding-right:50px}
  .right{width:420px;display:flex;flex-direction:column;justify-content:center}
  .icon-badge{display:inline-flex;align-items:center;gap:10px;padding:8px 20px;border-radius:24px;background:${color}15;border:1px solid ${color}30;margin-bottom:24px;width:fit-content}
  .icon-badge .emoji{font-size:24px} .icon-badge .label{font-size:14px;color:${color};font-weight:600}
  .title{font-size:48px;font-weight:900;color:#f8fafc;line-height:1.15;margin-bottom:8px}
  .subtitle{font-size:36px;font-weight:700;background:linear-gradient(135deg,${color},${color}cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:24px;line-height:1.2}
  .url{font-size:16px;color:#64748b;margin-top:auto} .url span{color:${color};font-weight:700} .url .free{display:inline-block;padding:4px 12px;border-radius:6px;background:${color};color:white;font-size:13px;font-weight:700;margin-left:10px}
  .card{background:rgba(15,23,42,0.9);border:1px solid rgba(100,116,139,0.2);border-radius:16px;padding:28px;box-shadow:0 8px 32px rgba(0,0,0,0.3)}
  .card-title{font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;font-weight:500}
  .point{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid rgba(100,116,139,0.1)} .point:last-child{border:none}
  .dot{width:8px;height:8px;border-radius:4px;flex-shrink:0} .point span{font-size:16px;color:#e2e8f0;font-weight:500}
  .branding{display:flex;align-items:center;gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(100,116,139,0.15)}
  .brand-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#6d28d9);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:16px}
  .brand-name{font-size:16px;font-weight:800;color:#f8fafc} .brand-desc{font-size:10px;color:#64748b}
</style></head><body>
<div class="gradient-bar"></div><div class="gradient-bar-b"></div><div class="bg-grid"></div>
<div class="bg-glow"></div><div class="bg-glow2"></div><div class="bg-ring"></div>
<div class="fd fd1"></div><div class="fd fd2"></div><div class="fd fd3"></div><div class="fd fd4"></div>
<div class="corner1"></div><div class="corner2"></div>
<div class="content"><div class="left">
  <div class="icon-badge"><span class="emoji">${icon}</span><span class="label">finlance.co</span></div>
  <div class="title">${title}</div><div class="subtitle">${subtitle}</div>
  <div class="url"><span>finlance.co</span><span class="free">อ่านฟรี</span></div>
</div><div class="right"><div class="card">
  <div class="card-title">สิ่งที่คุณจะได้เรียนรู้</div>${pointsHTML}
  <div class="branding"><div class="brand-icon">F</div><div><div class="brand-name">Finlance</div><div class="brand-desc">ผู้ช่วยการเงินสำหรับฟรีแลนซ์</div></div></div>
</div></div></div></body></html>`;
}

const COLORS = ['#a78bfa','#34d399','#60a5fa','#f59e0b','#ef4444','#ec4899'];
const ICONS = ['📊','💰','🧾','📈','🏦','💼','🎯','📋','🔄','🛟','💎','🧮','📝','💸','🏥','🚀','🏠','💳','🚗','⚖️'];

function postPhoto(pngBuffer, message) {
  return new Promise((resolve, reject) => {
    const boundary = 'b' + Date.now() + Math.random().toString(36);
    let body = '--' + boundary + '\r\nContent-Disposition: form-data; name="message"\r\n\r\n' + message + '\r\n';
    body += '--' + boundary + '\r\nContent-Disposition: form-data; name="access_token"\r\n\r\n' + TOKEN + '\r\n';
    body += '--' + boundary + '\r\nContent-Disposition: form-data; name="source"; filename="cover.png"\r\nContent-Type: image/png\r\n\r\n';
    const bodyEnd = '\r\n--' + boundary + '--\r\n';
    const bodyBuf = Buffer.concat([Buffer.from(body,'utf8'), pngBuffer, Buffer.from(bodyEnd,'utf8')]);
    const req = https.request({ hostname:'graph.facebook.com', path:`/v25.0/${PAGE_ID}/photos`, method:'POST',
      headers:{'Content-Type':'multipart/form-data; boundary='+boundary,'Content-Length':bodyBuf.length}
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ const r=JSON.parse(d); if(r.error) reject(r.error); else resolve(r); }); });
    req.on('error',reject); req.write(bodyBuf); req.end();
  });
}

async function main() {
  const allSlugs = getAllSlugs();
  const posted = getPostedSlugs();

  // Find next unposted slug
  const unposted = allSlugs.filter(s => !posted.includes(s));

  if (unposted.length === 0) {
    // All posted — reset and start over
    fs.writeFileSync(POSTED_FILE, '[]');
    console.log('All articles posted! Resetting cycle.');
    return;
  }

  const slug = unposted[0];
  const data = getPostData(slug);
  const colorIndex = allSlugs.indexOf(slug) % COLORS.length;
  const iconIndex = allSlugs.indexOf(slug) % ICONS.length;
  const color = COLORS[colorIndex];
  const icon = ICONS[iconIndex];

  // Split title into main + subtitle
  const titleParts = data.title.split(/[—\-:|]/);
  const mainTitle = titleParts[0].trim();
  const subtitle = titleParts.length > 1 ? titleParts.slice(1).join(' ').trim() : '';

  // Make points from excerpt
  const points = data.excerpt.split(/[,，、]/).map(s => s.trim()).filter(s => s.length > 5).slice(0, 5);
  if (points.length < 3) {
    points.push('อ่านบทความเต็มที่ finlance.co');
  }

  const caption = makeCaption(data);
  const link = `https://finlance.co/blog/${slug}`;
  const message = caption + `\n\nอ่านบทความเต็ม: ${link}`;

  console.log(`Post: ${slug} (${unposted.length} remaining)`);
  console.log('Rendering image...');

  const html = generatePostImage(mainTitle, subtitle, points, color, icon);
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
  const pngBuffer = await page.screenshot({ type: 'png' });
  await browser.close();
  console.log(`Image: ${pngBuffer.length} bytes`);

  const result = await postPhoto(pngBuffer, message);
  console.log('Posted! ID:', result.post_id || result.id);

  // Save to posted history
  savePostedSlug(slug);
  console.log(`Saved. ${unposted.length - 1} articles remaining.`);
}

main().catch(e => { console.error(e); process.exit(1); });
