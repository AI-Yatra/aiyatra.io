import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import AmbassadorsPage from './pages/AmbassadorsPage';
import BlogIndexPage from './pages/BlogIndexPage';
import BlogPostPage from './pages/BlogPostPage';
import AdminPage from './pages/AdminPage';

function App() {
    // Served from "/" (custom domain + Vercel).
    // Vite injects the build's base as import.meta.env.BASE_URL, so the
    // router matches with zero per-host configuration.
    const base = import.meta.env.BASE_URL || '/';
    const basename = base.replace(/\/+$/, '') || '/';
    return (
        <Router basename={basename}>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/ambassadors" element={<AmbassadorsPage />} />
                <Route path="/blog" element={<BlogIndexPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </Router>
    );
}

export default App;
