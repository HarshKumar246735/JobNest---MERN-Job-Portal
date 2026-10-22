import { useState } from 'react';
export default function InterviewForm({ initial = {}, onSubmit, label = 'Schedule interview' }) {
  const [f, setF] = useState({ date: '', startTime: '10:00', endTime: '10:45', timezone: 'Asia/Kolkata', mode: 'Online', meetingUrl: '', location: '', instructions: '', ...initial, date: initial.date ? String(initial.date).slice(0, 10) : '' });
  const [busy, setBusy] = useState(false); const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await onSubmit(f); } finally { setBusy(false); } }}>
      <div className="two-col"><label className="field"><span>Date</span><input type="date" required value={f.date} min={new Date().toISOString().slice(0, 10)} onChange={set('date')} /></label>
        <label className="field"><span>Time zone</span><input value={f.timezone} onChange={set('timezone')} /></label>
        <label className="field"><span>Start time</span><input type="time" required value={f.startTime} onChange={set('startTime')} /></label>
        <label className="field"><span>End time</span><input type="time" required value={f.endTime} onChange={set('endTime')} /></label>
        <label className="field"><span>Mode</span><select value={f.mode} onChange={set('mode')}><option>Online</option><option>Phone</option><option>In person</option></select></label>
        {f.mode === 'Online' && <label className="field"><span>Meeting URL</span><input type="url" required value={f.meetingUrl} onChange={set('meetingUrl')} placeholder="https://" /></label>}
        {f.mode === 'In person' && <label className="field"><span>Location</span><input required value={f.location} onChange={set('location')} /></label>}</div>
      <label className="field"><span>Instructions for candidate</span><textarea rows={2} value={f.instructions} onChange={set('instructions')} /></label>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : label}</button>
    </form>
  );
}
