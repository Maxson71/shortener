import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";
import { IoCopyOutline } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";


const Dashboard = () => {
    const { authToken, logout } = useContext(AuthContext);
    const [url, setUrl] = useState("");
    const [links, setLinks] = useState([]);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState(null);
    const navigate = useNavigate();

    // Fetch user's links
    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/me/urls", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch links");
                }

                const data = await response.json();
                setLinks(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchLinks();
    }, [authToken]);

    useEffect(() => {
        const getUserInfo = async () => {
            const username = await fetchUserInfo(authToken);
            setUsername(username);
        };

        getUserInfo();
    }, [authToken]);

    const fetchUserInfo = async (authToken) => {
        try {
            const response = await fetch("http://localhost:8000/api/me", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user info");
            }

            const userData = await response.json();
            return userData.username; // Повертаємо ім'я користувача
        } catch (err) {
            console.error(err.message);
            return null;
        }
    };


    const handleShorten = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch("http://localhost:8000/api/me/urls", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error("Write the correct URL");
            }

            const newLink = await response.json();
            setLinks((prevLinks) => [newLink, ...prevLinks]);
            setUrl("");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCopy = (short) => {
        navigator.clipboard.writeText(`http://localhost:8000/${short}`).then(
            () => {
                alert("Copied to clipboard!");
            },
            (err) => {
                console.error("Failed to copy: ", err);
            }
        );
    };


    const handleDelete = (short) => {
        setLinks((prevLinks) => prevLinks.filter((link) => link.short !== short));
        // Зроблено так, оскільки бекенд не має такого функціоналу
    };

    return (
        <div className="container w-full mx-auto p-4">
            <div className="flex w-full row justify-between mb-4">
                <h1 className="text-3xl font-bold text-green-600">Dashboard</h1>
                <div className="flex row items-center gap-3">
                    <p className="text-gray-800 font-bold">{username}</p>
                    <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Logout
                    </button>
                </div>
            </div>
            <form
                onSubmit={handleShorten}
                className="bg-white border shadow rounded px-8 pt-6 pb-8 mb-4"
            >
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    URL to shorten:
                </label>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="appearance-none border rounded w-full py-2 px-3 mb-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
                {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
                <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-700 transition text-white font-bold py-2 px-4 rounded"
                >
                    Shorten
                </button>
            </form>
            <div className="overflow-y-auto border rounded shadow-md p-2">
                <ul className="space-y-4">
                    {links.map((link) => (
                        <li
                            key={link.short}
                            className="p-4 bg-white border rounded flex items-center justify-between"
                        >
                            <div className="flex row gap-3">
                                <a
                                    href={`http://localhost:8000/${link.short}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    {link.short}
                                </a>
                                <p>{link.url}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-gray-500">
                                    {new Date(link.created_at).toLocaleDateString('en-us', {
                                        weekday: "short",
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric"
                                    })}
                                </p>
                                <button
                                    onClick={() => handleCopy(link.short)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1.5 px-1.5 rounded flex items-center"
                                >
                                    <IoCopyOutline size={20}/>
                                </button>
                                <button
                                    onClick={() => navigate(`/link/${link.short}`)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => handleDelete(link.short)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-1.5 rounded flex items-center"
                                >
                                    <IoTrashOutline size={20}/>
                                </button>
                            </div>
                        </li>
                    ))}
                    {links.length === 0 && (
                        <p className="text-gray-500 text-center">No links yet</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
