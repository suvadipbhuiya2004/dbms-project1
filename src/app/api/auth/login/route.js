import { query } from '@/lib/db/pool';
import { verifyPassword, generateToken } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  validateRequired,
  isValidEmail,
} from '@/lib/apiHelpers';

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: 'Invalid JSON body' });
  }

  const { email, password } = body;

  const errors = validateRequired(body, ['email', 'password']);
  if (errors) return validationErrorResponse(errors);

  if (!isValidEmail(email)) {
    return validationErrorResponse({ email: 'Invalid email format' });
  }

  try {
    const { rows } = await query(
      `
      SELECT id, email, password_hash, role
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    const user = rows[0] ?? null;
    const passwordHash = user?.password_hash ?? '$2b$12$invalidinvalidinvalidinvalidinvalidinv';

    const passwordOk = await verifyPassword(password, passwordHash);

    if (!user || !passwordOk) {
      return errorResponse('Invalid email or password', 401);
    }

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

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      {
        // user: {
        //   id: user.id,
        //   email: user.email,
        //   role: user.role,
        //   profile,
        // },
        token,
      },
      'Login successful'
    );
  } catch (err) {
    console.error('Login error', {
      message: err.message,
      code: err.code,
    });

    return errorResponse('Failed to login', 500);
  }
}
