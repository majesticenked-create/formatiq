import type { ComponentType } from 'react';

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolHowItWorksStep {
  title: string;
  description: string;
}

export interface ToolBenefit {
  title: string;
  description: string;
}

export interface ToolDefinition {
  /** URL-safe identifier, unique within its category */
  slug: string;
  /** Category slug this tool belongs to */
  category: string;
  /** Display title, e.g. "JSON Formatter" */
  title: string;
  /** One-line summary used in cards / lists */
  shortDescription: string;
  /** Longer SEO description block shown on the tool page */
  longDescription: string;
  /** <title> tag content */
  metaTitle: string;
  /** <meta name="description"> content */
  metaDescription: string;
  /** Target keywords, used for internal reference / future SEO tooling */
  keywords: string[];
  /** Short, specific "best for" use case sentence, e.g. "Debugging malformed API responses" */
  useCase?: string;
  /** Optional 3-4 step "How this tool works" walkthrough shown above the tool workbench */
  howItWorks?: ToolHowItWorksStep[];
  /** Optional "Why use this tool" 2x2 feature card grid, exactly 4 items, shown after the long description */
  benefits?: ToolBenefit[];
  /** FAQ entries rendered with FAQPage structured data */
  faqs: ToolFaq[];
  /** Marks a tool as part of the most recently added batch, shown in the homepage "New Additions" section */
  isNew?: boolean;
  /** Marks a tool as a manually curated high-value pick, shown in the homepage "Popular Tools" section */
  isPopular?: boolean;
  /** The React component implementing the tool's interactive UI */
  Component: ComponentType;
}

export interface CategoryDefinition {
  slug: string;
  title: string;
  /** Short label for space-constrained UI (site nav, breadcrumb chips) - the full `title` is used everywhere else (H1s, meta, footer). */
  navLabel: string;
  description: string;
}
