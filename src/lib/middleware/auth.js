import { getUserFromRequest } from "../auth.js";
import { unauthorizedResponse, forbiddenResponse } from "../apiHelpers.js";

// Authenticate and attach user to request
const authenticate = (request) => {
  const user = getUserFromRequest(request);
  if (!user) return null;

  request.auth = { user };
  return user;
};

// Require authentication middleware
const requireAuth = (handler) => {
  return async (request, context) => {
    const user = authenticate(request);

    if (!user) {
      return unauthorizedResponse("Authentication required");
    }

    return handler(request, context);
  };
};

// Require one of the given roles
const requireRole = (...allowedRoles) => {
  return (handler) => {
    return async (request, context) => {
      const user = authenticate(request);

      if (!user) {
        return unauthorizedResponse("Authentication required");
      }

      if (!allowedRoles.includes(user.role)) {
        return forbiddenResponse("Insufficient permissions");
      }

      return handler(request, context);
    };
  };
};

// Role-specific helpers
const requireAdmin = (handler) => requireRole("ADMIN")(handler);

const requireStudent = (handler) => requireRole("STUDENT")(handler);

const requireInstructor = (handler) => requireRole("INSTRUCTOR")(handler);

const requireDataAnalyst = (handler) => requireRole("DATA_ANALYST")(handler);

// Get authenticated user
const getUser = (request) => request.auth?.user ?? getUserFromRequest(request);

export {
  requireAuth,
  requireRole,
  requireAdmin,
  requireStudent,
  requireInstructor,
  requireDataAnalyst,
  getUser,
};
