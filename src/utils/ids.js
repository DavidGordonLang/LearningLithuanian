// src/utils/ids.js
export const nowTs = () => Date.now();
export const genId = () => Math.random().toString(36).slice(2);
