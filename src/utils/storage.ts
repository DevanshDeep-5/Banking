export const storage = {
  get<T = any>(key: string, fallback: T | null = null): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('storage.set', e);
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};
