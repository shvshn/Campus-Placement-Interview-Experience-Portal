import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { commentsAPI } from '../services/api.js';
import './CommentSection.css';

function CommentSection({ experienceId }) {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadComments();
    }, [experienceId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await commentsAPI.getByExperience(experienceId);
            setComments(data || []);
            setError(null);
        } catch (err) {
            console.error('Failed to load comments:', err);
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) {
            return;
        }

        try {
            setSubmitting(true);
            const comment = await commentsAPI.create(experienceId, newComment);
            setComments([comment, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to post comment:', err);
            alert('Failed to post comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            await commentsAPI.delete(commentId);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment:', err);
            alert('Failed to delete comment. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div className="comment-section">
            <div className="comment-section-header">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Discussion
                    {comments.length > 0 && <span className="comment-count">({comments.length})</span>}
                </h3>
            </div>

            {/* Comment Form */}
            {isAuthenticated ? (
                <form className="comment-form" onSubmit={handleSubmit}>
                    <textarea
                        className="comment-textarea"
                        placeholder="Share your thoughts or ask a question..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        maxLength={1000}
                        rows={3}
                        disabled={submitting}
                    />
                    <div className="comment-form-footer">
                        <span className="character-count">
                            {newComment.length}/1000
                        </span>
                        <button
                            type="submit"
                            className="comment-submit-btn"
                            disabled={!newComment.trim() || submitting}
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </form>
            ) : (
                <div className="comment-login-prompt">
                    <p>Please log in to join the discussion</p>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="comments-loading">
                    <div className="loading-spinner" />
                    <p>Loading comments...</p>
                </div>
            ) : error ? (
                <div className="comments-error">
                    <p>{error}</p>
                </div>
            ) : comments.length === 0 ? (
                <div className="comments-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p>No comments yet. Be the first to start the discussion!</p>
                </div>
            ) : (
                <div className="comments-list">
                    {comments.map((comment) => (
                        <div key={comment._id} className="comment-card">
                            <div className="comment-avatar">
                                {getInitials(comment.author?.name)}
                            </div>
                            <div className="comment-content">
                                <div className="comment-header">
                                    <div className="comment-author-info">
                                        {comment.author?.username ? (
                                            <Link to={`/user/${comment.author.username}`} className="comment-author-link">
                                                <span className="comment-author-name">
                                                    {comment.author?.name || 'Anonymous'}
                                                </span>
                                                <span className="comment-username">@{comment.author.username}</span>
                                            </Link>
                                        ) : (
                                            <span className="comment-author-name">
                                                {comment.author?.name || 'Anonymous'}
                                            </span>
                                        )}
                                        <span className="comment-timestamp">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    {isAuthenticated && user?._id === comment.author?._id && (
                                        <button
                                            type="button"
                                            className="comment-delete-btn"
                                            onClick={() => handleDelete(comment._id)}
                                            title="Delete comment"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <p className="comment-text">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CommentSection;
