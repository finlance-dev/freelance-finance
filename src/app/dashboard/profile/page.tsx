"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Save,
  Camera,
} from "lucide-react";
import { useToast } from "@/components/toast";
import { usePlan } from "@/hooks/usePlan";

const STORAGE_KEY = "ff_user_profile";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  taxId: string;
  address: string;
  website: string;
  bio: string;
  avatar: string;
  bankName: string;
  bankAccount: string;
}

const emptyProfile: UserProfile = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  taxId: "",
  address: "",
  website: "",
  bio: "",
  avatar: "",
  bankName: "",
  bankAccount: "",
};

function getProfile(): UserProfile {
  if (typeof window === "undefined") return emptyProfile;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return { ...emptyProfile, ...JSON.parse(stored) };
  // Seed from ff_user if profile doesn't exist yet
  const user = localStorage.getItem("ff_user");
  if (user) {
    const parsed = JSON.parse(user);
    return { ...emptyProfile, name: parsed.name || "", email: parsed.email || "" };
  }
  return emptyProfile;
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  // Also update ff_user for sidebar name display
  const user = localStorage.getItem("ff_user");
  if (user) {
    const parsed = JSON.parse(user);
    parsed.name = profile.name;
    parsed.email = profile.email;
    localStorage.setItem("ff_user", JSON.stringify(parsed));
  }
}

const BANK_OPTIONS = [
  "ธนาคารกรุงเทพ",
  "ธนาคารกสิกรไทย",
  "ธนาคารกรุงไทย",
  "ธนาคารไทยพาณิชย์",
  "ธนาคารกรุงศรีอยุธยา",
  "ธนาคารทหารไทยธนชาต",
  "ธนาคารออมสิน",
  "ธนาคารเกียรตินาคินภัทร",
  "ธนาคารซีไอเอ็มบีไทย",
  "ธนาคารยูโอบี",
  "อื่นๆ",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { planLabel, isPro } = usePlan();

  useEffect(() => {
    setProfile(getProfile());
    setMounted(true);
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!profile.name.trim()) errs.name = "กรุณากรอกชื่อ";
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      errs.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (profile.phone && !/^[\d-]{9,13}$/.test(profile.phone.replace(/\s/g, ""))) {
      errs.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
    }
    if (profile.taxId && !/^\d{13}$/.test(profile.taxId.replace(/[-\s]/g, ""))) {
      errs.taxId = "เลข Tax ID ต้องมี 13 หลัก";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    saveProfile(profile);
    setEditing(false);
    toast("บันทึกโปรไฟล์สำเร็จ");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) {
      toast("รูปภาพต้องไม่เกิน 500KB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setProfile((prev) => ({ ...prev, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  if (!mounted) return null;

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">โปรไฟล์</h1>
          <p className="text-muted text-sm mt-1">ข้อมูลส่วนตัวและธุรกิจของคุณ</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition text-sm"
          >
            แก้ไขโปรไฟล์
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setProfile(getProfile());
                setEditing(false);
                setErrors({});
              }}
              className="bg-secondary hover:bg-border text-foreground px-4 py-2 rounded-xl font-medium transition text-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition text-sm"
            >
              <Save className="w-4 h-4" />
              บันทึก
            </button>
          </div>
        )}
      </div>

      {/* Avatar + Name Card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
                {initials}
              </div>
            )}
            {editing && (
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name || "ยังไม่ได้ตั้งชื่อ"}</h2>
            <p className="text-muted text-sm">{profile.email || "ยังไม่ได้ใส่อีเมล"}</p>
            <span
              className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                isPro
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-muted"
              }`}
            >
              {planLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          ข้อมูลส่วนตัว
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="ชื่อ-นามสกุล"
            icon={<User className="w-4 h-4" />}
            value={profile.name}
            editing={editing}
            error={errors.name}
            onChange={(v) => handleChange("name", v)}
            placeholder="ชื่อจริง นามสกุล"
          />
          <Field
            label="อีเมล"
            icon={<Mail className="w-4 h-4" />}
            value={profile.email}
            editing={editing}
            error={errors.email}
            onChange={(v) => handleChange("email", v)}
            placeholder="email@example.com"
            type="email"
          />
          <Field
            label="เบอร์โทร"
            icon={<Phone className="w-4 h-4" />}
            value={profile.phone}
            editing={editing}
            error={errors.phone}
            onChange={(v) => handleChange("phone", v)}
            placeholder="0812345678"
            type="tel"
          />
          <Field
            label="เว็บไซต์"
            icon={<FileText className="w-4 h-4" />}
            value={profile.website}
            editing={editing}
            onChange={(v) => handleChange("website", v)}
            placeholder="https://yoursite.com"
          />
        </div>
        {(editing || profile.bio) && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-muted mb-1.5">แนะนำตัว</label>
            {editing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="เล่าเกี่ยวกับตัวเองสั้นๆ..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              />
            ) : (
              <p className="text-sm">{profile.bio}</p>
            )}
          </div>
        )}
      </div>

      {/* Business Info */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          ข้อมูลธุรกิจ
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="ชื่อธุรกิจ / ชื่อที่ใช้ในใบแจ้งหนี้"
            icon={<Building2 className="w-4 h-4" />}
            value={profile.businessName}
            editing={editing}
            onChange={(v) => handleChange("businessName", v)}
            placeholder="เช่น บริษัท ABC จำกัด"
          />
          <Field
            label="เลขประจำตัวผู้เสียภาษี (Tax ID)"
            icon={<FileText className="w-4 h-4" />}
            value={profile.taxId}
            editing={editing}
            error={errors.taxId}
            onChange={(v) => handleChange("taxId", v)}
            placeholder="1234567890123"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-muted mb-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              ที่อยู่ (แสดงในใบแจ้งหนี้)
            </div>
          </label>
          {editing ? (
            <textarea
              value={profile.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123/45 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
            />
          ) : (
            <p className="text-sm">{profile.address || <span className="text-muted">ยังไม่ได้ใส่</span>}</p>
          )}
        </div>
      </div>

      {/* Bank Info */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-warning" />
          บัญชีธนาคาร
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">ธนาคาร</label>
            {editing ? (
              <select
                value={profile.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">เลือกธนาคาร</option>
                {BANK_OPTIONS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm">{profile.bankName || <span className="text-muted">ยังไม่ได้เลือก</span>}</p>
            )}
          </div>
          <Field
            label="เลขบัญชี"
            value={profile.bankAccount}
            editing={editing}
            onChange={(v) => handleChange("bankAccount", v)}
            placeholder="xxx-x-xxxxx-x"
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  value,
  editing,
  error,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  editing: boolean;
  error?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted mb-1.5">
        {icon ? (
          <span className="flex items-center gap-1.5">
            {icon}
            {label}
          </span>
        ) : (
          label
        )}
      </label>
      {editing ? (
        <>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
              error ? "border-danger" : "border-border"
            }`}
          />
          {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </>
      ) : (
        <p className="text-sm">{value || <span className="text-muted">ยังไม่ได้ใส่</span>}</p>
      )}
    </div>
  );
}
