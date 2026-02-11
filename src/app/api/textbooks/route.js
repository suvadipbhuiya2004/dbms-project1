import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, title, author FROM textbooks ORDER BY title ASC`
    );
    return Response.json({ textbooks: rows });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch textbooks", 500);
  }
}
