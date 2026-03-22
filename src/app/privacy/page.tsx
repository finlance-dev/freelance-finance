import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | Finlance",
  description: "นโยบายความเป็นส่วนตัวของ Finlance ผู้ช่วยการเงินสำหรับฟรีแลนซ์",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">นโยบายความเป็นส่วนตัว</h1>
      <p className="text-muted mb-4 text-sm">อัปเดตล่าสุด: 22 มีนาคม 2569</p>

      <div className="prose prose-invert max-w-none space-y-6 text-foreground/80 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h2>
          <p>เมื่อคุณใช้บริการ Finlance เราอาจเก็บรวบรวมข้อมูลดังต่อไปนี้:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>ข้อมูลบัญชี: อีเมล ชื่อ (เมื่อสมัครสมาชิก)</li>
            <li>ข้อมูลการเงิน: รายรับ รายจ่าย ข้อมูลภาษี (เก็บบนเครื่องของคุณเท่านั้น)</li>
            <li>ข้อมูลการใช้งาน: หน้าที่เข้าชม ระยะเวลาการใช้งาน (ผ่าน Google Analytics)</li>
            <li>ข้อมูลอุปกรณ์: ประเภทเบราว์เซอร์ ระบบปฏิบัติการ</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. วิธีการใช้ข้อมูล</h2>
          <p>เราใช้ข้อมูลที่เก็บรวบรวมเพื่อ:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>ให้บริการและปรับปรุงแพลตฟอร์ม Finlance</li>
            <li>วิเคราะห์การใช้งานเพื่อพัฒนาประสบการณ์ผู้ใช้</li>
            <li>ส่งข้อมูลข่าวสารและอัปเดตที่เกี่ยวข้อง (ถ้าคุณสมัครรับ)</li>
            <li>ป้องกันการใช้งานที่ไม่เหมาะสม</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. การจัดเก็บข้อมูลการเงิน</h2>
          <p>
            ข้อมูลการเงินของคุณ (รายรับ รายจ่าย ข้อมูลภาษี) จัดเก็บบน localStorage ของเบราว์เซอร์คุณเท่านั้น
            เราไม่ส่งข้อมูลการเงินของคุณไปยังเซิร์ฟเวอร์ของเรา ข้อมูลอยู่ในการควบคุมของคุณทั้งหมด
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. คุกกี้และเทคโนโลยีติดตาม</h2>
          <p>เราใช้:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Google Analytics เพื่อวิเคราะห์การใช้งานเว็บไซต์</li>
            <li>localStorage เพื่อจัดเก็บข้อมูลการเงินและการตั้งค่าของคุณ</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. การแบ่งปันข้อมูล</h2>
          <p>
            เราไม่ขาย ไม่แลกเปลี่ยน และไม่ให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สาม
            ยกเว้นในกรณีที่กฎหมายกำหนด
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. สิทธิ์ของคุณ</h2>
          <p>คุณมีสิทธิ์:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>เข้าถึงข้อมูลส่วนบุคคลของคุณ</li>
            <li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
            <li>ลบข้อมูลของคุณ (ล้าง localStorage)</li>
            <li>ยกเลิกการรับข่าวสาร</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. ความปลอดภัย</h2>
          <p>
            เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ
            รวมถึงการเข้ารหัส HTTPS สำหรับการสื่อสารทั้งหมด
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">8. การเปลี่ยนแปลงนโยบาย</h2>
          <p>
            เราอาจอัปเดตนโยบายนี้เป็นครั้งคราว การเปลี่ยนแปลงจะประกาศบนหน้านี้
            พร้อมวันที่อัปเดตล่าสุด
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">9. ติดต่อเรา</h2>
          <p>
            หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว ติดต่อได้ที่อีเมล finlanceco@gmail.com
          </p>
        </section>
      </div>
    </main>
  );
}
