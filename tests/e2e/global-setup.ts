import { execFileSync } from "node:child_process";
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
  { username: "e2e-buyer", role: "agent", mustChangePassword: false },
  { username: "e2e-canceller", role: "agent", mustChangePassword: false },
  { username: "e2e-payer", role: "agent", mustChangePassword: false },
  { username: "e2e-notify", role: "agent", mustChangePassword: false },
  { username: "e2e-a11y", role: "agent", mustChangePassword: false },
];

const E2E_USERS = "(select id from users where username like 'e2e-%')";

const cleanupSql = `
  delete from orders where agent_id in ${E2E_USERS};
  delete from carts where agent_id in ${E2E_USERS};
  delete from audit_logs where actor_id in ${E2E_USERS};
  delete from announcements where author_id in ${E2E_USERS};
  update app_settings set value = '[]' where key in ('bank_accounts', 'notification_recipients');
  delete from products where slug like 'e2e-%';
  delete from login_attempts where username like 'e2e-%';
  delete from users where username like 'e2e-%';
`;

const quote = (value: string): string => `'${value.replaceAll("'", "''")}'`;

const usersSql = (passwordHash: string): string =>
  testUsers
    .map(
      ({ username, role, mustChangePassword }, index) => `
        with new_user as (
          insert into users (username, role, full_name, password_hash, must_change_password)
          values (${quote(username)}, '${role}', ${quote(username)}, ${quote(passwordHash)}, ${mustChangePassword})
          returning id
        )
        ${role === "agent" ? `insert into agents (user_id, code) select id, 'E2E-${index}' from new_user;` : "select 1 from new_user;"}
      `,
    )
    .join("\n");

const productsSql = `
  insert into products (slug, name, category_id, status, custom_size_enabled, custom_unit_price)
  select 'e2e-cart', 'E2E Keranjang', id, 'active', true, 150000 from categories where code = 'dress';
  insert into products (slug, name, category_id, status)
  select 'e2e-cart-two', 'E2E Kedua', id, 'active' from categories where code = 'koko';
  insert into product_colors (product_id, name, sort)
  select p.id, c.name, c.sort from products p
  cross join (values ('Hitam', 1), ('Putih', 2)) as c(name, sort)
  where p.slug in ('e2e-cart', 'e2e-cart-two');
  insert into size_prices (product_id, size_code, unit_price)
  select p.id, s.code, s.price from products p
  cross join (values ('S', 100000), ('M', 120000)) as s(code, price)
  where p.slug in ('e2e-cart', 'e2e-cart-two');
  insert into po_batches (product_id, batch_no, label, status)
  select id, 1, 'B1', 'open' from products where slug in ('e2e-cart', 'e2e-cart-two');
`;

const globalSetup = async (): Promise<void> => {
  const databaseUrl = process.env.E2E_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
  const sql = [cleanupSql, usersSql(hashSync(E2E_PASSWORD, 4)), productsSql].join("\n");
  execFileSync("psql", [databaseUrl, "-q", "-v", "ON_ERROR_STOP=1", "-1", "-c", sql], { stdio: ["ignore", "ignore", "inherit"] });
};

export default globalSetup;
