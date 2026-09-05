import BookDetailClient from '@/components/BookDetailClient';
import { INITIAL_BOOKS } from '@/lib/seed-data';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [
    ...INITIAL_BOOKS.map((book) => ({
      id: book.id,
    })),
    { id: '[id]' },
  ];
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <BookDetailClient id={resolvedParams.id} />;
}

