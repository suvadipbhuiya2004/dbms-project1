import { getServerUser } from "@/lib/serverAuth";
import { query } from "@/lib/db/pool";
import CourseList from "../../components/CourseList";

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

export default async function CoursesPage() {
  const user = await getServerUser();

  const { rows: courses } = await query(`
    SELECT
      c.id,
      c.name,
      c.description,
      c.program_type,
      c.duration,
      c.university_id,
      c.book_id,
      u.name AS university,
      tb.title AS textbook_title,
      tb.author AS textbook_author
    FROM courses c
    JOIN partner_university u ON u.id = c.university_id
    LEFT JOIN textbooks tb ON tb.id = c.book_id
    ORDER BY c.created_at DESC
  `);

  // Fetch topics for each course
  const { rows: courseTopics } = await query(`
    SELECT ct.course_id, t.name AS topic_name
    FROM course_topics ct
    JOIN topics t ON t.id = ct.topic_id
  `);

  // Organize topics by course
  const topicsByCourse = {};
  courseTopics.forEach((ct) => {
    if (!topicsByCourse[ct.course_id]) {
      topicsByCourse[ct.course_id] = [];
    }
    topicsByCourse[ct.course_id].push(ct.topic_name);
  });

  // Attach topics and textbook to each course
  const enrichedCourses = courses.map((course) => ({
    ...course,
    topics: topicsByCourse[course.id] || [],
    textbook:
      course.textbook_title && course.textbook_author
        ? { title: course.textbook_title, author: course.textbook_author }
        : null,
  }));

  const { rows: universities } = await query(`
    SELECT id, name FROM partner_university ORDER BY name
  `);

  return <CourseList courses={enrichedCourses} universities={universities} userRole={user?.role} />;
}

