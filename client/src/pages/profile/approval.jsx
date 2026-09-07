import { useEffect, useMemo, useState } from "react"
import api from "@/axios/interceptor.js"
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

const formatRole = (role) =>
  role === "superadmin" ? "Superadmin" : "Administrator"

const formatDate = (value) => {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

const normalizeUser = (user) => {
  if (!user) return null

  return {
    ...user,
    id: user._id || user.id,
    createdAt: formatDate(user.createdAt),
  }
}

export default function Account() {
  const [activeSection, setActiveSection] = useState("overview")
  const [users, setUsers] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [accountStats, setAccountStats] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  const isSuperadmin = currentUser?.role === "superadmin"

  const loadAccountData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [meRes, usersRes, pendingRes, statsRes] = await Promise.all([
        api.get("/auth/account/me"),
        api.get("/auth/account/users"),
        api.get("/auth/account/approval/pending"),
        api.get("/auth/account/stats"),
      ])

      const me = meRes.data?.data?.user || meRes.data?.user
      const accountUsers = usersRes.data?.data?.users || usersRes.data?.users || []
      const pending = pendingRes.data?.data?.users || pendingRes.data?.users || []
      const stats = statsRes.data?.data?.stats || statsRes.data?.stats || null

      setCurrentUser(normalizeUser(me))
      setUsers(accountUsers.map(normalizeUser))
      setPendingUsers(pending.map(normalizeUser))
      setAccountStats(stats)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load account information"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccountData()
  }, [])

  const admins = useMemo(
    () => users.filter((user) => user.role === "admin" && user.approvalStatus === "approved"),
    [users]
  )

  const superadmin = useMemo(
    () => users.find((user) => user.role === "superadmin"),
    [users]
  )

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return admins

    return admins.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    )
  }, [admins, search])

  const approveUser = async (id) => {
    try {
      setActionLoading(true)
      setError(null)

      await api.patch(`/auth/account/approval/${id}/approve`)

      setSelectedUser(null)
      await loadAccountData()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to approve administrator"
      )
    } finally {
      setActionLoading(false)
    }
  }

  const rejectUser = async (id) => {
    try {
      setActionLoading(true)
      setError(null)

      await api.patch(`/auth/account/approval/${id}/reject`)

      setSelectedUser(null)
      await loadAccountData()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to reject administrator"
      )
    } finally {
      setActionLoading(false)
    }
  }

  const deleteUser = async (id) => {
    try {
      setActionLoading(true)
      setError(null)

      await api.delete(`/auth/account/users/${id}`)

      setSelectedUser(null)
      await loadAccountData()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete administrator"
      )
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
          <p className="mt-3 text-xs font-semibold text-slate-400">
            Loading account...
          </p>
        </div>
      </div>
    )
  }

  if (error && !currentUser) {
    return (
      <div className="px-4 py-6 sm:px-6 md:px-12">
        <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm font-bold text-red-700">Unable to load account</p>
          <p className="mt-2 text-xs text-red-500">{error}</p>
          <Button
            onClick={loadAccountData}
            className="mt-4 h-9 rounded-lg bg-orange-500 text-xs font-bold text-white shadow-none hover:bg-orange-600"
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-scale px-4 py-4 opacity-0 transition-all duration-500 sm:px-6 md:px-12 md:py-6">
      {/* TOP BAR */}
      <div className="mb-7 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Users className="text-orange-500" size={28} />
            Account & workspace
          </h1>
          <p className="text-sm text-gray-500">
            Manage your profile, security and administrator access.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border-2 border-red-100 bg-red-50 px-4 py-3">
          <p className="text-xs font-semibold text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* PROFILE HERO */}
      <div className="mb-5 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
        <div className="grid lg:grid-cols-[1fr_330px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="flex h-[76px] w-[76px] items-center justify-center rounded-2xl bg-orange-100 text-xl font-bold text-orange-600">
                  {getInitials(currentUser?.fullName)}
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-950">
                    {currentUser?.fullName || "User"}
                  </h2>
                  <span
                    className={`rounded-md px-2 py-1 text-[8px] font-bold uppercase tracking-wide ${
                      isSuperadmin
                        ? "bg-slate-900 text-white"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {formatRole(currentUser?.role)}
                  </span>
                  {currentUser?.isVerified && (
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-emerald-600">
                      Verified
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {currentUser?.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Joined {currentUser?.createdAt}
                  </span>
                </div>

                <p className="mt-3 max-w-xl text-xs leading-5 text-slate-500">
                  {isSuperadmin
                    ? "You have full workspace administration access. All administrator accounts and access requests can be managed from this account."
                    : "You have administrator access to the workspace. You can manage your account and view other administrator accounts."}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-slate-100 bg-slate-50/70 p-5 lg:border-l-2 lg:border-t-0">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Access level
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-bold text-slate-900">
                    Full administrator access
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                <div>
                  <p className="text-[9px] uppercase text-slate-400">Account status</p>
                  <p className="mt-1 text-xs font-bold text-slate-700">
                    {currentUser?.approvalStatus === "approved" ? "Approved" : currentUser?.approvalStatus}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="mb-5 overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
        <div className="flex min-w-max">
          <AccountTab
            active={activeSection === "overview"}
            icon={UserRound}
            label="Overview"
            onClick={() => setActiveSection("overview")}
          />
          <AccountTab
            active={activeSection === "approval"}
            icon={UserCheck}
            label="Approval"
            count={pendingUsers.length}
            onClick={() => setActiveSection("approval")}
          />
          <AccountTab
            active={activeSection === "security"}
            icon={ShieldCheck}
            label="Security"
            onClick={() => setActiveSection("security")}
          />
        </div>
      </div>

      {/* SECTIONS */}
      {activeSection === "overview" && (
        <Overview
          users={users}
          pendingUsers={pendingUsers}
          admins={admins}
          superadmin={superadmin}
          isSuperadmin={isSuperadmin}
          accountStats={accountStats}
          setActiveSection={setActiveSection}
          setSelectedUser={setSelectedUser}
          deleteUser={deleteUser}
          actionLoading={actionLoading}
        />
      )}

      {activeSection === "approval" && (
        <Approval
          pendingUsers={pendingUsers}
          admins={admins}
          filteredAdmins={filteredAdmins}
          search={search}
          setSearch={setSearch}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          approveUser={approveUser}
          rejectUser={rejectUser}
          isSuperadmin={isSuperadmin}
          actionLoading={actionLoading}
          deleteUser={deleteUser}
        />
      )}

      {activeSection === "security" && <Security currentUser={currentUser} />}
    </div>
  )
}

/* =========================================================
   OVERVIEW SECTION
========================================================= */

function Overview({
  users,
  pendingUsers,
  admins,
  superadmin,
  isSuperadmin,
  setActiveSection,
  setSelectedUser,
  deleteUser,
  actionLoading,
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
      <div className="space-y-5">
        {/* QUICK METRICS */}
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            icon={Users}
            label="Total members"
            value={isSuperadmin ? users.length : admins.length}
            description={
              isSuperadmin
                ? "People in workspace"
                : "Visible administrator accounts"
            }
          />
          <MetricCard
            icon={UserCheck}
            label="Administrators"
            value={admins.length}
            description="Approved admin accounts"
          />
          <MetricCard
            icon={Clock3}
            label="Pending approval"
            value={pendingUsers.length}
            description={
              pendingUsers.length ? "Requires your attention" : "Nothing waiting"
            }
            orange={pendingUsers.length > 0}
          />
        </div>

        {/* APPROVAL PREVIEW */}
        <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b-2 border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-orange-500">
                Workspace access
              </p>
              <h2 className="mt-1 text-base font-bold text-slate-900">
                Approval queue
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Review new administrator access requests.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setActiveSection("approval")}
              className="h-9 rounded-lg border-slate-200 text-xs font-bold shadow-none"
            >
              View all
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>

          {pendingUsers.length ? (
            <div className="divide-y divide-slate-100">
              {pendingUsers.slice(0, 3).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(user)
                    setActiveSection("approval")
                  }}
                  className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50"
                >
                  <Avatar user={user} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {user.fullName}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {user.email}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-[9px] font-bold uppercase text-orange-500">
                      Pending
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {user.createdAt}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* CURRENT ADMINS */}
        <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
          <div className="border-b-2 border-slate-100 p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              People
            </p>
            <h2 className="mt-1 text-base font-bold text-slate-900">
              Current administrators
            </h2>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {admins.slice(0, 4).map((user) => (
              <AdminPreview key={user.id} user={user} />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-5">
        {/* PROTECTED ACCOUNT (SUPERADMIN ONLY) */}
        {isSuperadmin && superadmin && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Protected account
              </p>
              <LockKeyhole className="h-4 w-4 text-slate-400" />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                {getInitials(superadmin.fullName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">
                  {superadmin.fullName}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {superadmin.email}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border-2 border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-600" />
                <p className="text-xs font-bold text-slate-700">
                  Superadmin protection
                </p>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-slate-400">
                This account has permanent administrative authority and cannot
                be removed by another administrator.
              </p>
            </div>
          </div>
        )}

        {/* ACCOUNT HEALTH */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-orange-500">
                Account health
              </p>
              <h3 className="mt-1 text-base font-bold text-slate-900">
                Everything looks good
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <HealthRow label="Email verification" status="Verified" />
            <HealthRow label="Workspace access" status="Approved" />
            <HealthRow label="Administrator access" status="Active" />
            <HealthRow label="Account security" status="Protected" />
          </div>
        </div>

        {/* LAST ACTIVITY */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Recent activity
            </h3>
          </div>

          <div className="mt-5 space-y-4">
            <SmallActivity title="Account accessed" time="Just now" />
            <SmallActivity title="Workspace checked" time="18 min ago" />
            <SmallActivity title="Admin activity reviewed" time="1 hr ago" />
          </div>

          <button
            type="button"
            className="mt-5 flex w-full items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-500 hover:text-orange-500"
          >
            View activity
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   APPROVAL SECTION
========================================================= */

function Approval({
  pendingUsers,
  admins,
  filteredAdmins,
  search,
  setSearch,
  selectedUser,
  setSelectedUser,
  approveUser,
  rejectUser,
  isSuperadmin,
  actionLoading,
  deleteUser,
}) {
  return (
    <div className="space-y-5">
      {/* APPROVAL HEADER */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-orange-500">
                  Access management
                </p>
                <h2 className="text-lg font-bold text-slate-900">
                  Administrator approval
                </h2>
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-500">
              Verified users appear here when they request administrator
              access. Approve trusted users to give them access to the
              workspace.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                Waiting
              </p>
              <p className="mt-0.5 text-xl font-bold text-orange-500">
                {pendingUsers.length}
              </p>
            </div>
            <div className="rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                Active admins
              </p>
              <p className="mt-0.5 text-xl font-bold text-slate-900">
                {admins.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REQUEST QUEUE */}
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b-2 border-slate-100 p-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pending requests
              </h3>
              <p className="mt-1 text-[10px] text-slate-400">
                Review each verified administrator request.
              </p>
            </div>
            {pendingUsers.length > 0 && (
              <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wide text-white">
                {pendingUsers.length} waiting
              </span>
            )}
          </div>

          {pendingUsers.length ? (
            <div className="divide-y divide-slate-100">
              {pendingUsers.map((user) => (
                <RequestRow
                  key={user.id}
                  user={user}
                  selected={selectedUser?.id === user.id}
                  onSelect={() => setSelectedUser(user)}
                  approveUser={approveUser}
                  rejectUser={rejectUser}
                  isSuperadmin={isSuperadmin}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          ) : (
            <div className="p-10">
              <EmptyState />
            </div>
          )}
        </div>

        {/* REVIEW PANEL */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white">
          <div className="border-b-2 border-slate-100 p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Review
            </p>
            <h3 className="mt-1 text-sm font-bold text-slate-900">
              Request details
            </h3>
          </div>

          {selectedUser ? (
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Avatar user={selectedUser} large />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {selectedUser.fullName}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <ReviewRow label="Email verification" value="Verified" green />
                <ReviewRow label="Requested role" value="Administrator" />
                <ReviewRow label="Requested" value={selectedUser.createdAt} />
                <ReviewRow label="Status" value="Pending" orange />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => rejectUser(selectedUser.id)}
                    className="h-10 rounded-lg border-slate-200 text-xs font-bold shadow-none hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => approveUser(selectedUser.id)}
                    className="h-10 rounded-lg bg-orange-500 text-xs font-bold text-white shadow-none hover:bg-orange-600"
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              <div className="mt-3 rounded-xl border-2 border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">
                      Approval permissions
                    </p>
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-slate-400">
                    Administrators and the Superadmin can approve or reject verified administrator requests.
                  </p>
                </div>
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-700">
                Select a request
              </p>
              <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-400">
                Select an administrator request to review its details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CURRENT PEOPLE */}
      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b-2 border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace members
            </p>
            <h3 className="mt-1 text-sm font-bold text-slate-900">
              Administrator accounts
            </h3>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search administrators..."
              className="h-9 rounded-lg border-2 border-slate-200 bg-white pl-8 text-xs shadow-none focus-visible:border-orange-400 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAdmins.map((user) => (
            <MemberRow
              key={user.id}
              user={user}
              onClick={() => setSelectedUser(user)}
              deleteUser={deleteUser}
              actionLoading={actionLoading}
            />
          ))}

          {filteredAdmins.length === 0 && (
            <div className="p-8">
              <EmptyMembersState />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   SECURITY SECTION
========================================================= */

function Security() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
      <div className="rounded-2xl border-2 border-slate-200 bg-white">
        <div className="border-b-2 border-slate-100 p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-orange-500">
            Security
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Account protection
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Authentication and account security information.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          <SecurityRow
            icon={LockKeyhole}
            title="Password"
            description="Your password is securely stored."
            action="Change password"
          />
          <SecurityRow
            icon={Mail}
            title="Email verification"
            description="Your account email has been verified."
            verified
          />
          <SecurityRow
            icon={ShieldCheck}
            title="Administrator permissions"
            description="Your account has full workspace permissions."
            verified
          />
        </div>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="mt-5 text-base font-bold text-slate-900">
          Your account is protected
        </h3>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Your email is verified and your account currently has approved
          administrator access.
        </p>

        <div className="mt-5 rounded-xl border-2 border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Account status</span>
            <span className="text-xs font-bold text-emerald-600">Secure</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   ACTIVITY PAGE
========================================================= */

function ActivityPage() {
  const activities = [
    {
      title: "Account accessed",
      description: "Your account was accessed successfully.",
      time: "Just now",
    },
    {
      title: "Workspace activity reviewed",
      description: "Administrator activity was checked.",
      time: "18 min ago",
    },
    {
      title: "Admin account approved",
      description: "An administrator access request was approved.",
      time: "1 hr ago",
    },
    {
      title: "Account security checked",
      description: "Security information was accessed.",
      time: "Yesterday",
    },
  ]

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white">
      <div className="border-b-2 border-slate-100 p-5 sm:p-6">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-orange-500">
          Activity
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">
          Account activity
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Recent events associated with your account.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Activity className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">
                {activity.title}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {activity.description}
              </p>
            </div>
            <span className="hidden shrink-0 text-[10px] font-medium text-slate-400 sm:block">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function AccountTab({ active, icon: Icon, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 border-b-[3px] px-5 py-3.5 text-xs font-bold transition ${
        active
          ? "border-orange-500 text-orange-600"
          : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      {count > 0 && (
        <span
          className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] ${
            active
              ? "bg-orange-500 text-white"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function MetricCard({ icon: Icon, label, value, description, orange }) {
  return (
    <div
      className={`rounded-2xl border-2 p-4 ${
        orange ? "border-orange-200 bg-orange-50/40" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            orange ? "bg-orange-100 text-orange-500" : "bg-slate-100 text-slate-500"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span
          className={`text-2xl font-bold ${
            orange ? "text-orange-500" : "text-slate-900"
          }`}
        >
          {value}
        </span>
      </div>
      <p className="mt-4 text-xs font-bold text-slate-800">{label}</p>
      <p className="mt-1 text-[10px] text-slate-400">{description}</p>
    </div>
  )
}

function Avatar({ user, large }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-600 ${
        large ? "h-12 w-12 text-sm" : "h-10 w-10 text-[10px]"
      }`}
    >
      {getInitials(user?.fullName)}
    </div>
  )
}

function RequestRow({
  user,
  selected,
  onSelect,
  approveUser,
  rejectUser,
  isSuperadmin,
  actionLoading,
}) {
  return (
    <div
      className={`flex flex-col gap-4 p-4 transition sm:flex-row sm:items-center ${
        selected ? "bg-orange-50/40" : "hover:bg-slate-50"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-900">
              {user.fullName}
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold uppercase text-emerald-600">
              Verified
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-400">{user.email}</p>
        </div>
        <div className="hidden shrink-0 text-right md:block">
          <p className="text-[9px] font-bold uppercase text-orange-500">
            Admin request
          </p>
          <p className="mt-1 text-[10px] text-slate-400">{user.createdAt}</p>
        </div>
      </button>

      <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={actionLoading}
            onClick={() => rejectUser(user.id)}
            className="h-9 rounded-lg border-slate-200 px-3 text-xs font-bold shadow-none hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Reject
          </Button>
          <Button
            type="button"
            disabled={actionLoading}
            onClick={() => approveUser(user.id)}
            className="h-9 rounded-lg bg-orange-500 px-3 text-xs font-bold text-white shadow-none hover:bg-orange-600"
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Approve
          </Button>
        </div>
    </div>
  )
}

function MemberRow({ user, protectedAccount, onClick, deleteUser, actionLoading }) {
  const isProtected = protectedAccount || user?.role === "superadmin"

  const handleDelete = (event) => {
    event.stopPropagation()

    if (isProtected || !deleteUser) return

    const confirmed = window.confirm(
      `Delete administrator account for ${user?.fullName}? This action cannot be undone.`
    )

    if (confirmed) {
      deleteUser(user.id)
    }
  }

  return (
    <div className="flex w-full items-center gap-3 p-4 transition hover:bg-slate-50">
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${
            isProtected
              ? "bg-slate-900 text-white"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {getInitials(user?.fullName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-800">
              {user?.fullName}
            </p>
            {isProtected && (
              <LockKeyhole className="h-3 w-3 shrink-0 text-slate-400" />
            )}
          </div>
          <p className="mt-1 truncate text-xs text-slate-400">
            {user?.email}
          </p>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-[9px] font-bold uppercase text-slate-400">
            {formatRole(user?.role)}
          </p>
          <p className="mt-1 text-[9px] font-semibold text-emerald-600">
            Active
          </p>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
      </button>

      {!isProtected && deleteUser && (
        <Button
          type="button"
          variant="outline"
          disabled={actionLoading}
          onClick={handleDelete}
          className="h-9 shrink-0 rounded-lg border-slate-200 px-3 text-xs font-bold text-slate-500 shadow-none hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Delete
        </Button>
      )}
    </div>
  )
}

function AdminPreview({ user }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-slate-100 p-3">
      <Avatar user={user} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800">
          {user.fullName}
        </p>
        <p className="mt-1 truncate text-[10px] text-slate-400">{user.email}</p>
      </div>
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
    </div>
  )
}

function HealthRow({ label, status }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Check className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className="text-[10px] font-bold text-slate-700">{status}</span>
    </div>
  )
}

function SmallActivity({ title, time }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-700">{title}</p>
      </div>
      <span className="shrink-0 text-[9px] text-slate-400">{time}</span>
    </div>
  )
}

function ReviewRow({ label, value, green, orange }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span
        className={`text-[10px] font-bold ${
          green ? "text-emerald-600" : orange ? "text-orange-500" : "text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function SecurityRow({ icon: Icon, title, description, action, verified }) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
      </div>

      {verified ? (
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
          <Check className="h-3.5 w-3.5" />
          Verified
        </span>
      ) : (
        <Button
          variant="outline"
          className="h-9 rounded-lg border-slate-200 text-xs font-bold shadow-none"
        >
          {action}
        </Button>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Check className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-bold text-slate-700">No pending requests</p>
      <p className="mt-1 text-xs text-slate-400">
        All administrator requests have been reviewed.
      </p>
    </div>
  )
}

function EmptyMembersState() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Users className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm font-bold text-slate-700">
        No administrators found
      </p>
      <p className="mt-1 text-xs text-slate-400">Try changing your search.</p>
    </div>
  )
}