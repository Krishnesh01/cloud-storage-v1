import React, { useState } from 'react';

import api, { getErrorMessage } from '../api';

import { useNavigate } from 'react-router-dom';

import {
    FaCloud,
    FaLock,
    FaUpload
} from 'react-icons/fa';

function Login() {

    const [username, setUsername] = useState('');

    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleLogin = async () => {

        try {

            const res = await api.post('/api/auth/login', {
                username,
                password
            });

            localStorage.setItem(
                'token',
                res.data.token
            );

            if (res.data.user) {
                localStorage.setItem(
                    'user',
                    JSON.stringify(res.data.user)
                );
            }

            navigate('/dashboard');

        } catch (error) {

            alert(getErrorMessage(error, 'Login failed'));
        }
    };

    return (

        <div className="login-page">

            <div className="login-left">

                <h1>
                    Access Your
                    <br />
                    <span>Cloud Storage</span>
                </h1>

                <p>
                    Securely upload,
                    manage and share
                    files anywhere.
                </p>

                <div className="feature">
                    <div className="feature-icon">
                        <FaLock />
                    </div>

                    <div>
                        <h3>Secure Authentication</h3>
                        <p>
                            JWT protected system
                        </p>
                    </div>
                </div>

                <div className="feature">
                    <div className="feature-icon">
                        <FaCloud />
                    </div>

                    <div>
                        <h3>Cloud Powered</h3>
                        <p>
                            AWS S3 integrated
                        </p>
                    </div>
                </div>

                <div className="feature">
                    <div className="feature-icon">
                        <FaUpload />
                    </div>

                    <div>
                        <h3>Easy File Management</h3>
                        <p>
                            Upload & share instantly
                        </p>
                    </div>
                </div>

            </div>

            <div className="login-card">

                <h2>
                    Login to
                    <span> CloudDrive</span>
                </h2>

                <input
                    type="text"
                    placeholder="Username"
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <button onClick={handleLogin}>
    Login
</button>

<p
    style={{
        marginTop: '20px',
        color: '#94a3b8',
        textAlign: 'center'
    }}
>

    Don't have account?

    <span
        onClick={() =>
            navigate('/register')
        }
        style={{
            color: '#22c55e',
            cursor: 'pointer',
            marginLeft: '6px'
        }}
    >
        Register
    </span>

</p>

            </div>

        </div>
    );
}

export default Login;
