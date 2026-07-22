export type KnowledgePriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type KnowledgeStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';
export type KnowledgeSourceType = 'DEFAULT_FAQ' | 'CUSTOM_FAQ' | 'IMPORTED' | 'LEARNED';

export interface KnowledgeCategory {
  id: string;
  agency_id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeEntry {
  id: string;
  agency_id: string;
  category_id: string | null;
  question: string;
  answer: string;
  keywords: string[];
  priority: KnowledgePriority;
  status: KnowledgeStatus;
  is_ai_enabled: boolean;
  search_text: string | null;
  confidence_score: number | null;
  usage_count: number;
  last_used_at: string | null;
  language: string;
  source_type: KnowledgeSourceType;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  category?: Pick<KnowledgeCategory, 'name' | 'color'> | null;
}

export interface KnowledgeEntryVersion {
  id: string;
  knowledge_entry_id: string;
  question: string;
  answer: string;
  changed_by: string | null;
  created_at: string;
}

export interface KnowledgeUsageLog {
  id: string;
  agency_id: string;
  knowledge_entry_id: string | null;
  conversation_id: string | null;
  agent_id: string | null;
  customer_question: string;
  created_at: string;
}
