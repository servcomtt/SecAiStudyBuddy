# CompTIA SecAI+ CY0-001 Content Structure

Source: `materials/CompTIA SecAI+ CY0-001 Exam Objectives (4.0).pdf`

## Domain Weighting

- Domain 1.0: Basic AI Concepts Related to Cybersecurity (17%)
- Domain 2.0: Securing AI Systems (40%)
- Domain 3.0: AI-assisted Security (24%)
- Domain 4.0: AI Governance, Risk, and Compliance (19%)

## Domain 1.0 - Basic AI Concepts Related to Cybersecurity

### 1.1 Compare and contrast various AI types and techniques used in cybersecurity
- Types of AI
  - Generative AI
  - Machine learning
  - Statistical learning
  - Transformers
  - Deep learning
  - GANs
  - NLP (LLMs, SLMs)
- Model training techniques
  - Model validation
  - Supervised, unsupervised, reinforcement, federated learning
  - Fine-tuning, epoch, pruning, quantization
- Prompt engineering
  - System/user prompts
  - One-shot, multi-shot, zero-shot
  - System roles, templates

### 1.2 Explain the importance of data security in relation to AI
- Data processing
  - Cleansing, verification, lineage, integrity, provenance
  - Augmentation, balancing
- Data types
  - Structured, semi-structured, unstructured
- Watermarking
- RAG
  - Vector storage, embeddings

### 1.3 Explain the importance of security throughout the life cycle of AI
- Business use case and alignment with corporate objectives
- Data collection (trustworthiness, authenticity)
- Data preparation
- Model development/selection
- Model evaluation
- Deployment
- Validation
- Monitoring and maintenance
- Feedback and iteration
- Human-centric AI design
  - Human-in-the-loop, human oversight, human validation

## Domain 2.0 - Securing AI Systems

### 2.1 Given a scenario, use AI threat-modeling resources
- OWASP Top 10 (LLM Top 10, ML Security Top 10)
- MIT AI Risk Repository
- MITRE ATLAS
- CVE AI Working Group
- Threat-modeling frameworks

### 2.2 Given a set of requirements, implement security controls for AI systems
- Model controls
  - Model evaluation
  - Model guardrails (prompt templates)
- Gateway controls
  - Prompt firewalls
  - Rate limits, token limits, input quotas
  - Modality limits
  - Endpoint access controls
- Guardrail testing and validation

### 2.3 Given a scenario, implement appropriate access controls for AI systems
- Model access
- Data access
- Agent access
- Network/API access

### 2.4 Given a scenario, implement data security controls for AI systems
- Encryption (in transit, at rest, in use)
- Data safety
  - Anonymization
  - Classification labels
  - Redaction
  - Masking
  - Minimization

### 2.5 Given a scenario, implement monitoring and auditing for AI systems
- Prompt monitoring (query, response)
- Log monitoring, sanitization, protection
- Response confidence level
- Rate monitoring
- AI cost monitoring (prompts, storage, response, processing)
- Auditing for quality/compliance
  - Hallucinations, accuracy, bias/fairness, access

### 2.6 Given a scenario, analyze evidence of an attack and suggest compensating controls
- Attack types
  - Backdoor, trojan, prompt injection, poisoning
  - Jailbreaking, input manipulation, introducing biases
  - Guardrail circumvention, integration manipulation
  - Model inversion, model theft, supply chain attacks
  - Transfer learning attacks, model skewing, output integrity attacks
  - Membership inference, insecure output handling
  - Model DoS, sensitive information disclosure
  - Insecure plug-in design, excessive agency, overreliance
- Compensating controls
  - Prompt firewalls
  - Model guardrails
  - Access controls
  - Data integrity controls
  - Encryption
  - Prompt templates
  - Rate limiting
  - Least privilege

## Domain 3.0 - AI-assisted Security

### 3.1 Given a scenario, use AI-enabled tools to facilitate security tasks
- Tools/applications
  - IDE plug-ins, browser plug-ins, CLI plug-ins
  - Chatbots, personal assistants, MCP server
- Use cases
  - Signature matching
  - Code quality and linting
  - Vulnerability analysis
  - Automated penetration testing
  - Anomaly detection and pattern recognition
  - Incident management and threat modeling
  - Fraud detection
  - Translation and summarization

### 3.2 Explain how AI enables or enhances attack vectors
- AI-generated content/deepfake
  - Impersonation, misinformation, disinformation
- Adversarial networks
- Reconnaissance
- Social engineering
- Obfuscation
- Automated data correlation
- Automated attack generation
  - Attack vector discovery, payloads, malware, honeypot, DDoS

### 3.3 Given a scenario, use AI to automate security tasks
- Scripting tools (low-code, no-code)
- Document synthesis and summarization
- Incident response ticket management
- Change management
  - AI-assisted approvals
  - Automated deployment/rollback
- AI agents
- CI/CD automation
  - Code scanning
  - Software composition analysis
  - Unit, regression, and model testing
  - Automated deployment/rollback

## Domain 4.0 - AI Governance, Risk, and Compliance

### 4.1 Explain organizational governance structures that support AI
- Organizational structures
  - AI Center of Excellence
  - AI policies and procedures
- AI-related roles
  - Data scientist
  - AI architect
  - ML engineer
  - Platform engineer
  - MLOps engineer
  - AI security architect
  - AI governance engineer
  - AI risk analyst
  - AI auditor
  - Data engineer

### 4.2 Explain risks associated with AI
- Responsible AI principles
  - Fairness
  - Reliability and safety
  - Transparency
  - Privacy and security
  - Differential privacy
  - Explainability
  - Inclusiveness
  - Accountability
  - Consistency
  - Awareness training
- Risks
  - Introduction of bias
  - Accidental data leakage
  - Reputational loss
  - Model accuracy and performance issues
  - IP-related risks
  - Autonomous systems risk
- Shadow IT / Shadow AI

### 4.3 Summarize the impact of compliance on business use and development of AI
- EU AI Act
- OECD standards
- ISO AI standards
- NIST AI Risk Management Framework (AIRMF)
- Corporate policies
  - Sanctioned vs. unsanctioned
  - Private vs. public models
  - Sensitive data governance
- Third-party compliance evaluations
- Data sovereignty

## Suggested Build Order

1. Build questions and labs for Domain 2.0 first (largest weight).
2. Build Domain 3.0 second, then Domain 4.0.
3. Finish with Domain 1.0 foundations as reinforcement content.
