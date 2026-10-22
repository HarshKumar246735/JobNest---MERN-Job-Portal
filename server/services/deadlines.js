const Job = require('../models/Job'); const SavedJob = require('../models/SavedJob'); const Application = require('../models/Application'); const Notification = require('../models/Notification'); const { notify } = require('./notify');
const run = async () => {
  try {
    const jobs = await Job.find({ status: 'open', deadline: { $gte: new Date(), $lte: new Date(Date.now() + 2 * 864e5) } }).select('title slug companyName').lean();
    for (const j of jobs) for (const u of await SavedJob.find({ job: j._id }).distinct('user')) {
      const link = `/jobs/${j.slug}`;
      if (await Notification.exists({ user: u, type: 'DEADLINE_SOON', link })) continue; if (await Application.exists({ job: j._id, candidate: u })) continue;
      await notify(u, 'DEADLINE_SOON', 'Saved job closing soon', `${j.title} at ${j.companyName} closes within 2 days`, link);
    }
  } catch (e) { console.error('deadline reminder failed', e.message); }
};
exports.start = () => { run(); setInterval(run, 6 * 3600 * 1000).unref(); };
