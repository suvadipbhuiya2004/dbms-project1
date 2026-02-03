// Base json response
const jsonResponse = (payload, status = 200) => Response.json(payload, { status });

// Success response
export const successResponse = (
  data = null,
  message = 'Success',
  status = 200
) =>
  jsonResponse(
    {
      success: true,
      message,
      ...(data !== null && { data }),
    },
    status
  );

// Error response
export const errorResponse = (
  message = 'Error',
  status = 400,
  errors = null
) =>
  jsonResponse(
    {
      success: false,
      message,
      ...(errors && { errors }),
    },
    status
  );

// HTTP specific responses
export const unauthorizedResponse = (message = 'Unauthorized') => errorResponse(message, 401);

export const forbiddenResponse = (message = 'Forbidden') => errorResponse(message, 403);

export const notFoundResponse = (message = 'Resource not found') => errorResponse(message, 404);

export const validationErrorResponse = (errors) => errorResponse('Validation failed', 422, errors);

export const serverErrorResponse = (message = 'Internal server error') => errorResponse(message, 500);

// Validate required fields
export const validateRequired = (data, required) => {
  const errors = {};

  for (const field of required) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ''
    ) {
      errors[field] = `${field} is required`;
    }
  }

  return Object.keys(errors).length ? errors : null;
};

// Email validation
export const isValidEmail = (email) =>
  typeof email === 'string' &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// UUID validation
export const isValidUUID = (uuid) =>
  typeof uuid === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  );

// Pagination params
export const parsePaginationParams = (url) => {
  const params = url.searchParams;

  const page = Math.max(1, Number(params.get('page')) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(params.get('limit')) || 10)
  );

  return { page, limit, offset: (page - 1) * limit };
};

// Sort params
export const parseSortParams = (
  url,
  allowedFields = ['created_at'],
  defaultField = 'created_at'
) => {
  const params = url.searchParams;

  const sortBy = allowedFields.includes(params.get('sortBy'))
    ? params.get('sortBy')
    : defaultField;

  const order =
    params.get('order')?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return { sortBy, order };
};

export default {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
  validateRequired,
  isValidEmail,
  isValidUUID,
  parsePaginationParams,
  parseSortParams,
};
