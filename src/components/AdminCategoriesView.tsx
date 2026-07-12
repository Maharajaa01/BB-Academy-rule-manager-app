import { apiFetch } from "../api";
import React, { useEffect, useState } from "react";
import { FolderLock, FolderPlus, Trash2, Edit2, ShieldAlert, X, Save, Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RuleCategory } from "../types";

interface AdminCategoriesViewProps {
  showToast: (msg: string, type?: "success" | "error") => void;
  canDelete?: boolean;
  setView: (view: string) => void;
}

export default function AdminCategoriesView({ showToast, canDelete = false, setView }: AdminCategoriesViewProps) {
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer / Modal Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RuleCategory | null>(null);

  // Fields
  const [categoryName, setCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/method/rule_management.rule_management.api.get_assigned_rule_categories");
      const data = await res.json();
      if (data.status === "success") {
        setCategories(data.data);
      } else {
        showToast(data.message || "Failed to load categories list.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error retrieving categories list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateForm = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsFormOpen(true);
  };

  const openEditForm = (cat: RuleCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.category_name);
    setIsFormOpen(true);
  };

  const handleDelete = async (catId: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this rule category? Deleting a category will cascade rule book groupings.")) {
      return;
    }

    try {
      const res = await apiFetch("/api/method/rule_management.rule_management.api.delete_rule_category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: catId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        showToast("Rule category deleted successfully.", "success");
        fetchCategories();
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
    if (!categoryName.trim()) {
      showToast("Category Name is required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = !!editingCategory;
      const endpoint = isEdit
        ? "/api/method/rule_management.rule_management.api.update_rule_category"
        : "/api/method/rule_management.rule_management.api.create_rule_category";

      const payload = isEdit
        ? {
            category_id: editingCategory.id,
            category_name: categoryName,
          }
        : {
            category_name: categoryName,
          };

      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === "success") {
        showToast(
          isEdit ? "Rule category updated successfully." : "Rule category registered.",
          "success"
        );
        setIsFormOpen(false);
        fetchCategories();
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

  const filteredCategories = categories.filter(
    (c) => c.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-900 pb-5">
        <div>
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gold mb-3 transition-colors text-xs font-mono tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold">Administrator Console</span>
          <h2 className="text-xl font-black text-white tracking-tight">Category Organization Registry</h2>
        </div>

        {canDelete && (
          <button
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-lg shadow-gold/10 transition-all duration-300 active:scale-95 cursor-pointer font-sans self-start sm:self-auto"
          >
            <FolderPlus className="w-4 h-4 text-black" />
            <span>Add Category</span>
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
            placeholder="Search by category name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 transition-all duration-300 gold-glow-focus"
          />
        </div>

        <div className="text-xs font-mono text-gray-500 w-full sm:w-auto text-right">
          Active Branches: <strong className="text-gold">{filteredCategories.length} Categories</strong>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-gold/15"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-gold animate-spin"></div>
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Retrieving organization structure...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategories.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -2 }}
              className="p-6 rounded-2xl border border-gold/10 bg-[#161616] flex flex-col justify-between gap-4 shadow-lg transition-all duration-300"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold/5 border border-gold/15 flex items-center justify-center text-gold">
                    <FolderLock className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-200">{cat.category_name}</h4>
                </div>
                <div className="text-[10px] font-mono text-gray-500">
                  SYSTEM ID: {cat.id}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-900 mt-1">
                <button
                  onClick={() => openEditForm(cat)}
                  className="p-2 rounded-lg bg-premium-light hover:bg-gold/10 border border-gray-850 text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-200 flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modify</span>
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-350 transition-all duration-200 flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-2xl">
              <FolderLock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-mono">No matching rule categories found.</p>
            </div>
          )}
        </div>
      )}

      {/* Category Creation Drawer/Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md max-h-[90vh] rounded-2xl border border-gold/20 bg-[#141414] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-gold/10 flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-[#121212]">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-gold" />
                  <h3 className="text-md font-bold text-white font-sans uppercase tracking-wider">
                    {editingCategory ? "Modify Category Details" : "Create Rule Category"}
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
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                {/* Category Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category (e.g. Safety & Security)"
                    className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 gold-glow-focus transition-all duration-300"
                  />
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
                        <span>{editingCategory ? "Apply Changes" : "Create Folder"}</span>
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
