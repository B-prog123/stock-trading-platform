const rawBase = import.meta.env.VITE_API_BASE_URL || "";
export const API_BASE_URL = rawBase.replace(/\/$/, "");

export const apiUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
};
