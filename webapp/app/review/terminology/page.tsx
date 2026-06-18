const terms = [
  'Prompt injection',
  'Model poisoning',
  'Model inversion',
  'Membership inference',
  'Prompt firewall',
  'Model guardrails',
  'Data provenance',
  'Data lineage',
  'Watermarking',
  'Differential privacy',
  'Human-in-the-loop',
  'Least privilege',
] as const;

export default function TerminologyPage() {
  return (
    <div className="stack-xl">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Review</p>
            <h2>Terminology</h2>
          </div>
        </div>
        <p className="panel__copy">
          Core SecAI+ terminology for quick recall before domain quizzes and scenario-based practice.
        </p>
      </section>

      <section className="panel">
        <div className="tag-row">
          {terms.map((term) => (
            <span key={term} className="tag">
              {term}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
