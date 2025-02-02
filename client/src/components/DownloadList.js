import React from 'react';
import DownloadItem from './DownloadItem';

function DownloadList({ downloads, refreshDownloads }) {
    return (
        <div className="space-y-4">
            {downloads.map(download => (
                <DownloadItem key={download.id} download={download} refreshDownloads={refreshDownloads} />
            ))}
        </div>
    );
}

export default DownloadList;
