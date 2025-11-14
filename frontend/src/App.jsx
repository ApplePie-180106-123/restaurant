// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Menu from "./pages/Menu";
import Home from "./pages/Home";
import AddMenuItem from "./pages/admin/AddMenuItem";
import Cart from "./pages/Cart"
import Orders from "./pages/admin/Orders";
import InventoryManager from "./pages/admin/InventoryManager";


import "./App.css";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="/admin/add-menu" element={
          <PrivateRoute roles={['admin']}>
            <AddMenuItem />
          </PrivateRoute>
        } />
        <Route
          path="/admin/orders"
          element={
            <PrivateRoute roles={["admin", "waiter"]}>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <PrivateRoute roles={['inventory', 'admin']}>
              <InventoryManager />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
