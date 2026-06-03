import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(here, "../.env") });
config({ path: path.join(here, "../../../.env") });
