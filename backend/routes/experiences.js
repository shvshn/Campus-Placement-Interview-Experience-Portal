const express = require('express');
const router = express.Router();
const {
  getExperiences,
  getExperienceById,
  addExperience,
  updateExperience,
  deleteExperience
} = require('../data/mockData');

// GET /api/experiences - Get all experiences with optional filters
router.get('/', (req, res) => {
  try {
    let experiences = getExperiences();
    const { company, role, branch, year, search } = req.query;

    // Filter by company
    if (company) {
      experiences = experiences.filter(exp => 
        exp.company.toLowerCase().includes(company.toLowerCase())
      );
    }

    // Filter by role
    if (role) {
      experiences = experiences.filter(exp => 
        exp.role.toLowerCase().includes(role.toLowerCase())
      );
    }

    // Filter by branch
    if (branch) {
      experiences = experiences.filter(exp => 
        exp.branch.toLowerCase().includes(branch.toLowerCase())
      );
    }

    // Filter by year
    if (year) {
      experiences = experiences.filter(exp => exp.year === parseInt(year));
    }

    // Search across multiple fields
    if (search) {
      const searchLower = search.toLowerCase();
      experiences = experiences.filter(exp =>
        exp.company.toLowerCase().includes(searchLower) ||
        exp.role.toLowerCase().includes(searchLower) ||
        exp.branch.toLowerCase().includes(searchLower) ||
        exp.tips.toLowerCase().includes(searchLower) ||
        exp.rounds.some(round => 
          round.questions.some(q => q.toLowerCase().includes(searchLower)) ||
          round.feedback.toLowerCase().includes(searchLower)
        )
      );
    }

    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/experiences/:id - Get single experience
router.get('/:id', (req, res) => {
  try {
    const experience = getExperienceById(req.params.id);
    if (experience) {
      res.json(experience);
    } else {
      res.status(404).json({ error: 'Experience not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/experiences - Create new experience
router.post('/', (req, res) => {
  try {
    const {
      company,
      role,
      branch,
      year,
      rounds,
      package: pkg,
      tips,
      interviewDate,
      offerStatus,
      author
    } = req.body;

    // Basic validation
    if (!company || !role || !branch || !year || !rounds || !author) {
      return res.status(400).json({ 
        error: 'Missing required fields: company, role, branch, year, rounds, author' 
      });
    }

    const newExperience = addExperience({
      company,
      role,
      branch,
      year: parseInt(year),
      rounds,
      package: pkg,
      tips: tips || '',
      interviewDate: interviewDate || new Date().toISOString().split('T')[0],
      offerStatus: offerStatus || 'Pending',
      author
    });

    res.status(201).json(newExperience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/experiences/:id - Update experience
router.put('/:id', (req, res) => {
  try {
    const updated = updateExperience(req.params.id, req.body);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Experience not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/experiences/:id - Delete experience
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteExperience(req.params.id);
    if (deleted) {
      res.json({ message: 'Experience deleted successfully' });
    } else {
      res.status(404).json({ error: 'Experience not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

