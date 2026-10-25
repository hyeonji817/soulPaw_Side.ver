import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Always load server/.env, independent of the terminal's working directory.
dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)), quiet: true });
