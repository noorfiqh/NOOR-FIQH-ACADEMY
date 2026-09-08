import CourseDetailClient from '@/components/CourseDetailClient';
import { INITIAL_COURSES } from '@/lib/seed-data';

export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = new Set<string>();
  INITIAL_COURSES.forEach((course) => ids.add(course.id));
  ids.add('detail');

  try {
    const fs = await import('fs');
    if (fs.existsSync('firebase-applet-config.json')) {
      const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'courses'));
      snap.forEach((d) => {
        if (d.id) ids.add(d.id);
      });
    }
  } catch {
    // fallback gracefully to static seeds
  }

  return Array.from(ids).map((id) => ({ id }));
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <CourseDetailClient id={resolvedParams.id} />;
}

