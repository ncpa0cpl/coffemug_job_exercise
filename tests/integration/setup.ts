import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "../..");
const APP_MAIN = path.resolve(ROOT_DIR, "src/start.ts");

type ServerProc = {
  url: string;
  close(): void;
  out(): string;
};

type ServerOptions = {
  populateProducts?: boolean;
};

export function startServerForTesting(port: number, opt: ServerOptions = {}) {
  return new Promise<ServerProc>(async (res, rej) => {
    let tryResolve = (out: string): void => {
      if (out.includes("Server started")) {
        res(procHandler);
        tryResolve = () => {};
      }
    };

    const tmpDir = path.join(ROOT_DIR, "node_modules", ".tmp");
    await fs.mkdir(tmpDir, { recursive: true });

    const dbFilepath = path.join(tmpDir, `db_${port}.sql`);

    const proc = spawn("node", [APP_MAIN], {
      env: {
        NODE_ENV: "testing",
        PORT: port.toString(),
        DATABASE_FILE: dbFilepath,
        POPULATE_PRODUCTS: opt.populateProducts ? "true" : "false",
        /**
         * Date based discounts can cause flaky tests as we don't have a easy way
         * of manipulating the system time in the integration tests.
         */
        ADD_DATE_BASED_DISCOUNTS: "false",
      },
    });

    let serverOut = "";
    const procHandler = {
      url: `http://localhost:${port}`,
      async close() {
        proc.kill();
        await fs.unlink(dbFilepath);
      },
      out() {
        return serverOut;
      },
    };

    proc.stdout.setEncoding("utf8");
    proc.stdout.on("data", (data) => {
      data = data.toString();
      serverOut += data;
      tryResolve(serverOut);
    });

    proc.stderr.setEncoding("utf8");
    proc.stderr.on("data", (data) => {
      data = data.toString();
      serverOut += data;
      tryResolve(serverOut);
    });

    proc.on("error", err => {
      rej(err);
    });

    proc.on("exit", ecode => {
      if (ecode != 0) {
        console.error(serverOut);
        rej(new Error("server process exited: " + ecode));
      }
    });
  });
}
