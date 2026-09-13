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
  DialogTrigger,
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
      const res = await api.get("/auth/get-all-request");

      setPending(res?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load requests. Please refresh and try again."
      );
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleString(undefined, options);
  };

  const approveRequest = async (id, action) => {
    setButtonLoading(true);

    toast.promise(
      api.post("/auth/approve-reject-req", {
        id,
        action,
      }),
      {
        loading: () =>
          action === "Reject" ? "Rejecting..." : "Approving...",

        success: (res) => {
          setPending((current) =>
            current.filter(
              (item) => item._id !== res?.data?.data?._id
            )
          );

          return res?.data?.message || "Action performed successfully";
        },

        error: (error) => {
          console.log(error);

          return (
            error?.response?.data?.message ||
            "Failed to perform action. Please try again"
          );
        },

        finally: () => setButtonLoading(false),
      }
    );
  };

  return loading ? (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 />
    </div>
  ) : (
    <div className="animate-fade-in-scale min-h-full px-4 py-6 opacity-0 transition-all duration-500 sm:px-6 md:px-10 lg:px-12 lg:py-8">
      {/* Header */}
      <div className="mb-7 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div className="min-w-0 space-y-2">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-gray-900">
            <Clock3
              className="shrink-0 text-orange-500"
              size={28}
            />

            <span>Pending Requests</span>

            <Badge variant="secondary">
              {pending?.length}{" "}
              {pending.length === 1 ? "Request" : "Requests"}
            </Badge>
          </h1>

          <p className="text-sm text-gray-500">
            Administrator access requests waiting for your decision.
          </p>
        </div>
      </div>

      {/* Empty State */}
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
        <div className="space-y-3">
          {pending.map((request, index) => {
            return (
              <div
                key={request._id}
                className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.025)] transition-all duration-300 hover:border-slate-300"
              >
                <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:p-6">
                  {/* Number */}
                  <div className="hidden w-7 shrink-0 text-center lg:block">
                    <span className="text-[11px] font-bold text-slate-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-slate-100 text-sm font-bold text-slate-600 sm:h-14 sm:w-14 sm:rounded-[18px]">
                        {getInitials(request.fullName)}
                      </div>

                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-orange-400">
                        <Clock3 className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="min-w-0 max-w-full truncate text-sm font-bold text-slate-900 sm:text-base">
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

                      <div className="mt-1.5 flex min-w-0 items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                        <p className="min-w-0 truncate text-xs text-slate-500">
                          {request.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Request Info */}
                  <div className="grid w-full grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 sm:gap-6 lg:w-auto lg:min-w-[300px] lg:grid-cols-2 lg:border-0 lg:pt-0">
                    {/* Requested */}
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Requested
                      </p>

                      <div className="mt-1 flex min-w-0 items-start gap-1.5">
                        <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                        <span className="min-w-0 break-words text-xs font-medium leading-5 text-slate-600">
                          {dateFormat(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </p>

                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />

                        <span className="text-xs font-medium text-slate-600">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex w-full items-center gap-2 lg:w-auto lg:shrink-0 lg:ml-2">
                    <button
                      disabled={buttonLoading}
                      onClick={() => {
                        setOpen(true);
                        setUserID(request?._id);
                      }}
                      className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 lg:flex-none"
                    >
                      <X className="h-4 w-4 shrink-0" />

                      <span>Reject</span>
                    </button>

                    <button
                      disabled={buttonLoading}
                      onClick={() =>
                        approveRequest(request?._id, "Approve")
                      }
                      className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 text-xs font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 lg:flex-none"
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

      {/* Bottom Info */}
      {pending.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2 px-4 text-center">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-slate-300" />

          <p className="text-[10px] font-medium leading-4 text-slate-400">
            Only approved users will receive administrator access.
          </p>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] rounded-2xl p-5 sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Reject Request
            </DialogTitle>

            <DialogDescription className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to reject this access request? This
              action cannot be undone and will permanently remove it from
              the pending list.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              disabled={buttonLoading}
              onClick={() => setOpen(false)}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              disabled={buttonLoading}
              onClick={() => {
                approveRequest(userID, "Reject");
                setOpen(false);
              }}
              className="w-full rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Confirm Reject
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
