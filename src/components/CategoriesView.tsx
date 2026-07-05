import React, { useEffect, useState } from "react";
import { FolderLock, BookOpen, ChevronRight, Search, Play, HelpCircle, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { RuleCategory, RuleBook } from "../types";

interface CategoriesViewProps {
  showToast: (msg: string, type?: "success" | "error") => void;
  onSelectBook: (id: string) => void;
}

export default function CategoriesView({ showToast, onSelectBook }: CategoriesViewProps) {
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [books, setBooks] = useState<RuleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drill-down states
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await fetch("/api/method/rule_management.rule_management.api.get_assigned_rule_categories");
        const catData = await catRes.json();
        if (catData.status === "success") {
          setCategories(catData.data);
        } else {
          showToast(catData.message || "Failed to load categories.", "error");
        }

        const booksRes = await fetch("/api/method/rule_management.rule_management.api.get_rule_books");
        const booksData = await booksRes.json();
        if (booksData.status === "success") {
          setBooks(booksData.data);
        }
      } catch (err) {
        console.error(err);
        showToast("Error retrieving categories list.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter books inside selected category
  const filteredBooks = selectedCategory
    ? books.filter((b) => b.rule_category === selectedCategory.category_name)
    : [];

  // Global search through all books
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
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 rounded-lg bg-premium-light border border-gray-800 text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold">
              {selectedCategory ? selectedCategory.category_name : "Operational Directory"}
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              {selectedCategory ? "Training Handbooks" : "Rule Book Categories"}
            </h2>
          </div>
        </div>

        {/* Global Search Box */}
        <div className="relative max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search all rule books..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedCategory) setSelectedCategory(null); // Clear category filter to search globally
            }}
            className="w-full sm:w-64 bg-[#161616] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 font-sans tracking-wide transition-all duration-300 gold-glow-focus"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-gold/15"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-gold animate-spin"></div>
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Loading rules database...</p>
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
              <motion.div
                key={book.id}
                whileHover={{ y: -2 }}
                onClick={() => onSelectBook(book.id)}
                className="p-5 rounded-2xl border border-gold/10 bg-[#161616] hover:border-gold/30 cursor-pointer transition-all duration-300 flex items-center justify-between group shadow-md"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <span className="text-[9px] uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded font-mono font-semibold">
                    {book.rule_category}
                  </span>
                  <h4 className="font-bold text-sm text-gray-200 group-hover:text-gold transition-colors line-clamp-1 leading-snug">
                    {book.book_title}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono">{book.rules?.length || 0} Rule clauses</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all duration-300 shadow">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}

            {searchedBooks.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-gray-800 rounded-2xl">
                <HelpCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-mono">No matching rule books discovered.</p>
              </div>
            )}
          </div>
        </div>
      ) : selectedCategory ? (
        /* Render Books inside Selected Category (Drill-down) */
        <div className="space-y-6">
          {/* Category description header */}
          <div className="p-5 rounded-xl border border-gold/10 bg-[#121212] flex gap-4 items-start shadow-md">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
              <FolderLock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">{selectedCategory.category_name}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">{selectedCategory.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ y: -2 }}
                onClick={() => onSelectBook(book.id)}
                className="p-5 rounded-2xl border border-gold/10 bg-[#161616] hover:border-gold/30 cursor-pointer transition-all duration-300 flex items-center justify-between group shadow-md"
              >
                <div className="space-y-1 flex-1 pr-4">
                  <h4 className="font-bold text-sm text-gray-200 group-hover:text-gold transition-colors line-clamp-1 leading-snug">
                    {book.book_title}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono">{book.rules?.length || 0} Rule clauses defined</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all duration-300 shadow">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}

            {filteredBooks.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-gray-800 rounded-2xl">
                <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-mono">No rule books listed in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Render Categories List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const catBookCount = books.filter((b) => b.rule_category === cat.category_name).length;
            return (
              <motion.div
                key={cat.id}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedCategory(cat)}
                className="p-6 rounded-2xl border border-gold/10 bg-[#161616] hover:border-gold/30 cursor-pointer transition-all duration-300 flex items-start justify-between group shadow-lg"
              >
                <div className="space-y-2 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                      <FolderLock className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-sm text-gray-200 group-hover:text-gold transition-colors tracking-tight leading-tight">
                      {cat.category_name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans line-clamp-2">
                    {cat.description || "No category description recorded."}
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-[10px] font-mono text-gold font-bold uppercase tracking-wider">
                    <span>{catBookCount} Training Handbooks</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {categories.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-2xl">
              <FolderLock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-mono">No active rule categories present in system database.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
