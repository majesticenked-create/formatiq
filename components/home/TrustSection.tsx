// Honesty check (per audit): most Formatiq tools run entirely client-side
// (formatters, converters, hashers, generators, image/color tools), but a
// handful call an external API by necessity (e.g. currency conversion needs
// live exchange rates). The copy below is worded to reflect "most", not "all",
// so it stays true for the whole catalog rather than overclaiming.
const TRUST_POINTS = [
  {
    title: 'Runs in your browser',
    description:
      'Most tools on Formatiq process everything locally in your browser - nothing you paste is uploaded to a server. A small number that need live data, like currency conversion, are the exception.',
  },
  {
    title: 'No account, no paywall',
    description: 'Every tool is free to use, with no sign-up, no usage limits, and no premium tier.',
  },
  {
    title: 'Built for real tasks',
    description:
      'Each tool exists because a specific day-to-day task - debugging JSON, decoding a JWT, checking a regex - needed one, not to fill out a category.',
  },
  {
    title: 'No dark patterns',
    description: 'No fake countdowns, no intrusive pop-ups asking you to sign up before you can see a result.',
  },
];

export default function TrustSection() {
  return (
    <section aria-labelledby="trust-heading">
      <h2 id="trust-heading" className="section-title">
        Why Formatiq
      </h2>
      <div className="trust-grid">
        {TRUST_POINTS.map((point) => (
          <div key={point.title} className="trust-card">
            <h3>{point.title}</h3>
            <p>{point.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
