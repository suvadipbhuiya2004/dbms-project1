import { query, withTransaction } from '@/lib/db/pool';
import { hashPassword, generateToken } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  validateRequired,
  isValidEmail,
} from '@/lib/apiHelpers';

const VALID_ROLES = ['STUDENT', 'INSTRUCTOR', 'ADMIN', 'DATA_ANALYST'];

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ body: 'Invalid JSON body' });
  }

  const { email, password, role, ...profileData } = body;

  const errors = validateRequired(body, ['email', 'password', 'role']);
  if (errors) return validationErrorResponse(errors);

  if (!isValidEmail(email)) {
    return validationErrorResponse({ email: 'Invalid email format' });
  }

  if (!VALID_ROLES.includes(role)) {
    return validationErrorResponse({
      role: 'Invalid role. Must be STUDENT, INSTRUCTOR, ADMIN, or DATA_ANALYST',
    });
  }

  const { rows: existing } = await query(
    'SELECT 1 FROM users WHERE email = $1',
    [email]
  );

  if (existing.length > 0) {
    return errorResponse('User with this email already exists', 409);
  }

  const passwordHash = await hashPassword(password);

  try {
    const result = await withTransaction(async (client) => {
      // Create user
      const { rows } = await client.query(
        `
        INSERT INTO users (email, password_hash, role)
        VALUES ($1, $2, $3)
        RETURNING id, email, role, created_at
        `,
        [email, passwordHash, role]
      );

      const user = rows[0];

      // Role-specific profile
      if (role === 'STUDENT') {
        const { name, age, country, skill_level, category } = profileData;

        if (!name) {
          throw {
            type: 'validation',
            errors: { name: 'Name is required for students' },
          };
        }

        await client.query(
          `
          INSERT INTO student (user_id, role, name, age, country, skill_level, category)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            user.id,
            role,
            name,
            age ?? null,
            country ?? null,
            skill_level ?? null,
            category ?? null,
          ]
        );
      }

      if (role === 'INSTRUCTOR') {
        const { name, experience = 0, rating = 0 } = profileData;

        if (!name) {
          throw {
            type: 'validation',
            errors: { name: 'Name is required for instructors' },
          };
        }

        await client.query(
          `
          INSERT INTO instructor (user_id, role, name, experience, rating)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [user.id, role, name, experience, rating]
        );
      }
      return user;
    });

    const token = generateToken({
      userId: result.id,
      email: result.email,
      role: result.role,
    });

    return successResponse(
      {
        user: result,
        token,
      },
      'User registered successfully',
      201
    );
  } catch (err) {
    if (err?.type === 'validation') {
      return validationErrorResponse(err.errors);
    }

    console.error('Registration error', {
      message: err.message,
      code: err.code,
    });

    return errorResponse('Failed to register user', 500);
  }
}
