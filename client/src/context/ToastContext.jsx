import { createContext, useContext, useState, useCallback } from 'react';
const T = createContext(() => {});
export const useToast = () => useContext(T);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = 'ok') => { const id = Math.random(); setItems((s) => [...s, { id, message, type }]); setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3500); }, []);
  return <T.Provider value={push}>{children}<div className="toasts" role="status" aria-live="polite">{items.map((i) => <div key={i.id} className={`toast ${i.type}`}>{i.message}</div>)}</div></T.Provider>;
}
