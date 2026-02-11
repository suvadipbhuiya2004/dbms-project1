import { getUserFromRequest } from "@/lib/auth/request";
import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

// Get all students enrolled in a course (Instructor or Admin only)
export async function GET(request, { params }) {
  const { id: courseId } = await params;
  const user = getUserFromRequest(request);

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  // Check if user is instructor for this course or admin
  let hasAccess = user.role === "ADMIN";

  if (!hasAccess && user.role === "INSTRUCTOR") {
    const { rows: teaching } = await query(
      `SELECT 1 FROM teaches WHERE course_id = $1 AND instructor_id = $2`,
      [courseId, user.userId]
    );
    hasAccess = teaching.length > 0;
  }

  if (!hasAccess) {
    return errorResponse("Forbidden - Only instructors of this course or admins can view students", 403);
  }

  try {
    const { rows } = await query(
      `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        s.age, 
        s.country, 
        s.skill_level,
        e.marks,
        e.created_at as enrolled_at
      FROM enrollments e
      JOIN students s ON s.user_id = e.student_id
      JOIN users u ON u.id = s.user_id
      WHERE e.course_id = $1
      ORDER BY u.name ASC
      `,
      [courseId]
    );

    return Response.json({ students: rows });
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
    return errorResponse("Failed to fetch enrolled students", 500);
  }
}

// Add student to course (Admin only)
export async function POST(request, { params }) {
  const { id: courseId } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  const { studentId } = await request.json();

  if (!studentId) {
    return errorResponse("Student ID is required", 400);
  }

  try {
    await query(
      `
      INSERT INTO enrollments (student_id, course_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [studentId, courseId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error enrolling student:", error);
    return errorResponse("Failed to enroll student in course", 500);
  }
}

// Remove student from course (Admin only)
export async function DELETE(request, { params }) {
  const { id: courseId } = await params;
  const user = getUserFromRequest(request);

  if (!user || user.role !== "ADMIN") {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return errorResponse("Student ID is required", 400);
  }

  try {
    await query(
      `
      DELETE FROM enrollments
      WHERE student_id = $1 AND course_id = $2
      `,
      [studentId, courseId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error removing student:", error);
    return errorResponse("Failed to remove student from course", 500);
  }
}

// Update student marks (Instructor or Admin only)
export async function PUT(request, { params }) {
  const { id: courseId } = await params;
  const user = getUserFromRequest(request);

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  // Check if user is instructor for this course or admin
  let hasAccess = user.role === "ADMIN";

  if (!hasAccess && user.role === "INSTRUCTOR") {
    const { rows: teaching } = await query(
      `SELECT 1 FROM teaches WHERE course_id = $1 AND instructor_id = $2`,
      [courseId, user.userId]
    );
    hasAccess = teaching.length > 0;
  }

  if (!hasAccess) {
    return errorResponse("Forbidden - Only instructors of this course or admins can update marks", 403);
  }

  const { studentId, marks } = await request.json();

  if (!studentId) {
    return errorResponse("Student ID is required", 400);
  }

  if (marks === null || marks === undefined) {
    return errorResponse("Marks value is required", 400);
  }

  if (marks < 0 || marks > 100) {
    return errorResponse("Marks must be between 0 and 100", 400);
  }

  try {
    await query(
      `
      UPDATE enrollments
      SET marks = $1
      WHERE student_id = $2 AND course_id = $3
      `,
      [marks, studentId, courseId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating student marks:", error);
    return errorResponse("Failed to update student marks", 500);
  }
}
