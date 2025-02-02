import React, { useState, useEffect } from 'react';
import SchedulerForm from './components/SchedulerForm';
import DownloadList from './components/DownloadList';
import axios from 'axios';

function App() {
    const [downloads, setDownloads] = useState([]);
    const [darkMode, setDarkMode] = useState(true);

    const fetchDownloads = async () => {
        const res = await axios.get('http://localhost:5000/api/downloads');
        setDownloads(res.data);
    };

    useEffect(() => {
        fetchDownloads();
        const interval = setInterval(fetchDownloads, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleToggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const pauseAll = async () => {
        await axios.post('http://localhost:5000/api/downloads/pauseAll');
        fetchDownloads();
    };

    const resumeAll = async () => {
        await axios.post('http://localhost:5000/api/downloads/resumeAll');
        fetchDownloads();
    };

    const cancelAll = async () => {
        await axios.post('http://localhost:5000/api/downloads/cancelAll');
        fetchDownloads();
    };

    return (
        <div className={darkMode ? "dark" : ""}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
                <button
                    onClick={handleToggleTheme}
                    className="mb-4 bg-primary text-black px-4 py-2 rounded"
                >
                    Toggle Theme
                </button>
                <SchedulerForm refreshDownloads={fetchDownloads} />
                <div className="flex space-x-4 my-4">
                    <button onClick={pauseAll} className="bg-primary text-black px-4 py-2 rounded">Pause All</button>
                    <button onClick={resumeAll} className="bg-primary text-black px-4 py-2 rounded">Resume All</button>
                    <button onClick={cancelAll} className="bg-primary text-black px-4 py-2 rounded">Cancel All</button>
                </div>
                <DownloadList downloads={downloads} refreshDownloads={fetchDownloads} />
            </div>
        </div>
    );
}

export default App;