const AUDIT_BRANCH = "codex/temporary-zodis-audit-access";

export const IS_AUDIT_MODE =
  import.meta.env.VITE_AUDIT_MODE === "isolated-preview" ||
  import.meta.env.VITE_VERCEL_GIT_COMMIT_REF === AUDIT_BRANCH;
