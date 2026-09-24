import type { GuideBlock } from '@/content/guides/types';

/**
 * Renders a single guide content block. Pure/static (server component) -
 * no client JS needed for any block type.
 */
export default function GuideBlockRenderer({ block, keyPrefix }: { block: GuideBlock; keyPrefix: string }) {
  switch (block.type) {
    case 'paragraph':
      return <p key={keyPrefix}>{block.text}</p>;

    case 'heading':
      return (
        <h3 key={keyPrefix} className="guide-subheading">
          {block.text}
        </h3>
      );

    case 'list':
      return block.ordered ? (
        <ol key={keyPrefix} className="guide-list">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul key={keyPrefix} className="guide-list">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case 'note':
      return (
        <div key={keyPrefix} className="guide-note">
          {block.text}
        </div>
      );

    case 'formula':
      return (
        <div key={keyPrefix} className="guide-formula">
          <div className="guide-formula-expr">{block.formula}</div>
          <dl className="guide-formula-legend">
            {block.legend.map((entry) => (
              <div key={entry.symbol}>
                <dt>{entry.symbol}</dt>
                <dd>{entry.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      );

    case 'example':
      return (
        <div key={keyPrefix} className="guide-example">
          <h4>{block.title}</h4>
          <ol>
            {block.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      );

    case 'table':
      return (
        <div key={keyPrefix} className="comparison-table-wrap">
          <table>
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'code':
      return (
        <pre key={keyPrefix} className="guide-code">
          <code>{block.code}</code>
        </pre>
      );

    default:
      return null;
  }
}
