/**
 * Practice entry data layer.
 * Uses mock data when Supabase tables are not yet available.
 */

export type Category = {
  id: string;
  name: string;
  sort_order: number;
  question_count: number;
  answered_count: number;
};

export type PracticeEntryData = {
  certification: {
    id: string;
    code: string;
    name: string;
    provider: string;
    total_questions: number;
    free_question_limit: number;
  };
  stats: {
    answered_count: number;
    correct_count: number;
    wrong_count: number;
    correct_rate: number;
  };
  last_question_sort_order: number | null;
  categories: Category[];
};

const MOCK_CERT = {
  id: "1",
  code: "aws-saa",
  name: "AWS Solutions Architect Associate",
  provider: "AWS",
  total_questions: 350,
  free_question_limit: 15,
};

const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Compute", sort_order: 1, question_count: 60, answered_count: 45 },
  { id: "2", name: "Storage", sort_order: 2, question_count: 50, answered_count: 32 },
  { id: "3", name: "Networking", sort_order: 3, question_count: 40, answered_count: 28 },
  { id: "4", name: "Database", sort_order: 4, question_count: 45, answered_count: 20 },
  { id: "5", name: "Security", sort_order: 5, question_count: 55, answered_count: 31 },
  { id: "6", name: "Architecture", sort_order: 6, question_count: 50, answered_count: 0 },
  { id: "7", name: "Cost Optimization", sort_order: 7, question_count: 50, answered_count: 0 },
];

const MOCK_CERTS: Record<string, typeof MOCK_CERT> = {
  "aws-saa": MOCK_CERT,
  "aws-dva": {
    id: "2",
    code: "aws-dva",
    name: "AWS Developer Associate",
    provider: "AWS",
    total_questions: 280,
    free_question_limit: 12,
  },
};

export async function getPracticeEntryData(
  certCode: string,
  _options?: { locale?: string; userId?: string | null }
): Promise<PracticeEntryData | null> {
  const cert = MOCK_CERTS[certCode] ?? null;
  if (!cert) return null;

  // TODO: Replace with Supabase when tables exist
  return {
    certification: cert,
    stats: {
      answered_count: 156,
      correct_count: 113,
      wrong_count: 43,
      correct_rate: 72.4,
    },
    last_question_sort_order: 156,
    categories: MOCK_CATEGORIES,
  };
}
