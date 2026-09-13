import React, { useState } from "react";
import {
  UserRound,
  Mail,
  LockKeyhole,
  ShieldCheck,
  Pencil,
  Check,
  X,
  Eye,
  EyeOff,
  CalendarDays,
  User,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function Account() {
  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };
  const dateFormat = (rawDate) => {
    const date = new Date(rawDate);

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleString(undefined, options)
  }

  const { user } = useSelector((state) => state.auth)
  return (
    <div className="animate-fade-in-scale px-4 py-4 opacity-0 transition-all duration-500 sm:px-6 md:px-12 md:py-6">
      <div className="mb-7 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <User className="text-orange-500" size={28} />
            Your profile
          </h1>
          <p className="text-sm text-gray-500">
            Manage your personal information and account security.
          </p>
        </div>
      </div>

      {/* PROFILE HERO */}
      <div className="relative mb-8 overflow-hidden rounded-[28px] bg-[#1b202b] shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-orange-500/[0.13] blur-3xl" />
        <div className="absolute -bottom-36 left-[38%] h-80 w-80 rounded-full bg-orange-400/[0.07] blur-3xl" />
        <div className="relative px-7 py-7 lg:px-9 lg:py-8">
          <div className="flex flex-col gap-7 md:flex-row md:items-center">

            {/* AVATAR */}
            <div className="relative">
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[26px] bg-gradient-to-br from-orange-400 to-orange-600 text-[26px] font-bold text-white shadow-lg shadow-orange-950/20">
                {getInitials(user.fullName)}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-[#1b202b] bg-emerald-500">
                <Check className="h-3 w-3 text-white" />
              </span>
            </div>

            {/* IDENTITY INFO */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[24px] font-semibold tracking-[-0.025em] text-white">
                  {user.fullName.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}
                </h2>
                <span className="rounded-full bg-orange-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-300 ring-1 ring-inset ring-orange-400/20">
                  {user.role}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-slate-400">{user.email}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                  Joined {dateFormat(user.createdAt)}
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  {user.isVerified ? "Verified account" : "Verification required"}
                </span>
              </div>
            </div>

            {/* ACTIVE STATUS */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] px-5 py-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Account status
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-200">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">

        {/* LEFT COLUMN: EDITABLE SETTINGS */}
        <main className="space-y-7">

          {/* PERSONAL INFORMATION */}
          <section className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.035)] lg:p-7">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Profile
                </div>
                <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">
                  Personal information
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Update the information associated with your account.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">

              {/* NAME FIELD */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-orange-50 group-hover:text-orange-500">
                    <UserRound className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-400">Full name</p>
                    <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
                  </div>
                </div>
              </div>

              {/* EMAIL FIELD */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-orange-50 group-hover:text-orange-500">
                    <Mail className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-slate-400">Email address</p>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* ROLE BANNER */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 md:col-span-2">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <ShieldCheck className="h-[19px] w-[19px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">Account role</p>
                    <p className="mt-1 text-xs text-slate-400">Your permission level within the POS system.</p>
                  </div>
                  <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
                    {user.role.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* PASSWORD & SECURITY */}
          <section className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.035)] lg:p-7">
            <div className="mb-7">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Security
              </div>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">Password & security</h2>
              <p className="mt-1 text-xs text-slate-400">Keep your account protected with a strong password.</p>
            </div>

            <div className="flex flex-col gap-5 rounded-2xl bg-slate-50/70 p-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-orange-400">
                <LockKeyhole className="h-[19px] w-[19px]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900">Password</h3>
                <p className="mt-1 text-xs text-slate-400">Your password is securely protected.</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600"> Password protected</div>
              </div>
              <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-500">
                <LockKeyhole className="h-3.5 w-3.5" /> Change password
              </button>
            </div>
          </section>
        </main>

        {/* RIGHT COLUMN: SIDEBAR */}
        <aside className="space-y-6">

          {/* ACCOUNT SUMMARY */}
          <div className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-500">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Overview
              </div>
              <h3 className="mt-1.5 text-base font-semibold text-slate-950">Account details</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">Status</span>
                <span className="text-right text-xs font-semibold text-emerald-600">Active</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">Role</span>
                <span className="text-right text-xs font-semibold text-slate-700">{user.role.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">Email</span>
                <span className={`text-right text-xs font-semibold ${user.isVerified ? "text-emerald-600" : "text-slate-700"}`}>
                  {user.isVerified ? "Verified" : "Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">Member since</span>
                <span className="text-right text-xs font-semibold text-slate-700">{dateFormat(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* SECURITY CARD SUMMARY */}
          <div className="relative overflow-hidden rounded-[26px] bg-[#1b202b] p-6 text-white">
            <div className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-orange-500/10 blur-2xl" />
            <div className="relative">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">Account security</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">Your account is protected with password-based authentication.</p>
              <div className="mt-5 flex items-center gap-2 border-t border-white/[0.08] pt-4">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-400">Password protected</span>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>

  );
}