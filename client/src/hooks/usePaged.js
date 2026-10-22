import { useEffect, useState, useCallback } from 'react';
import api, { errMsg } from '../services/api';
export default function usePaged(url, filters = {}) {
  const [page, setPage] = useState(1), [data, setData] = useState(null), [err, setErr] = useState(''); const key = JSON.stringify(filters);
  const load = useCallback(() => api.get(url, { params: { ...filters, page } }).then((r) => { setData(r.data); setErr(''); }).catch((e) => setErr(errMsg(e))), [url, key, page]);
  useEffect(() => { setPage(1); }, [key]);
  useEffect(() => { load(); }, [load]);
  return { data, err, page, setPage, reload: load };
}
