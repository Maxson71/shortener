import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LinkDetails from "./pages/LinkDetails";
import AuthPage from "./pages/AuthPage";

export const AuthContext = createContext();

const App = () => {
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  return (
      <AuthContext.Provider value={{authToken, isAuthenticated, login, logout}}>
        <div className="flex h-screen">
          <Router>
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard/> : <Navigate to="/login"/>}/>
              <Route path="/link/:short"
                     element={isAuthenticated ? <LinkDetails authToken={authToken}/> : <Navigate to="/login"/>}/>
              <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"}/>}/>
            </Routes>
          </Router>
        </div>
      </AuthContext.Provider>
  );
};

export default App;

