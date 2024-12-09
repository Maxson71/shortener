import React, { useState, useContext } from "react";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Registration
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // State for Login
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState(null);

    // State for Registration
    const [regUsername, setRegUsername] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regFullName, setRegFullName] = useState("");
    const [regError, setRegError] = useState(null);
    const [regSuccess, setRegSuccess] = useState(false);

    // Handle Login Submission
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError(null);

        const formData = new URLSearchParams();
        formData.append("username", loginUsername);
        formData.append("password", loginPassword);

        try {
            const response = await fetch("http://localhost:8000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            });

            if (!response.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await response.json();
            login(data.access_token);
        } catch (err) {
            setLoginError(err.message);
        }
    };

    // Handle Registration Submission
    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();
        setRegError(null);
        setRegSuccess(false);

        const payload = {
            username: regUsername,
            password: regPassword,
            full_name: regFullName || null,
        };

        try {
            const response = await fetch("http://localhost:8000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 201) {
                setRegSuccess(true);
                setTimeout(() => {
                    setIsLogin(true);
                    navigate("/login");
                }, 2000);
            } else if (response.status === 409) {
                setRegError("Username already taken.");
            } else {
                throw new Error("Failed to register. Please try again.");
            }
        } catch (err) {
            setRegError(err.message);
        }
    };

    return (
        <div className="flex justify-center items-center h-full w-full">
            <div className="container mb-36 mx-auto p-4 max-w-md bg-white border shadow rounded">
                <div className="flex justify-around mb-6">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 px-4 rounded-l ${
                            isLogin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 px-4 rounded-r ${
                            !isLogin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                    >
                        Register
                    </button>
                </div>
                {isLogin ? (
                    <div>
                        <h1 className="text-2xl text-center font-bold mb-4">Login</h1>
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1">Username:</label>
                                <input
                                    type="text"
                                    value={loginUsername}
                                    onChange={(e) => setLoginUsername(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Password:</label>
                                <input
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-green-500 text-white py-2 px-4 rounded"
                            >
                                Login
                            </button>
                            {loginError && <p className="text-red-500 text-center text-sm mt-2">{loginError}</p>}
                        </form>
                    </div>
                ) : (
                    <div>
                        <h1 className="text-2xl text-center font-bold mb-4">Register</h1>
                        <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1">Username:</label>
                                <input
                                    type="text"
                                    value={regUsername}
                                    onChange={(e) => setRegUsername(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                    minLength="3"
                                    maxLength="20"
                                    pattern="^[a-zA-Z0-9_]+$"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Password:</label>
                                <input
                                    type="password"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                    minLength="8"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Full Name (optional):</label>
                                <input
                                    type="text"
                                    value={regFullName}
                                    onChange={(e) => setRegFullName(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-green-500 text-white py-2 px-4 rounded"
                            >
                                Register
                            </button>
                            {regSuccess && <p className="text-green-500 text-sm mt-2">Registration successful! Redirecting...</p>}
                            {regError && <p className="text-red-500 text-center text-sm mt-2">{regError}</p>}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
