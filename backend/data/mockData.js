// Mock data for development
let experiences = [
  {
    id: 1,
    company: 'Google',
    role: 'Software Engineer',
    branch: 'Computer Science',
    year: 2024,
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Online Assessment',
        questions: [
          'Given an array of integers, find the maximum sum of contiguous subarray',
          'Design a system to handle 1 million requests per second'
        ],
        feedback: 'Focus on time complexity and edge cases'
      },
      {
        roundNumber: 2,
        roundName: 'Technical Interview',
        questions: [
          'Explain how HashMap works internally',
          'Implement a binary search tree',
          'Given two sorted arrays, merge them in O(n) time'
        ],
        feedback: 'Interviewer was helpful. Covered DSA fundamentals well.'
      },
      {
        roundNumber: 3,
        roundName: 'System Design',
        questions: [
          'Design a URL shortener like bit.ly',
          'How would you scale it to handle billions of requests?'
        ],
        feedback: 'Discussed distributed systems and caching strategies'
      }
    ],
    package: '35 LPA',
    tips: 'Practice system design questions. Focus on distributed systems and scalability.',
    interviewDate: '2024-01-15',
    offerStatus: 'Selected',
    author: 'Student A',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 2,
    company: 'Microsoft',
    role: 'Software Development Engineer',
    branch: 'Computer Science',
    year: 2024,
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Coding Round',
        questions: [
          'Find all permutations of a string',
          'Implement LRU Cache',
          'Reverse a linked list in groups of k'
        ],
        feedback: 'Medium difficulty. Expected optimized solutions.'
      },
      {
        roundNumber: 2,
        roundName: 'Technical Interview',
        questions: [
          'Explain ACID properties in databases',
          'What is the difference between REST and GraphQL?',
          'Design a parking lot system'
        ],
        feedback: 'Interview focused on problem-solving approach'
      }
    ],
    package: '28 LPA',
    tips: 'Strong emphasis on clean code and design patterns. Brush up on OOP concepts.',
    interviewDate: '2024-02-10',
    offerStatus: 'Selected',
    author: 'Student B',
    createdAt: '2024-02-15T14:30:00Z'
  },
  {
    id: 3,
    company: 'Amazon',
    role: 'Software Development Engineer',
    branch: 'Electronics Engineering',
    year: 2024,
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Online Assessment',
        questions: [
          'Find longest palindromic subsequence',
          'Minimum path sum in a grid',
          'Design a rate limiter'
        ],
        feedback: 'Time-bound questions. Practice speed coding.'
      },
      {
        roundNumber: 2,
        roundName: 'Technical Interview 1',
        questions: [
          'Explain BFS vs DFS',
          'Implement a Trie data structure',
          'Two sum problem variants'
        ],
        feedback: 'Good discussion on time-space tradeoffs'
      },
      {
        roundNumber: 3,
        roundName: 'Technical Interview 2',
        questions: [
          'Design a notification system',
          'How do you handle distributed transactions?',
          'Explain CAP theorem'
        ],
        feedback: 'Deep dive into system architecture'
      },
      {
        roundNumber: 4,
        roundName: 'Bar Raiser',
        questions: [
          'Tell me about a challenging project',
          'How do you handle conflict in a team?',
          'Design Twitter feed'
        ],
        feedback: 'Behavioral and technical mix. Be prepared for leadership questions.'
      }
    ],
    package: '32 LPA',
    tips: 'Amazon leadership principles are important. Have examples ready.',
    interviewDate: '2024-03-05',
    offerStatus: 'Selected',
    author: 'Student C',
    createdAt: '2024-03-10T09:15:00Z'
  },
  {
    id: 4,
    company: 'Goldman Sachs',
    role: 'Software Engineer',
    branch: 'Computer Science',
    year: 2023,
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Coding Round',
        questions: [
          'Stock buying/selling problem',
          'Implement a priority queue',
          'Find all anagrams in a string'
        ],
        feedback: 'Questions related to financial algorithms'
      },
      {
        roundNumber: 2,
        roundName: 'Technical Interview',
        questions: [
          'Explain how garbage collection works',
          'Design a high-frequency trading system',
          'Concurrency and thread safety'
        ],
        feedback: 'Strong focus on performance and optimization'
      }
    ],
    package: '26 LPA',
    tips: 'Understand low-level programming and performance optimization. C++ knowledge helps.',
    interviewDate: '2023-11-20',
    offerStatus: 'Selected',
    author: 'Alumni D',
    createdAt: '2023-11-25T16:45:00Z'
  },
  {
    id: 5,
    company: 'Meta',
    role: 'Software Engineer',
    branch: 'Computer Science',
    year: 2024,
    rounds: [
      {
        roundNumber: 1,
        roundName: 'Phone Screen',
        questions: [
          'Merge k sorted lists',
          'Design Instagram feed',
          'Find longest common subsequence'
        ],
        feedback: 'Algorithm design and optimization focus'
      },
      {
        roundNumber: 2,
        roundName: 'Onsite Round 1',
        questions: [
          'Design a distributed cache',
          'Implement a graph traversal algorithm',
          'System design for news feed ranking'
        ],
        feedback: 'Emphasis on scalable solutions'
      },
      {
        roundNumber: 3,
        roundName: 'Onsite Round 2',
        questions: [
          'Explain React internals',
          'How does virtual DOM work?',
          'Design a real-time chat system'
        ],
        feedback: 'Mix of frontend and backend concepts'
      }
    ],
    package: '40 LPA',
    tips: 'Strong system design skills required. Practice large-scale system problems.',
    interviewDate: '2024-04-12',
    offerStatus: 'Selected',
    author: 'Student E',
    createdAt: '2024-04-18T11:20:00Z'
  }
];

let nextId = 6;

// Helper functions
const getExperiences = () => experiences;
const getExperienceById = (id) => experiences.find(exp => exp.id === parseInt(id));
const addExperience = (experience) => {
  const newExperience = {
    id: nextId++,
    ...experience,
    createdAt: new Date().toISOString()
  };
  experiences.push(newExperience);
  return newExperience;
};
const updateExperience = (id, updatedExperience) => {
  const index = experiences.findIndex(exp => exp.id === parseInt(id));
  if (index !== -1) {
    experiences[index] = { ...experiences[index], ...updatedExperience };
    return experiences[index];
  }
  return null;
};
const deleteExperience = (id) => {
  const index = experiences.findIndex(exp => exp.id === parseInt(id));
  if (index !== -1) {
    experiences.splice(index, 1);
    return true;
  }
  return false;
};

module.exports = {
  getExperiences,
  getExperienceById,
  addExperience,
  updateExperience,
  deleteExperience
};

