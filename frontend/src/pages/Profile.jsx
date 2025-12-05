import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI, experiencesAPI } from '../services/api.js';
import './Profile.css';

function Profile() {
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [experiences, setExperiences] = useState([]);
    const [profileData, setProfileData] = useState({
        name: '',
        username: '',
        email: '',
        branch: '',
        graduationYear: '',
        currentCompany: '',
        isAlumni: false,
        role: '',
        profile: {
            bio: '',
            linkedin: '',
            github: '',
            twitter: '',
        },
    });

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);

            // Load user profile
            const profileResponse = await userAPI.getProfile();
            if (profileResponse.success && profileResponse.user) {
                const userData = profileResponse.user;
                setProfileData({
                    name: userData.name || '',
                    username: userData.username || '',
                    email: userData.email || '',
                    branch: userData.branch || '',
                    graduationYear: userData.graduationYear || '',
                    currentCompany: userData.currentCompany || '',
                    isAlumni: userData.isAlumni || false,
                    role: userData.role || '',
                    profile: {
                        bio: userData.profile?.bio || '',
                        linkedin: userData.profile?.linkedin || '',
                        github: userData.profile?.github || '',
                        twitter: userData.profile?.twitter || '',
                    },
                });
            }

            // Load user's experiences
            const experiencesData = await experiencesAPI.getMyExperiences();
            setExperiences(experiencesData || []);
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('profile.')) {
            const profileField = name.split('.')[1];
            setProfileData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    [profileField]: value,
                },
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const updatePayload = {
                name: profileData.name,
                branch: profileData.branch,
                graduationYear: profileData.graduationYear ? parseInt(profileData.graduationYear) : null,
                currentCompany: profileData.currentCompany,
                isAlumni: profileData.isAlumni,
                profile: profileData.profile,
            };

            await userAPI.updateProfile(updatePayload);
            await refreshUser(); // Refresh the user context
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        loadProfileData(); // Reload original data
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

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

    if (loading) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="profile-loading">
                        <div className="loading-spinner" />
                        <p>Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                {/* Profile Header */}
                <div className="profile-header">
                    <h1>My Profile</h1>
                    {!isEditing ? (
                        <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Profile
                        </button>
                    ) : (
                        <div className="profile-edit-actions">
                            <button className="profile-cancel-btn" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Info Card */}
                <div className="profile-card">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-large">
                            {getInitials(profileData.name)}
                        </div>
                        <div className="profile-basic-info">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        name="name"
                                        className="profile-input profile-input-large"
                                        value={profileData.name}
                                        onChange={handleInputChange}
                                        placeholder="Your Name"
                                    />
                                    {profileData.username && (
                                        <span className="profile-username">@{profileData.username}</span>
                                    )}
                                    <p className="profile-email-readonly">{profileData.email}</p>
                                </>
                            ) : (
                                <>
                                    <h2>{profileData.name}</h2>
                                    {profileData.username && (
                                        <span className="profile-username">@{profileData.username}</span>
                                    )}
                                    <p className="profile-email">{profileData.email}</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="profile-details-grid">
                        {/* Branch */}
                        <div className="profile-field">
                            <label>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                </svg>
                                Branch
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="branch"
                                    className="profile-input"
                                    value={profileData.branch}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Computer Science"
                                />
                            ) : (
                                <span>{profileData.branch || 'Not specified'}</span>
                            )}
                        </div>

                        {/* Graduation Year */}
                        <div className="profile-field">
                            <label>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                Graduation Year
                            </label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="graduationYear"
                                    className="profile-input"
                                    value={profileData.graduationYear}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2025"
                                    min="2000"
                                    max="2050"
                                />
                            ) : (
                                <span>{profileData.graduationYear || 'Not specified'}</span>
                            )}
                        </div>

                        {/* Current Organization */}
                        <div className="profile-field">
                            <label>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                                Current Organization
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="currentCompany"
                                    className="profile-input"
                                    value={profileData.currentCompany}
                                    onChange={handleInputChange}
                                    placeholder="Company or University"
                                />
                            ) : (
                                <span>{profileData.currentCompany || 'Not specified'}</span>
                            )}
                        </div>

                        {/* Role */}
                        <div className="profile-field">
                            <label>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Role
                            </label>
                            <span className="profile-role-badge">{profileData.role || 'Student'}</span>
                        </div>
                    </div>

                    {/* Alumni Toggle */}
                    {isEditing && (
                        <div className="profile-field profile-field-checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isAlumni"
                                    checked={profileData.isAlumni}
                                    onChange={handleInputChange}
                                />
                                <span>I am an Alumni</span>
                            </label>
                        </div>
                    )}

                    {/* Bio */}
                    <div className="profile-field profile-field-full">
                        <label>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            Bio
                        </label>
                        {isEditing ? (
                            <textarea
                                name="profile.bio"
                                className="profile-textarea"
                                value={profileData.profile.bio}
                                onChange={handleInputChange}
                                placeholder="Tell us about yourself..."
                                rows={4}
                                maxLength={500}
                            />
                        ) : (
                            <p className="profile-bio-text">
                                {profileData.profile.bio || 'No bio added yet'}
                            </p>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="profile-social-section">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            Social Links
                        </h3>

                        <div className="profile-social-grid">
                            {/* LinkedIn */}
                            <div className="profile-social-field">
                                <label>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                    LinkedIn
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="profile.linkedin"
                                        className="profile-input"
                                        value={profileData.profile.linkedin}
                                        onChange={handleInputChange}
                                        placeholder="LinkedIn URL"
                                    />
                                ) : profileData.profile.linkedin ? (
                                    <a href={profileData.profile.linkedin} target="_blank" rel="noopener noreferrer">
                                        {profileData.profile.linkedin}
                                    </a>
                                ) : (
                                    <span className="profile-social-empty">Not added</span>
                                )}
                            </div>

                            {/* GitHub */}
                            <div className="profile-social-field">
                                <label>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                    </svg>
                                    GitHub
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="profile.github"
                                        className="profile-input"
                                        value={profileData.profile.github}
                                        onChange={handleInputChange}
                                        placeholder="GitHub URL"
                                    />
                                ) : profileData.profile.github ? (
                                    <a href={profileData.profile.github} target="_blank" rel="noopener noreferrer">
                                        {profileData.profile.github}
                                    </a>
                                ) : (
                                    <span className="profile-social-empty">Not added</span>
                                )}
                            </div>

                            {/* Twitter */}
                            <div className="profile-social-field">
                                <label>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    Twitter / X
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="profile.twitter"
                                        className="profile-input"
                                        value={profileData.profile.twitter}
                                        onChange={handleInputChange}
                                        placeholder="Twitter/X URL"
                                    />
                                ) : profileData.profile.twitter ? (
                                    <a href={profileData.profile.twitter} target="_blank" rel="noopener noreferrer">
                                        {profileData.profile.twitter}
                                    </a>
                                ) : (
                                    <span className="profile-social-empty">Not added</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Experiences Section */}
                <div className="profile-experiences-section">
                    <div className="section-header">
                        <h2>
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

                    {experiences.length === 0 ? (
                        <div className="profile-experiences-empty">
                            <p>You haven't shared any experiences yet</p>
                            <Link to="/create" className="profile-add-experience-btn">
                                Share Your First Experience
                            </Link>
                        </div>
                    ) : (
                        <div className="profile-experiences-list">
                            {experiences.map((exp) => (
                                <Link
                                    key={exp._id}
                                    to={`/experiences/${exp._id}`}
                                    className="profile-experience-item"
                                >
                                    <div className="experience-main">
                                        <div className="experience-company-role">
                                            <h3>{exp.company}</h3>
                                            <span className="experience-role">{exp.role}</span>
                                        </div>
                                        <div className="experience-meta">
                                            <span>{exp.branch}</span>
                                            <span className="separator">•</span>
                                            <span>{exp.year}</span>
                                            {exp.package && (
                                                <>
                                                    <span className="separator">•</span>
                                                    <span className="package">{exp.package}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="experience-details">
                                        <span className={`status ${getStatusClass(exp.offerStatus)}`}>
                                            {exp.offerStatus}
                                        </span>
                                        <span className="date">{formatDate(exp.createdAt)}</span>
                                        <span className="views">
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
                </div>
            </div>
        </div>
    );
}

export default Profile;
