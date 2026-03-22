const https = require('https');
const fs = require('fs');
const path = require('path');

// Load from .env.local if exists (local dev), otherwise use env vars (GitHub Actions)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
}

const PAGE_ID = process.env.FB_PAGE_ID;
const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

function postPhoto(imagePath, message) {
  return new Promise((resolve, reject) => {
    const boundary = 'boundary' + Date.now() + Math.random().toString(36);
    const imgData = fs.readFileSync(imagePath);

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
    const bodyBuf = Buffer.concat([
      Buffer.from(body, 'utf8'),
      imgData,
      Buffer.from(bodyEnd, 'utf8')
    ]);

    const req = https.request({
      hostname: 'graph.facebook.com',
      path: `/v25.0/${PAGE_ID}/photos`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': bodyBuf.length
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const result = JSON.parse(d);
        if (result.error) reject(result.error);
        else resolve(result);
      });
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

async function main() {
  const posts = [
    {
      image: 'quit-job-freelance.png',
      message: `ลาออกมาเป็นฟรีแลนซ์ เตรียมตัวยังไงไม่ให้เจ๊ง?

สิ่งที่ต้องเตรียมก่อนยื่นใบลาออก:
- เงินสำรอง 6-12 เดือน
- ลูกค้าอย่างน้อย 2-3 ราย
- สมัคร ม.39 ภายใน 6 เดือน (ห้ามพลาด!)
- สัญญาจ้างงาน + Invoice template
- แยกบัญชีธุรกิจ-ส่วนตัว

อ่านบทความเต็ม: https://finlance.co/blog/quit-job-to-freelance-preparation`
    },
    {
      image: 'average-income.png',
      message: `รายได้ฟรีแลนซ์ไทยเฉลี่ยเท่าไหร่ 2569?

Developer: 40K-200K+/เดือน
Designer: 30K-150K/เดือน
Marketing: 25K-120K/เดือน
นักเขียน: 15K-80K/เดือน
ช่างภาพ: 20K-100K/เดือน

ปัจจัยที่ทำให้รายได้ต่างกัน:
1. Niche ที่เลือก
2. ลูกค้าไทย vs ต่างชาติ
3. วิธีตั้งราคา
4. Personal brand

อ่านวิเคราะห์ครบทุกสาย: https://finlance.co/blog/freelance-average-income-thailand-2026`
    },
    {
      image: 'social-security-33.png',
      message: `ลาออกจากงานประจำ ประกันสังคม ม.33 ต้องทำอะไรบ้าง?

สิ่งที่ต้องทำทันที:
1. สมัคร ม.39 ภายใน 6 เดือน (จ่าย 432 บ./เดือน ได้สิทธิ์ครบ)
2. ขึ้นทะเบียนว่างงาน ภายใน 30 วัน
3. โอนกองทุนสำรองเลี้ยงชีพไป RMF (ไม่ต้องเสียภาษี)

พลาด ม.39 = เสียสิทธิ์ดีที่สุดไปตลอด!

อ่านคู่มือเต็ม: https://finlance.co/blog/freelance-social-security-33-resignation`
    },
    {
      image: 'essential-skills.png',
      message: `ทักษะที่ฟรีแลนซ์ต้องมี นอกจากทักษะหลัก

เก่งแค่ coding หรือ design ไม่พอ ต้องมี:

💰 การเงิน — ตั้งราคา บริหารเงิน วางแผนภาษี
🗣 สื่อสาร — เขียน Proposal เจรจาต่อรอง
⏰ บริหารจัดการ — Time Management จัดลำดับงาน
📢 Marketing — Personal Brand หาลูกค้า
🧠 Mindset — รับมือ Rejection, Self-Discipline

ทักษะหลักเป็นแค่ตั๋วเข้าสนาม ทักษะเสริมทำให้อยู่ได้ยาวนาน

อ่านเพิ่ม: https://finlance.co/blog/essential-skills-for-freelancing`
    },
    {
      image: 'best-careers.png',
      message: `10 อาชีพฟรีแลนซ์ที่เหมาะกับคนไทย 2569

1. Developer — รายได้สูงสุด
2. UI/UX Designer — ตลาดกำลังโต
3. Content Writer — เริ่มต้นง่ายสุด
4. ช่างภาพ — งาน Creative
5. Video Editor — Demand สูง
6. Digital Marketing — Retainer income
7. Virtual Assistant — ไม่ต้องมีทักษะเฉพาะ
8. Data Analyst — อนาคตสดใส
9. นักแปล — ได้เปรียบถ้าเก่งภาษา
10. Consultant — รายได้สูง ต้องมีประสบการณ์

อ่านวิเคราะห์แต่ละสาย: https://finlance.co/blog/best-freelance-careers-thailand-2026`
    },
    {
      image: 'financial-runway.png',
      message: `เตรียมเงินเท่าไหร่ก่อนลาออกมาฟรีแลนซ์?

สูตรง่ายๆ:
Runway = ค่าใช้จ่าย/เดือน x จำนวนเดือน + 20% buffer

ตัวอย่าง (ค่าใช้จ่าย 25,000 บ./เดือน):
- ขั้นต่ำ 6 เดือน = 180,000 บาท
- แนะนำ 9 เดือน = 270,000 บาท
- ปลอดภัย 12 เดือน = 360,000 บาท

ยิ่งมี Runway ยาว ยิ่งมีอิสระเลือกงานที่ดี

อ่านสูตรคำนวณ: https://finlance.co/blog/financial-runway-before-freelancing`
    },
    {
      image: 'beginner-mistakes.png',
      message: `10 ผิดพลาดที่ฟรีแลนซ์มือใหม่ทำ

1. ตั้งราคาต่ำเกินไป — เสียรายได้ปีละ 180K+
2. ไม่ทำสัญญา — โดนเบี้ยว scope creep
3. ไม่แยกบัญชี — ไม่รู้กำไรขาดทุน
4. ลืมภาษี — โดนค่าปรับย้อนหลัง
5. ไม่มี Emergency Fund — ล้มละลายได้
6. รับงานทุกอย่าง — Burnout
7. ไม่สร้าง Portfolio — ลูกค้าไม่มั่นใจ
8. ไม่ Networking — พลาดโอกาส
9. ทำงานจน Burnout — สุขภาพพัง
10. ไม่พัฒนาทักษะ — ล้าหลังตลาด

อ่านวิธีหลีกเลี่ยง: https://finlance.co/blog/freelance-beginner-mistakes-avoid`
    }
  ];

  const postIndex = parseInt(process.argv[2] || '0');

  if (postIndex >= 0 && postIndex < posts.length) {
    const p = posts[postIndex];
    const imgPath = path.join(__dirname, '..', 'public', 'blog', 'covers', p.image);
    console.log(`Posting #${postIndex + 1}: ${p.image}...`);
    const result = await postPhoto(imgPath, p.message);
    console.log('Success! Post ID:', result.post_id || result.id);
  } else if (process.argv[2] === 'all') {
    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      const imgPath = path.join(__dirname, '..', 'public', 'blog', 'covers', p.image);
      console.log(`\nPosting #${i + 1}/${posts.length}: ${p.image}...`);
      try {
        const result = await postPhoto(imgPath, p.message);
        console.log('Success! Post ID:', result.post_id || result.id);
      } catch (e) {
        console.error('Error:', e.message);
      }
      // Wait 30 seconds between posts to avoid rate limiting
      if (i < posts.length - 1) {
        console.log('Waiting 30 seconds...');
        await new Promise(r => setTimeout(r, 30000));
      }
    }
    console.log('\nAll posts done!');
  } else {
    console.log('Usage: node fb-post.js [0-6|all]');
    posts.forEach((p, i) => console.log(`  ${i}: ${p.image}`));
  }
}

main().catch(console.error);
