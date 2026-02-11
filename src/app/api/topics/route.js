import { query } from "@/lib/db/pool";
import { errorResponse } from "@/lib/apiHelpers";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, name FROM topics ORDER BY name ASC`
    );
    return Response.json({ topics: rows });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch topics", 500);
  }
}
