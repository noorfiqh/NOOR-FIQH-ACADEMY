import { INITIAL_BOOKS } from '@/lib/seed-data';
import BookDetailClient from '@/components/BookDetailClient';

export function generateStaticParams() {
  return INITIAL_BOOKS.map((book) => ({
    id: book.id,
  }));
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <BookDetailClient id={resolvedParams.id} />;
}
