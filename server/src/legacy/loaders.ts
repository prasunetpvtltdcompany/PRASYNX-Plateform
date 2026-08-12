import path from 'node:path';
import { createRequire } from 'node:module';
import type { Application, Router } from 'express';

/**
 * Loader for the legacy portal backends (prasynx-management-backend and
 * prasynx-staff-backend). These standalone Express apps used to serve
 * /api/v2 and /api/workforce before the monolith existed. They are loaded
 * lazily at runtime (not statically typed) so the monolith's tsconfig
 * `rootDir: src` and build stay untouched, while the whole API surface runs
 * on this single port (4000) during development.
 */
const legacyRequire = createRequire(__filename);

interface LegacyApps {
  managementV2App: Application;
  workforceRouter: Router;
}

/** Repo-relative path from this file: server/src/legacy -> repo root. */
function repoPath(relativeFromRepo: string): string {
  return path.resolve(__dirname, '..', '..', '..', relativeFromRepo);
}

export function loadLegacyApps(): LegacyApps {
  // prasynx-management-backend boots its own env (dotenv) but reuses the same
  // SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from the monolith .env.
  const mgmtEntry = repoPath('prasynx-management-backend/src/app');
  const mgmtModule = legacyRequire(mgmtEntry) as { default?: Application } & Application;
  const managementV2App = mgmtModule.default ?? mgmtModule;

  const staffEntry = repoPath('prasynx-staff-backend/src/routes/refactored/workforce.routes');
  const staffModule = legacyRequire(staffEntry) as { default?: Router } & Router;
  const workforceRouter = staffModule.default ?? staffModule;

  return { managementV2App, workforceRouter };
}
