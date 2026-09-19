import React, { useEffect, useMemo, useState } from "react";
import api from "@/axios/interceptor.js";
import { toast } from "sonner";
import Loader2 from "@/components/loaders/loader2";
import {
  Users as UsersIcon,
  Search,
  ShieldCheck,
  Shield,
  CalendarDays,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user: currUser } = useSelector((state) => state.auth);

  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const formatRole = (role) => {
    return role
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getAllUser = async () => {
    setLoading(true);
    try {
      const res = await api("/auth/get-all-user");
      setUsers(res?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to get user data. Please refresh and try again"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUser();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchText = search.toLowerCase().trim();
    if (!searchText) return users;
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText)
    );
  }, [users, search]);

  const dateFormat = (rawDate) => {
    if (!rawDate) return "N/A";
    const date = new Date(rawDate);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleString(undefined, options);
  };

  const handleRemove = () => {
    if (!selectedUser) return;
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user._id !== selectedUser._id)
    );
    setSelectedUser(null);
  };

  return loading ? (
    <div className="flex w-full h-full justify-center items-center">
      <Loader2 />
    </div>
  ) : (
    <div className="animate-fade-in-scale px-4 py-4 opacity-0 transition-all duration-500 sm:px-6 md:px-12 md:py-6">
      <div className="mb-7 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <UsersIcon className="text-orange-500" size={28} />
            Manage users
          </h1>
          <p className="text-sm text-gray-500">
            Manage the people who have access to your SaleSync account.
          </p>
        </div>
        <div className="relative w-full sm:w-[280px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Search users..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
          />
        </div>
      </div>
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="group relative flex min-h-[248px] flex-col overflow-visible rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_12px_35px_rgba(15,23,42,0.07)] sm:p-6"
            >
              <div className="absolute left-0 top-8 h-8 w-1 rounded-r-full bg-orange-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3.5">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white shadow-md shadow-orange-950/10">
                      {getInitials(user.fullName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <h2 className="truncate text-[15px] font-semibold tracking-tight text-slate-950">
                        {user.fullName}
                      </h2>
                      {user?._id === currUser?._id && (
                        <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-orange-600 ring-1 ring-inset ring-orange-200">
                          You
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-1 truncate text-xs text-slate-400"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
                {user.role !== "superadmin" && user?._id !== currUser?._id && (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(
                          openMenu === user._id ? null : user._id
                        );
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openMenu === user._id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-9 z-30 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.12)]"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenMenu(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Remove user
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="my-5 h-px bg-slate-100" />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${user.role === "superadmin"
                        ? "bg-orange-50 text-orange-500"
                        : "bg-slate-100 text-slate-500"
                      }`}
                  >
                    {user.role === "superadmin" ? (
                      <ShieldCheck size={18} />
                    ) : (
                      <Shield size={18} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Role
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {formatRole(user.role)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <CalendarDays size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Joined
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-700">
                      {dateFormat(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-5">
                {user.role === "superadmin" ? (
                  <div className="flex items-center gap-2.5 rounded-xl border border-orange-100 bg-orange-50/60 p-3">
                    <ShieldCheck
                      size={14}
                      className="shrink-0 text-orange-500"
                    />
                    <span className="text-[10px] font-semibold text-orange-700 leading-snug">
                      Superadmin account is protected
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3">
                    <Shield
                      size={14}
                      className="shrink-0 text-slate-400"
                    />
                    <span className="text-[10px] font-medium text-slate-500 leading-snug">
                      Standard administrator access
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[26px] border border-slate-200/80 bg-white px-5 py-16 text-center shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Search size={24} />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No users found
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Try searching with a different name or email.
          </p>
        </div>
      )}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-[26px] border border-slate-200 bg-white p-0 shadow-[0_25px_70px_rgba(15,23,42,0.20)] sm:rounded-[32px]">
          {/* Decorative Background Banner */}
          <div className="h-24 w-full bg-gradient-to-br from-red-100/60 via-slate-50 to-slate-100/50" />

          <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
            {/* Centered Overlapping Avatar */}
            <div className="-mt-10 mb-5 flex justify-center">
              <div className="relative rounded-2xl border-4 border-white bg-white shadow-sm">
                {selectedUser?.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.fullName}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-50 text-xl font-bold text-red-600">
                    {selectedUser ? getInitials(selectedUser.fullName) : "U"}
                  </div>
                )}

                {/* Small destructive badge */}
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-red-500 text-white shadow-sm">
                  <Trash2 size={12} strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center text-slate-950">
              <h2 className="text-lg font-bold tracking-tight">Remove Access?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-900">
                  {selectedUser?.fullName}
                </span>{" "}
                from SaleSync? They will no longer be able to log in or access data.
              </p>
              {selectedUser?.email && (
                <p className="mt-1 text-xs text-slate-400">
                  {selectedUser.email}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-[0.98]"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllUsers;