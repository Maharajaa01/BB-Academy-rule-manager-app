import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Initial in-memory Database for PWA Demo
let staffDb = [
  {
    id: "STF-001",
    employee_name: "Alexander Mercer",
    mobile_no: "+1 (555) 019-2834",
    email: "alex@bb-rulemanager.com",
    login_id: "staff",
    password: "staff123",
    status: "Active",
    role: "Staff"
  },
  {
    id: "STF-002",
    employee_name: "Sarah Jenkins",
    mobile_no: "+1 (555) 014-9844",
    email: "sarah@bb-rulemanager.com",
    login_id: "admin",
    password: "admin123",
    status: "Active",
    role: "Administrator"
  },
  {
    id: "STF-003",
    employee_name: "Elena Rostova",
    mobile_no: "+1 (555) 017-3388",
    email: "elena@bb-rulemanager.com",
    login_id: "elena",
    password: "password123",
    status: "Active",
    role: "Staff"
  }
];

let categoriesDb = [
  {
    id: "CAT-001",
    category_name: "Safety & Security",
    description: "Protocol for workplace safety, emergency drills, hazard reporting, and building security keys."
  },
  {
    id: "CAT-002",
    category_name: "Shift Operations",
    description: "Guidelines on daily check-ins, shift handover procedures, log entry, and team handoffs."
  },
  {
    id: "CAT-003",
    category_name: "Customer Experience",
    description: "Standards of communication, refund rules, client relationship management, and resolving disputes."
  }
];

let ruleBooksDb = [
  {
    id: "BK-001",
    rule_category: "Safety & Security",
    book_title: "Emergency Evacuation Protocol 2026",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    rules: [
      "Upon fire alarm trigger, immediately cease work and direct visitors toward the nearest exit.",
      "Do not use elevators during an active evacuation drill or fire emergency under any circumstances.",
      "Gather at the designated muster assembly point in the North Parking Lot for roll-call.",
      "Staff members must verify that all restroom doors are closed but unlocked behind them.",
      "Report any missing colleagues or guests immediately to the safety officer on site."
    ]
  },
  {
    id: "BK-002",
    rule_category: "Safety & Security",
    book_title: "Server Room Security Standards",
    youtube_url: "https://www.youtube.com/watch?v=y7e-GC6f14I",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    rules: [
      "Access is restricted to authorized operations staff with Tier-2 biometric clearance only.",
      "All visits must be logged manually in the entrance binder including exact IN/OUT timestamps.",
      "No food, open drinks, or magnetic items are permitted within 5 meters of rack mounts.",
      "Temp alerts exceeding 24°C must be escalated to the on-call engineer within 10 minutes."
    ]
  },
  {
    id: "BK-003",
    rule_category: "Shift Operations",
    book_title: "End-Of-Shift Reconciliation Manual",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    rules: [
      "All till cash registers must be double-counted against the printed POS sales reports.",
      "Flag any cash register variance greater than $5.00 directly to the regional manager.",
      "Complete the digital Handover checklist and attach clear photos of the safe-deposit receipts.",
      "Ensure all non-essential equipment, lights, and AC systems are powered off before locking up."
    ]
  },
  {
    id: "BK-004",
    rule_category: "Customer Experience",
    book_title: "Dispute & Refund Handbook",
    youtube_url: "https://www.youtube.com/watch?v=y7e-GC6f14I",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    rules: [
      "Listen intently without interruption; validate client concerns with a calm, neutral tone.",
      "Refund requests under $50 can be approved directly by any on-duty staff member.",
      "For items returned after 30 days, offer store credit rather than direct cash reversals.",
      "Always document resolved escalations in the CRM under the 'Customer Feedback' log."
    ]
  }
];

