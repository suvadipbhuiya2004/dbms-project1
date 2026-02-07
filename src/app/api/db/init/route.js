import {
  isDatabaseInitialized,
  initializeDatabase,
  resetDatabase,
} from "@/lib/db/init";
import runSeeds from "@/lib/db/seed";
import { successResponse, errorResponse } from "@/lib/apiHelpers";

// GET database status
export async function GET() {
  try {
    const initialized = await isDatabaseInitialized();

    return successResponse({
      initialized,
      message: initialized
        ? "Database is initialized"
        : "Database is not initialized",
    });
  } catch (err) {
    console.error("Check database status error", {
      message: err.message,
      code: err.code,
    });

    return errorResponse("Failed to check database status", 500);
  }
}

// POST initialize or reset database
export async function POST(request) {
  if (process.env.NODE_ENV === "production") {
    return errorResponse("Operation not allowed in production", 403);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {}

  const { action, seed = false } = body;

  if (!action) {
    return errorResponse("Action is required (init or reset)", 400);
  }

  try {
    if (action === "init") {
      const initialized = await isDatabaseInitialized();

      if (initialized) {
        return errorResponse("Database is already initialized", 400);
      }

      await initializeDatabase();
      if (seed) await runSeeds();

      return successResponse(
        { initialized: true },
        seed
          ? "Database initialized and seeded successfully"
          : "Database initialized successfully",
      );
    }

    if (action === "reset") {
      await resetDatabase();
      if (seed) await runSeeds();

      return successResponse(
        { initialized: true },
        seed
          ? "Database reset and seeded successfully"
          : "Database reset successfully",
      );
    }

    return errorResponse('Invalid action. Must be "init" or "reset"', 400);
  } catch (err) {
    console.error("Database init/reset error", {
      message: err.message,
      code: err.code,
    });

    return errorResponse("Failed to initialize database", 500);
  }
}
