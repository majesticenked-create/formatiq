import Link from 'next/link';

export default function ToolCta({ category }: { category: string }) {
  return (
    <div className="tool-cta">
      <div className="container tool-cta-inner">
        <h2>Explore more free tools</h2>
        <p>Formatters, converters, validators, and generators - all free and running entirely in your browser.</p>
        <Link href={`/tools/${category}`} className="btn btn-primary">
          Browse more tools
        </Link>
      </div>
    </div>
  );
}
