interface AdSlotProps {
  label?: string;
}

/**
 * Placeholder for a display ad unit (AdSense/Ezoic/Mediavine).
 * Swap the contents for the actual ad network's script/ins tag when ready —
 * see PROJECT_PLAN.md §6 for placement guidance and Core Web Vitals notes.
 */
export default function AdSlot({ label = 'Ad' }: AdSlotProps) {
  return <div className="ad-slot">{label} slot</div>;
}
