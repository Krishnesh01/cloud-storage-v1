
import React, { useEffect, useState } from 'react';
import UploadForm from '../components/UploadForm';
import FileList from '../components/FileList';
import StorageStats from '../components/StorageStats';
import SharedLinks from '../components/SharedLinks';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FaMoon, FaSun } from 'react-icons/fa';

function Dashboard() {
    const [activePage, setActivePage] =
    useState('dashboard');
    const [refreshKey, setRefreshKey] = useState(0);
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'dark'
    );
    const navigate = useNavigate();
    const user = JSON.parse(
        localStorage.getItem('user') || '{}'
    );
    const displayName = user.username || 'there';

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const logout = () => {

    api.post('/api/auth/logout').finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/');
    });
};

    const refreshDashboard = () => {
        setRefreshKey((current) => current + 1);
    };

    const toggleTheme = () => {
        setTheme((current) =>
            current === 'dark' ? 'light' : 'dark'
        );
    };

    return (

        <div className="dashboard">

            <div className="sidebar">

                <div className="logo">
                    Cloud<span>Drive</span>
                </div>

                <div className="sidebar-menu">

                    <div className="sidebar-menu">

    <div
        className="sidebar-item"
        onClick={() =>
            setActivePage('dashboard')
        }
    >
        Dashboard
    </div>

    <div
        className="sidebar-item"
        onClick={() =>
            setActivePage('files')
        }
    >
        My Files
    </div>

    <div
        className="sidebar-item"
        onClick={() =>
            setActivePage('shared')
        }
    >
        Shared Links
    </div>

    <div
        className="sidebar-item"
        onClick={() =>
            setActivePage('settings')
        }
    >
        Settings
    </div>

</div>

                </div>

            </div>

            <div className="main">

                <div className="topbar">

                    <div>
                        <h1>
                            Welcome Back, {displayName}
                        </h1>

                        <p>
                            Manage your files
                            and storage
                        </p>
                    </div>

                    <button
                        className="theme-toggle"
                        type="button"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                    >
                        {theme === 'dark' ? <FaSun /> : <FaMoon />}
                    </button>

                </div>

                {
    activePage === 'dashboard' && (

        <>

            <StorageStats refreshKey={refreshKey} />

            <UploadForm onUploadSuccess={refreshDashboard} />

            <FileList refreshKey={refreshKey} onChange={refreshDashboard} />

        </>
    )
}

{
    activePage === 'files' && (

        <div className="files-section">

            <h2>My Files</h2>

            <FileList refreshKey={refreshKey} onChange={refreshDashboard} />

        </div>
    )
}

{
    activePage === 'shared' && (

        <div className="files-section">

            <h2>Shared Files</h2>

            <SharedLinks />

        </div>
    )
}

{
    activePage === 'settings' && (

        <div className="files-section">

            <h2>Settings</h2>

            <button
    className="logout-btn"
    onClick={logout}
>
    Logout
</button>

        </div>
    )
}

            </div>

        </div>
    );
}

export default Dashboard;
