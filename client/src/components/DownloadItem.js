import React from 'react';
import axios from 'axios';

function DownloadItem({ download, refreshDownloads }) {
    const pauseDownload = async () => {
        await axios.post(`http://localhost:5000/api/downloads/${download.id}/pause`);
        refreshDownloads();
    };

    const resumeDownload = async () => {
        await axios.post(`http://localhost:5000/api/downloads/${download.id}/resume`);
        refreshDownloads();
    };

    const cancelDownload = async () => {
        await axios.post(`http://localhost:5000/api/downloads/${download.id}/cancel`);
        refreshDownloads();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h3 className="text-lg">{download.link}</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-4 mb-2">
                <div className="bg-primary h-4 rounded" style={{ width: `${download.progress}%` }}></div>
            </div>
            <p>Status: {download.status}</p>
            <div className="flex space-x-2 mt-2">
                {download.status === 'downloading' && <button onClick={pauseDownload} className="bg-primary text-black px-2 py-1 rounded">Pause</button>}
                {download.status === 'paused' && <button onClick={resumeDownload} className="bg-primary text-black px-2 py-1 rounded">Resume</button>}
                {(download.status === 'downloading' || download.status === 'paused') && <button onClick={cancelDownload} className="bg-red-500 text-white px-2 py-1 rounded">Cancel</button>}
            </div>
        </div>
    );
}

export default DownloadItem;
