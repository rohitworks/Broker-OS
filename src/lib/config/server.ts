import "server-only";
import { parseServerConfig } from "./server-schema";

export type { ServerConfig } from "./server-schema";
export { parseServerConfig } from "./server-schema";

export function getServerConfig() { return parseServerConfig(process.env); }
