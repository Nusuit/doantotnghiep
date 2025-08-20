import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateReviewPage from './pages/CreateReviewPage';
import ReviewsListPage from './pages/ReviewsListPage';
import ReviewDetailPage from './pages/ReviewDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reviews" element={<ReviewsListPage />} />
            <Route path="/reviews/:id" element={<ReviewDetailPage />} />
            <Route
              path="/reviews/create"
              element={
                <ProtectedRoute>
                  <CreateReviewPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
