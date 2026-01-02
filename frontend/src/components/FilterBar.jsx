import { memo } from 'react';
import './FilterBar.css';
import CustomDropdown from './CustomDropdown';

const FilterBar = memo(function FilterBar({ filters, onFilterChange, onSearchChange, onClearFilters, searchTerm, filterOptions = { companies: [], roles: [], branches: [], years: [] } }) {
  // Prepare dropdown options
  const companyOptions = [
    { value: '', label: 'All Companies' },
    ...(filterOptions.companies && Array.isArray(filterOptions.companies) && filterOptions.companies.length > 0
      ? filterOptions.companies.map((company) => ({ value: company, label: company }))
      : [])
  ];

  const roleOptions = [
    { value: '', label: 'All Roles' },
    ...(filterOptions.roles && Array.isArray(filterOptions.roles) && filterOptions.roles.length > 0
      ? filterOptions.roles.map((role) => ({ value: role, label: role }))
      : [])
  ];

  const branchOptions = [
    { value: '', label: 'All Branches' },
    ...(filterOptions.branches && Array.isArray(filterOptions.branches) && filterOptions.branches.length > 0
      ? filterOptions.branches.map((branch) => ({ value: branch, label: branch }))
      : [])
  ];

  const yearOptions = [
    { value: '', label: 'All Years' },
    ...(filterOptions.years && Array.isArray(filterOptions.years) && filterOptions.years.length > 0
      ? filterOptions.years.map((year) => ({ value: year.toString(), label: year.toString() }))
      : [])
  ];
  
  return (
    <div className="filter-bar">
      <div className="filter-group search-group">
        <input
          type="text"
          placeholder="Search experiences"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-field"
        />
      </div>

      <div className="filter-group">
        <CustomDropdown
          value={filters.company || ''}
          onChange={(value) => onFilterChange('company', value)}
          options={companyOptions}
          placeholder="All Companies"
        />
      </div>

      <div className="filter-group">
        <CustomDropdown
          value={filters.role || ''}
          onChange={(value) => onFilterChange('role', value)}
          options={roleOptions}
          placeholder="All Roles"
        />
      </div>

      <div className="filter-group">
        <CustomDropdown
          value={filters.branch || ''}
          onChange={(value) => onFilterChange('branch', value)}
          options={branchOptions}
          placeholder="All Branches"
        />
      </div>

      <div className="filter-group">
        <CustomDropdown
          value={filters.year ? filters.year.toString() : ''}
          onChange={(value) => onFilterChange('year', value ? parseInt(value) : '')}
          options={yearOptions}
          placeholder="All Years"
        />
      </div>

      <button
        onClick={onClearFilters}
        className="clear-filters-btn"
      >
        Clear Filters
      </button>
    </div>
  );
});

export default FilterBar;
