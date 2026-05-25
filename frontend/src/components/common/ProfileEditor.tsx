import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, Edit3, Mail, Phone, Shield, Loader2, User as UserIcon, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/user.service";

interface ProfileEditorProps {
  /** Dark mode uses #0a0a0b palette; light mode uses CSS vars */
  theme?: "dark" | "system";
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ theme = "dark" }) => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-[#111115] border-white/8" : "bg-card border-border";
  const inputBg = isDark ? "bg-white/[0.04] border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:bg-white/[0.06]" : "bg-muted/50 border-border text-foreground placeholder-muted-foreground focus:border-primary/50";
  const labelColor = isDark ? "text-gray-400" : "text-muted-foreground";
  const headingColor = isDark ? "text-white" : "text-foreground";
  const subheadingColor = isDark ? "text-gray-500" : "text-muted-foreground";

  const handleAvatarClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }

    // Optimistic preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      const updated = await userService.updateProfile(formData);
      updateUser({ profileImage: updated.profileImage });
      toast.success("Profile photo updated");
    } catch {
      setAvatarPreview(null);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
      // Reset so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({ name: name.trim(), phoneNumber: phone.trim() || undefined });
      updateUser({ name: updated.name, phoneNumber: updated.phoneNumber });
      toast.success("Profile updated");
      setIsEditing(false);
    } catch {
      // Error toast is shown by axios interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setPhone(user?.phoneNumber || "");
    setIsEditing(false);
  };

  const avatarSrc = avatarPreview || user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=3b82f6&color=fff&size=200`;

  const roleLabel =
    user?.role === "lender" ? "Verified Host" :
    user?.role === "admin" ? "Platform Admin" :
    "Premium Member";

  const roleColor =
    user?.role === "lender" ? "bg-purple-500/15 text-purple-400 border-purple-500/20" :
    user?.role === "admin" ? "bg-red-500/15 text-red-400 border-red-500/20" :
    "bg-blue-500/15 text-blue-400 border-blue-500/20";

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border p-8 ${cardBg}`}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0 group">
            <div
              onClick={handleAvatarClick}
              className="relative w-28 h-28 rounded-3xl overflow-hidden cursor-pointer ring-2 ring-blue-500/30 hover:ring-blue-500/60 transition-all duration-300 shadow-xl"
            >
              <img
                src={avatarSrc}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {isUploading ? (
                  <Loader2 size={22} className="text-white animate-spin" />
                ) : (
                  <>
                    <Camera size={20} className="text-white mb-1" />
                    <span className="text-white text-[10px] font-semibold tracking-wide">Change</span>
                  </>
                )}
              </div>
            </div>
            {/* Online dot */}
            <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111115] shadow" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name / role / edit button */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <h2 className={`text-2xl font-display font-bold truncate ${headingColor}`}>
                {user?.name}
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border self-center sm:self-auto ${roleColor}`}>
                <Shield size={11} />
                {roleLabel}
              </span>
            </div>
            <p className={`text-sm ${subheadingColor} mb-5`}>{user?.email}</p>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-semibold hover:bg-blue-500/20 transition-all"
              >
                <Edit3 size={14} />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-60"
                >
                  <X size={14} />
                  Cancel
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
              <div className={`mt-8 pt-8 border-t ${isDark ? "border-white/8" : "border-border"} grid grid-cols-1 sm:grid-cols-2 gap-5`}>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-muted-foreground"}`} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${inputBg}`}
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-muted-foreground"}`} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${inputBg}`}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Info grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {[
          {
            icon: Mail,
            label: "Email Address",
            value: user?.email || "—",
            color: "text-blue-400",
            bg: isDark ? "bg-blue-400/10" : "bg-blue-50 dark:bg-blue-400/10",
            note: "Contact support to change email",
          },
          {
            icon: Phone,
            label: "Phone Number",
            value: user?.phoneNumber || "Not provided",
            color: "text-purple-400",
            bg: isDark ? "bg-purple-400/10" : "bg-purple-50 dark:bg-purple-400/10",
            note: isEditing ? "Editable above" : "Click Edit Profile to update",
          },
          {
            icon: UserIcon,
            label: "Account Role",
            value: user?.role === "lender" ? "Car Host" : user?.role === "admin" ? "Administrator" : "Car Renter",
            color: "text-emerald-400",
            bg: isDark ? "bg-emerald-400/10" : "bg-emerald-50 dark:bg-emerald-400/10",
            note: "Contact support to change role",
          },
          {
            icon: Shield,
            label: "Account Status",
            value: user?.isVerified ? "Verified" : "Pending Verification",
            color: user?.isVerified ? "text-emerald-400" : "text-yellow-400",
            bg: user?.isVerified
              ? isDark ? "bg-emerald-400/10" : "bg-emerald-50"
              : isDark ? "bg-yellow-400/10" : "bg-yellow-50",
            note: user?.isVerified ? "Your account is verified" : "Check your email to verify",
          },
        ].map((field, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 + i * 0.04 }}
            className={`p-5 rounded-2xl border flex items-start gap-4 ${cardBg}`}
          >
            <div className={`w-11 h-11 rounded-xl ${field.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <field.icon size={20} className={field.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${subheadingColor}`}>
                {field.label}
              </p>
              <p className={`text-sm font-semibold truncate ${headingColor}`}>{field.value}</p>
              <p className={`text-[10px] mt-0.5 ${subheadingColor}`}>{field.note}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ProfileEditor;
