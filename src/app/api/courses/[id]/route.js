import { getUserFromRequest } from "@/lib/auth/request";
import { query, withTransaction } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

export async function PATCH(request, { params }) {
  const { id } = await params;
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

    // Update course
    await query(
      `
      UPDATE courses
      SET name = $1, description = $2, program_type = $3, duration = $4, university_id = $5, book_id = $6
      WHERE id = $7
      `,
      [name, description, program_type, duration, university_id, bookId, id]
    );

    // Clear existing topics for this course
    await query("DELETE FROM course_topics WHERE course_id = $1", [id]);

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
          [id, topicId]
        );
      }
    }

    // Commit transaction
    await query("COMMIT");

    return Response.json({ success: true });
  } catch (error) {
    // Rollback on error
    await query("ROLLBACK");
    console.error("Course update error:", error);
    return errorResponse("Failed to update course: " + error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  await withTransaction(async (client) => {
    await client.query("DELETE FROM teaches WHERE course_id = $1", [id]);
    await client.query("DELETE FROM courses WHERE id = $1", [id]);
  });

  return Response.json({ success: true });
}
