import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Shield,
  Key,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Mail,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import ProfileEditor from "../components/common/ProfileEditor";
import { userService } from "../services/user.service";

const ROLE_LABEL: Record<string, string> = {
  User:   "Renter",
  lender: "Lender",
  admin:  "Admin",
};

const ROLE_COLOR: Record<string, string> = {
  User:   "text-blue-light bg-blue/10 border-blue/20",
  lender: "text-amber bg-amber/10 border-amber/20",
  admin:  "text-red bg-red/[0.12] border-red/25",
};

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
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-ink-tertiary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] py-12">
      <div className="container max-w-2xl">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">My Account</h1>
          <p className="text-sm text-ink-tertiary mt-1">
            Manage your profile and account settings
          </p>
        </div>

        {/* Identity bar */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-surface-1 border border-[#1c1c1c] mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Mail size={14} className="text-ink-tertiary flex-shrink-0" />
            <span className="text-sm text-ink-secondary truncate">{user.email}</span>
            {user.isVerified && (
              <CheckCircle size={13} className="text-green flex-shrink-0" />
            )}
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${ROLE_COLOR[user.role] ?? ROLE_COLOR["User"]}`}
          >
            {ROLE_LABEL[user.role] ?? user.role}
          </span>
        </div>

        {/* Profile editor */}
        <div className="mb-6">
          <ProfileEditor />
        </div>

        {/* Account security */}
        <div className="mb-6 p-6 rounded-2xl border border-[#1c1c1c] bg-surface-1">
          <div className="flex items-center gap-2.5 mb-5">
            <Shield size={16} className="text-blue-light" />
            <h2 className="font-semibold text-[15px] text-ink-primary">Account security</h2>
          </div>

          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full flex items-center justify-between py-3 px-3 -mx-1 rounded-xl hover:bg-surface-2 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-3 border border-[#282828] flex items-center justify-center">
                <Key size={14} className="text-ink-secondary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-ink-primary">Change password</p>
                <p className="text-xs text-ink-tertiary">Send a reset link to your email</p>
              </div>
            </div>
            <ChevronRight
              size={14}
              className="text-ink-tertiary group-hover:text-ink-secondary transition-colors"
            />
          </button>

          <div className="border-t border-[#1c1c1c] my-2" />

          <div className="flex items-center justify-between py-3 px-3 -mx-1 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-3 border border-[#282828] flex items-center justify-center">
                <Shield size={14} className="text-ink-secondary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-ink-primary">
                  Two-factor authentication
                </p>
                <p className="text-xs text-ink-tertiary">Coming soon</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-ink-tertiary border border-[#282828] rounded-full px-2 py-0.5 bg-surface-3">
              SOON
            </span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="p-6 rounded-2xl border border-red/20 bg-red/[0.03]">
          <div className="flex items-center gap-2.5 mb-3">
            <AlertTriangle size={16} className="text-red" />
            <h2 className="font-semibold text-[15px] text-red">Danger zone</h2>
          </div>

          <p className="text-sm text-ink-tertiary mb-5 leading-relaxed">
            Permanently delete your account and all associated data — bookings, reviews, and
            profile information. This action cannot be undone.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red border border-red/20 bg-red/[0.06] hover:bg-red/[0.12] transition-colors"
            >
              <Trash2 size={14} />
              Delete my account
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-red/[0.06] border border-red/20 space-y-3">
              <p className="text-sm font-semibold text-red">Are you absolutely sure?</p>
              <p className="text-xs text-ink-tertiary">
                All your trips, reviews, and data will be permanently removed from our servers.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red text-white hover:bg-red/80 transition-colors disabled:opacity-60"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  Yes, delete permanently
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
