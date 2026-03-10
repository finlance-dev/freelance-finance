# โครงสร้างและการตัดสินใจทางเทคนิค (Architecture)

## Tech Stack
| เทคโนโลยี | เวอร์ชัน | เหตุผล |
|-----------|---------|--------|
| Next.js | 16.1.6 | App Router, SSR, Turbopack |
| TypeScript | - | Type safety |
| Tailwind CSS | v4 | @theme inline syntax, utility-first |
| Recharts | - | Charts (Bar, Pie) |
| Lucide React | - | Icons |
| Supabase | - | Auth + PostgreSQL + RLS (ready, not connected) |
| clsx + tailwind-merge | - | Conditional className merging |

## โครงสร้างไฟล์ (File Structure)
```
freelance-finance/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (lang="th")
│   │   ├── globals.css         # Theme CSS variables
│   │   ├── page.tsx            # Landing page
│   │   ├── login/page.tsx      # Login (demo mode)
│   │   ├── signup/page.tsx     # Signup
│   │   └── dashboard/
│   │       ├── layout.tsx      # Sidebar + mobile menu
│   │       ├── page.tsx        # Overview (stats, charts)
│   │       ├── transactions/page.tsx  # CRUD transactions
│   │       ├── clients/page.tsx       # Clients & Projects
│   │       └── tax/page.tsx           # Tax estimator
│   └── lib/
│       ├── types.ts            # TypeScript interfaces
│       ├── store.ts            # localStorage CRUD
│       ├── supabase.ts         # Supabase client + schema
│       └── utils.ts            # cn, formatCurrency, formatDate
├── .project-memory/            # Memory system
└── .env.local.example          # Supabase env template
```

## Data Models
```typescript
Client: { id, name, email, color, createdAt }
Project: { id, clientId, name, status, hourlyRate, createdAt }
Transaction: { id, projectId, clientId, type, amount, date, description, category }
TaxSettings: { annualIncome, taxRate, deductions, quarter }
```

## localStorage Keys (prefix: ff_)
- `ff_user` — ข้อมูลผู้ใช้ (login state)
- `ff_transactions` — รายการเงิน
- `ff_clients` — ข้อมูลลูกค้า
- `ff_projects` — โปรเจกต์
- `ff_tax_rate` — อัตราภาษี
- `ff_monthly_expenses` — ค่าใช้จ่ายรายเดือน

## Supabase Schema (Ready, Not Connected)
- Tables: clients, projects, transactions
- Row Level Security (RLS) enabled
- Policies: Users can only CRUD their own data
- Auth: Supabase Auth with email/password

## Thai Tax Brackets (Progressive)
| รายได้สุทธิ (บาท) | อัตราภาษี |
|-------------------|----------|
| 0 - 150,000 | ยกเว้น |
| 150,001 - 300,000 | 5% |
| 300,001 - 500,000 | 10% |
| 500,001 - 750,000 | 15% |
| 750,001 - 1,000,000 | 20% |
| 1,000,001 - 2,000,000 | 25% |
| 2,000,001 - 5,000,000 | 30% |
| 5,000,001+ | 35% |

## Design Decisions
1. **localStorage-first** — MVP ความเร็วสูง, ไม่ต้อง backend
2. **Demo mode login** — ทุก credentials ใช้ได้ เพื่อทดสอบง่าย
3. **Dark mode default** — CSS variables ใน globals.css
4. **Thai-first UI** — ทุกข้อความเป็นภาษาไทย
5. **Freemium model** — Free / ฿299/mo / ฿2,499/yr

---
*อัพเดทล่าสุด: 2026-03-10*
