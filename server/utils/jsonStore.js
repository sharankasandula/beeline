const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'downloads.json');

function readData() {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(filePath);
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function writeData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getAllJobs() {
    return readData();
}

function getJob(id) {
    const jobs = readData();
    return jobs.find(job => job.id === id);
}

function addJob(job) {
    const jobs = readData();
    jobs.push(job);
    writeData(jobs);
}

function updateJob(id, updatedJob) {
    const jobs = readData();
    const index = jobs.findIndex(job => job.id === id);
    if (index !== -1) {
        jobs[index] = updatedJob;
        writeData(jobs);
    }
}

module.exports = { getAllJobs, getJob, addJob, updateJob };
