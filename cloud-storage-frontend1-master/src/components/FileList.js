import React, {
    useEffect,
    useMemo,
    useState
} from 'react';

import api, { getErrorMessage } from '../api';

const typeGroups = [
    {
        label: 'Images',
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']
    },
    {
        label: 'Documents',
        extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md']
    },
    {
        label: 'Spreadsheets',
        extensions: ['xls', 'xlsx', 'csv']
    },
    {
        label: 'Presentations',
        extensions: ['ppt', 'pptx']
    },
    {
        label: 'Videos',
        extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm']
    },
    {
        label: 'Audio',
        extensions: ['mp3', 'wav', 'aac', 'flac', 'm4a']
    },
    {
        label: 'Archives',
        extensions: ['zip', 'rar', '7z', 'tar', 'gz']
    },
    {
        label: 'Code',
        extensions: ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp']
    }
];

function FileList({ refreshKey = 0, onChange }) {

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        fetchFiles();

    }, [refreshKey]);

    const normalizedFiles = useMemo(() =>
        files
            .map((file) => normalizeFile(file))
            .sort((a, b) => b.uploadedAtValue - a.uploadedAtValue),
    [files]);

    const groupedFiles = useMemo(() => {
        const groups = normalizedFiles.reduce((acc, file) => {
            const key = file.typeLabel;

            if (!acc[key]) {
                acc[key] = [];
            }

            acc[key].push(file);
            return acc;
        }, {});

        return Object.entries(groups)
            .map(([label, items]) => ({
                label,
                items
            }))
            .sort((a, b) => b.items[0].uploadedAtValue - a.items[0].uploadedAtValue);
    }, [normalizedFiles]);

    const fetchFiles = async () => {

        try {
            setLoading(true);
            const res = await api.get('/api/files');
            setFiles(res.data.files || res.data || []);
            setError('');
        } catch (error) {
            setError(getErrorMessage(error, 'Could not load files'));
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (file) => {

    try {

        const response = await api.get(

            `/api/files/download/${encodeURIComponent(file.key)}`,

            {
                responseType: 'blob'
            }
        );

        const url = window.URL.createObjectURL(
            new Blob([response.data])
        );

        const link = document.createElement('a');

        link.href = url;

        link.setAttribute('download', file.name);

        document.body.appendChild(link);

        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {

        alert(getErrorMessage(error, "Download failed"));
    }
};

    const previewFile = async (file) => {

        try {
            const res = await api.get(
                `/api/files/share/${encodeURIComponent(file.key)}`
            );

            window.open(res.data.url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            alert(getErrorMessage(error, "Preview failed"));
        }
    };

    const shareFile = async (file) => {

        try {

            const res = await api.get(

                `/api/files/share/${encodeURIComponent(file.key)}`
            );

            navigator.clipboard.writeText(
                res.data.url
            );
            const existingLinks =
    JSON.parse(
        localStorage.getItem(
            'sharedLinks'
        )
    ) || [];

existingLinks.push({

    file: file.name,

    url: res.data.url
});

localStorage.setItem(

    'sharedLinks',

    JSON.stringify(existingLinks)
);

            alert("Share link copied!");

        } catch (error) {

            alert(getErrorMessage(error, "Error generating link"));
        }
    };

    const deleteFile = async (file) => {

        try {
            await api.delete(`/api/files/${encodeURIComponent(file.key)}`);
            onChange?.();
            fetchFiles();
        } catch (error) {
            alert(getErrorMessage(error, "Delete failed"));
        }
    };

    return (

        <div className="files-section">

            <div className="section-heading">
                <div>
                    <h2>
                        Files by Type
                    </h2>
                    <p>
                        Sorted by latest upload date with file details.
                    </p>
                </div>
            </div>

            {error && (
                <div className="inline-error">
                    {error}
                </div>
            )}

            {loading && (
                <p className="muted-text">
                    Loading files...
                </p>
            )}

            {!loading && !error && normalizedFiles.length === 0 && (
                <p className="muted-text">
                    No files uploaded yet.
                </p>
            )}

            {groupedFiles.map((group) => (
                <div
                    className="file-group"
                    key={group.label}
                >
                    <div className="file-group-header">
                        <h3>{group.label}</h3>
                        <span>{group.items.length} file{group.items.length === 1 ? '' : 's'}</span>
                    </div>

                    {group.items.map((file) => (

                        <div
                            className="file-card"
                            key={file.key}
                        >

                            <div className="file-info">
                                <p>{file.name}</p>
                                <div className="file-meta">
                                    <span>{file.typeLabel}</span>
                                    <span>{file.formattedDate}</span>
                                    <span>{file.formattedSize}</span>
                                </div>
                            </div>

                            <div className="file-actions">

                                <button
                                    onClick={() =>
                                        downloadFile(file)
                                    }
                                >
                                    Download
                                </button>

                                <button
                                    onClick={() =>
                                        previewFile(file)
                                    }
                                >
                                    Preview
                                </button>

                                <button
                                    onClick={() =>
                                        shareFile(file)
                                    }
                                >
                                    Share
                                </button>

                                <button
                                    onClick={() =>
                                        deleteFile(file)
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    ))}
                </div>
            ))}

        </div>
    );
}

const normalizeFile = (file) => {
    const key = typeof file === 'string' ? file : file.key;
    const name = key.replace(/^\d+-/, '');
    const extension = getExtension(key);
    const uploadedAt = file.lastModified ? new Date(file.lastModified) : getDateFromKey(key);
    const uploadedAtValue = uploadedAt?.getTime?.() || 0;

    return {
        key,
        name,
        extension,
        typeLabel: getTypeLabel(extension),
        uploadedAtValue,
        formattedDate: uploadedAtValue
            ? uploadedAt.toLocaleString()
            : 'Upload date unavailable',
        formattedSize: formatBytes(file.size || 0)
    };
};

const getExtension = (key) => {
    const cleanKey = key.split('?')[0];
    const parts = cleanKey.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const getTypeLabel = (extension) => {
    const group = typeGroups.find((item) =>
        item.extensions.includes(extension)
    );

    return group?.label || 'Other Files';
};

const getDateFromKey = (key) => {
    const timestamp = Number(key.split('-')[0]);
    return Number.isFinite(timestamp) ? new Date(timestamp) : null;
};

const formatBytes = (bytes) => {
    if (!bytes) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );
    const value = bytes / Math.pow(1024, index);

    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

export default FileList;
