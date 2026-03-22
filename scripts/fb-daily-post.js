const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

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

// All blog posts with their Facebook captions
const allPosts = [
  { slug: "how-to-start-freelancing-thailand", cover: "start-freelancing", caption: "เริ่มต้นเป็นฟรีแลนซ์ยังไง? คู่มือฉบับสมบูรณ์ 2569\n\nครอบคลุมทุกขั้นตอน ตั้งแต่หาทักษะ สร้าง Portfolio ตั้งราคา หาลูกค้า จัดการภาษี และวางแผนการเงิน" },
  { slug: "quit-job-to-freelance-preparation", cover: "quit-job-freelance", caption: "ลาออกมาเป็นฟรีแลนซ์ เตรียมตัวยังไงไม่ให้เจ๊ง?\n\n- เงินสำรอง 6-12 เดือน\n- ลูกค้าอย่างน้อย 2-3 ราย\n- สมัคร ม.39 ภายใน 6 เดือน\n- สัญญาจ้างงาน + Invoice template" },
  { slug: "freelance-average-income-thailand-2026", cover: "average-income", caption: "รายได้ฟรีแลนซ์ไทยเฉลี่ยเท่าไหร่ 2569?\n\nDeveloper: 40K-200K+/เดือน\nDesigner: 30K-150K/เดือน\nMarketing: 25K-120K/เดือน\nนักเขียน: 15K-80K/เดือน" },
  { slug: "freelance-social-security-33-resignation", cover: "social-security-33", caption: "ลาออกจากงานประจำ ประกันสังคม ม.33 ต้องทำอะไร?\n\n1. สมัคร ม.39 ภายใน 6 เดือน (432 บ./เดือน)\n2. ขึ้นทะเบียนว่างงาน ภายใน 30 วัน\n3. โอนกองทุนสำรองไป RMF\n\nพลาด ม.39 = เสียสิทธิ์ดีที่สุดไปตลอด!" },
  { slug: "essential-skills-for-freelancing", cover: "essential-skills", caption: "ทักษะที่ฟรีแลนซ์ต้องมี นอกจากทักษะหลัก\n\nเก่งแค่ coding หรือ design ไม่พอ ต้องมี:\n- การเงิน: ตั้งราคา บริหารเงิน วางแผนภาษี\n- สื่อสาร: เขียน Proposal เจรจาต่อรอง\n- Marketing: Personal Brand หาลูกค้า" },
  { slug: "best-freelance-careers-thailand-2026", cover: "best-careers", caption: "10 อาชีพฟรีแลนซ์ที่เหมาะกับคนไทย 2569\n\n1. Developer\n2. Designer\n3. นักเขียน\n4. ช่างภาพ\n5. Video Editor\n6. Digital Marketing\n7. VA\n8. Data Analyst\n9. นักแปล\n10. Consultant" },
  { slug: "financial-runway-before-freelancing", cover: "financial-runway", caption: "เตรียมเงินเท่าไหร่ก่อนลาออกมาฟรีแลนซ์?\n\nสูตร: ค่าใช้จ่าย/เดือน x จำนวนเดือน + 20%\n\nตัวอย่าง (25,000 บ./เดือน):\n- 6 เดือน = 180,000 บาท\n- 9 เดือน = 270,000 บาท\n- 12 เดือน = 360,000 บาท" },
  { slug: "employee-to-freelancer-mindset-shift", cover: "mindset-shift", caption: "เปลี่ยน Mindset จากพนักงานสู่ฟรีแลนซ์\n\nพนักงาน: รอคำสั่ง ขายเวลา บริษัทรับเสี่ยง\nฟรีแลนซ์: ริเริ่มเอง ขายคุณค่า รับเสี่ยงเอง\n\nก่อนเป็นฟรีแลนซ์ ต้องเปลี่ยนวิธีคิดก่อน" },
  { slug: "freelancing-pros-cons-honest-review", cover: "pros-cons", caption: "ข้อดีข้อเสียฟรีแลนซ์ ความจริงที่ไม่มีใครบอก\n\nข้อดี: อิสระ รายได้ไม่จำกัด ทำงานที่ไหนก็ได้\nข้อเสีย: รายได้ไม่แน่นอน ไม่มีสวัสดิการ โดดเดี่ยว\n\nSocial media โชว์แต่ด้านดี บทความนี้บอกทุกด้าน" },
  { slug: "freelance-beginner-mistakes-avoid", cover: "beginner-mistakes", caption: "10 ผิดพลาดที่ฟรีแลนซ์มือใหม่ทำ\n\n1. ตั้งราคาต่ำเกินไป\n2. ไม่ทำสัญญา\n3. ไม่แยกบัญชี\n4. ลืมภาษี\n5. ไม่มี Emergency Fund\n\nรวมเสียรายได้ปีละ 300K-500K+ บาท!" },
  { slug: "freelance-tax-calculation-2026", cover: "tax-calculation", caption: "วิธีคำนวณภาษีสำหรับฟรีแลนซ์ 2569\n\nรู้หรือไม่? ฟรีแลนซ์หักค่าใช้จ่ายเหมาได้ 60%\n\nรายได้ 600,000 บ./ปี หักเหมา 360,000\nเหลือเงินได้ 240,000 หักลดหย่อน 60,000\nเงินได้สุทธิ 180,000 ภาษี = 1,500 บาทเท่านั้น!" },
  { slug: "freelance-pricing-strategy", cover: "pricing-strategy", caption: "ตั้งราคาค่าบริการฟรีแลนซ์ยังไงให้ไม่ขาดทุน?\n\nสูตร: (ค่าใช้จ่าย + ออม + ภาษี) / ชม.ทำงานจริง\n\nค่าใช้จ่าย 30K + ออม 6K + ภาษี 5K = 41K\nหาร 100 ชม. = ขั้นต่ำ 410 บ./ชม.\n\nนี่คือราคาต่ำสุด ราคาจริงควรสูงกว่า 30-50%!" },
  { slug: "emergency-fund-6-months-guide", cover: "emergency-fund", caption: "ฟรีแลนซ์ต้องมี Emergency Fund เท่าไหร่?\n\nขั้นต่ำ: 6 เดือนค่าใช้จ่าย\nแนะนำ: 9-12 เดือน\n\nเก็บไว้ในบัญชีออมทรัพย์ ถอนได้ทันที\nอย่าเอาไปลงทุนในสินทรัพย์เสี่ยง!" },
  { slug: "withholding-tax-freelance-guide", cover: "withholding-tax", caption: "ภาษีหัก ณ ที่จ่าย 3% ฟรีแลนซ์ต้องรู้!\n\nลูกค้าหัก 3% ก่อนจ่ายเงินให้คุณ\nงาน 10,000 บาท ได้รับจริง 9,700 บาท\n\nแต่เงิน 300 บาทนี้ไม่ได้หายไป!\nเอามาเครดิตภาษีตอนยื่น ภ.ง.ด.90 ได้\nอย่าลืมขอ 50 ทวิ จากลูกค้าทุกครั้ง" },
  { slug: "freelance-contract-template-guide", cover: "contract-template", caption: "สัญญาจ้างงานฟรีแลนซ์ ต้องมีอะไรบ้าง?\n\n1. Scope of Work ชัดเจน\n2. ราคาและเงื่อนไขการจ่าย\n3. จำนวน Revision\n4. กำหนดส่งงาน\n5. สิทธิ์ในผลงาน\n6. เงื่อนไขยกเลิก\n\nไม่มีสัญญา = เสี่ยงโดนเบี้ยว" },
  { slug: "freelance-cashflow-management-irregular-income", cover: "cashflow", caption: "บริหารเงินยังไง เมื่อรายได้ไม่สม่ำเสมอ?\n\nเดือนนี้ได้ 80K เดือนหน้าอาจได้ 20K\n\nวิธีรับมือ:\n1. จ่ายเงินเดือนตัวเองคงที่ทุกเดือน\n2. เงินส่วนเกินเข้า Buffer Fund\n3. เดือนรายได้น้อย ดึงจาก Buffer\n4. กัน 15-20% ไว้จ่ายภาษี" },
  { slug: "freelance-social-security-section-39-40-guide", cover: "social-security", caption: "ประกันสังคม ม.39 vs ม.40 เลือกแบบไหนดี?\n\nม.39: 432 บ./เดือน ได้สิทธิ์ครบ (OPD IPD คลอด บำนาญ)\nม.40: 70-300 บ./เดือน สิทธิ์จำกัด\n\nถ้าเคยเป็นพนักงาน สมัคร ม.39 คุ้มกว่ามาก!" },
  { slug: "freelance-retirement-planning-ssf-rmf-guide", cover: "retirement-planning", caption: "ฟรีแลนซ์วางแผนเกษียณยังไง?\n\nไม่มีกองทุนสำรองเลี้ยงชีพจากนายจ้าง ต้องจัดการเอง\n\nSSF: ลงทุนได้ถึง 30% ของรายได้ สูงสุด 200,000 บ.\nRMF: ลงทุนได้ถึง 30% ของรายได้ สูงสุด 500,000 บ.\n\nทั้งสองลดหย่อนภาษีได้!" },
  { slug: "freelance-burnout-work-life-balance", cover: "burnout", caption: "Burnout ฟรีแลนซ์ สัญญาณเตือนและวิธีรับมือ\n\nสัญญาณ:\n- หมดแรงจูงใจ ทำงานไม่ไหว\n- นอนไม่หลับ กังวลตลอด\n- คุณภาพงานลดลง\n\nวิธีแก้:\n- ตั้งเวลาทำงานชัดเจน\n- ปฏิเสธงานที่ไม่จำเป็น\n- พักผ่อน ออกกำลังกาย" },
  { slug: "freelance-build-online-portfolio", cover: "portfolio", caption: "Portfolio ฟรีแลนซ์ ต้องมีอะไรบ้าง?\n\n1. ผลงาน 5-8 ชิ้นที่ดีที่สุด\n2. คำอธิบาย: ปัญหา > แก้ยังไง > ผลลัพธ์\n3. Testimonial จากลูกค้า\n4. ข้อมูลติดต่อชัดเจน\n\nไม่ต้องเยอะ แต่ต้องคุณภาพ!" },
];

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
  // Calculate which post to use based on day of year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const postIndex = dayOfYear % allPosts.length;

  const post = allPosts[postIndex];
  const svgPath = path.join(__dirname, '..', 'public', 'blog', 'covers', post.cover + '.svg');
  const pngPath = path.join(__dirname, '..', 'public', 'blog', 'covers', post.cover + '.png');

  // Convert SVG to PNG if needed
  if (!fs.existsSync(pngPath)) {
    console.log(`Converting ${post.cover}.svg to PNG...`);
    await sharp(svgPath).png().toFile(pngPath);
  }

  const message = post.caption + '\n\nอ่านบทความเต็ม: https://finlance.co/blog/' + post.slug;

  console.log(`Day ${dayOfYear} -> Post #${postIndex}: ${post.slug}`);
  console.log(`Message preview: ${message.substring(0, 80)}...`);

  try {
    const result = await postPhoto(pngPath, message);
    console.log('Posted successfully! ID:', result.post_id || result.id);
  } catch (e) {
    console.error('Error posting:', e.message || e);
    process.exit(1);
  }
}

main();
