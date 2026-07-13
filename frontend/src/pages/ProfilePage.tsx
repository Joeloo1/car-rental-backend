import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Shield,
  Key,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Loader2,
  Eye,
  EyeOff,
  Check,
  Star,
} from "@/lib/icons";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import ProfileEditor from "../components/common/ProfileEditor";
import { userService } from "../services/user.service";

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-ink-tertiary mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-field w-full pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary transition-colors"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const { data: reviewsData } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: () => userService.getMyReviews(1, 10),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, isLoading, navigate]);

  const deleteMutation = useMutation({
    mutationFn: userService.deleteAccount,
    onSuccess: async () => {
      await logout();
      toast.success("Account deleted.");
      navigate("/");
    },
    onError: () => toast.error("Failed to delete account. Please try again."),
  });

  const passwordMutation = useMutation({
    mutationFn: () => userService.changePassword(currentPw, newPw),
    onSuccess: () => {
      toast.success("Password updated. Please sign in again.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwOpen(false);
      setTimeout(() => logout(), 1500);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to update password.");
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) { toast.error("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { toast.error("Passwords do not match."); return; }
    passwordMutation.mutate();
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-ink-tertiary" />
      </div>
    );
  }

  const isOAuth = !!user.provider;

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: "var(--color-bg)" }}>
      <div className="container max-w-2xl">

        {/* Page header */}
        <div className="mb-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary mb-1">Settings</p>
          <h1 className="font-heading text-2xl font-bold text-ink-primary tracking-tight">My Account</h1>
        </div>

        {/* Profile editor */}
        <div className="mb-5">
          <ProfileEditor />
        </div>

        {/* My Reviews */}
        {reviewsData?.data && reviewsData.data.length > 0 && (
          <div className="mb-5 rounded-2xl border border-[#1c1c1c] overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
            <div className="px-5 py-4 border-b border-[#1c1c1c] flex items-center gap-2">
              <Star size={13} className="text-gold" />
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-tertiary">My Reviews</span>
              <span className="ml-auto text-xs text-ink-tertiary">{reviewsData.pagination?.total ?? reviewsData.data.length} total</span>
            </div>
            <div className="divide-y divide-[#1c1c1c]">
              {reviewsData.data.map((review: any) => (
                <div key={review.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Link
                      to={`/cars/${review.car?.id}`}
                      className="text-sm font-medium text-ink-primary hover:text-gold transition-colors line-clamp-1"
                    >
                      {review.car?.title ?? "Car listing"}
                    </Link>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={11}
                          className={s <= review.rating ? "text-gold fill-gold" : "text-ink-tertiary/30"}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-ink-tertiary leading-relaxed line-clamp-2">{review.comment}</p>
                  )}
                  <p className="text-[10px] text-ink-tertiary/60 mt-1.5">
                    {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
            {reviewsData.pagination?.totalPages > 1 && (
              <div className="px-5 py-3 border-t border-[#1c1c1c]">
                <p className="text-xs text-ink-tertiary">Showing 10 of {reviewsData.pagination.total} reviews</p>
              </div>
            )}
          </div>
        )}

        {/* Security */}
        <div className="mb-5 rounded-2xl border border-[#1c1c1c] overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
          <div className="px-5 py-4 border-b border-[#1c1c1c] flex items-center gap-2">
            <Shield size={13} className="text-ink-tertiary" />
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-tertiary">Security</span>
          </div>

          {/* Change password row */}
          {isOAuth ? (
            <div className="flex items-center justify-between px-5 py-3.5 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(212,151,42,0.10)", border: "1px solid rgba(212,151,42,0.18)" }}>
                  <Key size={13} className="text-gold" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-ink-primary">Change password</p>
                  <p className="text-xs text-ink-tertiary mt-0.5">Not available for social sign-in accounts</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setPwOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(212,151,42,0.10)", border: "1px solid rgba(212,151,42,0.18)" }}>
                    <Key size={13} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-ink-primary">Change password</p>
                    <p className="text-xs text-ink-tertiary mt-0.5">Update your account password</p>
                  </div>
                </div>
                <ChevronDown size={13} className={`text-ink-tertiary transition-transform duration-200 ${pwOpen ? "rotate-180" : ""}`} />
              </button>

              {pwOpen && (
                <div className="px-5 pb-5 border-t border-[#1c1c1c]">
                  <form onSubmit={handlePasswordSubmit} className="pt-4 space-y-3">
                    <PasswordField
                      label="Current password"
                      value={currentPw}
                      onChange={setCurrentPw}
                      placeholder="Enter current password"
                    />
                    <PasswordField
                      label="New password"
                      value={newPw}
                      onChange={setNewPw}
                      placeholder="At least 8 characters"
                    />
                    <PasswordField
                      label="Confirm new password"
                      value={confirmPw}
                      onChange={setConfirmPw}
                      placeholder="Repeat new password"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={passwordMutation.isPending || !currentPw || !newPw || !confirmPw}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #D4972A, #B8791E)" }}
                      >
                        {passwordMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        Update password
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPwOpen(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-ink-secondary border border-[#282828] hover:text-ink-primary transition-colors"
                        style={{ background: "var(--color-surface-3)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-[#1c1c1c]" />

          {/* 2FA — coming soon */}
          <div className="flex items-center justify-between px-5 py-3.5 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(74,142,232,0.10)", border: "1px solid rgba(74,142,232,0.18)" }}>
                <Shield size={13} className="text-teal" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-ink-primary">Two-factor authentication</p>
                <p className="text-xs text-ink-tertiary mt-0.5">Add an extra layer of security</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-ink-tertiary border border-[#282828] rounded-full px-2 py-0.5"
              style={{ background: "var(--color-surface-3)" }}>
              SOON
            </span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red/15 overflow-hidden" style={{ background: "rgba(255,77,77,0.02)" }}>
          <div className="px-5 py-4 border-b border-red/10 flex items-center gap-2">
            <AlertTriangle size={13} className="text-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-red/80">Danger zone</span>
          </div>

          <div className="px-5 py-4">
            <p className="text-sm text-ink-tertiary mb-4 leading-relaxed">
              Permanently delete your account and all associated data — bookings, reviews, and profile information. This action cannot be undone.
            </p>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red border border-red/20 bg-red/[0.06] hover:bg-red/[0.12] transition-colors"
              >
                <Trash2 size={13} />
                Delete my account
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-red/[0.06] border border-red/20 space-y-3">
                <p className="text-sm font-semibold text-red">Are you absolutely sure?</p>
                <p className="text-xs text-ink-tertiary leading-relaxed">
                  All your trips, reviews, and data will be permanently removed. There is no going back.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red text-white hover:bg-red/80 transition-colors disabled:opacity-60"
                  >
                    {deleteMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    Yes, delete permanently
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-ink-secondary border border-[#282828] hover:text-ink-primary transition-colors"
                    style={{ background: "var(--color-surface-3)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
