import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { experiencesAPI } from '../services/api.js';
import './Dashboard.css';

function Dashboard() {
    const { user } = useAuth();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyExperiences = async () => {
            try {
                setLoading(true);
                const data = await experiencesAPI.getMyExperiences();
                setExperiences(data || []);
            } catch (err) {
                console.error('Failed to fetch experiences:', err);
                setError('Failed to load your experiences');
            } finally {
                setLoading(false);
            }
        };

        fetchMyExperiences();
    }, []);

    const displayName = user?.name || user?.email?.split('@')[0] || 'User';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Selected':
                return 'status-selected';
            case 'Not Selected':
                return 'status-rejected';
            default:
                return 'status-pending';
        }
    };

    return (
        <div className="dashboard">
            <div className="container">
                {/* Welcome Section */}
                <div className="dashboard-header">
                    <div className="welcome-content">
                        <h1 className="welcome-title">
                            Welcome back, <span className="welcome-name">{displayName}</span>! 👋
                        </h1>
                        <p className="welcome-subtitle">
                            Manage your interview experiences and track your contributions
                        </p>
                    </div>
                    <Link to="/create" className="dashboard-cta">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Share New Experience
                    </Link>
                </div>

                {/* My Experiences Section */}
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            My Experiences
                        </h2>
                        <span className="experience-count">{experiences.length} total</span>
                    </div>

                    {loading ? (
                        <div className="dashboard-loading">
                            <div className="loading-spinner" />
                            <p>Loading your experiences...</p>
                        </div>
                    ) : error ? (
                        <div className="dashboard-error">
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()}>Try Again</button>
                        </div>
                    ) : experiences.length === 0 ? (
                        <div className="dashboard-empty">
                            <div className="empty-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                            </div>
                            <h3>No experiences yet</h3>
                            <p>Share your first interview experience to help others prepare!</p>
                            <Link to="/create" className="empty-cta">
                                Share Your First Experience
                            </Link>
                        </div>
                    ) : (
                        <div className="experience-list">
                            {experiences.map((exp) => (
                                <Link
                                    key={exp._id}
                                    to={`/experiences/${exp._id}`}
                                    className="experience-list-item"
                                >
                                    <div className="experience-main">
                                        <div className="experience-company-role">
                                            <h3 className="experience-company">{exp.company}</h3>
                                            <span className="experience-role">{exp.role}</span>
                                        </div>
                                        <div className="experience-meta">
                                            <span className="experience-branch">{exp.branch}</span>
                                            <span className="experience-separator">•</span>
                                            <span className="experience-year">{exp.year}</span>
                                            {exp.package && (
                                                <>
                                                    <span className="experience-separator">•</span>
                                                    <span className="experience-package">{exp.package}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="experience-details">
                                        <span className={`experience-status ${getStatusClass(exp.offerStatus)}`}>
                                            {exp.offerStatus}
                                        </span>
                                        <span className="experience-date">
                                            {formatDate(exp.createdAt)}
                                        </span>
                                        <span className="experience-views">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            {exp.views || 0}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Stats Overview */}
                {experiences.length > 0 && (
                    <section className="dashboard-stats">
                        <div className="stat-card">
                            <div className="stat-icon stat-icon-total">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{experiences.length}</span>
                                <span className="stat-label">Total Experiences</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-views">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">
                                    {experiences.reduce((sum, exp) => sum + (exp.views || 0), 0)}
                                </span>
                                <span className="stat-label">Total Views</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-selected">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">
                                    {experiences.filter((exp) => exp.offerStatus === 'Selected').length}
                                </span>
                                <span className="stat-label">Selected</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-companies">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">
                                    {new Set(experiences.map((exp) => exp.company)).size}
                                </span>
                                <span className="stat-label">Companies</span>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
