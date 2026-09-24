import { categories, tools } from '@/lib/tools/registry';
import { BrowserIcon, GridIcon, TagIcon, WrenchIcon } from '@/components/icons/UiIcons';

// Tool and category counts come from the registry. The other two are
// qualitative and deliberately qualified: some tools (e.g. currency
// conversion) call an external API, so we never claim every tool is fully client-side.
export default function StatsRow() {
  const categoryCount = new Set(tools.map((t) => t.category)).size || categories.length;
  const stats = [
    { icon: <WrenchIcon />, value: String(tools.length), label: 'Free developer tools' },
    { icon: <GridIcon />, value: String(categoryCount), label: 'Categories' },
    { icon: <BrowserIcon />, value: 'Browser-based', label: 'Most tools run locally' },
    { icon: <TagIcon />, value: 'No sign-up', label: 'Free to use' },
  ];
  return (
    <section className="stats-row" aria-label="Formatiq at a glance">
      <div className="container">
        <ul className="stats-list">
          {stats.map((s) => (
            <li key={s.label} className="stat">
              <span className="stat-icon" aria-hidden="true">{s.icon}</span>
              <span className="stat-text">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
