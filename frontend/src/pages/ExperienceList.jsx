import { useState, useEffect, useCallback, useMemo } from 'react';
import { experiencesAPI } from '../services/api';
import ExperienceCard from '../components/ExperienceCard';
import FilterBar from '../components/FilterBar';
import QuestionsModal from '../components/QuestionsModal';
import './ExperienceList.css';

function ExperienceList() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    company: '',
    role: '',
    branch: '',
    year: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    companies: [],
    roles: [],
    branches: [],
    years: [],
  });

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await experiencesAPI.getFilterOptions();
        console.log('Filter options received:', options);
        setFilterOptions(options || { companies: [], roles: [], branches: [], years: [] });
      } catch (err) {
        console.error('Error fetching filter options:', err);
        setFilterOptions({ companies: [], roles: [], branches: [], years: [] });
      }
    };
    fetchFilterOptions();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadExperiences = useCallback(async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }
      const filterParams = { ...filters };
      if (debouncedSearchTerm) {
        filterParams.search = debouncedSearchTerm;
      }
      const data = await experiencesAPI.getAll(filterParams);
      setExperiences(data);
      setError(null);
    } catch (err) {
      setError('Failed to load experiences. Please try again later.');
      console.error('Error loading experiences:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters, debouncedSearchTerm, initialLoad]);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      company: '',
      role: '',
      branch: '',
      year: '',
    });
  }, []);

  const filteredExperiences = useMemo(() => {
    return experiences;
  }, [experiences]);

  if (initialLoad && loading) {
    return (
      <div className="experience-list">
        <div className="container">
          <div className="loading">Loading experiences...</div>
        </div>
      </div>
    );
  }

  if (error && initialLoad) {
    return (
      <div className="experience-list">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  const handleDownloadQuestions = () => {
    setIsQuestionsModalOpen(true);
  };

  return (
    <div className="experience-list">
      <div className="container">
        <h1 className="page-title">Interview Experiences</h1>
        <p className="page-subtitle">
          Browse and filter placement experiences shared by students and alumni
        </p>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
          searchTerm={searchTerm}
          filterOptions={filterOptions}
        />

        {loading && !initialLoad && (
          <div className="loading-inline">Filtering experiences...</div>
        )}

        {!loading && filteredExperiences.length === 0 ? (
          <div className="no-results">
            <p>No experiences found matching your filters.</p>
            <p>Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          <div className="experiences-grid">
            {filteredExperiences.map((experience) => (
              <ExperienceCard key={experience._id || experience.id} experience={experience} />
            ))}
          </div>
        )}
      </div>
      
      <button onClick={handleDownloadQuestions} className="download-questions-btn floating-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span className="btn-text">Download Interview Questions</span>
      </button>

      {isQuestionsModalOpen && (
        <QuestionsModal onClose={() => setIsQuestionsModalOpen(false)} />
      )}
    </div>
  );
}

export default ExperienceList;
