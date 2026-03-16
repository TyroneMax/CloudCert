#!/usr/bin/env node
/**
 * Seed users with password admin123
 * Creates users in auth.users via Supabase Admin API.
 * The handle_new_user trigger automatically creates public.users and user_preferences.
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local or environment
 * Run: node scripts/seed-users.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local if exists (try cwd first for npm run, then script dir)
const envPaths = [
  resolve(process.cwd(), ".env.local"),
  resolve(__dirname, "../.env.local"),
];
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    }
    break;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PASSWORD = "admin123";

const USERS_TO_CREATE = [
  { email: "admin@example.com", displayName: "Admin" },
  { email: "test@example.com", displayName: "Test User" },
];

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(
      "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
    );
    console.error(
      "Add SUPABASE_SERVICE_ROLE_KEY to .env.local (get it from Supabase Dashboard → Settings → API)"
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Creating ${USERS_TO_CREATE.length} user(s) with password: ${PASSWORD}\n`);

  for (const { email, displayName } of USERS_TO_CREATE) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: displayName },
    });

    if (error) {
      if (error.message?.includes("already been registered")) {
        console.log(`⏭  ${email} - already exists, skipping`);
      } else {
        console.error(`❌ ${email} - ${error.message}`);
      }
      continue;
    }

    console.log(`✅ ${email} - created (id: ${data.user?.id})`);
  }

  console.log("\nDone. Users are linked to auth.users; public.users is populated by handle_new_user trigger.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
