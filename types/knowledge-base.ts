export interface KnowledgeBaseEntry {
  id: string;
  agency_id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  priority: number;
  source: string;
  search_text: string | null;
  usage_count: number;
  last_used_at: string | null;
  is_active: boolean;
  is_deleted: boolean;
  is_system: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseStats {
  total: number;
  active: number;
  inactive: number;
  custom: number;
  seed: number;
  uniqueCategories: number;
  recentlyUpdated: KnowledgeBaseEntry[];
}
