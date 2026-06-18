import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { notebooksDir } from '../../../lib/content-paths';

type NotebookRouteContext = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(_request: Request, { params }: NotebookRouteContext) {
  const { filename } = await params;

  if (!/^[a-z0-9_.-]+\.ipynb$/i.test(filename)) {
    return new Response('Invalid notebook filename.', { status: 400 });
  }

  const notebookPath = path.join(notebooksDir, filename);

  try {
    const file = await readFile(notebookPath);
    return new Response(file, {
      headers: {
        'Content-Type': 'application/x-ipynb+json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new Response('Notebook not found.', { status: 404 });
  }
}
