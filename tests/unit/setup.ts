import { vi } from "vitest";
import { CreateTablesMigration } from "../../src/data/migrations/create_tables.ts";
import { MigrationsController } from "../../src/lib/database/migrations_controller.ts";

MigrationsController.migrations = [new CreateTablesMigration()];

vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ["Date"] });
vi.setSystemTime(new Date(2025, 12, 30));
