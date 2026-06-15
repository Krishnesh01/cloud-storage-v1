import React, { useState } from 'react';

import api, { getErrorMessage } from '../api';

import { useDropzone } from 'react-dropzone';

function UploadForm({ onUploadSuccess }) {

    const [file, setFile] = useState();
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps, isDragActive, open } =
        useDropzone({
            multiple: false,
            noClick: true,
            noKeyboard: true,
            onDrop: (acceptedFiles) => {
                const selectedFile = acceptedFiles[0];

                if (selectedFile) {
                    setFile(selectedFile);
                    setError('');
                    setStatus(`${selectedFile.name} selected`);
                }
            }
        });

    const uploadFile = async () => {

        if (!file) {
            setError('Select a file first.');
            return;
        }

        const formData = new FormData();

        formData.append('file', file);

        try {
            setUploading(true);
            setError('');
            setStatus('Uploading...');

            await api.post('/api/files/upload', formData);

            setStatus('File uploaded successfully.');
            setFile(undefined);
            onUploadSuccess?.();
        } catch (error) {
            setStatus('');
            setError(getErrorMessage(error, 'Upload failed'));
        } finally {
            setUploading(false);
        }
    };

    return (

        <div
            {...getRootProps({
                className: `upload-box ${isDragActive ? 'upload-box-active' : ''}`
            })}
        >

            <input {...getInputProps()} />

            <h2>
                {isDragActive ? 'Drop the file here' : 'Drag & Drop your file here'}
            </h2>

            <p>
                or click to browse
            </p>

            <button
                className="theme-btn"
                type="button"
                onClick={open}
                disabled={uploading}
            >
                Browse File
            </button>

            {file && (
                <p className="selected-file">
                    Selected: {file.name}
                </p>
            )}

            <button
                className="theme-btn upload-action"
                type="button"
                onClick={uploadFile}
                disabled={uploading || !file}
            >
                {uploading ? 'Uploading...' : 'Upload File'}
            </button>

            {status && (
                <p className="inline-success">
                    {status}
                </p>
            )}

            {error && (
                <p className="inline-error">
                    {error}
                </p>
            )}

        </div>
    );
}

export default UploadForm;
