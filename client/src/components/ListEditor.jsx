import { Plus, Trash2 } from 'lucide-react';
export default function ListEditor({ items = [], onChange, fields, label }) {
  const set = (i, k, v) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  return (
    <div className="list-editor">
      {items.map((it, i) => (
        <div className="le-row" key={i}>
          {fields.map((f) => (
            <label className="field" key={f.k}><span>{f.label}</span>
              {f.area ? <textarea rows={2} value={it[f.k] || ''} onChange={(e) => set(i, f.k, e.target.value)} />
                : <input type={f.type || 'text'} value={f.type === 'date' && it[f.k] ? String(it[f.k]).slice(0, 10) : it[f.k] || ''} onChange={(e) => set(i, f.k, f.type === 'number' ? Number(e.target.value) || '' : e.target.value)} />}</label>))}
          <button type="button" className="btn btn-ghost icon" aria-label={`Remove ${label}`} onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
        </div>))}
      <button type="button" className="btn btn-ghost" onClick={() => onChange([...items, {}])}><Plus size={16} /> Add {label}</button>
    </div>
  );
}
