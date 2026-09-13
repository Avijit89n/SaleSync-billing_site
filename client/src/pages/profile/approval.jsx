import React, { useEffect, useState } from "react";
import {
  Clock3,
  Check,
  X,
  ShieldCheck,
  Mail,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/axios/interceptor.js";
import { toast } from "sonner";
import Loader2 from "@/components/loaders/loader2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PendingRequests() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [userID, setUserID] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase();
  };

  const getAllPendingRequest = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/get-all-request');
      setPending(res?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load requests. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPendingRequest();
  }, []);

  const dateFormat = (rawDate) => {
    if (!rawDate) return "N/A";
    const date = new Date(rawDate);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleString(undefined, options);
  };

  const approveRequest = async (id, action) => {
    setButtonLoading(true);
    try {
      await api.post('/auth/approve-reject-req', { id, action });
      setPending((current) => current.filter((item) => item._id !== id));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to perform action. Please try Again");
    } finally {
      setButtonLoading(false);
      setOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-scale min-h-full px-4 py-6 opacity-0 transition-all duration-500 sm:px-6 md:px-10 lg:px-12 lg:py-8">
      <div className="mb-7 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Clock3 className="text-orange-500" size={28} />
            Pending Requests
            <Badge variant="secondary">
              {pending?.length} {pending.length === 1 ? "Request" : "Requests"}
            </Badge>
          </h1>
          <p className="text-sm text-gray-500">
            Administrator access requests waiting for your decision.
          </p>
        </div>
      </div>

      {pending.length === 0 && !loading ? (
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[26px] border border-slate-200 bg-white px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-50">
            <Check className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="mt-5 text-lg font-bold text-slate-900">
            You're all caught up
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            There are currently no pending administrator access requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((request, index) => {
            return (
              <div
                key={request._id}
                className="group flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.025)] transition-all duration-300 hover:border-slate-300 xl:flex-row xl:items-center xl:p-6"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="hidden w-6 shrink-0 text-center xl:block">
                    <span className="text-[11px] font-bold text-slate-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="relative shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-slate-100 text-sm font-bold text-slate-600 sm:h-14 sm:w-14 sm:rounded-[18px]">
                      {getInitials(request.fullName)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-orange-400">
                      <Clock3 className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                        {request.fullName}
                      </h3>
                      {request.isVerified ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                          Verified
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                          Unverified
                        </span>
                      )}
                      <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-orange-600">
                        {request.role}
                      </span>
                    </div>
                    <div className="mt-1 flex min-w-0 items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <p className="truncate text-xs text-slate-500">
                        {request.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between xl:border-0 xl:pt-0">
                  <div className="flex items-center gap-5 sm:gap-6">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Requested
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate text-xs font-medium text-slate-600">
                          {dateFormat(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="hidden h-8 w-px shrink-0 bg-slate-100 sm:block" />

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                        <span className="truncate text-xs font-medium text-slate-600">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2 sm:mt-0 xl:ml-4">
                    <button
                      disabled={buttonLoading}
                      onClick={() => {
                        setOpen(true);
                        setUserID(request?._id);
                      }}
                      className="flex h-10 w-full min-w-[90px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-500 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-50 sm:w-auto xl:flex-none"
                    >
                      <X className="h-4 w-4 shrink-0" />
                      <span>Reject</span>
                    </button>
                    <button
                      disabled={buttonLoading}
                      onClick={() => approveRequest(request?._id, "Approve")}
                      className="flex h-10 w-full min-w-[100px] flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-xs font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 sm:w-auto xl:flex-none"
                    >
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pending.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2 text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-300" />
          <p className="text-[10px] font-medium text-slate-400">
            Only approved users will receive administrator access.
          </p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Reject Request
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-slate-500">
              Are you sure you want to reject this access request? This action cannot be undone and will permanently remove it from the pending list.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={() => setOpen(false)}
              disabled={buttonLoading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => approveRequest(userID, "Reject")}
              disabled={buttonLoading}
              className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:pointer-events-none disabled:opacity-70"
            >
              Confirm Reject
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}