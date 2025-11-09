// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Menu from "./pages/Menu";
import "./App.css";




const Home = () => (
  <div className="container mt-5">
    <h2>Welcome to RMS</h2>
    <p>Use the navbar to login or register.</p>
  </div>
);

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Menu />} />


        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        {/* Example: protect admin-only route */}
        {/* <Route path="/admin" element={
          <PrivateRoute roles={['admin']}>
            <AdminPage />
          </PrivateRoute>
        } /> */}
      </Routes>
    </>
  );
};

export default App;
