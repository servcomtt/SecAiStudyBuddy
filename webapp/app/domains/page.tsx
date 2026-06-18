export default async function DomainsPage() {
  const weightedDomains = [
    { id: '1.0', title: 'Basic AI Concepts Related to Cybersecurity', weight: 17, color: 'var(--primary)' },
    { id: '2.0', title: 'Securing AI Systems', weight: 40, color: '#2e9f62' },
    { id: '3.0', title: 'AI-assisted Security', weight: 24, color: '#f0b429' },
    { id: '4.0', title: 'AI Governance, Risk, and Compliance', weight: 19, color: '#8d56c5' },
  ] as const;

  const chapterDomains = [
    {
      id: '1',
      title: 'AI in Cybersecurity',
      page: 1,
      focuses: ['AI types and techniques', 'Prompt engineering', 'AI security fundamentals'],
    },
    {
      id: '2',
      title: 'Security and the AI Life Cycle',
      page: 27,
      focuses: ['Secure model life cycle', 'Data trust and integrity', 'Human-in-the-loop validation'],
    },
    {
      id: '3',
      title: 'AI Threats and Attacks',
      page: 57,
      focuses: ['Prompt injection and poisoning', 'Model theft and inversion', 'AI supply chain risks'],
    },
    {
      id: '4',
      title: 'AI Security Controls',
      page: 87,
      focuses: ['Guardrails and templates', 'Prompt firewall and quotas', 'Access and encryption controls'],
    },
    {
      id: '5',
      title: 'AI Monitoring and Auditing',
      page: 119,
      focuses: ['Prompt/log monitoring', 'Hallucination and bias checks', 'Quality and compliance audits'],
    },
    {
      id: '6',
      title: 'AI-Enhanced Attacks',
      page: 147,
      focuses: ['Deepfakes and social engineering', 'Automated attack generation', 'Adversarial misuse patterns'],
    },
    {
      id: '7',
      title: 'Enabling Security With AI',
      page: 167,
      focuses: ['AI-enabled security tooling', 'Automation and CI/CD use cases', 'Incident workflow acceleration'],
    },
    {
      id: '8',
      title: 'AI Governance, Risk, and Compliance',
      page: 195,
      focuses: ['Responsible AI principles', 'EU AI Act, OECD, ISO, NIST AIRMF', 'Policy, sovereignty, and oversight'],
    },
  ] as const;

  return (
    <div className="stack-xl">
      <section className="domain-hero">
        <h2>Exam Domains &amp; Weightings</h2>
        <p>
          The CY0-001 exam spans four weighted domains and eight study chapters. Use this view to
          prioritize study time based on exam impact.
        </p>
      </section>

      <section className="panel">
        <h3 className="domain-section-title">Domain Weightings</h3>
        <div className="domain-weight-list">
          {weightedDomains.map((domain) => (
            <div key={domain.id} className="domain-weight-row">
              <p className="domain-weight-row__label">
                <span>{domain.id}</span> {domain.title}
              </p>
              <div className="domain-weight-row__track">
                <div
                  className="domain-weight-row__fill"
                  style={{ width: `${domain.weight}%`, backgroundColor: domain.color }}
                />
              </div>
              <p className="domain-weight-row__percent">{domain.weight}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="domain-section-title">Exam Objectives - Click Any Domain to Expand</h3>
        <div className="domain-accordion-list">
          {chapterDomains.map((domain) => (
            <details key={domain.id} className="domain-accordion">
              <summary>
                <span className="domain-accordion__badge">{domain.id}</span>
                <span className="domain-accordion__title">{domain.title}</span>
                <span className="domain-accordion__meta">Starts p.{domain.page}</span>
              </summary>
              <ul>
                {domain.focuses.map((focus) => (
                  <li key={focus}>{focus}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section className="domain-bottom-grid">
        <article className="panel">
          <h3 className="domain-section-title">Exam Format</h3>
          <ul className="domain-note-list">
            <li>Maximum 60 questions</li>
            <li>60 minutes total exam time</li>
            <li>Passing score: 600 (scale 100-900)</li>
            <li>Multiple-choice and performance-based questions</li>
          </ul>
        </article>
        <article className="panel">
          <h3 className="domain-section-title">Exam Tips</h3>
          <ul className="domain-note-list">
            <li>Prioritize Domain 2 first (40% of exam).</li>
            <li>Practice scenario-style reasoning, not only term memorization.</li>
            <li>Review controls, monitoring, and compensating controls together.</li>
            <li>Use governance/compliance terms precisely in answers.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
