import { apiFetch } from "../api";
import React, { useEffect, useState } from "react";
import { Users, UserPlus, Trash2, Edit2, ShieldAlert, X, Check, Search, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Staff } from "../types";

interface AdminStaffViewProps {
  showToast: (msg: string, type?: "success" | "error") => void;
  canDelete?: boolean;
}

export default function AdminStaffView({ showToast, canDelete = true }: AdminStaffViewProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer / Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Active");
  const [role, setRole] = useState("Staff");
  const [access, setAccess] = useState("View Only");
  const [assignedCategories, setAssignedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch("/api/method/rule_management.rule_management.api.get_assigned_rule_categories");
      const data = await res.json();
      if (data.status === "success") {
        setAvailableCategories(data.data);
      }
    } catch (err) {}
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/method/rule_management.rule_management.api.get_staff_list");
      const data = await res.json();
      if (data.status === "success") {
        setStaffList(data.data);
      } else {
        showToast(data.message || "Failed to load staff list.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error retrieving staff list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchCategories();
  }, []);

  const openCreateForm = () => {
    setEditingStaff(null);
    setName("");
    setMobile("");
    setEmail("");
    setLoginId("");
    setPassword("");
    setStatus("Active");
    setRole("Staff");
    setAccess("View Only");
    setAssignedCategories([]);
    setIsFormOpen(true);
  };

  const openEditForm = (staff: Staff) => {
    setEditingStaff(staff);
    setName(staff.employee_name);
    setMobile(staff.mobile_no || "");
    setEmail(staff.email || "");
    setLoginId(staff.login_id);
    setPassword(staff.password || "");
    setStatus(staff.status);
    setRole(staff.role);
    setAccess(staff.access || "View Only");
    setAssignedCategories(staff.assigned_categories || []);
    setIsFormOpen(true);
  };

  const handleDelete = async (staffId: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this staff record? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await apiFetch("/api/method/rule_management.rule_management.api.delete_staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: staffId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        showToast("Staff member deleted successfully.", "success");
        fetchStaff();
      } else {
        showToast(data.message || "Deletion failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Could not complete deletion request.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !loginId.trim() || (!editingStaff && !password.trim())) {
      showToast("Please fill in all mandatory fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = !!editingStaff;
      const endpoint = isEdit
        ? "/api/method/rule_management.rule_management.api.update_staff"
        : "/api/method/rule_management.rule_management.api.create_staff";

      const payload = isEdit
        ? {
            staff_id: editingStaff.id,
            data: {
              employee_name: name,
              user: loginId,
              password: password || undefined,
              staff_category: role === "Administrator" ? "Admin" : "Staff",
              status: status,
              mobile_no: mobile,
              email: email,
              access: access,
              assigned_categories: assignedCategories.map(c => ({ rule_category: c })),
            },
          }
        : {
            data: {
              employee_name: name,
              user: loginId,
              password: password,
              staff_category: role === "Administrator" ? "Admin" : "Staff",
              status: status,
              mobile_no: mobile,
              email: email,
              access: access,
              assigned_categories: assignedCategories.map(c => ({ rule_category: c })),
            },
          };

      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === "success") {
        showToast(
          isEdit ? "Staff credentials updated successfully." : "New staff member registered.",
          "success"
        );
        setIsFormOpen(false);
        fetchStaff();
      } else {
        showToast(data.message || "Request failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Connection to server failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.login_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-900 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold">Administrator Console</span>
          <h2 className="text-xl font-black text-white tracking-tight">Staff Management Registry</h2>
        </div>

        {canDelete && (
          <button
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-lg shadow-gold/10 transition-all duration-300 active:scale-95 cursor-pointer font-sans self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 text-black" />
            <span>Register Staff</span>
          </button>
        )}
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#141414] border border-gray-900 p-4 rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, ID or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 transition-all duration-300 gold-glow-focus"
          />
        </div>

        <div className="text-xs font-mono text-gray-500 w-full sm:w-auto text-right">
          Active Database Count: <strong className="text-gold">{filteredStaff.length} Records</strong>
        </div>
      </div>

      {/* Staff Grid/Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-gold/15"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-gold animate-spin"></div>
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Retrieving credentials...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => (
            <motion.div
              key={staff.id}
              whileHover={{ y: -2 }}
              className="p-5 rounded-2xl border border-gold/10 bg-[#161616] flex flex-col justify-between gap-4 shadow-lg relative group transition-all duration-300"
            >
              {/* Profile Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-center text-gold font-sans font-bold shadow-inner">
                    {staff.employee_name?.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-200 line-clamp-1">{staff.employee_name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">{staff.id}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${
                  staff.status === "Active" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {staff.status}
                </span>
              </div>

              {/* Account properties */}
              <div className="space-y-1.5 pt-2 border-t border-gray-900 text-xs font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>Login ID:</span>
                  <span className="text-gray-200">{staff.login_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="text-gold font-bold">{staff.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Access:</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    staff.access === 'Can Edit and Delete' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    staff.access === 'Can Edit' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {staff.access || "View Only"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Categories:</span>
                  <span className="text-gray-300 font-bold">{staff.assigned_categories?.length || 0} Assigned</span>
                </div>
              </div>

              {/* CRUD Controls */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-900 mt-1">
                <button
                  onClick={() => openEditForm(staff)}
                  className="p-2 rounded-lg bg-premium-light hover:bg-gold/10 border border-gray-850 text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-200 flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(staff.id)}
                    className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-350 transition-all duration-200 flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {filteredStaff.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-2xl">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-mono">No matching staff accounts located in registry.</p>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal Dialog Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-gold/20 bg-[#141414] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-gold/10 flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-[#121212]">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-gold" />
                  <h3 className="text-md font-bold text-white font-sans uppercase tracking-wider">
                    {editingStaff ? "Modify Staff Profile" : "Register New Staff"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="w-7 h-7 rounded-full bg-premium-light text-gray-400 hover:text-gold border border-gray-800 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Employee Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name (e.g. Elena Rostova)"
                    className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 gold-glow-focus transition-all duration-300"
                  />
                </div>

                {/* Login ID */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                    Login ID / System ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="Enter unique login ID (e.g. elena)"
                    className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 gold-glow-focus transition-all duration-300"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                    Security Password {editingStaff ? "(Leave blank to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    required={!editingStaff}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingStaff ? "••••••••" : "Enter access password"}
                    className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 gold-glow-focus transition-all duration-300"
                  />
                </div>

                {/* Mobile / Telephone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 gold-glow-focus transition-all duration-300"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@bb-rulemanager.com"
                    className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 gold-glow-focus transition-all duration-300"
                  />
                </div>

                {/* Dropdowns role & status */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                      System Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white gold-glow-focus cursor-pointer transition-all duration-300"
                    >
                      <option value="Staff">Staff</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                      System Access
                    </label>
                    <select
                      value={access}
                      onChange={(e) => setAccess(e.target.value)}
                      disabled={role === "Administrator"}
                      className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white gold-glow-focus cursor-pointer transition-all duration-300 disabled:opacity-50"
                    >
                      <option value="View Only">View Only</option>
                      <option value="Can Edit">Can Edit</option>
                      <option value="Can Edit and Delete">Can Edit and Delete</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                      Account Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white gold-glow-focus cursor-pointer transition-all duration-300"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 col-span-2 pt-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                    Assigned Rule Categories
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 border border-gray-800 p-2 rounded-xl bg-[#1b1b1b]">
                    {availableCategories.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white/5 rounded">
                        <input
                          type="checkbox"
                          checked={assignedCategories.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) setAssignedCategories([...assignedCategories, c.id]);
                            else setAssignedCategories(assignedCategories.filter(id => id !== c.id));
                          }}
                          className="accent-gold w-3 h-3"
                        />
                        <span className="text-xs text-white line-clamp-1">{c.category_name}</span>
                      </label>
                    ))}
                    {availableCategories.length === 0 && <span className="text-xs text-gray-500">No categories found.</span>}
                  </div>
                </div>


                {/* Action CTA buttons */}
                <div className="pt-6 border-t border-gray-900 flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-black font-bold font-sans py-3 px-6 rounded-xl shadow-lg shadow-gold/10 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingStaff ? "Save Updates" : "Register Access"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
