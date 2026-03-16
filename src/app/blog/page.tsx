import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign } from "lucide-react";
import BlogList from "./BlogList";

export const metadata: Metadata = {
  title: "บทความการเงินสำหรับฟรีแลนซ์ | Finlance Blog",
  description: "เคล็ดลับการเงิน ภาษี และการจัดการรายรับรายจ่ายสำหรับฟรีแลนซ์ไทย อ่านบทความที่จะช่วยให้คุณจัดการเงินได้ดีขึ้น",
  openGraph: {
    title: "บทความการเงินสำหรับฟรีแลนซ์ | Finlance Blog",
    description: "เคล็ดลับการเงิน ภาษี และการจัดการรายรับรายจ่ายสำหรับฟรีแลนซ์ไทย",
  },
};

const posts = [
  { slug: "freelance-new-year-financial-reset", title: "ปีใหม่ รีเซ็ตการเงินฟรีแลนซ์ ตั้งเป้าหมายและงบประมาณใหม่", excerpt: "เริ่มต้นปีใหม่ด้วยการรีเซ็ตการเงิน สรุปปีที่ผ่านมา ตั้งเป้าหมายใหม่ วางงบประมาณ และวางแผนภาษีล่วงหน้า", coverImage: "/blog/covers/new-year-reset.svg", date: "2026-04-24" },
  { slug: "freelance-songkran-financial-planning", title: "วางแผนการเงินช่วงสงกรานต์ ฟรีแลนซ์รับมืองานหยุดยาวอย่างไร", excerpt: "ลูกค้าหยุดยาว งานชะงัก รายได้หายไป 1-2 สัปดาห์ เรียนรู้วิธีวางแผนการเงินรับมือช่วงสงกรานต์", coverImage: "/blog/covers/songkran-planning.svg", date: "2026-04-23" },
  { slug: "freelance-year-end-income-boost-strategy", title: "กลยุทธ์เพิ่มรายได้ปลายปีสำหรับฟรีแลนซ์ก่อนปิดงบ", excerpt: "Q4 คือช่วงโอกาสทองของฟรีแลนซ์ บริษัทมีงบเหลือต้องใช้ก่อนสิ้นปี เรียนรู้ 6 กลยุทธ์เพิ่มรายได้ปลายปี", coverImage: "/blog/covers/year-end-boost.svg", date: "2026-04-22" },
  { slug: "freelance-mid-year-financial-review-july", title: "รีวิวการเงินกลางปีสำหรับฟรีแลนซ์ ทำทุกเดือนกรกฎาคม", excerpt: "ผ่านมาครึ่งปีแล้ว เป้าหมายการเงินถึงไหน? รีวิวการเงินกลางปีช่วยให้ฟรีแลนซ์ปรับแผนได้ทันก่อนสิ้นปี", coverImage: "/blog/covers/mid-year-review.svg", date: "2026-04-21" },
  { slug: "freelance-tax-season-checklist-march", title: "ฟรีแลนซ์เตรียมตัวยื่นภาษีเดือนมีนาคม เช็กลิสต์ครบทุกขั้นตอน", excerpt: "ถึงเวลายื่นภาษีประจำปีแล้ว! รวมเช็กลิสต์ครบทุกขั้นตอน ตั้งแต่เตรียมเอกสาร คำนวณภาษี ยื่น e-Filing", coverImage: "/blog/covers/tax-season-checklist.svg", date: "2026-04-20" },
  { slug: "freelance-tax-common-mistakes", title: "10 ข้อผิดพลาดภาษีที่ฟรีแลนซ์ทำบ่อย และวิธีแก้ไขก่อนโดนปรับ", excerpt: "ฟรีแลนซ์หลายคนเสียเงินโดยไม่จำเป็นเพราะข้อผิดพลาดภาษีที่ป้องกันได้ รวม 10 ข้อผิดพลาดที่พบบ่อยที่สุด พร้อมวิธีแก้ไขทีละข้อ", coverImage: "/blog/covers/tax-mistakes.svg", date: "2026-04-19" },
  { slug: "freelance-outsource-delegate-work", title: "จ้างคนช่วยงาน เมื่อไหร่ฟรีแลนซ์ควร Outsource และวิธีทำให้คุ้มค่า", excerpt: "ฟรีแลนซ์ไม่จำเป็นต้องทำทุกอย่างเอง เรียนรู้วิธีตัดสินใจว่าเมื่อไหร่ควร outsource งานไหนควรจ้าง และจะจ้างยังไงให้คุ้มค่า", coverImage: "/blog/covers/outsource.svg", date: "2026-04-18" },
  { slug: "freelance-financial-goal-setting", title: "ตั้งเป้าหมายการเงินสำหรับฟรีแลนซ์ คู่มือวางแผนการเงินทุกระยะ", excerpt: "ฟรีแลนซ์ไม่มีเงินเดือนประจำ การตั้งเป้าหมายการเงินจึงสำคัญกว่าพนักงานประจำ เรียนรู้วิธีตั้งเป้าหมายการเงินระยะสั้น กลาง ยาว พร้อมสูตรคำนวณจริง", coverImage: "/blog/covers/financial-goal.svg", date: "2026-04-17" },
  { slug: "freelance-foreign-client-payment-guide", title: "รับงานลูกค้าต่างชาติ วิธีรับเงินและจัดการภาษีฉบับสมบูรณ์", excerpt: "ฟรีแลนซ์ไทยรับงานลูกค้าต่างประเทศต้องรู้อะไรบ้าง ตั้งแต่ช่องทางรับเงิน อัตราแลกเปลี่ยน ภาษี ไปจนถึงการออกใบแจ้งหนี้เป็นสกุลเงินต่างประเทศ", coverImage: "/blog/covers/foreign-client.svg", date: "2026-04-16" },
  { slug: "freelance-personal-brand-social-media", title: "สร้าง Personal Brand บนโซเชียลมีเดีย คู่มือฟรีแลนซ์ดึงดูดลูกค้าให้มาหาเอง", excerpt: "ฟรีแลนซ์ไม่ต้องวิ่งหาลูกค้าถ้ามี Personal Brand ที่แข็งแรง เรียนรู้วิธีสร้างแบรนด์ส่วนตัวบนโซเชียลมีเดียที่ดึงดูดลูกค้าคุณภาพ", coverImage: "/blog/covers/personal-brand.svg", date: "2026-04-15" },
  { slug: "freelance-time-tracking-billing-hours", title: "Time Tracking สำหรับฟรีแลนซ์ วิธีจับเวลาและคิดค่าบริการรายชั่วโมง", excerpt: "ฟรีแลนซ์คิดค่าบริการรายชั่วโมงยังไงให้คุ้มค่า เรียนรู้วิธีจับเวลา เครื่องมือ Time Tracking และสูตรคำนวณ Hourly Rate", coverImage: "/blog/covers/time-tracking.svg", date: "2026-04-14" },
  { slug: "freelance-client-red-flags-avoid", title: "สัญญาณอันตรายจากลูกค้า 10 Red Flags ที่ฟรีแลนซ์ต้องระวัง", excerpt: "ไม่ใช่ลูกค้าทุกคนจะดี เรียนรู้ 10 สัญญาณเตือนที่บอกว่าลูกค้ารายนี้อาจทำให้คุณเสียเวลา เสียเงิน หรือเสียสุขภาพจิต", coverImage: "/blog/covers/client-red-flags.svg", date: "2026-04-13" },
  { slug: "freelance-tax-deduction-home-office", title: "ค่าใช้จ่าย Home Office หักภาษีได้ไหม? คู่มือฟรีแลนซ์ทำงานที่บ้าน", excerpt: "ฟรีแลนซ์ทำงานที่บ้าน ค่าไฟ ค่าเน็ต ค่าอุปกรณ์ หักภาษีได้ไหม? เรียนรู้วิธีหักค่าใช้จ่ายจริง vs เหมา และเอกสารที่ต้องเก็บ", coverImage: "/blog/covers/home-office-tax.svg", date: "2026-04-12" },
  { slug: "freelance-upskill-courses-investment", title: "ลงทุนพัฒนาตัวเอง คอร์สเรียนไหนคุ้มค่าสำหรับฟรีแลนซ์ 2569", excerpt: "เรียนอะไรดีถึงจะเพิ่มรายได้ได้จริง? รวมคอร์สและทักษะที่ฟรีแลนซ์ควรลงทุนเรียน พร้อมวิธีคำนวณ ROI ของการเรียน", coverImage: "/blog/covers/upskill-courses.svg", date: "2026-04-11" },
  { slug: "freelance-nda-intellectual-property-guide", title: "NDA และทรัพย์สินทางปัญญา สิ่งที่ฟรีแลนซ์ต้องรู้ก่อนเซ็นสัญญา", excerpt: "NDA คืออะไร? ลิขสิทธิ์ผลงานเป็นของใคร? เรียนรู้เรื่อง NDA และทรัพย์สินทางปัญญาที่ฟรีแลนซ์ต้องเข้าใจก่อนเซ็นสัญญา", coverImage: "/blog/covers/nda-ip.svg", date: "2026-04-10" },
  { slug: "freelance-quarterly-tax-payment-guide", title: "ภาษีครึ่งปี ภ.ง.ด.94 คู่มือยื่นภาษีกลางปีสำหรับฟรีแลนซ์", excerpt: "ฟรีแลนซ์ต้องยื่นภาษีครึ่งปี ภ.ง.ด.94 ด้วย! เรียนรู้ว่าใครต้องยื่น วิธีคำนวณ กำหนดเวลา และวิธียื่นออนไลน์", coverImage: "/blog/covers/quarterly-tax.svg", date: "2026-04-09" },
  { slug: "freelance-savings-high-yield-account", title: "บัญชีออมทรัพย์ดอกเบี้ยสูง 2569 ฟรีแลนซ์เก็บเงินที่ไหนดี", excerpt: "เปรียบเทียบบัญชีออมทรัพย์ดอกเบี้ยสูงในไทย 2569 TTB ME Save, KBank MAKE, SCB EasyApp พร้อมแนะนำกลยุทธ์ฝากเงินสำหรับฟรีแลนซ์", coverImage: "/blog/covers/savings-account.svg", date: "2026-04-08" },
  { slug: "freelance-coworking-space-vs-home", title: "Co-working Space vs ทำงานที่บ้าน เปรียบเทียบต้นทุนและประสิทธิภาพ", excerpt: "ทำงานที่บ้านหรือไป co-working space ดีกว่ากัน? เปรียบเทียบต้นทุน ประสิทธิภาพ และความเหมาะสมสำหรับฟรีแลนซ์แต่ละประเภท", coverImage: "/blog/covers/coworking.svg", date: "2026-04-07" },
  { slug: "freelance-retainer-contract-recurring-income", title: "Retainer Contract สร้างรายได้ประจำสำหรับฟรีแลนซ์", excerpt: "หยุดหาลูกค้าใหม่ทุกเดือน เรียนรู้วิธีสร้าง Retainer Contract ที่ให้รายได้สม่ำเสมอ พร้อมตัวอย่างแพ็กเกจและวิธีเสนอลูกค้า", coverImage: "/blog/covers/retainer-contract.svg", date: "2026-04-06" },
  { slug: "freelance-credit-card-business-expenses", title: "ใช้บัตรเครดิตให้เป็นประโยชน์ เคล็ดลับบัตรเครดิตสำหรับฟรีแลนซ์", excerpt: "บัตรเครดิตไม่ใช่ศัตรู ถ้าใช้เป็นจะเป็นเครื่องมือทรงพลัง เรียนรู้วิธีใช้บัตรเครดิตเป็น cash flow buffer และสะสมแต้มจากค่าใช้จ่ายธุรกิจ", coverImage: "/blog/covers/credit-card.svg", date: "2026-04-05" },
  { slug: "freelance-separate-personal-business-account", title: "แยกบัญชีส่วนตัวกับบัญชีธุรกิจ ทำไมฟรีแลนซ์ต้องแยก?", excerpt: "เงินเข้าออกปนกัน ไม่รู้กำไรจริง ยื่นภาษีลำบาก เรียนรู้วิธีแยกบัญชีส่วนตัวกับธุรกิจ พร้อมขั้นตอนปฏิบัติจริง", coverImage: "/blog/covers/separate-accounts.svg", date: "2026-04-04" },
  { slug: "freelance-late-payment-collection-guide", title: "ลูกค้าจ่ายช้า ทวงยังไงให้ได้เงิน ไม่เสียลูกค้า", excerpt: "ปัญหาลูกค้าจ่ายเงินช้าเป็นเรื่องปกติของฟรีแลนซ์ เรียนรู้วิธีทวงหนี้อย่างมืออาชีพ 4 ระดับ พร้อมตัวอย่างข้อความ", coverImage: "/blog/covers/late-payment.svg", date: "2026-04-03" },
  { slug: "freelance-e-filing-rd-guide", title: "วิธียื่นภาษีออนไลน์ e-Filing ทีละขั้นตอน สำหรับฟรีแลนซ์ 2569", excerpt: "คู่มือยื่นภาษีออนไลน์ผ่าน rd.go.th ทีละขั้นตอน ตั้งแต่สมัครสมาชิก กรอกรายได้ ค่าลดหย่อน จนถึงชำระภาษีหรือขอคืน", coverImage: "/blog/covers/e-filing.svg", date: "2026-04-02" },
  { slug: "freelance-year-end-tax-planning", title: "วางแผนภาษีก่อนสิ้นปี 10 วิธีลดภาษีถูกกฎหมายสำหรับฟรีแลนซ์", excerpt: "อย่ารอจนถึง มี.ค. ค่อยคิดเรื่องภาษี วางแผนตั้งแต่ ต.ค.-ธ.ค. ช่วยประหยัดภาษีได้หลายหมื่น", coverImage: "/blog/covers/year-end-tax.svg", date: "2026-04-01" },
  { slug: "freelance-receipt-tax-invoice-difference", title: "ใบเสร็จรับเงิน vs ใบกำกับภาษี ต่างกันยังไง ฟรีแลนซ์ใช้ตอนไหน", excerpt: "หลายคนสับสนระหว่างใบเสร็จรับเงินกับใบกำกับภาษี ทั้งสองแตกต่างกันอย่างไร เมื่อไหร่ต้องออกแบบไหน", coverImage: "/blog/covers/receipt-tax-invoice.svg", date: "2026-03-31" },
  { slug: "freelance-build-online-portfolio", title: "สร้าง Portfolio ออนไลน์ ดึงดูดลูกค้าคุณภาพสำหรับฟรีแลนซ์", excerpt: "Portfolio คือหน้าตาธุรกิจของฟรีแลนซ์ เรียนรู้วิธีสร้าง portfolio ออนไลน์ที่ดึงดูดลูกค้าคุณภาพ พร้อมโครงสร้างและตัวอย่าง", coverImage: "/blog/covers/portfolio.svg", date: "2026-03-30" },
  { slug: "freelance-project-management-tools", title: "7 เครื่องมือจัดการโปรเจกต์ ฟรีแลนซ์ต้องมี 2569", excerpt: "รีวิว 7 เครื่องมือจัดการโปรเจกต์ที่เหมาะกับฟรีแลนซ์ เปรียบเทียบฟีเจอร์ ราคา และความเหมาะสม", coverImage: "/blog/covers/project-management.svg", date: "2026-03-29" },
  { slug: "freelance-negotiate-rate-increase", title: "ขึ้นราคางานฟรีแลนซ์ เจรจายังไงไม่ให้ลูกค้าหาย", excerpt: "ทำงานมาตั้งนาน ราคายังเท่าเดิม? เรียนรู้ 5 ขั้นตอนขึ้นราคาอย่างมืออาชีพ พร้อมสคริปต์เจรจา", coverImage: "/blog/covers/negotiate-rate.svg", date: "2026-03-28" },
  { slug: "freelance-burnout-work-life-balance", title: "Burnout ฟรีแลนซ์ สัญญาณเตือน วิธีรับมือ และการสร้าง Work-Life Balance", excerpt: "ฟรีแลนซ์เป็น burnout ได้ง่ายกว่าที่คิด เรียนรู้สัญญาณเตือนและวิธีฟื้นฟู", coverImage: "/blog/covers/burnout.svg", date: "2026-03-27" },
  { slug: "freelance-multiple-income-streams-tax", title: "มีรายได้หลายทาง ฟรีแลนซ์ยื่นภาษียังไงให้ถูกต้อง", excerpt: "ฟรีแลนซ์ที่มีรายได้จากหลายทาง ต้องยื่นภาษียังไงให้ถูกต้องและไม่เสียภาษีซ้ำซ้อน", coverImage: "/blog/covers/multiple-income-tax.svg", date: "2026-03-26" },
  { slug: "freelance-accounting-bookkeeping-basics", title: "ทำบัญชีเบื้องต้นสำหรับฟรีแลนซ์ จดรายรับรายจ่ายอย่างมืออาชีพ", excerpt: "ฟรีแลนซ์ไม่จำเป็นต้องเป็นนักบัญชี แต่ควรรู้พื้นฐานการจดบันทึกรายรับรายจ่าย แยกบัญชีส่วนตัวกับธุรกิจ", coverImage: "/blog/covers/bookkeeping.svg", date: "2026-03-25" },
  { slug: "freelance-scope-creep-protect-income", title: "Scope Creep คืออะไร? วิธีป้องกันงานบานปลายที่กินกำไรฟรีแลนซ์", excerpt: "ลูกค้าขอเพิ่มงานทีละนิด จนโปรเจกต์บานปลายเกินราคาที่ตกลง เรียนรู้วิธีป้องกันและตั้งราคา change request", coverImage: "/blog/covers/scope-creep.svg", date: "2026-03-24" },
  { slug: "freelance-50-tawi-tax-credit-guide", title: "หนังสือรับรอง 50 ทวิ คืออะไร? ฟรีแลนซ์ต้องเก็บ ต้องตรวจ ต้องใช้ยังไง", excerpt: "50 ทวิ คือเอกสารสำคัญที่ฟรีแลนซ์ต้องเก็บทุกใบ เพราะเป็นกุญแจในการขอภาษีคืน", coverImage: "/blog/covers/50-tawi.svg", date: "2026-03-23" },
  { slug: "freelance-debt-management-loan-approval-tips", title: "ฟรีแลนซ์มีหนี้ จัดการยังไง? + เคล็ดลับกู้เงินให้ผ่าน", excerpt: "ไม่มีสลิปเงินเดือนแต่อยากกู้ซื้อบ้านหรือรถ? เรียนรู้วิธีเตรียมเอกสารรายได้และเทคนิคเพิ่มโอกาสอนุมัติ", coverImage: "/blog/covers/debt-management.svg", date: "2026-03-22" },
  { slug: "freelance-passive-income-investment-strategies", title: "7 วิธีสร้าง Passive Income สำหรับฟรีแลนซ์ ให้เงินทำงานแทนคุณ", excerpt: "ฟรีแลนซ์ไม่ควรพึ่งพาแค่ active income จากงานรับจ้าง เริ่มสร้าง passive income จากการลงทุน", coverImage: "/blog/covers/passive-income.svg", date: "2026-03-21" },
  { slug: "freelance-cashflow-management-irregular-income", title: "บริหารกระแสเงินสดฉบับฟรีแลนซ์ รายได้ไม่แน่นอนก็รอดได้", excerpt: "รายได้เดือนละไม่เท่ากัน เรียนรู้ระบบจัดการ cash flow แบบ bucket system สำหรับฟรีแลนซ์", coverImage: "/blog/covers/cashflow-management.svg", date: "2026-03-20" },
  { slug: "freelance-vat-registration-1-8-million-guide", title: "รายได้เกิน 1.8 ล้าน ฟรีแลนซ์ต้องจด VAT! สิ่งที่ต้องรู้ก่อนสาย", excerpt: "เมื่อรายได้เกิน 1.8 ล้านบาทต่อปี ต้องจดทะเบียน VAT ภายใน 30 วัน ไม่รู้ไม่ได้แปลว่าไม่ผิด", coverImage: "/blog/covers/vat-registration.svg", date: "2026-03-19" },
  { slug: "freelance-register-company-sole-owner-guide", title: "ฟรีแลนซ์ควรเปิดบริษัทคนเดียวเมื่อไร? คู่มือจดทะเบียนฉบับสมบูรณ์", excerpt: "รายได้เริ่มเยอะ ภาษีเริ่มหนัก เปรียบเทียบภาษีบุคคลธรรมดา vs นิติบุคคล พร้อมขั้นตอนจดทะเบียน", coverImage: "/blog/covers/register-company.svg", date: "2026-03-18" },
  { slug: "freelance-retirement-planning-ssf-rmf-guide", title: "วางแผนเกษียณสำหรับฟรีแลนซ์ SSF, RMF และทางเลือกลดหย่อนภาษี 2026", excerpt: "ฟรีแลนซ์ไม่มีกองทุนสำรองเลี้ยงชีพ ต้องวางแผนเกษียณเอง เจาะลึก SSF RMF ThaiESG", coverImage: "/blog/covers/retirement-planning.svg", date: "2026-03-17" },
  { slug: "freelance-social-security-section-39-40-guide", title: "ประกันสังคมฟรีแลนซ์ มาตรา 39 vs 40 เลือกแบบไหนคุ้มกว่า?", excerpt: "เปรียบเทียบสิทธิประโยชน์และเงินสมทบระหว่างมาตรา 39 กับ 40 พร้อมแนะนำทางเลือกที่เหมาะกับคุณ", coverImage: "/blog/covers/social-security.svg", date: "2026-03-16" },
  { slug: "withholding-tax-freelance-guide", title: "ภาษีหัก ณ ที่จ่าย ฟรีแลนซ์ คู่มือฉบับสมบูรณ์", excerpt: "ทุกเรื่องที่ฟรีแลนซ์ต้องรู้เกี่ยวกับภาษีหัก ณ ที่จ่าย ตั้งแต่อัตราการหัก วิธีจัดการ การขอคืนภาษี ไปจนถึงการอ่านหนังสือ 50 ทวิ", coverImage: "/blog/covers/withholding-tax.svg", date: "2026-03-10" },
  { slug: "freelance-pricing-strategy", title: "ตั้งราคาค่าบริการฟรีแลนซ์ คู่มือคำนวณอย่างมืออาชีพ", excerpt: "เรียนรู้ 3 วิธีตั้งราคาค่าบริการฟรีแลนซ์ พร้อมสูตรคำนวณและตัวอย่างจริง", coverImage: "/blog/covers/pricing-strategy.svg", date: "2026-03-08" },
  { slug: "pnd90-tax-filing-freelance", title: "วิธียื่นภาษี ภ.ง.ด.90 สำหรับฟรีแลนซ์ ขั้นตอนครบจบ", excerpt: "คู่มือยื่นภาษี ภ.ง.ด.90 แบบ step-by-step สำหรับฟรีแลนซ์ ตั้งแต่เอกสารที่ต้องเตรียม วิธียื่นผ่าน e-Filing ไปจนถึงโทษของการยื่นล่าช้า", coverImage: "/blog/covers/pnd90-filing.svg", date: "2026-03-06" },
  { slug: "emergency-fund-6-months-guide", title: "สร้าง Emergency Fund 6 เดือน คู่มือฟรีแลนซ์", excerpt: "ทำไมฟรีแลนซ์ต้องมีเงินสำรองฉุกเฉินมากกว่าพนักงานประจำ วิธีคำนวณ เก็บที่ไหน และกลยุทธ์สร้างให้เร็วขึ้น", coverImage: "/blog/covers/emergency-fund.svg", date: "2026-03-05" },
  { slug: "freelance-contract-template-guide", title: "สัญญาจ้างงานฟรีแลนซ์ ตัวอย่างและข้อควรระวัง", excerpt: "ทำไมฟรีแลนซ์ต้องมีสัญญาจ้างงาน องค์ประกอบสำคัญ เงื่อนไขการจ่ายเงิน ลิขสิทธิ์ พร้อมตัวอย่างจริง", coverImage: "/blog/covers/contract-guide.svg", date: "2026-03-04" },
  { slug: "health-insurance-freelance-guide", title: "ประกันสุขภาพสำหรับฟรีแลนซ์ เลือกแบบไหนดี", excerpt: "เปรียบเทียบประกันสุขภาพทุกแบบ ตั้งแต่ประกันสังคม ม.39/40 ประกันเอกชน ไปจนถึงประกันชีวิต+สุขภาพ", coverImage: "/blog/covers/health-insurance.svg", date: "2026-03-02" },
  { slug: "freelance-tax-calculation-2026", title: "วิธีคำนวณภาษีสำหรับฟรีแลนซ์ 2026", excerpt: "เรียนรู้วิธีคำนวณภาษีเงินได้บุคคลธรรมดาสำหรับฟรีแลนซ์ ตั้งแต่การหักค่าใช้จ่าย ค่าลดหย่อน ไปจนถึงอัตราภาษีก้าวหน้า", coverImage: "/blog/covers/tax-calculation.svg", date: "2026-03-01" },
  { slug: "find-freelance-clients-channels", title: "หาลูกค้าฟรีแลนซ์ 10 ช่องทางที่ได้ผลจริง", excerpt: "รวม 10 ช่องทางหาลูกค้าฟรีแลนซ์ ตั้งแต่ LinkedIn Referral ไปจนถึง Content Marketing", coverImage: "/blog/covers/find-clients.svg", date: "2026-02-28" },
  { slug: "best-expense-tracking-apps-freelance", title: "7 แอปบันทึกรายรับรายจ่าย ที่ฟรีแลนซ์ต้องมี", excerpt: "รีวิว 7 แอปบันทึกรายรับรายจ่ายที่เหมาะกับฟรีแลนซ์ไทย เปรียบเทียบฟีเจอร์ ราคา และฟังก์ชันภาษี", coverImage: "/blog/covers/expense-apps.svg", date: "2026-02-25" },
  { slug: "freelance-vs-employment-comparison", title: "ฟรีแลนซ์ vs พนักงานประจำ เปรียบเทียบครบทุกมิติ", excerpt: "เปรียบเทียบชีวิตฟรีแลนซ์กับพนักงานประจำ ตั้งแต่รายได้ สวัสดิการ ภาษี ไปจนถึง Work-Life Balance", coverImage: "/blog/covers/freelance-vs-employment.svg", date: "2026-02-22" },
  { slug: "5-tips-manage-freelance-income-expenses", title: "5 เทคนิคจัดการรายรับ-รายจ่ายฟรีแลนซ์", excerpt: "เทคนิคง่ายๆ ที่ช่วยให้ฟรีแลนซ์จัดการเงินได้อย่างเป็นระบบ ไม่ปนเงินส่วนตัวกับเงินธุรกิจ", coverImage: "/blog/covers/income-expenses.svg", date: "2026-02-20" },
  { slug: "ai-tools-for-freelancers", title: "ใช้ AI ช่วยงานฟรีแลนซ์ เครื่องมือและวิธีใช้จริง", excerpt: "รวม AI tools ที่ฟรีแลนซ์ใช้ได้จริง ตั้งแต่เขียนคอนเทนต์ ออกแบบ เขียนโค้ด ไปจนถึงจัดการเงิน", coverImage: "/blog/covers/ai-tools.svg", date: "2026-02-18" },
  { slug: "professional-invoice-guide", title: "ใบแจ้งหนี้ที่ดีควรมีอะไรบ้าง", excerpt: "สร้างใบแจ้งหนี้แบบมืออาชีพ มีข้อมูลครบถ้วน ลูกค้าจ่ายเร็วขึ้น พร้อมตัวอย่างและเทมเพลต", coverImage: "/blog/covers/invoice-guide.svg", date: "2026-02-10" },
  { slug: "legal-tax-saving-tips-freelance", title: "วิธีประหยัดภาษีถูกกฎหมายสำหรับฟรีแลนซ์", excerpt: "รวม 7 วิธีลดภาษีที่ถูกกฎหมาย ตั้งแต่ค่าลดหย่อนส่วนตัว ประกัน ไปจนถึง SSF/RMF", coverImage: "/blog/covers/tax-saving.svg", date: "2026-01-25" },
  { slug: "getting-started-freelance-finance", title: "เริ่มต้นเป็นฟรีแลนซ์ ต้องเตรียมเรื่องเงินยังไง", excerpt: "คู่มือเตรียมตัวด้านการเงินสำหรับคนที่กำลังจะเริ่มเป็นฟรีแลนซ์ ตั้งแต่กองทุนฉุกเฉิน ไปจนถึงการวางแผนภาษี", coverImage: "/blog/covers/getting-started.svg", date: "2026-01-15" },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-primary" />
            <span className="text-lg font-bold">Finlance</span>
          </Link>
          <Link href="/signup" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            เริ่มใช้ฟรี
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">บทความการเงินสำหรับฟรีแลนซ์</h1>
        <p className="text-muted text-lg mb-10">เคล็ดลับ ความรู้ และวิธีจัดการเงินที่ฟรีแลนซ์ต้องรู้</p>

        <BlogList posts={posts} />
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        <Link href="/" className="hover:text-foreground transition">← กลับหน้าหลัก</Link>
      </footer>
    </div>
  );
}
