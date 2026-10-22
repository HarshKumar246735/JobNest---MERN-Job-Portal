// Sample/demo data definitions. All companies are FICTIONAL demo employers (never marked verified automatically).
module.exports.categories = [
  ['Software Development', ['Software Engineer', 'Python Developer', 'Java Developer', 'QA Automation Engineer', 'Mobile Application Developer'], ['Python', 'Java', 'Git', 'SQL', 'OOP'], 5],
  ['Frontend Development', ['React Developer', 'Frontend Engineer', 'Angular Developer', 'Vue.js Developer', 'Web Accessibility Engineer'], ['JavaScript', 'React', 'CSS', 'HTML', 'TypeScript'], 5],
  ['Backend Development', ['Node.js Developer', 'API Engineer', 'Golang Developer', 'Django Developer', 'Spring Boot Developer'], ['Node.js', 'REST', 'MongoDB', 'PostgreSQL', 'Docker'], 6],
  ['Full-Stack Development', ['MERN Stack Developer', 'Full-Stack Engineer', 'Next.js Developer', 'Laravel Full-Stack Developer', 'Product Engineer'], ['React', 'Node.js', 'MongoDB', 'Express', 'REST'], 6],
  ['Data Analytics', ['Data Analyst', 'Business Intelligence Analyst', 'Power BI Developer', 'SQL Analyst', 'Marketing Data Analyst'], ['SQL', 'Excel', 'Power BI', 'Tableau', 'Statistics'], 5],
  ['Data Science and AI', ['Data Scientist', 'Machine Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer', 'AI Research Associate'], ['Python', 'TensorFlow', 'Pandas', 'Machine Learning', 'Statistics'], 8],
  ['Cybersecurity', ['Security Analyst', 'SOC Analyst', 'Penetration Tester', 'GRC Analyst', 'Application Security Engineer'], ['Network Security', 'SIEM', 'Linux', 'OWASP', 'Incident Response'], 7],
  ['Cloud Computing and DevOps', ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'Kubernetes Administrator', 'Release Engineer'], ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'], 8],
  ['UI/UX Design', ['UI Designer', 'UX Researcher', 'Product Designer', 'Interaction Designer', 'Design Systems Designer'], ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'], 5],
  ['Digital Marketing', ['SEO Specialist', 'Performance Marketing Executive', 'Content Marketing Executive', 'Social Media Manager', 'Email Marketing Specialist'], ['SEO', 'Google Ads', 'Analytics', 'Copywriting', 'Social Media'], 4],
  ['Sales and Business Development', ['Business Development Executive', 'Inside Sales Representative', 'Account Executive', 'Sales Operations Analyst', 'Key Account Manager'], ['CRM', 'Negotiation', 'Lead Generation', 'Communication', 'Salesforce'], 4],
  ['Human Resources', ['HR Executive', 'Talent Acquisition Specialist', 'HR Generalist', 'Payroll Executive', 'Learning and Development Coordinator'], ['Recruitment', 'Onboarding', 'HRIS', 'Communication', 'Labour Law'], 4],
  ['Finance and Accounting', ['Accountant', 'Financial Analyst', 'Accounts Payable Executive', 'Internal Auditor', 'Tax Associate'], ['Tally', 'Excel', 'GST', 'Financial Reporting', 'Reconciliation'], 5],
  ['Customer Support', ['Customer Support Executive', 'Technical Support Specialist', 'Chat Support Associate', 'Customer Success Associate', 'Escalation Specialist'], ['Communication', 'Ticketing Tools', 'Problem Solving', 'CRM', 'Empathy'], 3],
  ['Operations and Management', ['Operations Executive', 'Project Coordinator', 'Supply Chain Analyst', 'Program Manager', 'Process Improvement Analyst'], ['Planning', 'MS Excel', 'Vendor Management', 'Reporting', 'Agile'], 5],
];
module.exports.levels = [
  { prefix: 'Intern -', exp: 'Internship', type: 'Internship', yrs: 0, mult: 0.25, edu: 'Pursuing Bachelor\'s degree' },
  { prefix: 'Junior', exp: 'Fresher', type: 'Full-time', yrs: 0, mult: 0.7, edu: 'Bachelor\'s degree' },
  { prefix: 'Associate', exp: 'Mid-level', type: 'Full-time', yrs: 3, mult: 1.4, edu: 'Bachelor\'s degree' },
  { prefix: 'Senior', exp: 'Senior-level', type: 'Full-time', yrs: 6, mult: 2.4, edu: 'Bachelor\'s or Master\'s degree' },
];
module.exports.companies = ['Nimbus Labs', 'Orbit Systems', 'BlueLeaf Technologies', 'Quanta Works', 'Pixelwave Studio', 'Cobalt Analytics', 'Zenith Software', 'Harbor Finance', 'Lumen Retail', 'Vertex Cloud', 'Ironclad Security', 'Aster Health Tech', 'Kinetic Logistics', 'Mosaic Media', 'Northstar Consulting', 'Pinecone Apps', 'Redwood Payments', 'Sapphire Edu', 'Tidal Networks', 'Umbra Games', 'Vantage Insurance', 'Willow Foods Tech', 'Xenon Robotics', 'Yarrow Travel', 'Zephyr Telecom', 'Atlas Manufacturing', 'Beacon HR Services', 'Crescent Energy', 'Delta Commerce', 'Ember Design Co', 'Falcon Aviation Tech', 'Granite Realty Tech'];
module.exports.cities = [['Delhi', 'Delhi'], ['Gurugram', 'Haryana'], ['Noida', 'Uttar Pradesh'], ['Bengaluru', 'Karnataka'], ['Hyderabad', 'Telangana'], ['Pune', 'Maharashtra'], ['Mumbai', 'Maharashtra'], ['Chennai', 'Tamil Nadu'], ['Kolkata', 'West Bengal'], ['Ahmedabad', 'Gujarat']];
