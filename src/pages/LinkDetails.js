import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClickChart from "../components/ClickChart";

const LinkDetails = ({ authToken }) => {
    const { short } = useParams();
    const [linkInfo, setLinkInfo] = useState(null);
    const [clickData, setClickData] = useState([]);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLinkInfo = async () => {
            try {
                // Fetch click data
                const clickResponse = await fetch(`http://localhost:8000/api/me/links/${short}/redirects`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!clickResponse.ok) {
                    throw new Error("Failed to fetch click data");
                }

                const clicks = await clickResponse.json();
                setClickData(clicks);

                // Fetch link details
                const linkResponse = await fetch("http://localhost:8000/api/me/urls", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!linkResponse.ok) {
                    throw new Error("Failed to fetch link information");
                }

                const links = await linkResponse.json();
                const link = links.find((l) => l.short === short);
                if (!link) throw new Error("Link not found");
                setLinkInfo(link);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchLinkInfo();
    }, [authToken, short]);


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
            return userData.username;
        } catch (err) {
            console.error(err.message);
            return null;
        }
    };


    const calculateClicksLastDay = () => {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        return clickData.filter((timestamp) => new Date(timestamp) > oneDayAgo).length;
    };

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!linkInfo) {
        return <p className="container mx-auto p-4">Loading...</p>;
    }

    return (
        <div className="container h-min-full mx-auto p-4 bg-white shadow rounded">
            <div className="flex w-full row justify-between mb-4">
                <h1 className="text-3xl font-bold text-green-600">Link Details</h1>
                <div className="flex row items-center gap-3">
                    <p className="text-gray-800 font-bold">{username}</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
            <p className="mb-2">
                <strong>Short URL:</strong>{" "}
                <a
                    href={`http://localhost:8000/${linkInfo.short}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    {`http://localhost:8000/${linkInfo.short}`}
                </a>
            </p>
            <p className="mb-2">
                <strong>Original URL:</strong> {linkInfo.url}
            </p>
            <p className="mb-2">
                <strong>Total Clicks:</strong> {clickData.length}
            </p>
            <p className="mb-4">
                <strong>Clicks in Last 24 Hours:</strong> {calculateClicksLastDay()}
            </p>
            <ClickChart data={clickData}/>
        </div>
    );
};

export default LinkDetails;
