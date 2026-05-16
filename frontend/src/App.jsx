import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";  
import MainLayout from "./layout/MainLayout";
import Login from './pages/Login';
import Signup from './pages/Signup';
import Listings from './pages/Listings';
import useAuthStore from "./store/store";
import { useEffect } from 'react';

function App() {

const checkAuth = useAuthStore(
   (state)=>state.checkAuth
);
  useEffect(()=>{
    checkAuth();
  }, []);

  return (

    <BrowserRouter>

      <Routes>

        <Route element={<MainLayout />}>

        <Route path="/listings" element={<Listings />} />


        <Route
          path="/login"
          element={<Login />}
        />

         <Route
          path="/signup"
          element={<Signup />}
        />

        </Route>

      </Routes>

    </BrowserRouter>

  );

}

export default App;

 