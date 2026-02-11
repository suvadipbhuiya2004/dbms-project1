import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import EnrolledStudents from "../../../../components/EnrolledStudents";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CourseStudentsPage({ params }) {
  const { id } = await params;
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is instructor for this course or admin
  let hasAccess = user.role === "ADMIN";

  if (!hasAccess && user.role === "INSTRUCTOR") {
    const { rows: teaching } = await query(
      `SELECT 1 FROM teaches WHERE course_id = $1 AND instructor_id = $2`,
      [id, user.id]
    );
    hasAccess = teaching.length > 0;
  }

  if (!hasAccess) {
    redirect(`/courses/${id}`);
  }

  // Fetch course info
  const { rows } = await query(
    `SELECT c.name, u.name AS university
     FROM courses c
     JOIN partner_university u ON u.id = c.university_id
     WHERE c.id = $1`,
    [id]
  );

  const course = rows[0];

  if (!course) {
    redirect('/courses');
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-7xl px-6 pt-12">
        <Link 
          href={`/courses/${id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Course
        </Link>

        <div className="rounded-[2.5rem] bg-white p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Enrolled Students</h1>
              <p className="text-lg text-slate-500 font-medium mt-1">{course.name}</p>
              <p className="text-sm text-slate-400">{course.university}</p>
            </div>
          </div>

          <EnrolledStudents courseId={id} />
        </div>
      </div>
    </div>
  );
}
