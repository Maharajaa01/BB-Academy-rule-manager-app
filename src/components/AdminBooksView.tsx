import { apiFetch } from "../api";
import React, { useEffect, useState } from "react";
import { BookOpen, BookPlus, Trash2, Edit2, ShieldAlert, X, Save, Search, Plus, ListOrdered } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RuleBook, RuleCategory } from "../types";

interface AdminBooksViewProps {
  showToast: (msg: string, type?: "success" | "error") => void;
  canDelete?: boolean;
}

export default function AdminBooksView({ showToast, canDelete = true }: AdminBooksViewProps) {
  const [books, setBooks] = useState<RuleBook[]>([]);
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Drill-down states
  const [path, setPath] = useState<RuleCategory[]>([]);
  const currentCategory = path.length > 0 ? path[path.length - 1] : null;

  const handleBack = () => {
    setPath((prev) => prev.slice(0, -1));
  };

  // Drawer / Modal Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<RuleBook | null>(null);

  // Form Fields
  const [categoryName, setCategoryName] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  
  // Dynamic rules array fields
  const [ruleClauses, setRuleClauses] = useState<string[]>([""]);

  const [submitting, setSubmitting] = useState(false);

  const fetchBooksAndCategories = async () => {
    setLoading(true);
    try {
      const catRes = await apiFetch("/api/method/rule_management.rule_management.api.get_assigned_rule_categories");
      const catData = await catRes.json();
      if (catData.status === "success") {
        setCategories(catData.data);
      }

      const booksRes = await apiFetch("/api/method/rule_management.rule_management.api.get_rule_books");
      const booksData = await booksRes.json();
      if (booksData.status === "success") {
        setBooks(booksData.data);
      } else {
        showToast(booksData.message || "Failed to load rule books.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error retrieving rule books.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksAndCategories();
  }, []);

  const openCreateForm = () => {
    setEditingBook(null);
    setCategoryName(currentCategory ? currentCategory.category_name : (categories[0]?.category_name || ""));
    setBookTitle("");
    setYoutubeUrl("");
    setAudioUrl("");
    setRuleClauses([""]);
    setIsFormOpen(true);
  };

  const openEditForm = (book: RuleBook) => {
    setEditingBook(book);
    setCategoryName(book.rule_category);
    setBookTitle(book.book_title);
    setYoutubeUrl(book.youtube_url || "");
    setAudioUrl(book.audio_url || "");
    setRuleClauses(book.rules && book.rules.length > 0 ? [...book.rules] : [""]);
    setIsFormOpen(true);
  };

  // Rule item manipulation
  const addRuleRow = () => {
    setRuleClauses([...ruleClauses, ""]);
  };

  const removeRuleRow = (index: number) => {
    if (ruleClauses.length === 1) {
      setRuleClauses([""]);
      return;
    }
    const filtered = ruleClauses.filter((_, idx) => idx !== index);
    setRuleClauses(filtered);
  };

  const handleRuleChange = (index: number, text: string) => {
    const updated = [...ruleClauses];
    updated[index] = text;
    setRuleClauses(updated);
  };

  const handleDelete = async (bookId: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this rule book? This will permanently delete all attached rules.")) {
      return;
    }

    try {
      const res = await apiFetch("/api/method/rule_management.rule_management.api.delete_rule_book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        showToast("Rule book deleted successfully.", "success");
        fetchBooksAndCategories();
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
    if (!categoryName || !bookTitle.trim()) {
      showToast("Rule Category and Book Title are required.", "error");
      return;
    }

    // Filter out empty rule rows
    const cleanRules = ruleClauses.map(r => r.trim()).filter(r => r !== "");

    setSubmitting(true);
    try {
      const isEdit = !!editingBook;
      const endpoint = isEdit
        ? "/api/method/rule_management.rule_management.api.update_rule_book"
        : "/api/method/rule_management.rule_management.api.create_rule_book";

      const payload = isEdit
        ? {
            book_id: editingBook.id,
            rule_category: categoryName,
            book_title: bookTitle,
            youtube_url: youtubeUrl,
            audio_url: audioUrl,
            rules: cleanRules,
          }
        : {
            rule_category: categoryName,
            book_title: bookTitle,
            youtube_url: youtubeUrl,
            audio_url: audioUrl,
            rules: cleanRules,
          };

      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === "success") {
        showToast(
          isEdit ? "Rule book details modified." : "New rule book registered.",
          "success"
        );
        setIsFormOpen(false);
        fetchBooksAndCategories();
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

  // Drill-down filtering
  const subCategories = currentCategory
    ? categories.filter((c) => c.parent_category === currentCategory.category_name)
    : [];
    
  const topCategories = categories.filter((c) => c.is_parent === 1 || !c.parent_category);

  // When drilled down, only search within the current category's books
  const filteredBooks = currentCategory
    ? books.filter((b) => b.rule_category === currentCategory.category_name)
    : [];

  const searchedBooks = searchQuery.trim()
    ? books.filter(
        (b) =>
          b.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.rule_category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-900 pb-5">
        <div className="flex items-center gap-3">
          {currentCategory && (
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-premium-light border border-gray-800 text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold">Administrator Console</span>
            <h2 className="text-xl font-black text-white tracking-tight">
              {currentCategory ? (subCategories.length > 0 ? "Sub Categories" : "Rule Books") : "Rules Book Catalogue Editor"}
            </h2>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={openCreateForm}
            disabled={categories.length === 0}
            className="flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-lg shadow-gold/10 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-sans self-start sm:self-auto"
          >
            <BookPlus className="w-4 h-4 text-black" />
            <span>Publish Rule Book</span>
          </button>
        )}
      </div>

      {categories.length === 0 && (
        <div className="p-4 rounded-xl border border-dashed border-gold/30 bg-gold/5 flex gap-3 items-start">
          <ShieldAlert className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-white">Prerequisite Action Required</h5>
            <p className="text-xs text-gray-400">
              You must create at least one Rule Category folder under the "Categories" tab before you can publish a Rule Book.
            </p>
          </div>
        </div>
      )}

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#141414] border border-gray-900 p-4 rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search all rule books..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentCategory) setPath([]); // Clear category filter to search globally
            }}
            className="w-full bg-[#1e1e1e] border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 transition-all duration-300 gold-glow-focus"
          />
        </div>

        <div className="text-xs font-mono text-gray-500 w-full sm:w-auto text-right">
          Total Categories: <strong className="text-gold">{categories.length}</strong> | Total Books: <strong className="text-gold">{books.length}</strong>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-gold/15"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-gold animate-spin"></div>
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Retrieving training manuals...</p>
        </div>
      ) : searchQuery.trim() ? (
        /* Render Search Results */
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gold">
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Search Results ({searchedBooks.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchedBooks.map((book) => (
              <motion.div key={book.id} whileHover={{ y: -2 }} className="p-6 rounded-2xl border border-gold/10 bg-[#161616] flex flex-col justify-between gap-4 shadow-lg transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded font-mono font-bold border border-gold/15">
                        {book.rule_category}
                      </span>
                      <h4 className="font-bold text-sm text-gray-200 mt-1 line-clamp-2">{book.book_title}</h4>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-900 mt-1">
                  <button onClick={() => openEditForm(book)} className="p-2 rounded-lg bg-premium-light hover:bg-gold/10 border border-gray-850 text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-200 flex items-center gap-1 text-[11px] font-mono">
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  {canDelete && (
                    <button onClick={() => handleDelete(book.id)} className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-350 transition-all duration-200 flex items-center gap-1 text-[11px] font-mono">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : currentCategory && subCategories.length === 0 ? (
        /* Render Books */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBooks.map((book) => (
            <motion.div
              key={book.id}
              whileHover={{ y: -2 }}
              className="p-6 rounded-2xl border border-gold/10 bg-[#161616] flex flex-col justify-between gap-4 shadow-lg transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded font-mono font-bold border border-gold/15">
                      {book.rule_category}
                    </span>
                    <h4 className="font-bold text-sm text-gray-200 mt-1 line-clamp-2">{book.book_title}</h4>
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 bg-premium-light px-2 py-1 rounded border border-gray-800 shrink-0">
                    {book.id}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-gray-400 font-mono">
                  <div>• Video ID: <span className="text-gray-300 font-sans break-all">{book.youtube_url ? "Linked" : "No Guide"}</span></div>
                  <div>• Audio file: <span className="text-gray-300 font-sans break-all">{book.audio_url ? "Linked" : "No Audio"}</span></div>
                  <div>• Rules count: <span className="text-gold font-bold">{book.rules?.length || 0} Clauses</span></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-900 mt-1">
                <button
                  onClick={() => openEditForm(book)}
                  className="p-2 rounded-lg bg-premium-light hover:bg-gold/10 border border-gray-850 text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-200 flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-350 transition-all duration-200 flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {filteredBooks.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-2xl">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-mono">No rule books located in this category.</p>
            </div>
          )}
        </div>
      ) : (
        /* Render Categories (Top-level or Sub) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(currentCategory ? subCategories : topCategories).map((cat) => {
            const catBookCount = books.filter((b) => b.rule_category === cat.category_name).length;
            const catSubCount = categories.filter((c) => c.parent_category === cat.category_name).length;
            
            return (
              <motion.div
                key={cat.id}
                whileHover={{ y: -3 }}
                onClick={() => setPath((prev) => [...prev, cat])}
                className="p-6 rounded-2xl border border-gold/10 bg-[#161616] hover:border-gold/30 cursor-pointer transition-all duration-300 flex items-start justify-between group shadow-lg"
              >
                <div className="space-y-2 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-gray-200 group-hover:text-gold transition-colors tracking-tight leading-tight">
                      {cat.category_name}
                    </h3>
                  </div>
                  <div className="pt-2 flex items-center gap-1 text-[10px] font-mono text-gold font-bold uppercase tracking-wider">
                    {catSubCount > 0 ? (
                      <span>{catSubCount} Sub-Categories</span>
                    ) : (
                      <span>{catBookCount} Training Handbooks</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Book Creation / Editing Drawer / Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl rounded-2xl border border-gold/20 bg-[#141414] shadow-2xl overflow-hidden flex flex-col my-8 max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-gold/10 flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-[#121212] sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-gold" />
                  <h3 className="text-md font-bold text-white font-sans uppercase tracking-wider">
                    {editingBook ? "Edit Rule Book Configuration" : "Publish Training Handbook"}
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
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Dropdown Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                      Rule Category *
                    </label>
                    <select
                      value={categoryName}
                      required
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white gold-glow-focus cursor-pointer transition-all duration-300"
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.category_name}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Book Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g. Evacuation Protocol 2026"
                      className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 gold-glow-focus transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* YouTube Video URL */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 gold-glow-focus transition-all duration-300"
                    />
                  </div>

                  {/* HTML5 Audio file */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                      Audio Handbook Link (MP3/WAV)
                    </label>
                    <input
                      type="url"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://www.soundhelix.com/...mp3"
                      className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 gold-glow-focus transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Dynamic rules entries list */}
                <div className="space-y-3 pt-2 border-t border-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gold">
                      <ListOrdered className="w-4 h-4 text-gold" />
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                        Numbered Rule Clauses ({ruleClauses.length})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={addRuleRow}
                      className="flex items-center gap-1 bg-gold/10 hover:bg-gold/20 text-gold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-gold/20 transition-all cursor-pointer font-bold"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Clause Row</span>
                    </button>
                  </div>

                  {/* Clauses dynamic rows */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {ruleClauses.map((clause, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="w-6 text-[11px] text-gold font-mono text-center font-bold">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          required
                          value={clause}
                          onChange={(e) => handleRuleChange(idx, e.target.value)}
                          placeholder="State the compliance directive precisely..."
                          className="flex-1 bg-[#1b1b1b] border border-gray-800 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 gold-glow-focus transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeRuleRow(idx)}
                          className="p-2 bg-red-500/5 hover:bg-red-500/15 border border-red-500/25 text-red-400 rounded-xl transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA buttons */}
                <div className="pt-6 border-t border-gray-900 flex justify-end gap-3 sticky bottom-0 bg-[#141414] py-2 z-10">
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
                        <span>{editingBook ? "Save Manual" : "Publish Manual"}</span>
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
