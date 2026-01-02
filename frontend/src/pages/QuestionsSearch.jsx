import { useState, useEffect } from 'react';
import { insightsAPI, experiencesAPI } from '../services/api';
import jsPDF from 'jspdf';
import './QuestionsSearch.css';

function QuestionsSearch() {
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [searchCompany, setSearchCompany] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [filterOptions, setFilterOptions] = useState({ companies: [], roles: [] });
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    loadFilterOptions();
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
    setQuestions([]);
    setAvailableRoles([]);
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

  return (
    <div className="questions-search-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Search Questions by Company or Role</h1>
            <p className="page-subtitle">
              Browse all interview questions with their difficulty levels
            </p>
          </div>
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
  );
}

export default QuestionsSearch;

