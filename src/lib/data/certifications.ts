/**
 * Certifications data layer.
 * Uses mock data when Supabase tables are not yet available.
 */

export type Certification = {
  id: string;
  code: string;
  name: string;
  provider: "AWS" | "Azure" | "GCP";
  description: string | null;
  icon_url: string | null;
  total_questions: number;
  free_question_limit: number;
  is_active: boolean;
  name_translated?: string;
};

export type CertificationWithProgress = Certification & {
  answered_count: number;
};

const MOCK_CERTIFICATIONS: Certification[] = [
  {
    id: "1",
    code: "aws-saa",
    name: "AWS Solutions Architect Associate",
    provider: "AWS",
    description: "Design and deploy scalable, highly available systems on AWS.",
    icon_url: null,
    total_questions: 350,
    free_question_limit: 15,
    is_active: true,
  },
  {
    id: "2",
    code: "aws-dva",
    name: "AWS Developer Associate",
    provider: "AWS",
    description: "Develop and maintain applications on the AWS platform.",
    icon_url: null,
    total_questions: 280,
    free_question_limit: 12,
    is_active: true,
  },
  {
    id: "3",
    code: "az-900",
    name: "Azure Fundamentals",
    provider: "Azure",
    description: "Microsoft Azure cloud concepts and services.",
    icon_url: null,
    total_questions: 200,
    free_question_limit: 10,
    is_active: false,
  },
  {
    id: "4",
    code: "gcp-ace",
    name: "Associate Cloud Engineer",
    provider: "GCP",
    description: "Deploy and maintain applications on Google Cloud.",
    icon_url: null,
    total_questions: 250,
    free_question_limit: 10,
    is_active: false,
  },
];

export async function getCertifications(options?: {
  locale?: string;
  provider?: "AWS" | "Azure" | "GCP" | "all";
  userId?: string | null;
}): Promise<CertificationWithProgress[]> {
  const { provider = "all" } = options ?? {};
  let certs = MOCK_CERTIFICATIONS.filter((c) => c.is_active);

  if (provider !== "all") {
    certs = certs.filter((c) => c.provider === provider);
  }

  // TODO: Replace with Supabase query when tables exist
  // const { data } = await supabase.from('certifications').select('*').eq('is_active', true);
  // Join certification_translations for locale
  // Join user_attempts for progress when userId present

  return certs.map((c) => ({
    ...c,
    answered_count: 0, // Mock: no progress. Real: aggregate from user_attempts
  }));
}

export async function getCertificationByCode(
  code: string,
  options?: { locale?: string }
): Promise<Certification | null> {
  const cert = MOCK_CERTIFICATIONS.find((c) => c.code === code);
  if (!cert) return null;
  return cert;
}
