import CourseDetailClient from '@/components/CourseDetailClient';
import { INITIAL_COURSES } from '@/lib/seed-data';

export async function generateStaticParams() {
  return INITIAL_COURSES.map((course) => ({
    id: course.id,
  }));
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <CourseDetailClient id={resolvedParams.id} />;
}

