const acronyms = [
  ['AI', 'Artificial Intelligence'],
  ['AIRMF', 'AI Risk Management Framework'],
  ['API', 'Application Programming Interface'],
  ['ATLAS', 'Adversarial Threat Landscape for Artificial Intelligence Systems'],
  ['CDN', 'Content Delivery Network'],
  ['CI/CD', 'Continuous Integration and Continuous Deployment'],
  ['CLI', 'Command-line Interface'],
  ['CPU', 'Central Processing Unit'],
  ['CRM', 'Customer Relationship Management'],
  ['CVE', 'Common Vulnerabilities and Exposures'],
  ['CWE', 'Common Weakness Enumeration'],
  ['DAST', 'Dynamic Application Security Testing'],
  ['DDoS', 'Distributed Denial of Service'],
  ['DoS', 'Denial of Service'],
  ['EDR', 'Endpoint Detection and Response'],
  ['ETL', 'Extract, Transform, Load'],
  ['EU', 'European Union'],
  ['GAN', 'Generative Adversarial Network'],
  ['GDPR', 'General Data Protection Regulation'],
  ['GPU', 'Graphics Processing Unit'],
  ['GRC', 'Governance, Risk, and Compliance'],
  ['HTTPS', 'Hypertext Transfer Protocol Secure'],
  ['IaC', 'Infrastructure as Code'],
  ['IAM', 'Identity and Access Management'],
  ['IDE', 'Integrated Development Environment'],
  ['IdP', 'Identity Provider'],
  ['IDS', 'Intrusion Detection System'],
  ['IP', 'Intellectual Property'],
  ['ISO', 'International Organization for Standardization'],
  ['ITIL', 'Information Technology Infrastructure Library'],
  ['ITSM', 'Information Technology Service Management'],
  ['LAN', 'Local Area Network'],
  ['LDAP', 'Lightweight Directory Access Protocol'],
  ['LLM', 'Large Language Model'],
  ['MCP', 'Model Context Protocol'],
  ['MDLC', 'Model Development Life Cycle'],
  ['MFA', 'Multifactor Authentication'],
  ['MIT', 'Massachusetts Institute of Technology'],
  ['ML', 'Machine Learning'],
  ['MLOps', 'Machine Learning Operations'],
  ['MSSP', 'Managed Security Service Provider'],
  ['NACL', 'Network Access Control List'],
  ['NIST', 'National Institute of Standards and Technology'],
  ['NLP', 'Natural Language Processing'],
  ['OECD', 'Organisation for Economic Co-operation and Development'],
  ['OAuth', 'Open Authorization'],
  ['OWASP', 'Open Worldwide Application Security Project'],
  ['PCI DSS', 'Payment Card Industry Data Security Standard'],
  ['PII', 'Personally Identifiable Information'],
  ['RAG', 'Retrieval-augmented Generation'],
  ['RMF', 'Risk Management Framework'],
  ['SCA', 'Software Composition Analysis'],
  ['SDLC', 'Software Development Life Cycle'],
  ['SIEM', 'Security Information and Event Management'],
  ['SLM', 'Small Language Model'],
  ['SOAR', 'Security Orchestration, Automation, and Response'],
  ['SOC', 'Security Operations Center'],
  ['SOC 2', 'System and Organization Controls 2'],
  ['SQL', 'Structured Query Language'],
  ['SSH', 'Secure Shell'],
  ['TLS', 'Transport Layer Security'],
  ['VPC', 'Virtual Private Cloud'],
  ['WAF', 'Web Application Firewall'],
] as const;

export default function AcronymFlashcardsPage() {
  return (
    <div className="stack-xl">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Review</p>
            <h2>Acronym Flashcards</h2>
          </div>
        </div>
        <p className="panel__copy">
          Rapid acronym drills pulled from the CompTIA SecAI+ objectives so you can reinforce core
          exam vocabulary.
        </p>
      </section>

      <section className="chapter-grid">
        {acronyms.map(([short, full]) => (
          <article key={short} className="chapter-card">
            <div className="chapter-card__header">
              <span className="chapter-card__badge">{short}</span>
              <h3>{full}</h3>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
