import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { errMsg } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
const S = createContext({ ids: new Set(), toggle: async () => {} });
export const useSaved = () => useContext(S);
export function SavedProvider({ children }) {
  const { user } = useAuth(); const toast = useToast(); const [ids, setIds] = useState(new Set());
  useEffect(() => { if (user?.role === 'candidate') api.get('/saved-jobs').then((r) => setIds(new Set(r.data.ids))).catch(() => {}); else setIds(new Set()); }, [user]);
  const toggle = useCallback(async (jobId) => {
    const has = ids.has(jobId);
    try { await (has ? api.delete(`/saved-jobs/${jobId}`) : api.post(`/saved-jobs/${jobId}`)); setIds((s) => { const n = new Set(s); has ? n.delete(jobId) : n.add(jobId); return n; }); toast(has ? 'Removed from saved jobs' : 'Job saved'); }
    catch (e) { toast(errMsg(e), 'err'); }
  }, [ids, toast]);
  return <S.Provider value={{ ids, toggle }}>{children}</S.Provider>;
}
