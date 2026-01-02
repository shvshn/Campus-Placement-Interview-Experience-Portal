import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ExperienceList from './pages/ExperienceList';
import ExperienceDetail from './pages/ExperienceDetail';
import CreateExperience from './pages/CreateExperience';
import Insights from './pages/Insights';
import QuestionsSearch from './pages/QuestionsSearch';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import { AuthModalProvider } from './context/AuthModalContext.jsx';
import './App.css';

function App() {
    return (
        <Router>
            <AuthModalProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/experiences"
                            element={
                                <ProtectedRoute>
                                    <ExperienceList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/experiences/:id"
                            element={
                                <ProtectedRoute>
                                    <ExperienceDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/create"
                            element={
                                <ProtectedRoute>
                                    <CreateExperience />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />
                        <Route path="/user/:username" element={<PublicProfile />} />
                        <Route path="/insights" element={<Insights />} />
                        <Route path="/questions" element={<QuestionsSearch />} />
                    </Routes>
                </Layout>
            </AuthModalProvider>
        </Router>
    );
}

export default App;
