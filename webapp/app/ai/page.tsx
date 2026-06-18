import { AiChat } from '../../components/ai-chat';

export default function AiPage() {
  return (
    <div className="stack-xl">
      <section className="hero hero--chapter">
        <p className="eyebrow">AI study mode</p>
        <h2>Local chat with Ollama</h2>
        <p className="hero__copy">
          This route adds a basic free AI assistant to the migrated webapp by calling a local Ollama
          model through a Node-backed API route. It now streams responses token-by-token and can
          inject chapter-aware study context so answers stay grounded in the course.
        </p>
      </section>

      <AiChat />

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Setup</p>
            <h3>What has to be running</h3>
          </div>
        </div>
        <div className="migration-list">
          <div className="migration-item">
            <strong>1. Install Ollama and pull a model.</strong>
            <span>Example: <code>ollama pull llama3</code></span>
          </div>
          <div className="migration-item">
            <strong>2. Add webapp environment variables.</strong>
            <span>Create <code>webapp/.env.local</code> from the example file and set the model name.</span>
          </div>
          <div className="migration-item">
            <strong>3. Start the webapp.</strong>
            <span>Run <code>npm run web:dev</code> from the repo root, then open <code>/ai</code>.</span>
          </div>
          <div className="migration-item">
            <strong>4. Choose a chapter when you want grounded help.</strong>
            <span>The backend will inject chapter topics, scenarios, quiz prompts, and lab focus into the model request.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
