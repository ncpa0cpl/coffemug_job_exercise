import { sql, type SqlFunction, transaction } from "./database.ts";

export type Migration = {
  name: string;
  timestamp: number;
  up(sql: SqlFunction): Promise<any>;
};

export class MigrationsController {
  static migrations: Migration[] = [];

  private static async prepare() {
    await sql`CREATE TABLE IF NOT EXISTS migrations (
        name VARCHAR PRIMARY KEY,
        timestamp INT
    )`.run();
  }

  private static async isApplied(name: string) {
    const result = await sql`SELECT name FROM migrations WHERE name = ${name}`.getAll();
    return result.length > 0;
  }

  static async applyMigrations() {
    await this.prepare();

    const sortedMigrations = this.migrations.toSorted((a, b) => a.timestamp - b.timestamp);
    const pendingMigrations: Migration[] = [];

    for (const m of sortedMigrations) {
      if (!(await this.isApplied(m.name))) {
        pendingMigrations.push(m);
      }
    }

    if (pendingMigrations.length > 0) {
      await transaction(async (sql) => {
        for (const m of pendingMigrations) {
          await m.up(sql);
          await sql`INSERT INTO migrations VALUES (${m.name}, ${m.timestamp})`.run();
        }
      });
    }
  }
}
