type StatCardProps = {
  label: string;
  value: string;
  tone?: 'primary' | 'accent' | 'neutral';
};

export function StatCard({ label, value, tone = 'neutral' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}
