/**
 * Questions data layer for practice/quiz.
 * Uses mock data when Supabase tables are not yet available.
 * NOTE: Options do NOT include is_correct - that is only used server-side for answer validation.
 */

export type QuestionOption = {
  id: string;
  option_label: string;
  option_text: string;
  sort_order: number;
};

export type Question = {
  id: string;
  question_text: string;
  question_type: "single_choice" | "multiple_choice";
  category_name: string;
  category_id: string;
  sort_order: number;
  is_free: boolean;
  options: QuestionOption[];
};

export type QuestionsResult = {
  questions: Question[];
  total: number;
};

const MOCK_OPTIONS = (qId: string) => [
  { id: `${qId}-opt1`, option_label: "A", option_text: "Amazon S3", sort_order: 1 },
  { id: `${qId}-opt2`, option_label: "B", option_text: "Amazon EC2", sort_order: 2 },
  { id: `${qId}-opt3`, option_label: "C", option_text: "Amazon RDS", sort_order: 3 },
  { id: `${qId}-opt4`, option_label: "D", option_text: "AWS Lambda", sort_order: 4 },
];

const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    question_text:
      "Which AWS service provides resizable compute capacity in the cloud and allows you to run virtual servers?",
    question_type: "single_choice",
    category_name: "Compute",
    category_id: "1",
    sort_order: 1,
    is_free: true,
    options: MOCK_OPTIONS("q1"),
  },
  {
    id: "q2",
    question_text:
      "A company needs to store large amounts of unstructured data. Which AWS service is best suited for this use case?",
    question_type: "single_choice",
    category_name: "Storage",
    category_id: "2",
    sort_order: 2,
    is_free: true,
    options: MOCK_OPTIONS("q2"),
  },
  {
    id: "q3",
    question_text:
      "Which of the following are benefits of using Amazon VPC? (Select all that apply)",
    question_type: "multiple_choice",
    category_name: "Networking",
    category_id: "3",
    sort_order: 3,
    is_free: true,
    options: [
      { id: "q3-opt1", option_label: "A", option_text: "Isolated network environment", sort_order: 1 },
      { id: "q3-opt2", option_label: "B", option_text: "Control over IP address ranges", sort_order: 2 },
      { id: "q3-opt3", option_label: "C", option_text: "Creation of subnets", sort_order: 3 },
      { id: "q3-opt4", option_label: "D", option_text: "Automatic scaling of instances", sort_order: 4 },
    ],
  },
  {
    id: "q4",
    question_text:
      "What is the primary purpose of AWS CloudTrail?",
    question_type: "single_choice",
    category_name: "Security",
    category_id: "5",
    sort_order: 4,
    is_free: true,
    options: [
      { id: "q4-opt1", option_label: "A", option_text: "Monitor and log API calls", sort_order: 1 },
      { id: "q4-opt2", option_label: "B", option_text: "Store application logs", sort_order: 2 },
      { id: "q4-opt3", option_label: "C", option_text: "Manage EC2 instances", sort_order: 3 },
      { id: "q4-opt4", option_label: "D", option_text: "Deploy containers", sort_order: 4 },
    ],
  },
  {
    id: "q5",
    question_text:
      "Which AWS service is a fully managed relational database?",
    question_type: "single_choice",
    category_name: "Database",
    category_id: "4",
    sort_order: 5,
    is_free: true,
    options: MOCK_OPTIONS("q5"),
  },
  {
    id: "q6",
    question_text:
      "For high availability, how many Availability Zones should you use at minimum?",
    question_type: "single_choice",
    category_name: "Architecture",
    category_id: "6",
    sort_order: 6,
    is_free: false,
    options: [
      { id: "q6-opt1", option_label: "A", option_text: "One", sort_order: 1 },
      { id: "q6-opt2", option_label: "B", option_text: "Two", sort_order: 2 },
      { id: "q6-opt3", option_label: "C", option_text: "Three", sort_order: 3 },
      { id: "q6-opt4", option_label: "D", option_text: "Four", sort_order: 4 },
    ],
  },
];

// Correct option IDs for mock validation (server-side only - not exposed to client)
export const MOCK_CORRECT_OPTIONS: Record<string, string[]> = {
  q1: ["q1-opt2"],
  q2: ["q2-opt1"],
  q3: ["q3-opt1", "q3-opt2", "q3-opt3"],
  q4: ["q4-opt1"],
  q5: ["q5-opt3"],
  q6: ["q6-opt2"],
};

export const MOCK_EXPLANATIONS: Record<string, string> = {
  q1: "Amazon EC2 provides resizable compute capacity in the cloud. It allows you to launch virtual servers (instances) and scale capacity up or down as needed. S3 is for object storage, RDS is for managed databases, and Lambda is for serverless compute.",
  q2: "Amazon S3 is designed for storing and retrieving any amount of unstructured data. It offers high durability, availability, and scalability for objects like images, videos, and backups.",
  q3: "Amazon VPC provides an isolated network environment, control over IP address ranges, and the ability to create subnets. Automatic scaling of instances is handled by Auto Scaling, not VPC.",
  q4: "AWS CloudTrail enables governance, compliance, operational auditing, and risk auditing of your AWS account by logging API calls and related events.",
  q5: "Amazon RDS (Relational Database Service) is a fully managed relational database service that supports MySQL, PostgreSQL, MariaDB, Oracle, and SQL Server.",
  q6: "For high availability, you should use at least two Availability Zones to ensure redundancy. If one AZ fails, the other can continue serving traffic.",
};

const CERT_QUESTIONS: Record<string, Question[]> = {
  "aws-saa": MOCK_QUESTIONS,
  "aws-dva": MOCK_QUESTIONS.slice(0, 4),
};

export async function getQuestionsForPractice(
  certCode: string,
  options?: {
    mode?: "all" | "category";
    categoryId?: string;
    locale?: string;
  }
): Promise<QuestionsResult | null> {
  let questions = CERT_QUESTIONS[certCode] ?? null;
  if (!questions) return null;

  if (options?.mode === "category" && options?.categoryId) {
    questions = questions.filter((q) => q.category_id === options.categoryId);
  }

  return {
    questions,
    total: questions.length,
  };
}
