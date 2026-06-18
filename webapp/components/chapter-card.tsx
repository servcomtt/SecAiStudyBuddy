import Link from 'next/link';

import type { ChapterMeta } from '../lib/course-data';

type ChapterCardProps = {
  chapter: ChapterMeta;
};

export function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <Link href={`/chapters/${chapter.slug}/topics`} className="chapter-card">
      <div className="chapter-card__header">
        <span className="chapter-card__badge">Ch {chapter.number}</span>
        <h2>{chapter.title}</h2>
      </div>
      <p className="chapter-card__description">{chapter.description}</p>
      <div className="tag-row">
        {chapter.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="chapter-card__footer">Open chapter route</div>
    </Link>
  );
}
