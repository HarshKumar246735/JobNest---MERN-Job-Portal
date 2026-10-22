import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const login = useCallback(async (email, password) => { const r = await api.post('/auth/login', { email, password }); setUser(r.data.user); return r.data.user; }, []);
  const register = useCallback(async (body) => { const r = await api.post('/auth/register', body); setUser(r.data.user); return r.data.user; }, []);
  const refresh = useCallback(async () => { const r = await api.get('/auth/me'); setUser(r.data.user); }, []);
  const logout = useCallback(async () => { await api.post('/auth/logout').catch(() => {}); setUser(null); }, []);
  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}
export const homeFor = (u) => (u?.role === 'admin' ? '/admin/dashboard' : u?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
