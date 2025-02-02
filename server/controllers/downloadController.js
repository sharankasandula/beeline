const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const jsonStore = require('../utils/jsonStore');
const scheduler = require('../utils/scheduler');

const downloadsFolder = path.join(__dirname, '..', 'Downloads');
if (!fs.existsSync(downloadsFolder)) {
    fs.mkdirSync(downloadsFolder, { recursive: true });
}

let activeDownloads = {};

function updateJob(job) {
    jsonStore.updateJob(job.id, job);
}

async function getAllDownloads(req, res) {
    const jobs = jsonStore.getAllJobs();
    res.json(jobs);
}

async function createDownloadJob(req, res) {
    const { links, scheduleTime } = req.body;
    const jobs = [];
    links.forEach(link => {
        const job = {
            id: uuidv4(),
            link,
            scheduleTime: scheduleTime || null,
            status: scheduleTime ? 'pending' : 'downloading',
            progress: 0,
            filePath: path.join(downloadsFolder, path.basename(link)),
            totalBytes: 0,
            downloadedBytes: 0
        };
        jsonStore.addJob(job);
        jobs.push(job);
        if (!scheduleTime) {
            startDownload(job);
        } else {
            scheduler.scheduleJob(job);
        }
    });
    res.json({ message: 'Download jobs created', jobs });
}

function startDownload(job) {
    job.status = 'downloading';
    updateJob(job);
    const fileExists = fs.existsSync(job.filePath);
    let startByte = 0;
    if (fileExists) {
        startByte = fs.statSync(job.filePath).size;
    }
    const headers = {};
    if (startByte > 0) {
        headers.Range = `bytes=${startByte}-`;
    }
    const cancelSource = axios.CancelToken.source();
    activeDownloads[job.id] = { cancelSource, paused: false };

    axios({
        method: 'get',
        url: job.link,
        responseType: 'stream',
        headers,
        cancelToken: cancelSource.token
    }).then(response => {
        if (!job.totalBytes) {
            job.totalBytes = parseInt(response.headers['content-length'] || 0) + startByte;
        }
        const writer = fs.createWriteStream(job.filePath, { flags: startByte > 0 ? 'a' : 'w' });
        response.data.on('data', chunk => {
            job.downloadedBytes += chunk.length;
            job.progress = job.totalBytes ? Math.min(100, ((job.downloadedBytes / job.totalBytes) * 100)) : 0;
            updateJob(job);
        });
        response.data.pipe(writer);
        writer.on('finish', () => {
            job.status = 'completed';
            job.progress = 100;
            updateJob(job);
            delete activeDownloads[job.id];
        });
        writer.on('error', (err) => {
            job.status = 'error';
            updateJob(job);
            delete activeDownloads[job.id];
        });
    }).catch(err => {
        if (axios.isCancel(err)) {
            job.status = 'paused';
        } else {
            job.status = 'error';
        }
        updateJob(job);
        delete activeDownloads[job.id];
    });
}

async function pauseDownload(req, res) {
    const { id } = req.params;
    const job = jsonStore.getJob(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (activeDownloads[id] && !activeDownloads[id].paused) {
        activeDownloads[id].cancelSource.cancel('Paused by user');
        activeDownloads[id].paused = true;
        job.status = 'paused';
        updateJob(job);
    }
    res.json({ message: 'Download paused', job });
}

async function resumeDownload(req, res) {
    const { id } = req.params;
    const job = jsonStore.getJob(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status === 'paused') {
        startDownload(job);
    }
    res.json({ message: 'Download resumed', job });
}

async function cancelDownload(req, res) {
    const { id } = req.params;
    const job = jsonStore.getJob(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (activeDownloads[id]) {
        activeDownloads[id].cancelSource.cancel('Cancelled by user');
        delete activeDownloads[id];
    }
    job.status = 'cancelled';
    updateJob(job);
    res.json({ message: 'Download cancelled', job });
}

async function pauseAllDownloads(req, res) {
    const jobs = jsonStore.getAllJobs();
    jobs.forEach(job => {
        if (activeDownloads[job.id] && !activeDownloads[job.id].paused) {
            activeDownloads[job.id].cancelSource.cancel('Paused all');
            activeDownloads[job.id].paused = true;
            job.status = 'paused';
            updateJob(job);
        }
    });
    res.json({ message: 'All downloads paused' });
}

async function resumeAllDownloads(req, res) {
    const jobs = jsonStore.getAllJobs();
    jobs.forEach(job => {
        if (job.status === 'paused') {
            startDownload(job);
        }
    });
    res.json({ message: 'All paused downloads resumed' });
}

async function cancelAllDownloads(req, res) {
    const jobs = jsonStore.getAllJobs();
    jobs.forEach(job => {
        if (activeDownloads[job.id]) {
            activeDownloads[job.id].cancelSource.cancel('Cancelled all');
            delete activeDownloads[job.id];
        }
        if (job.status === 'downloading' || job.status === 'paused' || job.status === 'pending') {
            job.status = 'cancelled';
            updateJob(job);
        }
    });
    res.json({ message: 'All downloads cancelled' });
}

module.exports = {
    getAllDownloads,
    createDownloadJob,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    pauseAllDownloads,
    resumeAllDownloads,
    cancelAllDownloads
};
