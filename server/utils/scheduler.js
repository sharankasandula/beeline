const cron = require('node-cron');
const jsonStore = require('./jsonStore');
const downloadController = require('../controllers/downloadController');

function checkScheduledJobs() {
    const jobs = jsonStore.getAllJobs();
    const now = new Date();
    jobs.forEach(job => {
        if (job.status === 'pending' && job.scheduleTime) {
            const scheduledTime = new Date(job.scheduleTime);
            if (scheduledTime <= now) {
                downloadController.resumeDownload({ params: { id: job.id } }, { json: () => { } });
            }
        }
    });
}

let task;
function start() {
    task = cron.schedule('* * * * *', checkScheduledJobs);
}

function scheduleJob(job) {
    // No additional scheduling required; cron handles it.
}

module.exports = { start, scheduleJob };