// Current session simulation
let currentLoggedInUser = staffDb[0]; // defaults to staff

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Helper function to return unified responses
  const sendRes = (res: express.Response, status: "success" | "error", message: string, data: any = null) => {
    return res.json({ status, message, data });
  };

  const BASE_URL = "/api/method/rule_management.rule_management.api.";

  // --- API ROUTING MAP ---

  // 1. Authentication
  app.post(`${BASE_URL}login`, (req, res) => {
    const { login_id, password } = req.body;
    
    if (!login_id || !password) {
      return sendRes(res, "error", "Please provide both Login ID and Password.");
    }

    const user = staffDb.find(
      (s) => s.login_id.toLowerCase() === login_id.toLowerCase() && s.password === password
    );

    if (!user) {
      return sendRes(res, "error", "Invalid credentials. Please try again.");
    }

    if (user.status !== "Active") {
      return sendRes(res, "error", "This account has been deactivated by administrator.");
    }

    currentLoggedInUser = user;
    return sendRes(res, "success", "Login successful!", {
      staff_id: user.id,
      employee_name: user.employee_name,
      role: user.role,
      login_id: user.login_id,
      email: user.email,
      mobile_no: user.mobile_no
    });
  });

  // 2. Staff Portal (Read-Only)
  app.get(`${BASE_URL}get_staff_dashboard`, (req, res) => {
    // Return total assigned categories, books, and rules
    const totalCategories = categoriesDb.length;
    const totalBooks = ruleBooksDb.length;
    const totalRules = ruleBooksDb.reduce((sum, b) => sum + b.rules.length, 0);

    return sendRes(res, "success", "Dashboard loaded", {
      total_assigned_categories: totalCategories,
      total_rule_books: totalBooks,
      total_rules: totalRules
    });
  });

  app.get(`${BASE_URL}get_assigned_rule_categories`, (req, res) => {
    return sendRes(res, "success", "Categories retrieved", categoriesDb);
  });

  app.get(`${BASE_URL}get_rule_books`, (req, res) => {
    const categoryName = req.query.rule_category as string;
    if (!categoryName) {
      return sendRes(res, "success", "All rule books retrieved", ruleBooksDb);
    }
    const filtered = ruleBooksDb.filter(
      (b) => b.rule_category.toLowerCase() === categoryName.toLowerCase()
    );
    return sendRes(res, "success", `Rule books for ${categoryName}`, filtered);
  });

  app.get(`${BASE_URL}get_rule_book_detail`, (req, res) => {
    const bookTitle = req.query.rule_book as string;
    if (!bookTitle) {
      return sendRes(res, "error", "Rule book parameter is required.");
    }
    const book = ruleBooksDb.find(
      (b) => b.book_title.toLowerCase() === bookTitle.toLowerCase() || b.id === bookTitle
    );
    if (!book) {
      return sendRes(res, "error", "Rule book details not found.");
    }
    return sendRes(res, "success", "Rule book details loaded", book);
  });

  app.get(`${BASE_URL}get_logged_in_staff_profile`, (req, res) => {
    return sendRes(res, "success", "Profile loaded", currentLoggedInUser);
  });

  // 3. Administrator Portal (Management)
  app.get(`${BASE_URL}get_staff_list`, (req, res) => {
    return sendRes(res, "success", "Staff retrieved successfully", staffDb);
  });

  app.get(`${BASE_URL}admin_dashboard`, (req, res) => {
    const totalStaff = staffDb.length;
    const totalCategories = categoriesDb.length;
    const totalRules = ruleBooksDb.reduce((sum, b) => sum + b.rules.length, 0);
    const totalBooks = ruleBooksDb.length;

    return sendRes(res, "success", "Admin dashboard loaded", {
      total_staff: totalStaff,
      total_categories: totalCategories,
      total_rules: totalRules,
      total_books: totalBooks
    });
  });

  // Staff CRUD
  app.post(`${BASE_URL}create_staff`, (req, res) => {
    const { data } = req.body;
    if (!data || !data.employee_name || !data.login_id || !data.password) {
      return sendRes(res, "error", "Required fields are missing.");
    }

    const exists = staffDb.some((s) => s.login_id.toLowerCase() === data.login_id.toLowerCase());
    if (exists) {
      return sendRes(res, "error", "Login ID already exists.");
    }

    const newId = `STF-${String(staffDb.length + 1).padStart(3, "0")}`;
    const newStaff = {
      id: newId,
      employee_name: data.employee_name,
      mobile_no: data.mobile_no || "",
      email: data.email || "",
      login_id: data.login_id,
      password: data.password,
      status: data.status || "Active",
      role: data.role || "Staff"
    };

    staffDb.push(newStaff);
    return sendRes(res, "success", "Staff member created successfully", newStaff);
  });

  app.post(`${BASE_URL}update_staff`, (req, res) => {
    const { staff_id, data } = req.body;
    if (!staff_id || !data) {
      return sendRes(res, "error", "Staff ID and update data are required.");
    }

    const index = staffDb.findIndex((s) => s.id === staff_id);
    if (index === -1) {
      return sendRes(res, "error", "Staff member not found.");
    }

    // Merge updates
    staffDb[index] = {
      ...staffDb[index],
      ...data,
      id: staff_id // prevent ID overriding
    };

    // If current logged-in user got updated, sync it
    if (currentLoggedInUser.id === staff_id) {
      currentLoggedInUser = staffDb[index];
    }

    return sendRes(res, "success", "Staff member updated successfully", staffDb[index]);
  });

  app.post(`${BASE_URL}delete_staff`, (req, res) => {
    const { staff_id } = req.body;
    if (!staff_id) {
      return sendRes(res, "error", "Staff ID is required.");
    }

    const index = staffDb.findIndex((s) => s.id === staff_id);
    if (index === -1) {
      return sendRes(res, "error", "Staff member not found.");
    }

    const deleted = staffDb.splice(index, 1)[0];
    return sendRes(res, "success", "Staff member deleted successfully", deleted);
  });

  // Rule Category CRUD
  app.post(`${BASE_URL}create_rule_category`, (req, res) => {
    const { category_name, description } = req.body;
    if (!category_name) {
      return sendRes(res, "error", "Category name is required.");
    }

    const exists = categoriesDb.some(
      (c) => c.category_name.toLowerCase() === category_name.toLowerCase()
    );
    if (exists) {
      return sendRes(res, "error", "Category with this name already exists.");
    }

    const newId = `CAT-${String(categoriesDb.length + 1).padStart(3, "0")}`;
    const newCat = {
      id: newId,
      category_name,
      description: description || ""
    };

    categoriesDb.push(newCat);
    return sendRes(res, "success", "Rule category created successfully", newCat);
  });

  app.post(`${BASE_URL}update_rule_category`, (req, res) => {
    const { category_id, category_name, description } = req.body;
    if (!category_id) {
      return sendRes(res, "error", "Category ID is required.");
    }

    const index = categoriesDb.findIndex((c) => c.id === category_id);
    if (index === -1) {
      return sendRes(res, "error", "Rule category not found.");
    }

    const oldName = categoriesDb[index].category_name;

    categoriesDb[index] = {
      ...categoriesDb[index],
      category_name: category_name || categoriesDb[index].category_name,
      description: description !== undefined ? description : categoriesDb[index].description
    };

    // Cascade rename category name in rule books if changed
    if (category_name && oldName !== category_name) {
      ruleBooksDb.forEach((book) => {
        if (book.rule_category === oldName) {
          book.rule_category = category_name;
        }
      });
    }

    return sendRes(res, "success", "Rule category updated successfully", categoriesDb[index]);
  });

  app.post(`${BASE_URL}delete_rule_category`, (req, res) => {
    const { category_id } = req.body;
    if (!category_id) {
      return sendRes(res, "error", "Category ID is required.");
    }

    const index = categoriesDb.findIndex((c) => c.id === category_id);
    if (index === -1) {
      return sendRes(res, "error", "Rule category not found.");
    }

    const deleted = categoriesDb.splice(index, 1)[0];
    // Optional: delete related rule books or cascade. We'll leave them or clean.
    return sendRes(res, "success", "Rule category deleted successfully", deleted);
  });

  // Rule Book CRUD
  app.post(`${BASE_URL}create_rule_book`, (req, res) => {
    const { rule_category, book_title, youtube_url, audio_url, rules } = req.body;
    
    if (!rule_category || !book_title) {
      return sendRes(res, "error", "Rule Category and Book Title are required.");
    }

    const exists = ruleBooksDb.some(
      (b) => b.book_title.toLowerCase() === book_title.toLowerCase()
    );
    if (exists) {
      return sendRes(res, "error", "Rule book with this title already exists.");
    }

    const newId = `BK-${String(ruleBooksDb.length + 1).padStart(3, "0")}`;
    const newBook = {
      id: newId,
      rule_category,
      book_title,
      youtube_url: youtube_url || "",
      audio_url: audio_url || "",
      rules: Array.isArray(rules) ? rules : []
    };

    ruleBooksDb.push(newBook);
    return sendRes(res, "success", "Rule book created successfully", newBook);
  });

  app.post(`${BASE_URL}update_rule_book`, (req, res) => {
    const { book_id, rule_category, book_title, youtube_url, audio_url, rules } = req.body;
    if (!book_id) {
      return sendRes(res, "error", "Book ID is required.");
    }

    const index = ruleBooksDb.findIndex((b) => b.id === book_id);
    if (index === -1) {
      return sendRes(res, "error", "Rule book not found.");
    }

    ruleBooksDb[index] = {
      ...ruleBooksDb[index],
      rule_category: rule_category || ruleBooksDb[index].rule_category,
      book_title: book_title || ruleBooksDb[index].book_title,
      youtube_url: youtube_url !== undefined ? youtube_url : ruleBooksDb[index].youtube_url,
      audio_url: audio_url !== undefined ? audio_url : ruleBooksDb[index].audio_url,
      rules: Array.isArray(rules) ? rules : ruleBooksDb[index].rules
    };

    return sendRes(res, "success", "Rule book updated successfully", ruleBooksDb[index]);
  });

  app.post(`${BASE_URL}delete_rule_book`, (req, res) => {
    const { book_id } = req.body;
    if (!book_id) {
      return sendRes(res, "error", "Book ID is required.");
    }

    const index = ruleBooksDb.findIndex((b) => b.id === book_id);
    if (index === -1) {
      return sendRes(res, "error", "Rule book not found.");
    }

    const deleted = ruleBooksDb.splice(index, 1)[0];
    return sendRes(res, "success", "Rule book deleted successfully", deleted);
  });


  // --- FRONTEND INTEGRATION & ASSETS ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BB Rule Manager server running at http://localhost:${PORT}`);
  });
}

startServer();
