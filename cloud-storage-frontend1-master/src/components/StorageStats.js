import React, {
    useEffect,
    useState
} from 'react';

import api, { getErrorMessage } from '../api';

function StorageStats({ refreshKey = 0 }) {

    const [stats, setStats] = useState({
        totalFiles: 0,
        totalSizeMB: 0
    });
    const [error, setError] = useState('');

    useEffect(() => {

        fetchStats();

    }, [refreshKey]);

    const fetchStats = async () => {

        try {
            const res = await api.get('/api/files/stats');
            setStats(res.data);
            setError('');
        } catch (error) {
            setError(getErrorMessage(error, 'Could not load storage stats'));
        }
    };

    return (

        <>

        {error && (
            <div className="inline-error">
                {error}
            </div>
        )}

        <div className="stats-grid">

            <div className="stat-card">

                <h3>Total Files</h3>

                <p>
                    {stats.totalFiles}
                </p>

            </div>

            <div className="stat-card">

                <h3>Total Storage</h3>

                <p>
                    {stats.totalSizeMB} MB
                </p>

            </div>

            <div className="stat-card">

                <h3>Cloud Status</h3>

                <p>Active</p>

            </div>

            <div className="stat-card">

                <h3>Security</h3>

                <p>Protected</p>

            </div>

        </div>

        </>
    );
}

export default StorageStats;
