import { useState, useEffect } from 'react';
import { insightsAPI, experiencesAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import './Insights.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Insights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [searchCompany, setSearchCompany] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [filterOptions, setFilterOptions] = useState({ companies: [], roles: [] });
  const [availableRoles, setAvailableRoles] = useState([]);

  // Helper function to format currency values (remove $ and ensure ₹)
  const formatCurrency = (value) => {
    if (typeof value === 'string') {
      // Remove dollar signs and other currency symbols
      return value.replace(/\$/g, '').replace(/USD/gi, '').trim();
    }
    return value;
  };

  useEffect(() => {
    loadInsights();
    loadFilterOptions();
    // Don't load questions initially - wait for filter selection
  }, []);

  const loadFilterOptions = async () => {
    try {
      const options = await experiencesAPI.getFilterOptions();
      setFilterOptions({
        companies: options.companies || [],
        roles: options.roles || []
      });
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  const loadQuestions = async (company = '', role = '') => {
    try {
      setQuestionsLoading(true);
      const data = await insightsAPI.searchQuestions(company, role);
      if (data.success) {
        setQuestions(data.questions || []);
        // Update available roles if company is selected
        if (company && data.availableRoles) {
          setAvailableRoles(data.availableRoles);
        } else if (!company) {
          setAvailableRoles([]);
        }
      }
    } catch (err) {
      console.error('Error loading questions:', err);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleCompanyChange = (company) => {
    setSearchCompany(company);
    setSearchRole(''); // Reset role when company changes
    if (company) {
      loadQuestions(company, '');
    } else {
      setQuestions([]);
      setAvailableRoles([]);
    }
  };

  const handleRoleChange = (role) => {
    setSearchRole(role);
    if (searchCompany || role) {
      loadQuestions(searchCompany, role);
    } else {
      setQuestions([]);
    }
  };

  const handleSearch = () => {
    if (searchCompany || searchRole) {
      loadQuestions(searchCompany, searchRole);
    }
  };

  const handleClear = () => {
    setSearchCompany('');
    setSearchRole('');
    loadQuestions('', '');
  };

  // Group questions by interview round
  const groupQuestionsByRound = (questions) => {
    const grouped = {};
    questions.forEach((q) => {
      const roundKey = `Round ${q.roundNumber}: ${q.roundName}`;
      if (!grouped[roundKey]) {
        grouped[roundKey] = {
          roundNumber: q.roundNumber,
          roundName: q.roundName,
          questions: []
        };
      }
      grouped[roundKey].questions.push(q);
    });
    
    // Sort rounds by round number
    return Object.values(grouped).sort((a, b) => a.roundNumber - b.roundNumber);
  };

  // Download questions as PDF
  const downloadQuestionsPDF = () => {
    if (questions.length === 0) {
      alert('No questions to download');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;
    const lineHeight = 7;
    const sectionSpacing = 10;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredSpace) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Interview Questions', pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight * 2;

    // Filter info
    if (searchCompany || searchRole) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let filterText = 'Filters: ';
      if (searchCompany) filterText += `Company: ${searchCompany}`;
      if (searchCompany && searchRole) filterText += ', ';
      if (searchRole) filterText += `Role: ${searchRole}`;
      doc.text(filterText, margin, yPos);
      yPos += lineHeight * 1.5;
    }

    // Group questions by round
    const groupedRounds = groupQuestionsByRound(questions);

    // Add questions grouped by rounds
    groupedRounds.forEach((roundGroup, roundIndex) => {
      checkPageBreak(sectionSpacing + lineHeight * 3);

      // Round header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text(`Round ${roundGroup.roundNumber}: ${roundGroup.roundName}`, margin, yPos);
      yPos += lineHeight * 1.5;

      // Questions in this round
      roundGroup.questions.forEach((q, qIndex) => {
        checkPageBreak(lineHeight * 4);

        // Question number and text
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const questionNum = `${roundIndex + 1}.${qIndex + 1}`;
        doc.text(`${questionNum}. ${q.question}`, margin + 5, yPos);
        yPos += lineHeight;

        // Metadata
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        let metaText = `${q.company} • ${q.role}`;
        if (q.year) metaText += ` • ${q.year}`;
        metaText += ` • Level: ${q.level}`;
        doc.text(metaText, margin + 10, yPos);
        yPos += lineHeight * 1.5;
      });

      // Spacing between rounds
      yPos += sectionSpacing;
    });

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${totalPages} | Total Questions: ${questions.length}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Generate filename
    let filename = 'interview-questions';
    if (searchCompany) filename += `-${searchCompany}`;
    if (searchRole) filename += `-${searchRole}`;
    filename += '.pdf';

    // Save PDF
    doc.save(filename);
  };

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await insightsAPI.getAll();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError('Failed to load insights. Please try again later.');
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="insights">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="insights">
        <div className="container">
          <div className="error-state">{error || 'Failed to load insights'}</div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const companyData = Object.entries(insights.companyDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const roleData = Object.entries(insights.roleDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const yearData = Object.entries(insights.yearDistribution)
    .sort((a, b) => a[0] - b[0]);

  // Company Bar Chart
  const companyChartData = {
    labels: companyData.map(([company]) => company),
    datasets: [
      {
        label: 'Experiences',
        data: companyData.map(([, count]) => count),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Role Pie Chart
  const roleChartData = {
    labels: roleData.map(([role]) => role),
    datasets: [
      {
        label: 'Roles',
        data: roleData.map(([, count]) => count),
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(244, 114, 182, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(192, 132, 252, 0.8)',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Year Line Chart
  const yearChartData = {
    labels: yearData.map(([year]) => year.toString()),
    datasets: [
      {
        label: 'Experiences per Year',
        data: yearData.map(([, count]) => count),
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(168, 85, 247, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: '600',
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
        },
        borderColor: 'rgba(168, 85, 247, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y || context.parsed}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value) {
            return value;
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          font: {
            size: 11,
            weight: '500',
          },
          padding: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
        },
        borderColor: 'rgba(168, 85, 247, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || context.raw || 0;
            return `${label}: ${value}`;
          }
        }
      },
    },
  };

  return (
    <div className="insights">
      <div className="container">
        <div className="insights-header">
          <h1 className="page-title">Data Insights & Analytics</h1>
          <p className="page-subtitle">
            Comprehensive analytics and trends from placement experiences
          </p>
        </div>

        {/* Stats Overview Cards */}
        <div className="stats-overview">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{insights.overview.totalExperiences}</div>
              <div className="stat-label">Total Experiences</div>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{insights.overview.uniqueCompanies}</div>
              <div className="stat-label">Unique Companies</div>
            </div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{insights.overview.uniqueRoles}</div>
              <div className="stat-label">Unique Roles</div>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <text x="12" y="18" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">₹</text>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">₹{formatCurrency(insights.overview.avgPackage)} LPA</div>
              <div className="stat-label">Average Package</div>
            </div>
          </div>

          <div className="stat-card stat-card-danger">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <text x="12" y="18" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">₹</text>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">₹{formatCurrency(insights.overview.maxPackage)} LPA</div>
              <div className="stat-label">Maximum Package</div>
            </div>
          </div>

          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <text x="12" y="18" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">₹</text>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">₹{formatCurrency(insights.overview.minPackage)} LPA</div>
              <div className="stat-label">Minimum Package</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h2>Top Companies</h2>
              <p>Experiences by company</p>
            </div>
            <div className="chart-container">
              <Bar data={companyChartData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h2>Role Distribution</h2>
              <p>Most common job roles</p>
            </div>
            <div className="chart-container">
              <Pie data={roleChartData} options={pieChartOptions} />
            </div>
          </div>
        </div>

        {/* Search Questions Section */}
        <div className="insights-grid">
          <div className="insight-card insight-card-full">
            <div className="card-header">
              <h2>Search Questions by Company or Role</h2>
              <p className="card-description">
                Browse all interview questions with their difficulty levels
              </p>
            </div>
            
            {/* Search Filters */}
            <div className="questions-search-filters">
              <div className="search-filter-group">
                <label htmlFor="search-company">Company</label>
                <select
                  id="search-company"
                  value={searchCompany}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="search-select"
                >
                  <option value="">All Companies</option>
                  {filterOptions.companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="search-filter-group">
                <label htmlFor="search-role">Role</label>
                <select
                  id="search-role"
                  value={searchRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="search-select"
                  disabled={searchCompany && availableRoles.length === 0}
                >
                  <option value="">All Roles</option>
                  {(searchCompany && availableRoles.length > 0 ? availableRoles : filterOptions.roles).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="search-actions">
                <button onClick={handleSearch} className="search-btn" disabled={questionsLoading}>
                  {questionsLoading ? 'Searching...' : 'Search'}
                </button>
                <button onClick={handleClear} className="clear-btn">
                  Clear
                </button>
                <button 
                  onClick={downloadQuestionsPDF} 
                  className="download-btn"
                  disabled={questions.length === 0 || (!searchCompany && !searchRole)}
                  title="Download questions as PDF"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="questions-container">
              {!searchCompany && !searchRole ? (
                <div className="no-data-prompt">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <p>Please select a Company or Role to view questions</p>
                </div>
              ) : questionsLoading ? (
                <div className="loading-questions">
                  <div className="loading-spinner"></div>
                  <p>Loading questions...</p>
                </div>
              ) : questions.length > 0 ? (
                groupQuestionsByRound(questions).map((roundGroup, roundIndex) => (
                  <div key={roundIndex} className="round-section">
                    <h3 className="round-section-header">
                      Round {roundGroup.roundNumber}: {roundGroup.roundName}
                    </h3>
                    <div className="questions-list">
                      {roundGroup.questions.map((q, index) => (
                        <div key={index} className="question-item">
                          <div className="question-content">
                            <div className="question-text">{q.question}</div>
                            <div className="question-meta">
                              <span className="question-company">{q.company}</span>
                              <span className="question-separator">•</span>
                              <span className="question-role">{q.role}</span>
                              {q.year && (
                                <>
                                  <span className="question-separator">•</span>
                                  <span className="question-year">{q.year}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className={`question-level-badge level-${q.level.toLowerCase()}`}>
                            {q.level}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No questions found. Try adjusting your search criteria.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights;
