import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "next-env.d.ts",
    // Vendored legacy prasynx-management-frontend code, copied verbatim.
    "app/(portals)/management/lib/**",
    "app/(portals)/management/components/**",
    "app/(portals)/management/language/**",
    "app/(portals)/management/i18n/**",
    "app/(portals)/management/contexts/**",
    "app/(portals)/management/StaffTab.tsx",
    "app/(portals)/management/StaffAttendanceTab.tsx",
    "app/(portals)/management/page.tsx",
    "app/(portals)/management/staff/*/page.tsx",
    "components/CommandPalette.tsx",
    "components/ui/avatar.tsx",
    "components/ui/badge.tsx",
    "components/ui/input.tsx",
    "components/ui/progress.tsx",
    "components/ui/sonner.tsx",
    "components/ui/textarea.tsx",
    "lib/utils.ts",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // @prasynx/web must never talk to Supabase directly; it only calls the monolith API.
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@supabase/supabase-js", "@supabase/*"],
              message:
                "Direct Supabase access is not allowed in apps/web. Use the monolith API client instead.",
            },
          ],
        },
      ],
    },
  },
]);