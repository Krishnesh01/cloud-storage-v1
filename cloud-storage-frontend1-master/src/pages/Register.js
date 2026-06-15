import React, { useState } from 'react';

import api, { getErrorMessage } from '../api';

import { useNavigate } from 'react-router-dom';

import {
    FaCloud,
    FaLock
} from 'react-icons/fa';

function Register() {

    const [username, setUsername] =
        useState('');

    const [password, setPassword] =
        useState('');

    const navigate = useNavigate();

    const handleRegister = async () => {

        try {

            const res = await api.post(

                '/api/auth/register',

                {
                    username,
                    password
                }
            );

            if (res.data.token) {
                localStorage.setItem(
                    'token',
                    res.data.token
                );
            }

            if (res.data.user) {
                localStorage.setItem(
                    'user',
                    JSON.stringify(res.data.user)
                );
            }

            navigate('/dashboard');

        } catch (error) {

            alert(
                getErrorMessage(error, "Registration failed")
            );
        }
    };

    return (

        <div className="login-page">

            <div className="login-left">

                <h1>
                    Create Your
                    <br />
                    <span>Cloud Account</span>
                </h1>

                <p>
                    Register to securely
                    store and manage
                    your files.
                </p>

                <div className="feature">

                    <div className="feature-icon">
                        <FaLock />
                    </div>

                    <div>

                        <h3>
                            Secure Access
                        </h3>

                        <p>
                            JWT protected
                            authentication
                        </p>

                    </div>

                </div>

                <div className="feature">

                    <div className="feature-icon">
                        <FaCloud />
                    </div>

                    <div>

                        <h3>
                            Cloud Storage
                        </h3>

                        <p>
                            AWS S3 powered
                            system
                        </p>

                    </div>

                </div>

            </div>

            <div className="login-card">

                <h2>
                    Register to
                    <span> CloudDrive</span>
                </h2>

                <input
                    type="text"
                    placeholder="Username"
                    onChange={(e) =>
                        setUsername(
                            e.target.value
                        )
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) =>
                        setPassword(
                            e.target.value
                        )
                    }
                />

                <button
                    className="theme-btn"
                    onClick={handleRegister}
                >
                    Register
                </button>

                <p
                    style={{
                        marginTop: '20px',
                        color: '#94a3b8',
                        textAlign: 'center'
                    }}
                >

                    Already have account?

                    <span
                        onClick={() =>
                            navigate('/')
                        }
                        style={{
                            color: '#22c55e',
                            cursor: 'pointer',
                            marginLeft: '6px'
                        }}
                    >
                        Login
                    </span>

                </p>

            </div>

        </div>
    );
}

export default Register;
