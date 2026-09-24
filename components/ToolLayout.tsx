import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ToolDefinition } from '@/lib/tools/types';
import { getCategory, getRelatedTools } from '@/lib/tools/registry';
import AdSlot from './AdSlot';
import RelatedTools from './RelatedTools';
import CopyLinkButton from './CopyLinkButton';
import ToolCta from './ToolCta';
import ToolActionBar from './ToolActionBar';
import ToolGuide from './tools/ToolGuide';

export default function ToolLayout({ tool, children }: { tool: ToolDefinition; children: ReactNode }) {
  const category = getCategory(tool.category);
  const related = getRelatedTools(tool);

  const baseUrl = 'https://formatiq.tools';

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
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Formatiq', item: baseUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: category?.title ?? tool.category,
            item: `${baseUrl}/tools/${tool.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.title,
            item: `${baseUrl}/tools/${tool.category}/${tool.slug}`,
          },
        ],
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
          <div className="tool-header-title-row">
            <h1>{tool.title}</h1>
            <CopyLinkButton />
          </div>
          <div className="tool-badges">
            <span className="pill">Client-side</span>
            <span className="pill">No sign-up</span>
            <span className="pill">Free</span>
          </div>
          <p>{tool.shortDescription}</p>
        </div>
      </div>

      <div className="container tool-workbench">
        {tool.useCase && (
          <div className="quick-facts">
            <h2>Quick facts</h2>
            <dl>
              <div>
                <dt>Category</dt>
                <dd>
                  <Link href={`/tools/${tool.category}`}>{category?.title ?? tool.category}</Link>
                </dd>
              </div>
              <div>
                <dt>Best for</dt>
                <dd>{tool.useCase}</dd>
              </div>
            </dl>
          </div>
        )}

        {children}
        <AdSlot label="In-content" />
      </div>

      <ToolActionBar toolTitle={tool.title} category={tool.category} slug={tool.slug} />

      <ToolGuide tool={tool} />

      <div className="container">
        <RelatedTools tools={related} />
      </div>

      <ToolCta category={tool.category} />
    </>
  );
}
