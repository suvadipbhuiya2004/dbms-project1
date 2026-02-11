import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  const body = await request.json();
  const {
    name,
    description,
    program_type,
    duration,
    university_id,
    textbook,
    topics,
  } = body;

  try {
    // Start transaction
    await query("BEGIN");

    let bookId = null;

    // Handle textbook creation/lookup if provided
    if (textbook && textbook.title && textbook.author) {
      const { rows: bookRows } = await query(
        `
        INSERT INTO textbooks (title, author)
        VALUES ($1, $2)
        ON CONFLICT (title, author) DO UPDATE SET title = EXCLUDED.title
        RETURNING id
        `,
        [textbook.title.trim(), textbook.author.trim()]
      );
      bookId = bookRows[0].id;
    }

    // Create course
    const { rows: courseRows } = await query(
      `
      INSERT INTO courses
      (name, description, program_type, duration, university_id, book_id)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id
      `,
      [name, description, program_type, duration, university_id, bookId]
    );

    const courseId = courseRows[0].id;

    // Handle topics if provided
    if (topics && Array.isArray(topics) && topics.length > 0) {
      for (const topicName of topics) {
        if (!topicName || !topicName.trim()) continue;

        // Insert or get existing topic
        const { rows: topicRows } = await query(
          `
          INSERT INTO topics (name)
          VALUES ($1)
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
          `,
          [topicName.trim()]
        );

        const topicId = topicRows[0].id;

        // Link topic to course
        await query(
          `
          INSERT INTO course_topics (course_id, topic_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          `,
          [courseId, topicId]
        );
      }
    }

    // Commit transaction
    await query("COMMIT");

    return Response.json({ success: true, courseId });
  } catch (error) {
    // Rollback on error
    await query("ROLLBACK");
    console.error("Course creation error:", error);
    return errorResponse("Failed to create course: " + error.message, 500);
  }
}
