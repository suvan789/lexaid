/**
 * LexAid Appium Automation Framework — Test Data Providers
 * =======================================================
 * Structured data providers for 400 Appium E2E Test Cases across 20 Modules.
 */

module.exports = {
  users: {
    validCitizen: { email: 'suvansenthils@gmail.com', password: 'password123', name: 'Suvan Senthil', role: 'client' },
    validAdvocate: { email: 'flowfored@gmail.com', password: 'password123', name: 'Advocate Flowfored', role: 'lawyer' },
    invalidUser: { email: 'invalid.user@nonexistent.com', password: 'WrongPassword99#' },
    newCitizen: { email: 'test.user.mobile@lexaid.org', password: 'TestPassword123!', full_name: 'Test Mobile User', phone: '+919876543210' }
  },

  documents: {
    rentalAgreement: { filename: 'Rental_Agreement_Sample.pdf', clause: 'Termination notice 15 days', risk: 'LOW' },
    employmentContract: { filename: 'Employment_Contract.pdf', clause: 'Non-compete 2 years', risk: 'HIGH' }
  },

  aiChatQueries: [
    { query: 'my bike crashed by government bus what to do', expectedAct: 'Motor Vehicles Act, 1988' },
    { query: 'tenant not paying rent what to do', expectedAct: 'Transfer of Property Act, 1882' },
    { query: 'my boss is not giving my salary', expectedAct: 'Payment of Wages Act, 1936' },
    { query: 'cheque bounced in bank what legal section', expectedAct: 'Negotiable Instruments Act, 1881' },
    { query: 'explain section 302', expectedAct: 'Indian Penal Code Section 302' },
    { query: 'what are my fundamental rights in india', expectedAct: 'Article 21' }
  ],

  caseAssessorFacts: {
    strongCase: 'Petitioner accused under IPC Section 420 for cheating. First time offender, fully cooperating with investigation, all money returned to complainant.',
    weakCase: 'Repeat offender habitual fraud accused under Section 302 with direct eyewitness recovery of weapon.'
  },

  appointmentData: {
    lawyerName: 'Advocate Suvan Senthil',
    date: '2026-08-15',
    time: '11:00 AM',
    notes: 'Legal consultation regarding commercial rent agreement dispute.'
  },

  forumPostData: {
    title: 'How to contest illegal eviction notice from landlord in Tamil Nadu?',
    category: 'Tenancy & Rent Law',
    content: 'My landlord issued a 3-day eviction notice demanding double rent. Is this legal under Rent Control Act?'
  }
};
