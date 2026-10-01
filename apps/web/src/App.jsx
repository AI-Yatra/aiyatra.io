import React, { Suspense, lazy } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import PauseOffscreen from './components/PauseOffscreen';
import HomePage from './pages/HomePage';

// The home page ships in the main bundle; every other page loads on demand.
const AmbassadorsPage = lazy(() => import('./pages/AmbassadorsPage'));
const LabsPage = lazy(() => import('./pages/LabsPage'));
const BlogIndexPage = lazy(() => import('./pages/BlogIndexPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

function PageFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white" role="status" aria-label="Loading">
            <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-tone-blue border-t-tone-blue-deep" />
        </div>
    );
}

function App() {
    // Served from "/" (custom domain + Vercel).
    // Vite injects the build's base as import.meta.env.BASE_URL, so the
    // router matches with zero per-host configuration.
    const base = import.meta.env.BASE_URL || '/';
    const basename = base.replace(/\/+$/, '') || '/';
    return (
        <Router basename={basename}>
            <ScrollToTop />
            <PauseOffscreen />
            <Suspense fallback={<PageFallback />}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/ambassadors" element={<AmbassadorsPage />} />
                <Route path="/labs" element={<LabsPage />} />
                <Route path="/blog" element={<BlogIndexPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/contact" element={<ContactPage />} />
            </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
