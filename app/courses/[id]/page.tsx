import CourseDetailClient from '@/components/CourseDetailClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <CourseDetailClient id={resolvedParams.id} />;
}
