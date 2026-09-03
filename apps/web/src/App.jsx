import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';

function App() {
    // Served from "/" on Vercel but "/aiyatra.io/" on GitHub Pages.
    // Vite injects the build's --base as import.meta.env.BASE_URL, so the
    // router matches in both places with zero per-host configuration.
    const base = import.meta.env.BASE_URL || '/';
    const basename = base.replace(/\/+$/, '') || '/';
    return (
        <Router basename={basename}>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<HomePage />} />
            </Routes>
        </Router>
    );
}

export default App;
