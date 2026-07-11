export interface Staff {
  id: string;
  employee_name: string;
  mobile_no: string;
  email: string;
  login_id: string;
  password?: string;
  status: string;
  role: string;
  access: string;
  assigned_categories?: string[];
}

export interface RuleCategory {
  id: string;
  category_name: string;
  description: string;
  is_parent?: number;
  parent_category?: string;
}

export interface RuleBook {
  id: string;
  rule_category: string;
  book_title: string;
  youtube_url: string;
  audio_url: string;
  rules: string[];
}

export interface StaffDashboardData {
  total_assigned_categories: number;
  total_rule_books: number;
  total_rules: number;
}

export interface AdminDashboardData {
  total_staff: number;
  total_categories: number;
  total_rules: number;
  total_books: number;
}

export type ViewType = "dashboard" | "categories" | "admin-staff" | "admin-categories" | "admin-books" | "profile";
