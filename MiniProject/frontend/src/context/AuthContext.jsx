import { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API = "http://localhost:5000/api/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API}/login`, { email, password });
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      throw err;
    }
  };

  const signup = async (name, email, password, city) => {
    try {
      const res = await axios.post(`${API}/signup`, {
        name,
        email,
        password,
        city
      });
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ login, signup, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};