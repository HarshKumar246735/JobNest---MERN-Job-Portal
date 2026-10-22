import { useEffect, useState } from 'react';
import api, { errMsg } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import InterviewForm from '../../components/InterviewForm';
import { setTitle } from '../../utils/format';
export default function Interviews() {
  const [list, setList] = useState(null), [edit, setEdit] = useState(null), toast = useToast();
  const load = () => api.get('/interviews/my-interviews').then((r) => setList(r.data.interviews));
  useEffect(() => { setTitle('Interviews'); load(); }, []);
  const act = async (fn, msg) => { try { await fn(); toast(msg); setEdit(null); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  return (<><h1>Interviews</h1>{!list ? <div className="skeleton job-card" /> : list.length === 0 ? <div className="empty"><h3>No interviews scheduled</h3><p>Schedule one from a candidate's page.</p></div> : list.map((i) => {
    const open = ['SCHEDULED', 'RESCHEDULED'].includes(i.status);
    return (<div className="card" key={i._id}><div className="row-between"><div><strong>{i.candidate?.name}</strong> · {i.job?.title}<p className="muted">{new Date(i.date).toLocaleDateString()} {i.startTime}-{i.endTime} ({i.timezone}) · {i.mode} {i.meetingUrl && <a href={i.meetingUrl} target="_blank" rel="noopener noreferrer">Join link</a>} {i.location}</p></div>
      <div className="actions"><span className="status">{i.status}</span>{open && <><button className="btn btn-ghost" onClick={() => setEdit(edit === i._id ? null : i._id)}>Reschedule</button>
        <button className="btn btn-ghost" onClick={() => act(() => api.patch(`/interviews/${i._id}`, { status: 'COMPLETED' }), 'Marked completed')}>Complete</button>
        <button className="btn btn-ghost" onClick={() => confirm('Cancel this interview?') && act(() => api.delete(`/interviews/${i._id}`), 'Interview cancelled')}>Cancel</button></>}</div></div>
      {edit === i._id && <InterviewForm initial={i} label="Save new time" onSubmit={(f) => act(() => api.patch(`/interviews/${i._id}`, f), 'Interview rescheduled')} />}</div>);
  })}</>);
}
