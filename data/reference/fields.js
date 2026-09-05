/**
 * Fields of study.
 * `id` is what university records reference in their `fields` / `strongFields`.
 * Adding a field: append here, then use the id in university records.
 */
export const fields = [
  { id: 'computer-science', name: 'Computer Science & AI', icon: '💻',
    blurb: 'Software, algorithms, machine learning, data and security.',
    subjects: ['Mathematics', 'Computer Science', 'Physics'],
    careers: ['Software engineer', 'ML engineer', 'Data scientist', 'Security analyst'] },

  { id: 'engineering', name: 'Engineering', icon: '⚙️',
    blurb: 'Mechanical, electrical, civil, aerospace and chemical engineering.',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    careers: ['Design engineer', 'Systems engineer', 'Project engineer'] },

  { id: 'business', name: 'Business & Economics', icon: '📈',
    blurb: 'Management, finance, accounting, marketing and economic theory.',
    subjects: ['Mathematics', 'Economics', 'Business Studies'],
    careers: ['Analyst', 'Consultant', 'Product manager', 'Founder'] },

  { id: 'medicine', name: 'Medicine & Health', icon: '🩺',
    blurb: 'Medicine, dentistry, pharmacy, nursing and public health.',
    subjects: ['Biology', 'Chemistry', 'Mathematics'],
    careers: ['Doctor', 'Dentist', 'Pharmacist', 'Public-health specialist'] },

  { id: 'life-sciences', name: 'Life Sciences', icon: '🧬',
    blurb: 'Biology, biochemistry, neuroscience, genetics and biotechnology.',
    subjects: ['Biology', 'Chemistry', 'Mathematics'],
    careers: ['Research scientist', 'Biotech associate', 'Lab lead'] },

  { id: 'physical-sciences', name: 'Physics & Chemistry', icon: '🔭',
    blurb: 'Physics, chemistry, materials and earth sciences.',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    careers: ['Research physicist', 'Materials scientist', 'Quant'] },

  { id: 'mathematics', name: 'Mathematics & Statistics', icon: '📐',
    blurb: 'Pure and applied mathematics, statistics and actuarial science.',
    subjects: ['Mathematics', 'Further Mathematics'],
    careers: ['Quant analyst', 'Actuary', 'Statistician', 'Cryptographer'] },

  { id: 'law', name: 'Law', icon: '⚖️',
    blurb: 'Legal systems, international, corporate and human-rights law.',
    subjects: ['History', 'English', 'Politics'],
    careers: ['Solicitor', 'Barrister', 'Legal counsel', 'Policy adviser'] },

  { id: 'social-sciences', name: 'Social & Political Sciences', icon: '🏛️',
    blurb: 'Politics, international relations, sociology and anthropology.',
    subjects: ['History', 'Politics', 'Economics'],
    careers: ['Diplomat', 'Policy analyst', 'NGO programme lead'] },

  { id: 'psychology', name: 'Psychology', icon: '🧠',
    blurb: 'Cognitive, clinical, developmental and behavioural science.',
    subjects: ['Biology', 'Mathematics', 'Psychology'],
    careers: ['Clinical psychologist', 'UX researcher', 'Therapist'] },

  { id: 'humanities', name: 'Humanities & History', icon: '📚',
    blurb: 'History, philosophy, literature, languages and classics.',
    subjects: ['History', 'English Literature', 'Languages'],
    careers: ['Editor', 'Curator', 'Researcher', 'Journalist'] },

  { id: 'arts', name: 'Art & Design', icon: '🎨',
    blurb: 'Fine art, graphic and industrial design, fashion and film.',
    subjects: ['Art', 'Design Technology'],
    careers: ['Designer', 'Art director', 'Illustrator', 'Animator'] },

  { id: 'architecture', name: 'Architecture', icon: '🏗️',
    blurb: 'Architectural design, urban planning and the built environment.',
    subjects: ['Mathematics', 'Physics', 'Art'],
    careers: ['Architect', 'Urban planner', 'Landscape architect'] },

  { id: 'media', name: 'Media & Communication', icon: '🎬',
    blurb: 'Journalism, film, advertising and digital communication.',
    subjects: ['English', 'Media Studies', 'Languages'],
    careers: ['Journalist', 'Producer', 'Communications lead'] },

  { id: 'education', name: 'Education', icon: '🎓',
    blurb: 'Teaching, pedagogy, curriculum design and education policy.',
    subjects: ['Any teaching subject', 'Psychology'],
    careers: ['Teacher', 'Curriculum designer', 'Education researcher'] },

  { id: 'environment', name: 'Environment & Sustainability', icon: '🌍',
    blurb: 'Climate science, ecology, energy systems and sustainable policy.',
    subjects: ['Biology', 'Geography', 'Chemistry'],
    careers: ['Climate analyst', 'Sustainability lead', 'Ecologist'] }
];

export const fieldById = Object.fromEntries(fields.map(f => [f.id, f]));
