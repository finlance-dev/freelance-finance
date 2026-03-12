import { getLineNotifyToken } from "./store";

export async function sendLineNotify(message: string): Promise<boolean> {
  const token = getLineNotifyToken();
  if (!token) return false;

  try {
    const res = await fetch("/api/line-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function notifyOverdueInvoices(count: number): Promise<boolean> {
  if (count <= 0) return false;
  return sendLineNotify(
    `\n🔴 Finlance แจ้งเตือน\nคุณมีใบแจ้งหนี้เลยกำหนด ${count} รายการ\nกรุณาตรวจสอบและติดตามลูกค้า`
  );
}

export async function notifyTaxDeadline(quarter: string, amount: number, daysLeft: number): Promise<boolean> {
  return sendLineNotify(
    `\n📋 Finlance แจ้งเตือนภาษี\nภาษี ${quarter} ครบกำหนดอีก ${daysLeft} วัน\nยอดประมาณ: ฿${amount.toLocaleString()}\nเตรียมเงินจ่ายภาษีให้พร้อม`
  );
}
