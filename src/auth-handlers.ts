/**
 * Re-export of Auth.js HTTP handlers in a tiny shim file.
 * Keeps `src/app/api/auth/[...nextauth]/route.ts` minimal.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
