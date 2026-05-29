import { restSpec } from "./rest-spec";

// Full REST surface is implemented inside `api/rest-spec.ts` and mounted in `api/boot.ts`.
// This file only re-exports it for backwards compatibility.
export const restSpecRoutes = restSpec;
export default restSpecRoutes;







