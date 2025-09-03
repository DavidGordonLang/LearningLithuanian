@tailwind base;
@tailwind components;
@tailwind utilities;

/* Mobile-friendly defaults */
html, body, #root {
  height: 100%;
}
body {
  background-color: #0a0a0b; /* matches bg-zinc-950 */
  color: #e5e7eb;            /* text-zinc-200-ish */
}

/* Safe areas for notches */
:root {
  --safe-bottom: env(safe-area-inset-bottom);
}

/* Disable selection/callout/highlight on pressable audio buttons */
[data-press] {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
