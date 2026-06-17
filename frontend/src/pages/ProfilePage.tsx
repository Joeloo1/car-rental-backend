import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Shield,
  Key,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Loader2,
} from "@/lib/icons";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import ProfileEditor from "../components/common/ProfileEditor";
import { userService } from "../services/user.service";


const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-ink-tertiary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: 'var(--color-bg)' }}>
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

        {/* Account security */}
        <div className="mb-5 rounded-2xl border border-[#1c1c1c] overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
          <div className="px-5 py-4 border-b border-[#1c1c1c] flex items-center gap-2">
            <Shield size={13} className="text-ink-tertiary" />
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-tertiary">Security</span>
          </div>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(212,151,42,0.10)', border: '1px solid rgba(212,151,42,0.18)' }}>
                <Key size={13} className="text-gold" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-ink-primary">Change password</p>
                <p className="text-xs text-ink-tertiary mt-0.5">Send a reset link to your email</p>
              </div>
            </div>
            <ChevronRight size={13} className="text-ink-tertiary group-hover:text-ink-secondary transition-colors" />
          </button>

          <div className="border-t border-[#1c1c1c]" />

          <div className="flex items-center justify-between px-5 py-3.5 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(74,142,232,0.10)', border: '1px solid rgba(74,142,232,0.18)' }}>
                <Shield size={13} className="text-teal" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-ink-primary">Two-factor authentication</p>
                <p className="text-xs text-ink-tertiary mt-0.5">Add an extra layer of security</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-ink-tertiary border border-[#282828] rounded-full px-2 py-0.5"
              style={{ background: 'var(--color-surface-3)' }}>
              SOON
            </span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red/15 overflow-hidden" style={{ background: 'rgba(255,77,77,0.02)' }}>
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
                    style={{ background: 'var(--color-surface-3)' }}
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
