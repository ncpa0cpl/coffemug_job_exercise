import { type SqlFunction, transaction } from "./database.ts";

export interface Command<R = void> {
  act(sql: SqlFunction): Promise<R>;
}

export async function handleCommand<R>(command: Command<R>): Promise<R> {
  let result: R;
  await transaction(async (sql) => {
    result = await command.act(sql);
  });
  return result!;
}
