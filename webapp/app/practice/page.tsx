import Link from 'next/link';

import { chapters, steps } from '../../lib/course-data';

export default function PracticePage() {
  return (
    <div className="stack-xl">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Practice hub</p>
            <h2>Jump into chapter practice</h2>
          </div>
        </div>
        <p className="panel__copy">
          Every chapter includes direct links to topics, scenarios, labs, flashcards, quizzes, and
          summary review. Use this page as a quick launchpad into any practice slice.
        </p>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Chapter routes</p>
            <h3>Per-chapter study paths</h3>
          </div>
        </div>
        <div className="practice-route-list">
          {chapters.map((chapter) => (
            <div key={chapter.slug} className="practice-route-item">
              <strong>{chapter.fullTitle}</strong>
              <div className="route-chip-row">
                {steps.map((step) => (
                  <Link
                    key={step.id}
                    href={`/chapters/${chapter.slug}/${step.id}`}
                    className="route-chip"
                  >
                    {step.shortLabel}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
