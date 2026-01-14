# Agent Instructions (Codex)

## Branch rules
- Always work on the `dev` branch.
- Never commit, push, or open a pull request directly to `main`.
- If the current branch is not `dev`, stop and switch to `dev` before making changes.

## Change discipline
- Make the smallest change that satisfies the task.
- Do not refactor, rename, or reformat unrelated code.
- Do not change UI styling/layout unless explicitly required by the task.

## Output requirements
- List every file changed with a short reason.
- Provide clear repro steps and confirmation of the fix.
- If tests/lint/build exist, run them and report results (or state why not).

## Safety
- If unsure, ask for clarification rather than guessing.
- Prefer reversible changes and avoid one-way migrations unless requested. 

Last reviewed: 2026-01-14
