import { Transaction, Client, Project } from "./types";
import { getClients, getProjects } from "./store";

export function exportTransactionsCSV(transactions: Transaction[]) {
  const clients = getClients();
  const projects = getProjects();

  const getClientName = (id: string | null) => clients.find((c) => c.id === id)?.name || "";
  const getProjectName = (id: string | null) => projects.find((p) => p.id === id)?.name || "";

  const headers = ["วันที่", "ประเภท", "รายละเอียด", "จำนวนเงิน", "หมวดหมู่", "ลูกค้า", "โปรเจกต์"];
  const rows = transactions.map((tx) => [
    tx.date,
    tx.type === "income" ? "รายรับ" : "รายจ่าย",
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.amount.toString(),
    tx.category || "",
    getClientName(tx.clientId),
    getProjectName(tx.projectId),
  ]);

  const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csv, "freelanceflow-transactions.csv", "text/csv;charset=utf-8");
}

export function exportTransactionsPDF(transactions: Transaction[]) {
  const clients = getClients();
  const projects = getProjects();

  const getClientName = (id: string | null) => clients.find((c) => c.id === id)?.name || "-";
  const getProjectName = (id: string | null) => projects.find((p) => p.id === id)?.name || "-";

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const now = new Date();
  const dateStr = now.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  const formatMoney = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let html = `
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8" />
<title>FreelanceFlow - รายงานการเงิน</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans Thai', sans-serif; color: #1e293b; padding: 40px; font-size: 12px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 15px; }
  .header h1 { font-size: 22px; color: #6366f1; }
  .header .date { color: #64748b; font-size: 11px; }
  .summary { display: flex; gap: 20px; margin-bottom: 30px; }
  .summary-card { flex: 1; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; }
  .summary-card .label { font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .summary-card .value { font-size: 18px; font-weight: 700; }
  .income { color: #10b981; }
  .expense { color: #ef4444; }
  .profit { color: #6366f1; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 11px; color: #64748b; font-weight: 600; }
  td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
  tr:hover { background: #f8fafc; }
  .type-badge { padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }
  .type-income { background: #d1fae5; color: #059669; }
  .type-expense { background: #fee2e2; color: #dc2626; }
  .amount { font-weight: 600; text-align: right; }
  .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <h1>FreelanceFlow</h1>
  <div class="date">สร้างเมื่อ ${dateStr}</div>
</div>

<div class="summary">
  <div class="summary-card">
    <div class="label">รายรับรวม</div>
    <div class="value income">฿${formatMoney(totalIncome)}</div>
  </div>
  <div class="summary-card">
    <div class="label">รายจ่ายรวม</div>
    <div class="value expense">฿${formatMoney(totalExpenses)}</div>
  </div>
  <div class="summary-card">
    <div class="label">กำไรสุทธิ</div>
    <div class="value profit">฿${formatMoney(netProfit)}</div>
  </div>
</div>

<h2 style="font-size: 14px; margin-bottom: 10px;">รายการทั้งหมด (${transactions.length} รายการ)</h2>
<table>
  <thead>
    <tr>
      <th>วันที่</th>
      <th>ประเภท</th>
      <th>รายละเอียด</th>
      <th>ลูกค้า</th>
      <th>โปรเจกต์</th>
      <th style="text-align:right">จำนวนเงิน</th>
    </tr>
  </thead>
  <tbody>`;

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const tx of sorted) {
    html += `
    <tr>
      <td>${tx.date}</td>
      <td><span class="type-badge type-${tx.type}">${tx.type === "income" ? "รายรับ" : "รายจ่าย"}</span></td>
      <td>${tx.description}</td>
      <td>${getClientName(tx.clientId)}</td>
      <td>${getProjectName(tx.projectId)}</td>
      <td class="amount ${tx.type === "income" ? "income" : "expense"}">${tx.type === "income" ? "+" : "-"}฿${formatMoney(tx.amount)}</td>
    </tr>`;
  }

  html += `
  </tbody>
</table>
<div class="footer">สร้างโดย FreelanceFlow — ผู้ช่วยการเงินสำหรับฟรีแลนซ์</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onload = () => {
      win.print();
    };
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
