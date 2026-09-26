import { createClient } from "@supabase/supabase-js";
import { hashSync } from "bcryptjs";
import { E2E_PASSWORD } from "./fixtures";

type TestUser = {
  username: string;
  role: "admin" | "agent";
  mustChangePassword: boolean;
};

const testUsers: TestUser[] = [
  { username: "e2e-admin", role: "admin", mustChangePassword: false },
  { username: "e2e-agent", role: "agent", mustChangePassword: false },
  { username: "e2e-fresh", role: "agent", mustChangePassword: true },
  { username: "e2e-victim", role: "agent", mustChangePassword: false },
  { username: "e2e-locked", role: "agent", mustChangePassword: false },
  { username: "e2e-logout", role: "agent", mustChangePassword: false },
];

const globalSetup = async (): Promise<void> => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  await supabase.from("login_attempts").delete().like("username", "e2e-%");
  const { error: cleanupError } = await supabase.from("users").delete().like("username", "e2e-%");
  if (cleanupError) throw cleanupError;

  const passwordHash = hashSync(E2E_PASSWORD, 4);
  for (const [index, { username, role, mustChangePassword }] of testUsers.entries()) {
    const { data, error } = await supabase
      .from("users")
      .insert({ username, role, full_name: username, password_hash: passwordHash, must_change_password: mustChangePassword })
      .select("id")
      .single();
    if (error) throw error;
    if (role === "agent") {
      const { error: agentError } = await supabase.from("agents").insert({ user_id: data.id, code: `E2E-${index}` });
      if (agentError) throw agentError;
    }
  }
};

export default globalSetup;
