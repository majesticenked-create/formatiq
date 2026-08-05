import type { ComponentType } from 'react';

export interface ToolFaq {
  question: string;
  answer: string;
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
  /** FAQ entries rendered with FAQPage structured data */
  faqs: ToolFaq[];
  /** The React component implementing the tool's interactive UI */
  Component: ComponentType;
}

export interface CategoryDefinition {
  slug: string;
  title: string;
  description: string;
}
