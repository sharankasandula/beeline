// project-root/client/src/components/SchedulerForm.js
import React, { useState } from 'react';
import axios from 'axios';

function SchedulerForm({ refreshDownloads }) {
    const [links, setLinks] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const linkArray = links.split('\n').filter(link => link.trim() !== '');
        await axios.post('http://localhost:5000/api/downloads', {
            links: linkArray,
            scheduleTime
        });
        setLinks('');
        setScheduleTime('');
        refreshDownloads();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
            <h2 className="text-xl mb-2">New Download Job</h2>
            <textarea
                className="w-full p-2 border rounded mb-2 dark:bg-gray-700"
                placeholder="Enter one download link per line"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
            />
            <input
                type="datetime-local"
                className="w-full p-2 border rounded mb-2 dark:bg-gray-700"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
            />
            <button type="submit" className="bg-primary text-black px-4 py-2 rounded">Add Download</button>
        </form>
    );
}

export default SchedulerForm;
