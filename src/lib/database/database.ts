import dedent from "dedent";
import { type ColumnDefinition, type RunResult } from "libsql";
import { SqliteError } from "libsql";
import Db from "libsql/promise";
import plainTag from "plain-tag";
import { pad } from "../../utils/pad.ts";
import { SqlGetError } from "../../utils/sql_get_error.ts";
import { MigrationsController } from "./migrations_controller.ts";

let readDb: Db;
let createDbWriteConn: () => Promise<Db>;

class WriteConnectionPool {
  static connections: Array<{ id: symbol; conn: Db; inUse: boolean }> = [];

  static async get() {
    for (const [idx, { id, conn, inUse }] of this.connections.entries()) {
      if (!inUse) {
        this.connections[idx]!.inUse = true;
        return [id, conn] as const;
      }
    }

    const id = Symbol();
    const newConn = await createDbWriteConn();
    this.connections.push({
      id: id,
      conn: newConn,
      inUse: true,
    });

    return [id, newConn] as const;
  }

  static release(id: symbol) {
    const idx = this.connections.findIndex(e => e.id === id);
    if (idx != -1) {
      this.connections[idx]!.inUse = false;
    }
  }

  static closeAll() {
    for (const { conn } of this.connections) {
      conn.close();
    }
    this.connections = [];
  }
}

export async function closeDb() {
  if (readDb && readDb.open) {
    readDb.close();
    WriteConnectionPool.closeAll();
  }
}

export async function initDatabase() {
  const dbFilepath = process.env.DATABASE_FILE;
  if (typeof dbFilepath !== "string") {
    throw new Error("DATABASE_FILE env variable must be set");
  }
  readDb = new Db(dbFilepath, undefined);
  await readDb.exec("PRAGMA foreign_keys = ON");
  createDbWriteConn = async () => {
    const d = new Db(dbFilepath, undefined);
    await d.exec("PRAGMA foreign_keys = ON");
    return d;
  };

  await MigrationsController.applyMigrations();
}

// used for testing only
export async function initInMemoryDatabase() {
  const db = new Db(":memory:", undefined);
  await db.exec("PRAGMA foreign_keys = ON");
  // we can't have multiple connections to the same in-memory db
  createDbWriteConn = async () => {
    return db;
  };
  readDb = db;

  await MigrationsController.applyMigrations();
}

function handleSqlError(err: unknown, query: string, params: any[]): never {
  if (err instanceof SqliteError) {
    console.error("SqliteError:", err.message, err.code, err.rawCode);
    console.error(`Caused by Query:\n  ${pad(query)}\nArguments: [${params.map(String).join(", ")}]`);
  }
  throw err;
}

function fmtSqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function createSqlStatement(db: Db, query: string, args: any[] = []): SqlStatement {
  args = args.flatMap((arg) => {
    if (arg instanceof Date) {
      return fmtSqlDateTime(arg);
    }
    return arg;
  });

  Object.freeze(args);

  return Object.freeze({
    query,
    parameters: args,
    database: db,
    async run() {
      try {
        const preparedStm = (await db.prepare(query)) as PreparedStatement;
        return await preparedStm.run(args);
      } catch (err) {
        handleSqlError(err, query, args);
      }
    },
    async getAll<R = unknown>(): Promise<R[]> {
      try {
        const preparedStm = (await db.prepare(query)) as PreparedStatement;
        return (await preparedStm.all(args)) as any;
      } catch (err) {
        handleSqlError(err, query, args);
      }
    },
    async get<R = unknown>(): Promise<R> {
      try {
        const preparedStm = (await db.prepare(query)) as PreparedStatement;
        const v = (await preparedStm.get(args)) as any;
        if (v == null) {
          throw new SqlGetError(query);
        }
        return v;
      } catch (err) {
        handleSqlError(err, query, args);
      }
    },
  });
}

function makeSqlFunction(db?: Db) {
  function sql(template: TemplateStringsArray, ...args: any[]): SqlStatement {
    const query = dedent(
      plainTag(template, ...args.map((arg) => (Array.isArray(arg) ? `(${arg.map(() => "?").join(",")})` : "?"))).trim(),
    );

    return createSqlStatement(db ?? readDb, query, args);
  }

  sql.from = function(this, query: string, args: any[] = []) {
    return createSqlStatement(db ?? readDb, query, args);
  };

  return sql;
}

export const sql = makeSqlFunction();

export async function transaction(fn: (sql: SqlFunction) => Promise<void>) {
  const [id, db] = await WriteConnectionPool.get();
  const sql = makeSqlFunction(db);
  await db.exec("BEGIN");
  try {
    await fn(sql);
    await db.exec("COMMIT");
  } catch (err) {
    await db.exec("ROLLBACK");
    throw err;
  } finally {
    WriteConnectionPool.release(id);
  }
}

export type SqlFunction = typeof sql;

type PreparedStatement = {
  database: Db;
  source: string;
  reader: boolean;
  readonly: boolean;
  busy: boolean;

  run(...params: any[]): Promise<RunResult>;
  get(...params: any[]): Promise<unknown>;
  all(...params: any[]): Promise<unknown[]>;
  iterate(...params: any[]): Promise<IterableIterator<unknown>>;
  pluck(toggleState?: boolean): PreparedStatement;
  expand(toggleState?: boolean): PreparedStatement;
  raw(toggleState?: boolean): PreparedStatement;
  bind(...params: any[]): PreparedStatement;
  columns(): Promise<ColumnDefinition[]>;
  safeIntegers(toggleState?: boolean): PreparedStatement;
};

export type SqlStatement = Readonly<{
  database: Db;
  query: string;
  parameters: readonly any[];
  run(): Promise<RunResult>;
  getAll<R = unknown>(): Promise<R[]>;
  get<R = unknown>(): Promise<R>;
}>;
