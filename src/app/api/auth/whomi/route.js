import { query } from '@/lib/db/pool';
import { getUserFromRequest } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
} from '@/lib/apiHelpers';

export async function GET(request) {
  const authUser = getUserFromRequest(request);

  if (!authUser) {
    return unauthorizedResponse('Not authenticated');
  }

  try {
    const { rows } = await query(
      `
      SELECT id, email, role, created_at
      FROM users
      WHERE id = $1
      `,
      [authUser.userId]
    );

    if (rows.length === 0) {
      return unauthorizedResponse('User not found');
    }

    const user = rows[0];

    let profile = null;

    if (user.role === 'STUDENT') {
      const { rows } = await query(
        `
        SELECT name, age, country, skill_level, category
        FROM student
        WHERE user_id = $1
        `,
        [user.id]
      );
      profile = rows[0] ?? null;
    }

    if (user.role === 'INSTRUCTOR') {
      const { rows } = await query(
        `
        SELECT name, experience, rating
        FROM instructor
        WHERE user_id = $1
        `,
        [user.id]
      );
      profile = rows[0] ?? null;
    }

    return successResponse({
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      profile,
    });
  } catch (err) {
    console.error('whomi endpoint error', {
      message: err.message,
      code: err.code,
    });

    return errorResponse('Failed to get user data', 500);
  }
}
