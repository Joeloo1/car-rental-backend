import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  Edit3,
  Mail,
  Phone,
  Shield,
  Loader2,
  User as UserIcon,
  X,
  CheckCircle2,
  Clock,
  Lock,
} from "@/lib/icons";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/user.service";

const ROLE = {
  lender: { label: "Car Host",      color: "text-amber", bg: "bg-amber/10",      border: "border-amber/20" },
  admin:  { label: "Administrator", color: "text-red",   bg: "bg-red/[0.08]",   border: "border-red/20"   },
  User:   { label: "Renter",        color: "text-teal",  bg: "bg-teal/10",       border: "border-teal/20"  },
} as const;

const ProfileEditor: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing]       = useState(false);
  const [name, setName]                 = useState(user?.name || "");
  const [phone, setPhone]               = useState(user?.phoneNumber || "");
  const [isSaving, setIsSaving]         = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => { if (!isUploading) fileInputRef.current?.click(); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error("Image must be under 5 MB"); return; }

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("profileImage", file);
      const updated = await userService.updateProfile(fd);
      updateUser({ profileImage: updated.profileImage });
      toast.success("Profile photo updated");
    } catch {
      setAvatarPreview(null);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({ name: name.trim(), phoneNumber: phone.trim() || undefined });
      updateUser({ name: updated.name, phoneNumber: updated.phoneNumber });
      toast.success("Profile updated");
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setPhone(user?.phoneNumber || "");
    setIsEditing(false);
  };

  const avatarSrc =
    avatarPreview ||
    user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=161618&color=6B6B6B&size=200`;

  const role = ROLE[(user?.role ?? "User") as keyof typeof ROLE] ?? ROLE["User"];

  const initials = (user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4">

      {/* ── Profile card ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden border border-[#1c1c1c]" style={{ background: "var(--color-surface-2)" }}>

        {/* Cover banner */}
        <div className="relative h-[72px] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(212,151,42,0.10) 0%, rgba(74,142,232,0.06) 60%, transparent 100%)",
            }}
          />
          {/* Dot mesh overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          {/* Edit button top-right */}
          <div className="absolute top-3 right-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-ink-secondary border border-[#2a2a2a] hover:border-[#383838] hover:text-ink-primary transition-all"
                style={{ background: "rgba(10,10,14,0.65)", backdropFilter: "blur(8px)" }}
              >
                <Edit3 size={11} /> Edit profile
              </button>
            ) : (
              <div className="flex gap-1.5">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-black disabled:opacity-60 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)" }}
                >
                  {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-ink-tertiary border border-[#2a2a2a] hover:text-ink-secondary transition-colors"
                  style={{ background: "rgba(10,10,14,0.65)", backdropFilter: "blur(8px)" }}
                >
                  <X size={11} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Avatar + identity row */}
        <div className="px-6 pb-6">
          {/* Avatar overlaps cover */}
          <div className="-mt-8 mb-4 flex items-end gap-4">
            <div className="relative flex-shrink-0">
              <button
                onClick={handleAvatarClick}
                className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-[#1c1c1c] focus:outline-none transition-all group"
                title="Change photo"
                style={{ background: "var(--color-surface-3)" }}
              >
                <img
                  src={avatarSrc}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${initials}&background=1e1e24&color=6B6B6B&size=200`;
                  }}
                />
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  {isUploading
                    ? <Loader2 size={14} className="text-white animate-spin" />
                    : <Camera size={14} className="text-white" />
                  }
                </div>
              </button>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#16161a]"
                style={{ background: "var(--color-teal)" }} />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Name + role */}
            <div className="pb-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h3 className="text-base font-bold text-ink-primary leading-tight truncate">
                  {user?.name}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${role.color} ${role.bg} ${role.border}`}>
                  <Shield size={9} />
                  {role.label}
                </span>
              </div>
              <p className="text-xs text-ink-tertiary">{user?.email}</p>
            </div>
          </div>

          {/* Edit form — animated */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-5 border-t border-[#1c1c1c] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary mb-1.5">
                      Full name
                    </label>
                    <div className="relative">
                      <UserIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-base pl-8 text-sm"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary mb-1.5">
                      Phone number
                    </label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-base pl-8 text-sm"
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Account details ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#1c1c1c] overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
        <div className="px-5 py-4 border-b border-[#1c1c1c] flex items-center gap-2">
          <UserIcon size={13} className="text-ink-tertiary" />
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-tertiary">Account details</span>
        </div>

        {[
          {
            icon: Mail,
            label: "Email address",
            value: user?.email ?? "—",
            note: "Contact support to change",
            locked: true,
            iconColor: "var(--color-gold)",
            iconBg: "rgba(212,151,42,0.10)",
            iconBorder: "rgba(212,151,42,0.20)",
          },
          {
            icon: Phone,
            label: "Phone number",
            value: user?.phoneNumber || "Not provided",
            note: isEditing ? "Editable in form above" : "Click Edit profile to update",
            locked: false,
            iconColor: "var(--color-gold)",
            iconBg: "rgba(212,151,42,0.10)",
            iconBorder: "rgba(212,151,42,0.20)",
          },
          {
            icon: Shield,
            label: "Account role",
            value: role.label,
            note: "Contact support to change",
            locked: true,
            iconColor: "var(--color-teal)",
            iconBg: "rgba(74,142,232,0.10)",
            iconBorder: "rgba(74,142,232,0.20)",
          },
          {
            icon: user?.isVerified ? CheckCircle2 : Clock,
            label: "Verification",
            value: user?.isVerified ? "Verified" : "Pending",
            note: user?.isVerified ? "Your account is verified" : "Check your email inbox",
            locked: true,
            iconColor: user?.isVerified ? "var(--color-teal)" : "var(--color-gold)",
            iconBg:    user?.isVerified ? "rgba(74,142,232,0.10)" : "rgba(212,151,42,0.10)",
            iconBorder: user?.isVerified ? "rgba(74,142,232,0.20)" : "rgba(212,151,42,0.20)",
          },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className={`flex items-center gap-4 px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-[#1c1c1c]" : ""} hover:bg-white/[0.015] transition-colors`}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: item.iconBg, border: `1px solid ${item.iconBorder}` }}
            >
              <item.icon size={14} style={{ color: item.iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-tertiary">{item.label}</p>
              <p className="text-sm font-medium text-ink-primary mt-0.5 truncate">{item.value}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1.5">
              <span className="text-[10px] text-ink-tertiary hidden sm:block">{item.note}</span>
              {item.locked && <Lock size={11} className="text-ink-disabled" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileEditor;
