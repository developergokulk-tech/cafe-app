"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

export default function UsersPanel({ currentUser }) {
  const isChef = currentUser?.role === "CHEF";
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Chef Modal State
  const [showAddChefModal, setShowAddChefModal] = useState(false);
  const [chefName, setChefName] = useState("");
  const [chefEmail, setChefEmail] = useState("");
  const [chefPassword, setChefPassword] = useState("");
  const [chefError, setChefError] = useState("");
  const [addingChef, setAddingChef] = useState(false);

  // Edit Chef Modal State
  const [editingChef, setEditingChef] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Fetch Staff & Chefs
  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error("Failed to fetch staff team:", err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchStaff().finally(() => setLoading(false));
  }, [fetchStaff]);

  // Separate Primary Admin vs Chefs
  const primaryAdmin = useMemo(() => {
    return (
      staffList.find((s) => s.role === "ADMIN" || s.role === "MANAGER") ||
      staffList[0]
    );
  }, [staffList]);

  const chefs = useMemo(() => {
    return staffList.filter((s) => s.id !== primaryAdmin?.id);
  }, [staffList, primaryAdmin]);

  // Handle Add Chef
  const handleAddChef = async (e) => {
    e.preventDefault();
    setChefError("");
    setAddingChef(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: chefName,
          email: chefEmail,
          password: chefPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add chef");
      }

      await fetchStaff();
      setShowAddChefModal(false);
      setChefName("");
      setChefEmail("");
      setChefPassword("");
    } catch (err) {
      setChefError(err.message || "Failed to add chef");
    } finally {
      setAddingChef(false);
    }
  };

  // Open Edit Chef Modal
  const handleOpenEdit = (chef) => {
    setEditingChef(chef);
    setEditName(chef.name);
    setEditEmail(chef.email);
    setEditPassword("");
    setEditError("");
  };

  // Handle Edit Chef Save
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError("");
    setSavingEdit(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingChef.id,
          name: editName,
          email: editEmail,
          password: editPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update chef details");
      }

      await fetchStaff();
      setEditingChef(null);
    } catch (err) {
      setEditError(err.message || "Failed to update chef details");
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Delete Chef
  const handleDeleteChef = async (id, name) => {
    if (!confirm(`Are you sure you want to remove Chef "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to remove chef");
        return;
      }

      await fetchStaff();
    } catch (err) {
      console.error("Delete chef error:", err);
      alert("Error removing chef user");
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── Header Toolbar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            👨‍🍳 Kitchen Team & Staff Roles
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isChef
              ? "View kitchen staff and team roles (Credentials managed by Admin)"
              : "Manage administrative credentials and kitchen chef access accounts"}
          </p>
        </div>

        {!isChef && (
          <button
            onClick={() => setShowAddChefModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-extrabold text-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            + Add Chef
          </button>
        )}
      </div>

      {isChef && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-200/90 flex items-center gap-2.5">
          <span className="text-base">🛡️</span>
          <span>
            <strong>Read Only Access:</strong> Chefs are not permitted to change administrator credentials or modify staff accounts.
          </span>
        </div>
      )}

      {/* ── CHEFS & STAFF MANAGEMENT ── */}
      <div className="space-y-6">
        {/* Primary Admin Card */}
        {primaryAdmin && (
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#16131F] to-[#0A090E] p-4 sm:p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-extrabold text-black text-lg shadow-md uppercase shrink-0">
                  {primaryAdmin.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-white">{primaryAdmin.name}</h3>
                    <span className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                      🛡️ Primary Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{primaryAdmin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isChef ? (
                  <button
                    onClick={() => handleOpenEdit(primaryAdmin)}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition active:scale-95 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Admin Details
                  </button>
                ) : null}

                <div className="hidden md:flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-emerald-400 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Full System Control
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chefs Management Section */}
        <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                👨‍🍳 Kitchen Chefs & Culinary Staff ({chefs.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Staff members with kitchen order and dispatch privileges</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading staff team...</div>
          ) : chefs.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No additional chef accounts registered.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chefs.map((chef) => (
                <div
                  key={chef.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/2 p-4 hover:border-amber-500/30 transition group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center font-extrabold text-amber-300 text-sm uppercase shrink-0">
                          👨‍🍳
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition truncate">
                            {chef.name}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">{chef.email}</p>
                        </div>
                      </div>
                      <span className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 shrink-0">
                        Chef
                      </span>
                    </div>
                  </div>

                  {/* Action buttons (Admin only) */}
                  {!isChef && (
                    <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEdit(chef)}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Details
                      </button>

                      <button
                        onClick={() => handleDeleteChef(chef.id, chef.name)}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition p-1.5 rounded-lg hover:bg-rose-500/10 active:scale-95 cursor-pointer"
                        title="Remove Chef"
                      >
                        Delete Chef
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ADD CHEF MODAL ── */}
      {showAddChefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddChefModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-6 shadow-2xl overflow-hidden">
            <h3 className="text-lg font-bold text-amber-300 mb-1">👨‍🍳 Add Kitchen Chef</h3>
            <p className="text-xs text-slate-400 mb-5">Create login credentials for a new chef in your kitchen team.</p>

            {chefError && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {chefError}
              </div>
            )}

            <form onSubmit={handleAddChef} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Chef Name</label>
                <input
                  type="text"
                  required
                  value={chefName}
                  onChange={(e) => setChefName(e.target.value)}
                  placeholder="e.g. Chef Vikas"
                  className="w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Username / Email</label>
                <input
                  type="text"
                  required
                  value={chefEmail}
                  onChange={(e) => setChefEmail(e.target.value)}
                  placeholder="chef.vikas or chef.vikas@ripcafe.com"
                  className="w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={chefPassword}
                  onChange={(e) => setChefPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddChefModal(false)}
                  className="flex-1 rounded-xl border border-slate-700 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingChef}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold text-black hover:from-amber-400 transition disabled:opacity-50 cursor-pointer"
                >
                  {addingChef ? "Adding Chef..." : "Add Chef"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT STAFF MODAL (Admin or Chef) ── */}
      {editingChef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingChef(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-6 shadow-2xl overflow-hidden">
            <h3 className="text-lg font-bold text-amber-300 mb-1">
              ✏️ {editingChef.id === primaryAdmin?.id ? "Edit Admin Details" : "Edit Chef Details"}
            </h3>
            <p className="text-xs text-slate-400 mb-5">Update name, username/email, or set a new password for {editingChef.name}.</p>

            {editError && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  {editingChef.id === primaryAdmin?.id ? "Admin Name" : "Chef Name"}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Username / Email</label>
                <input
                  type="text"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  New Password <span className="text-[10px] text-slate-500 font-normal">(leave blank to keep unchanged)</span>
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingChef(null)}
                  className="flex-1 rounded-xl border border-slate-700 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold text-black hover:from-amber-400 transition disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
