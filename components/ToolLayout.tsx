import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ToolDefinition } from '@/lib/tools/types';
import { getCategory, getRelatedTools } from '@/lib/tools/registry';
import AdSlot from './AdSlot';
import RelatedTools from './RelatedTools';

export default function ToolLayout({ tool, children }: { tool: ToolDefinition; children: ReactNode }) {
  const category = getCategory(tool.category);
  const related = getRelatedTools(tool);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: tool.title,
        description: tool.metaDescription,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any (runs in browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="tool-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Formatiq</Link> /{' '}
            <Link href={`/tools/${tool.category}`}>{category?.title ?? tool.category}</Link> / {tool.title}
          </div>
          <h1>{tool.title}</h1>
          <p>{tool.shortDescription}</p>
        </div>
      </div>

      <div className="container tool-workbench">
        {children}
        <AdSlot label="In-content" />
      </div>

      <div className="container seo-content">
        <h2>About this tool</h2>
        <p>{tool.longDescription}</p>

        {tool.faqs.length > 0 && (
          <>
            <h2 style={{ marginTop: 32 }}>Frequently asked questions</h2>
            {tool.faqs.map((faq) => (
              <div className="faq-item" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="container">
        <RelatedTools tools={related} />
      </div>
    </>
  );
}
