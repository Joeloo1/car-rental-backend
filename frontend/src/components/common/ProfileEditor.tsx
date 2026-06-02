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
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/user.service";

const ProfileEditor: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing]   = useState(false);
  const [name, setName]             = useState(user?.name || "");
  const [phone, setPhone]           = useState(user?.phoneNumber || "");
  const [isSaving, setIsSaving]     = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Avatar upload ──────────────────────────────────────────────────────────
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

  // ── Save profile ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({
        name: name.trim(),
        phoneNumber: phone.trim() || undefined,
      });
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

  // ── Derived values ─────────────────────────────────────────────────────────
  const avatarSrc =
    avatarPreview ||
    user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1c1c1c&color=a1a1aa&size=200`;

  const ROLE = {
    lender: { label: "Car Host",      pill: "text-amber bg-amber/10 border-amber/20"       },
    admin:  { label: "Administrator", pill: "text-red bg-red/[0.1] border-red/20"           },
    User:   { label: "Renter",        pill: "text-blue-light bg-blue/10 border-blue/20"     },
  } as const;

  const role = ROLE[(user?.role ?? "User") as keyof typeof ROLE] ?? ROLE["User"];

  const INFO_CARDS = [
    {
      icon:        Mail,
      iconColor:   "#3b82f6",
      iconBg:      "rgba(37,99,235,0.12)",
      iconBorder:  "rgba(37,99,235,0.22)",
      label:       "Email address",
      value:       user?.email ?? "—",
      note:        "Contact support to change email",
    },
    {
      icon:        Phone,
      iconColor:   "#f59e0b",
      iconBg:      "rgba(245,158,11,0.12)",
      iconBorder:  "rgba(245,158,11,0.22)",
      label:       "Phone number",
      value:       user?.phoneNumber || "Not provided",
      note:        isEditing ? "Editable above ↑" : "Click Edit Profile to update",
    },
    {
      icon:        UserIcon,
      iconColor:   "#22c55e",
      iconBg:      "rgba(34,197,94,0.12)",
      iconBorder:  "rgba(34,197,94,0.22)",
      label:       "Account role",
      value:       role.label,
      note:        "Contact support to change role",
    },
    {
      icon:        user?.isVerified ? CheckCircle2 : Clock,
      iconColor:   user?.isVerified ? "#22c55e" : "#f59e0b",
      iconBg:      user?.isVerified ? "rgba(34,197,94,0.12)"  : "rgba(245,158,11,0.12)",
      iconBorder:  user?.isVerified ? "rgba(34,197,94,0.22)"  : "rgba(245,158,11,0.22)",
      label:       "Account status",
      value:       user?.isVerified ? "Verified" : "Pending verification",
      note:        user?.isVerified ? "Your account is verified" : "Check your email to verify",
    },
  ];

  return (
    <div className="space-y-4">

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-surface-1 border border-[#1c1c1c] overflow-hidden">

        {/* Top accent bar */}
        <div
          className="h-[3px]"
          style={{ background: "linear-gradient(to right, transparent, #d97706 40%, #3b82f6 70%, transparent)" }}
        />

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <button
                onClick={handleAvatarClick}
                className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-white/20 focus:outline-none transition-all group"
                title="Change photo"
              >
                <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading
                    ? <Loader2 size={18} className="text-white animate-spin" />
                    : <>
                        <Camera size={16} className="text-white mb-0.5" />
                        <span className="text-white text-[9px] font-semibold tracking-wide">Change</span>
                      </>
                  }
                </div>
              </button>
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green rounded-full border-2 border-surface-1" />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mb-1.5">
                <h2 className="text-xl font-bold text-ink-primary tracking-tight truncate">
                  {user?.name}
                </h2>
                <span className={`inline-flex items-center gap-1.5 self-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${role.pill}`}>
                  <Shield size={10} />
                  {role.label}
                </span>
              </div>
              <p className="text-sm text-ink-tertiary mb-4">{user?.email}</p>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-surface-3 border border-[#333] text-ink-primary hover:bg-surface-4 transition-colors"
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black disabled:opacity-60 transition-opacity hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #fcd34d, #d97706)" }}
                  >
                    {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    Save changes
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-ink-secondary bg-surface-2 border border-[#282828] hover:bg-surface-3 transition-colors"
                  >
                    <X size={13} /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Edit fields */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-[#1c1c1c] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-tertiary mb-2">
                      Full name
                    </label>
                    <div className="relative">
                      <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-base pl-9"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-tertiary mb-2">
                      Phone number
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-base pl-9"
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

      {/* ── Info cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {INFO_CARDS.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 + i * 0.04 }}
            className="flex items-start gap-4 p-5 rounded-2xl bg-surface-1 border border-[#1c1c1c] hover:border-[#272727] transition-colors"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: card.iconBg, border: `1px solid ${card.iconBorder}` }}
            >
              <card.icon size={18} style={{ color: card.iconColor }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary mb-1">
                {card.label}
              </p>
              <p className="text-sm font-semibold text-ink-primary truncate">{card.value}</p>
              <p className="text-xs text-ink-tertiary mt-0.5">{card.note}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfileEditor;
