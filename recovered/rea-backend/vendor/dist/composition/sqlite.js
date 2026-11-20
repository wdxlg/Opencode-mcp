import * as __reaScope from "../../../native/context.mjs";
import { SqliteDatabaseService } from "../application/sqlite/SqliteDatabaseService.js";
import { SqliteDatabaseProvider } from "../sqlite/SqliteDatabaseProvider.js";
/** Compose local snapshot inspection without opening a native analysis provider. */
export const createSqliteDatabaseService = (environment = __reaScope.backendEnvironment()) => new SqliteDatabaseService(new SqliteDatabaseProvider(environment));
