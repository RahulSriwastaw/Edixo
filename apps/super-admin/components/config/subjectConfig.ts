// Subject-specific configuration for question generation

export interface SubjectConfig {
    hasDatePicker?: boolean;
    hasTimePicker?: boolean;
    hasTopicTree?: boolean;
    hasFormulaSelector?: boolean;
    hasDiagramOption?: boolean;
    hasExperimentSelector?: boolean;
    topicCategories?: string[];
    topicTree?: Record<string, string[]>;
    questionTypes?: string[];
    branches?: string[];
    customFields?: { name: string; type: 'text' | 'select' | 'checkbox'; options?: string[] }[];
    quickFilters?: string[];
}

export const subjectConfigs: Record<string, SubjectConfig> = {
    'Current Affairs': {
        hasDatePicker: true,
        hasTimePicker: true,
        topicCategories: [
            "Daily News Recap",
            "Who, What, Where?",
            "Modi Cabinet 3.0",
            "State Capitals, Governors, and Chief Ministers",
            "High Courts of India",
            "Countries of the World: Who, What, Where?",
            "First in India and World: 2023-25",
            "Major Memorandums of Understanding (MoU): 2024-25",
            "Major Mobile Apps and Portals: 2024-25",
            "Brand Ambassadors (Campaigns and Organizations)",
            "Bharat Ratna: 2024",
            "Joint Military Exercises: 2024-25",
            "Lok Sabha Elections 2024",
            "International Organizations: At a Glance",
            "Major International Summits: 2024-25",
            "Major National Summits: 2024-25",
            "Major Operations of Year 2023-25",
            "Major Reports of Government of India",
            "Various Indices/Reports: 2024-25",
            "Economic Survey: 2024-25",
            "Union Budget: 2025-26",
            "Central Government Schemes: 2014-24",
            "State Government Schemes: 2023-24",
            "Economic Scenario",
            "Science and Technology",
            "Defense and Security",
            "Space Technology",
            "Environment and Ecology",
            "National Sports Awards: 2024",
            "Awards, Medals, and Honors",
            "Sports Scenario",
            "Latest Books and Authors",
            "Important Days",
            "Important Days and Their Themes",
            "Important Summits and Ceremonies",
            "Latest Abbreviations",
            "Miscellaneous Current Affairs"
        ],
        quickFilters: ['Today', 'Yesterday', 'This Week', 'This Month', 'Custom Date'],
        customFields: [
            { name: 'Event Type', type: 'select', options: ['Political', 'Economic', 'Sports', 'Awards', 'Summit', 'Scheme', 'Other'] },
            { name: 'Importance', type: 'select', options: ['High', 'Medium', 'Low'] }
        ]
    },

    'Mathematics': {
        hasTopicTree: true,
        hasFormulaSelector: true,
        hasDiagramOption: true,
        topicTree: {
            'Algebra': [
                'Linear Equations',
                'Quadratic Equations',
                'Polynomials',
                'Complex Numbers',
                'Sequences and Series',
                'Binomial Theorem'
            ],
            'Geometry': [
                'Triangles',
                'Circles',
                'Coordinate Geometry',
                'Mensuration',
                'Vectors',
                '3D Geometry'
            ],
            'Calculus': [
                'Limits',
                'Differentiation',
                'Integration',
                'Applications of Derivatives',
                'Differential Equations'
            ],
            'Trigonometry': [
                'Trigonometric Ratios',
                'Identities',
                'Equations',
                'Inverse Functions',
                'Heights and Distances'
            ],
            'Statistics & Probability': [
                'Mean, Median, Mode',
                'Standard Deviation',
                'Probability',
                'Distributions',
                'Correlation'
            ],
            'Number Theory': [
                'Divisibility',
                'Prime Numbers',
                'LCM & HCF',
                'Modular Arithmetic',
                'Number Systems'
            ]
        },
        customFields: [
            { name: 'Requires Diagram', type: 'checkbox' },
            { name: 'Formula Heavy', type: 'checkbox' },
            { name: 'Calculation Type', type: 'select', options: ['Mental', 'Basic', 'Advanced', 'Calculator'] }
        ]
    },

    'Science': {
        hasExperimentSelector: true,
        branches: ['Physics', 'Chemistry', 'Biology'],
        questionTypes: ['Theory', 'Numerical', 'Practical', 'Diagram-Based', 'Experiment'],
        topicTree: {
            'Physics': [
                'Mechanics',
                'Thermodynamics',
                'Optics',
                'Electricity & Magnetism',
                'Modern Physics',
                'Waves & Sound'
            ],
            'Chemistry': [
                'Organic Chemistry',
                'Inorganic Chemistry',
                'Physical Chemistry',
                'Chemical Reactions',
                'Periodic Table',
                'Environmental Chemistry'
            ],
            'Biology': [
                'Cell Biology',
                'Genetics',
                'Evolution',
                'Ecology',
                'Human Physiology',
                'Plant Science'
            ]
        },
        customFields: [
            { name: 'Branch', type: 'select', options: ['Physics', 'Chemistry', 'Biology'] },
            { name: 'Question Type', type: 'select', options: ['Theory', 'Numerical', 'Practical', 'Diagram-Based'] }
        ]
    },

    'Reasoning': {
        hasTopicTree: true,
        topicTree: {
            'Verbal Reasoning': [
                'Analogies',
                'Classification',
                'Series',
                'Coding-Decoding',
                'Blood Relations',
                'Direction Sense',
                'Syllogism',
                'Statement & Conclusion'
            ],
            'Non-Verbal Reasoning': [
                'Pattern Recognition',
                'Figure Series',
                'Mirror Images',
                'Paper Folding',
                'Cube & Dice',
                'Embedded Figures'
            ],
            'Analytical Reasoning': [
                'Puzzles',
                'Seating Arrangement',
                'Data Sufficiency',
                'Logical Deduction'
            ]
        },
        customFields: [
            { name: 'Reasoning Type', type: 'select', options: ['Verbal', 'Non-Verbal', 'Analytical'] }
        ]
    },

    'History': {
        hasTopicTree: true,
        topicTree: {
            'Ancient India': [
                'Indus Valley Civilization',
                'Vedic Period',
                'Mauryan Empire',
                'Gupta Empire'
            ],
            'Medieval India': [
                'Delhi Sultanate',
                'Mughal Empire',
                'Vijayanagara Empire',
                'Maratha Empire'
            ],
            'Modern India': [
                'British Rule',
                'Freedom Struggle',
                'Independence Movement',
                'Post-Independence India'
            ],
            'World History': [
                'World Wars',
                'Renaissance',
                'Industrial Revolution',
                'Cold War'
            ]
        },
        customFields: [
            { name: 'Era', type: 'select', options: ['Ancient', 'Medieval', 'Modern', 'Contemporary'] }
        ]
    },

    'Geography': {
        hasTopicTree: true,
        hasDiagramOption: true,
        topicTree: {
            'Physical Geography': [
                'Earth Structure',
                'Landforms',
                'Climate',
                'Natural Resources',
                'Disasters'
            ],
            'Human Geography': [
                'Population',
                'Migration',
                'Settlements',
                'Agriculture',
                'Industries'
            ],
            'Indian Geography': [
                'Physical Features',
                'Rivers & Lakes',
                'Climate Zones',
                'Natural Resources',
                'States & Capitals'
            ],
            'World Geography': [
                'Continents',
                'Countries',
                'Oceans',
                'Major Rivers',
                'Climate Zones'
            ]
        },
        customFields: [
            { name: 'Map Required', type: 'checkbox' },
            { name: 'Focus Area', type: 'select', options: ['Physical', 'Human', 'Indian', 'World'] }
        ]
    },

    'English': {
        hasTopicTree: true,
        topicTree: {
            'Grammar': [
                'Tenses',
                'Articles',
                'Prepositions',
                'Voice',
                'Narration',
                'Subject-Verb Agreement'
            ],
            'Vocabulary': [
                'Synonyms & Antonyms',
                'One Word Substitution',
                'Idioms & Phrases',
                'Spelling',
                'Word Formation'
            ],
            'Comprehension': [
                'Reading Comprehension',
                'Cloze Test',
                'Para Jumbles',
                'Error Spotting'
            ],
            'Writing': [
                'Essay Writing',
                'Letter Writing',
                'Precis Writing'
            ]
        },
        customFields: [
            { name: 'Skill Type', type: 'select', options: ['Grammar', 'Vocabulary', 'Comprehension', 'Writing'] }
        ]
    },

    'General Knowledge': {
        hasTopicTree: true,
        topicTree: {
            'India': [
                'Geography',
                'History',
                'Polity',
                'Economy',
                'Culture'
            ],
            'World': [
                'Countries & Capitals',
                'International Organizations',
                'World Geography',
                'World History'
            ],
            'Science & Technology': [
                'Inventions',
                'Discoveries',
                'Space Technology',
                'IT & Computers'
            ],
            'Sports': [
                'Olympics',
                'Cricket',
                'Football',
                'Other Sports'
            ]
        }
    }
};

export const getSubjectConfig = (subject: string): SubjectConfig => {
    return subjectConfigs[subject] || {};
};
