import BookDetailClient from '@/components/BookDetailClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <BookDetailClient id={resolvedParams.id} />;
}
