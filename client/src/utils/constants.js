export const TRANSITIONS = { // mirrors server rules; the server remains the authority
  APPLIED: ['UNDER_REVIEW', 'SHORTLISTED', 'REJECTED'], UNDER_REVIEW: ['SHORTLISTED', 'REJECTED'], SHORTLISTED: ['UNDER_REVIEW', 'REJECTED'],
  INTERVIEW_SCHEDULED: ['SHORTLISTED', 'OFFERED', 'REJECTED'], OFFERED: ['HIRED', 'REJECTED'], HIRED: [], REJECTED: [], WITHDRAWN: [],
};
export const STATUSES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN'];
export const pretty = (s) => s.replace(/_/g, ' ').toLowerCase();
export const download = async (api, url, name) => { const r = await api.get(url, { responseType: 'blob' }); const a = document.createElement('a'); a.href = URL.createObjectURL(r.data); a.download = name; a.click(); URL.revokeObjectURL(a.href); };
