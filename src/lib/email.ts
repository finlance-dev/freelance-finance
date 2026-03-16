import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "Finlance <noreply@finlance.co>";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) return { success: false, error: "Email not configured" };

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Email Templates ────────────────────────────────────────────────────

const wrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:'Noto Sans Thai',Helvetica,Arial,sans-serif;background:#f8fafc;padding:40px 20px;">
  <div style="max-width:500px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:24px;font-weight:bold;color:#6366f1;">$ Finlance</span>
    </div>
    ${content}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;">
      Finlance — ผู้ช่วยการเงินสำหรับฟรีแลนซ์
    </div>
  </div>
</body>
</html>`;

export function invoiceOverdueEmail(invoiceNumbers: string[], count: number) {
  return {
    subject: `⚠️ คุณมี ${count} ใบแจ้งหนี้เลยกำหนดชำระ`,
    html: wrapper(`
      <h2 style="color:#ef4444;font-size:18px;">ใบแจ้งหนี้เลยกำหนด</h2>
      <p style="color:#475569;">คุณมี <strong>${count}</strong> ใบแจ้งหนี้ที่เลยกำหนดชำระ:</p>
      <ul style="color:#1e293b;">${invoiceNumbers.map((n) => `<li>${n}</li>`).join("")}</ul>
      <a href="https://finlance.co/dashboard/invoices?status=overdue"
         style="display:inline-block;background:#6366f1;color:white;padding:10px 24px;border-radius:10px;text-decoration:none;margin-top:16px;">
        ดูใบแจ้งหนี้
      </a>
    `),
  };
}

export function planExpiringEmail(daysLeft: number) {
  return {
    subject: `แพลน Pro ของคุณจะหมดอายุใน ${daysLeft} วัน`,
    html: wrapper(`
      <h2 style="color:#f59e0b;font-size:18px;">แพลน Pro ใกล้หมดอายุ</h2>
      <p style="color:#475569;">แพลน Pro ของคุณจะหมดอายุใน <strong>${daysLeft} วัน</strong></p>
      <p style="color:#475569;">ต่ออายุเพื่อใช้งานฟีเจอร์ Pro ต่อเนื่อง</p>
      <a href="https://finlance.co/dashboard/pricing"
         style="display:inline-block;background:#6366f1;color:white;padding:10px 24px;border-radius:10px;text-decoration:none;margin-top:16px;">
        ต่ออายุแพลน
      </a>
    `),
  };
}

export function withdrawalPaidEmail(amount: number) {
  return {
    subject: `โอนค่าคอม ฿${amount.toLocaleString()} สำเร็จ`,
    html: wrapper(`
      <h2 style="color:#10b981;font-size:18px;">โอนเงินสำเร็จ!</h2>
      <p style="color:#475569;">เราได้โอนค่าคอมมิชชั่น <strong>฿${amount.toLocaleString()}</strong> ให้คุณแล้ว</p>
      <p style="color:#475569;">ตรวจสอบยอดเงินได้ที่บัญชี PromptPay ของคุณ</p>
      <a href="https://finlance.co/dashboard/referral"
         style="display:inline-block;background:#6366f1;color:white;padding:10px 24px;border-radius:10px;text-decoration:none;margin-top:16px;">
        ดูรายละเอียด
      </a>
    `),
  };
}

export function welcomeEmail(name: string) {
  return {
    subject: `ยินดีต้อนรับสู่ Finlance, ${name}! 🎉`,
    html: wrapper(`
      <h2 style="color:#6366f1;font-size:18px;">ยินดีต้อนรับ ${name}!</h2>
      <p style="color:#475569;">ขอบคุณที่สมัครใช้งาน Finlance — ผู้ช่วยการเงินสำหรับฟรีแลนซ์</p>
      <p style="color:#475569;">เริ่มต้นใช้งานง่ายๆ:</p>
      <ol style="color:#1e293b;">
        <li>เพิ่มรายรับ-รายจ่าย</li>
        <li>สร้างใบแจ้งหนี้ให้ลูกค้า</li>
        <li>ดูรายงานภาษีอัตโนมัติ</li>
      </ol>
      <a href="https://finlance.co/dashboard"
         style="display:inline-block;background:#6366f1;color:white;padding:10px 24px;border-radius:10px;text-decoration:none;margin-top:16px;">
        เริ่มใช้งาน
      </a>
    `),
  };
}
