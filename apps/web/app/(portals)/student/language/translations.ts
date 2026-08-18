export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu';

export const LANGUAGES: { code: LanguageCode; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
];

type NestedTranslation = { [key: string]: string | NestedTranslation };

const en: Record<string, string | NestedTranslation> = {
  app: {
    name: 'Prasunet',
    portal: 'Student Portal',
    login: 'Login',
    logout: 'Logout',
    logoutSuccess: 'Logged out successfully',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    submit: 'Submit',
    cancel: 'Cancel',
    send: 'Send',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    print: 'Print',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    noData: 'No data available.',
    welcome: 'Welcome back',
    hello: 'Hello',
    settings: 'Settings',
    help: 'Help',
    profile: 'Profile',
  },
  login: {
    title: 'Student Login',
    email: 'Email Address',
    password: 'Password',
    placeholder: {
      email: 'Enter your email',
      password: 'Enter your password',
      emailDemo: 'your.email@school.com',
    },
    button: 'Sign In',
    buttonLoading: 'Logging in...',
    submitButton: 'Login to Dashboard',
    description: 'Access your academic dashboard and track your progress',
    footer: 'Need help? Contact your school administration.',
    error: {
      empty: 'Please enter both email and password',
      failed: 'Login failed',
      connection: 'Connection error. Please try again.',
    },
    success: 'Login successful!',
  },
  tabs: {
    dashboard: 'Dashboard',
    academics: 'Academics',
    messages: 'Messages',
    attendance: 'Attendance',
    schedule: 'Schedule',
    library: 'Library',
    exams: 'Exams',
    finance: 'Finance',
    teachers: 'Teachers',
    events: 'Events',
    support: 'Support',
    health: 'Health',
  },
  dashboard: {
    welcome: 'Stay on top of your academics with Prasunet\'s student dashboard.',
    currentClass: 'Current Class',
    section: 'Section',
    teachers: 'Teachers',
    attendance: 'Attendance',
    academicProfile: 'Academic Profile',
    fullName: 'Full Name',
    rollNumber: 'Roll Number',
    class: 'Class',
    quickActions: 'Quick Actions',
    viewAssignments: 'View Assignments',
    checkSchedule: 'Check Schedule',
    viewGrades: 'View Grades',
  },
  teachers: {
    title: 'Your Teachers',
    role: 'Teacher',
    multipleSubjects: 'Multiple subjects',
    sendMessage: 'Send Message',
    noTeachers: 'No teachers assigned yet.',
    selectChat: 'Select a teacher to start messaging.',
  },
  messages: {
    title: 'Messages',
    teachers: 'Teachers',
    conversation: 'Conversation',
    noTeachers: 'No teachers available for chat.',
    startConversation: 'Start the conversation with your teacher.',
    placeholders: 'Type your message...',
    send: 'Send Message',
    selectTeacher: 'Select a teacher to start messaging.',
  },
  academics: {
    title: 'Academic Information',
    subjects: 'Subjects',
    averageScore: 'Average Score',
    currentGrade: 'Current Grade',
    assignments: 'Assignments',
  },
  attendance: {
    title: 'Attendance',
    overall: 'Overall Attendance',
    present: 'Present',
    absent: 'Absent',
    leave: 'Leave',
  },
  schedule: {
    title: 'Class Schedule',
    noSchedule: 'No timetable available yet.',
    classDay: 'Class Day',
    subject: 'Subject',
    teacher: 'Teacher',
  },
  library: {
    title: 'E-Library and Documents',
    resources: 'E-Library Resources',
    certificates: 'Certificates',
    noFiles: 'No library files available yet.',
    noCertificates: 'No certificates available yet.',
    uploaded: 'Uploaded recently',
    issued: 'Issued',
  },
  exams: {
    title: 'Exams and Results',
    upcoming: 'Upcoming Exams',
    details: 'Exam Details',
    noExams: 'No exams scheduled yet.',
    attempt: 'Attempt Exam',
    status: {
      draft: 'Draft',
      active: 'Active',
      completed: 'Completed',
    },
    submitted: 'Exam submitted successfully.',
    marksObtained: 'Marks obtained',
    question: 'Question',
    submitExam: 'Submit Exam',
    submitting: 'Submitting...',
    description: 'Complete the questions and submit your exam to get instant grading.',
  },
  finance: {
    title: 'Fee & Finance',
    feeDetails: 'Fee Details',
    amount: 'Amount',
    placeholder: 'Amount',
    status: 'Status',
    dueDate: 'Due Date',
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
    payNow: 'Pay Now',
    selectFee: 'Select a fee to pay',
    payWith: 'Pay with',
    none: 'No fees pending.',
    noFees: 'No fee records available to pay.',
    recordPayment: 'Record Payment',
    processing: 'Processing...',
    paymentSuccess: 'Payment recorded successfully.',
    paymentError: 'Choose a fee record and valid amount to pay.',
  },
  events: {
    title: 'Events, Workshops and Clubs',
    upcoming: 'Upcoming Events',
    clubs: 'Student Clubs',
    noEvents: 'No upcoming events yet.',
    noClubs: 'No club listings available yet.',
    advisor: 'Advisor',
    location: 'Online / Campus',
    careerAlerts: 'Career and Internship Alerts',
  },
  support: {
    title: 'Support and Feedback',
    feedback: 'Course Feedback',
    complaint: 'Complaint',
    submitFeedback: 'Submit Feedback',
    submitComplaint: 'Submit Complaint',
    announcements: 'Announcements',
    noNotices: 'No notices posted yet.',
    noCareer: 'No career sessions scheduled.',
    noInternships: 'No internship alerts available.',
    placeholders: {
      feedback: 'Tell us what you think about your classes or teachers',
      complaint: 'Describe your issue...',
    },
    category: 'Category',
    rating: 'Rating',
    comments: 'Comments',
    sent: 'Your feedback has been submitted.',
    feedbackSent: 'Feedback submitted successfully.',
    feedbackError: 'Please enter feedback before submitting.',
    complaintSent: 'Your complaint has been filed.',
  },
  common: {
    or: 'or',
    and: 'and',
    na: 'N/A',
    all: 'All',
    none: 'None',
    confirm: 'Are you sure?',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
  },
};

const hi: Record<string, string | NestedTranslation> = {
  app: { name: 'प्रसुनेट', portal: 'छात्र पोर्टल', login: 'लॉगिन', logout: 'लॉगआउट', logoutSuccess: 'सफलतापूर्वक लॉगआउट किया', loading: 'लोड हो रहा है...', error: 'त्रुटि', success: 'सफलता', submit: 'जमा करें', cancel: 'रद्द करें', send: 'भेजें', save: 'सहेजें', delete: 'हटाएं', edit: 'संपादित करें', view: 'देखें', search: 'खोजें', filter: 'फ़िल्टर', export: 'निर्यात', print: 'प्रिंट', back: 'वापस', next: 'अगला', previous: 'पिछला', noData: 'कोई डेटा उपलब्ध नहीं।', welcome: 'आपका स्वागत है', hello: 'नमस्ते', settings: 'सेटिंग्स', help: 'सहायता', profile: 'प्रोफ़ाइल' },
  login: {
    title: 'छात्र लॉगिन', email: 'ईमेल पता', password: 'पासवर्ड',
    placeholder: { email: 'अपना ईमेल दर्ज करें', password: 'अपना पासवर्ड दर्ज करें', emailDemo: 'आपका.ईमेल@स्कूल.कॉम' },
    button: 'साइन इन', buttonLoading: 'लॉगिन हो रहा है...', submitButton: 'डैशबोर्ड पर जाएं',
    description: 'अपने शैक्षणिक डैशबोर्ड तक पहुंचें और अपनी प्रगति को ट्रैक करें',
    footer: 'सहायता चाहिए? अपने स्कूल प्रशासन से संपर्क करें।',
    error: { empty: 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें', failed: 'लॉगिन विफल', connection: 'कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।' },
    success: 'लॉगिन सफल!',
  },
  tabs: { dashboard: 'डैशबोर्ड', academics: 'शैक्षणिक', messages: 'संदेश', attendance: 'उपस्थिति', schedule: 'अनुसूची', library: 'पुस्तकालय', exams: 'परीक्षाएं', finance: 'वित्त', teachers: 'शिक्षक', events: 'कार्यक्रम', support: 'सहायता', health: 'स्वास्थ्य' },
  dashboard: {
    welcome: 'प्रसुनेट छात्र डैशबोर्ड के साथ अपनी शैक्षणिक गतिविधियों पर नज़र रखें।',
    currentClass: 'वर्तमान कक्षा', section: 'अनुभाग', teachers: 'शिक्षक', attendance: 'उपस्थिति',
    academicProfile: 'शैक्षणिक प्रोफ़ाइल', fullName: 'पूरा नाम', rollNumber: 'रोल नंबर', class: 'कक्षा',
    quickActions: 'त्वरित कार्रवाइयां', viewAssignments: 'असाइनमेंट देखें', checkSchedule: 'अनुसूची देखें', viewGrades: 'ग्रेड देखें',
  },
  teachers: { title: 'आपके शिक्षक', role: 'शिक्षक', multipleSubjects: 'कई विषय', sendMessage: 'संदेश भेजें', noTeachers: 'अभी तक कोई शिक्षक नियुक्त नहीं।', selectChat: 'बातचीत शुरू करने के लिए एक शिक्षक चुनें।' },
  messages: { title: 'संदेश', teachers: 'शिक्षक', conversation: 'बातचीत', noTeachers: 'चैट के लिए कोई शिक्षक उपलब्ध नहीं।', startConversation: 'अपने शिक्षक के साथ बातचीत शुरू करें।', placeholders: 'अपना संदेश लिखें...', send: 'संदेश भेजें', selectTeacher: 'मैसेज करने के लिए एक शिक्षक चुनें।' },
  academics: { title: 'शैक्षणिक जानकारी', subjects: 'विषय', averageScore: 'औसत स्कोर', currentGrade: 'वर्तमान ग्रेड', assignments: 'असाइनमेंट' },
  attendance: { title: 'उपस्थिति', overall: 'कुल उपस्थिति', present: 'उपस्थित', absent: 'अनुपस्थित', leave: 'छुट्टी' },
  schedule: { title: 'कक्षा अनुसूची', noSchedule: 'अभी तक कोई समय सारिणी उपलब्ध नहीं।', classDay: 'कक्षा का दिन', subject: 'विषय', teacher: 'शिक्षक' },
  library: { title: 'ई-पुस्तकालय और दस्तावेज़', resources: 'ई-पुस्तकालय संसाधन', certificates: 'प्रमाणपत्र', noFiles: 'अभी तक कोई पुस्तकालय फ़ाइल उपलब्ध नहीं।', noCertificates: 'अभी तक कोई प्रमाणपत्र उपलब्ध नहीं।', uploaded: 'हाल ही में अपलोड किया गया', issued: 'जारी किया गया' },
  exams: { title: 'परीक्षाएं और परिणाम', upcoming: 'आगामी परीक्षाएं', details: 'परीक्षा विवरण', noExams: 'अभी तक कोई परीक्षा निर्धारित नहीं।', attempt: 'परीक्षा दें', status: { draft: 'ड्राफ्ट', active: 'सक्रिय', completed: 'पूर्ण' }, submitted: 'परीक्षा सफलतापूर्वक जमा की गई।', marksObtained: 'प्राप्त अंक', question: 'प्रश्न', submitExam: 'परीक्षा जमा करें', submitting: 'जमा किया जा रहा है...', description: 'प्रश्नों को पूरा करें और तत्काल ग्रेडिंग के लिए अपनी परीक्षा जमा करें।' },
  finance: { title: 'शुल्क और वित्त', feeDetails: 'शुल्क विवरण', amount: 'राशि', placeholder: 'राशि', status: 'स्थिति', dueDate: 'नियत तिथि', paid: 'भुगतान किया', pending: 'लंबित', overdue: 'अतिदेय', payNow: 'अभी भुगतान करें', selectFee: 'भुगतान करने के लिए एक शुल्क चुनें', payWith: 'भुगतान विधि', none: 'कोई शुल्क लंबित नहीं।', noFees: 'भुगतान के लिए कोई शुल्क रिकॉर्ड उपलब्ध नहीं।', recordPayment: 'भुगतान रिकॉर्ड करें', processing: 'प्रक्रिया चल रही है...', paymentSuccess: 'भुगतान सफलतापूर्वक रिकॉर्ड किया गया।', paymentError: 'एक शुल्क रिकॉर्ड और वैध राशि चुनें।' },
  events: { title: 'कार्यक्रम, कार्यशालाएं और क्लब', upcoming: 'आगामी कार्यक्रम', clubs: 'छात्र क्लब', noEvents: 'अभी तक कोई आगामी कार्यक्रम नहीं।', noClubs: 'अभी तक कोई क्लब सूची उपलब्ध नहीं।', advisor: 'सलाहकार', location: 'ऑनलाइन / कैंपस', careerAlerts: 'करियर और इंटर्नशिप अलर्ट' },
  support: { title: 'सहायता और प्रतिक्रिया', feedback: 'पाठ्यक्रम प्रतिक्रिया', complaint: 'शिकायत', submitFeedback: 'प्रतिक्रिया जमा करें', submitComplaint: 'शिकायत जमा करें', announcements: 'घोषणाएं', noNotices: 'अभी तक कोई सूचना पोस्ट नहीं की गई।', noCareer: 'कोई करियर सत्र निर्धारित नहीं।', noInternships: 'कोई इंटर्नशिप अलर्ट उपलब्ध नहीं।', placeholders: { feedback: 'हमें बताएं कि आप अपनी कक्षाओं या शिक्षकों के बारे में क्या सोचते हैं', complaint: 'अपनी समस्या का वर्णन करें...' }, category: 'श्रेणी', rating: 'रेटिंग', comments: 'टिप्पणियां', sent: 'आपकी प्रतिक्रिया जमा कर दी गई है।', feedbackSent: 'प्रतिक्रिया सफलतापूर्वक जमा की गई।', feedbackError: 'कृपया जमा करने से पहले प्रतिक्रिया दर्ज करें।', complaintSent: 'आपकी शिकायत दर्ज कर ली गई है।' },
  common: { or: 'या', and: 'और', na: 'उपलब्ध नहीं', all: 'सभी', none: 'कोई नहीं', confirm: 'क्या आपको यकीन है?', yes: 'हाँ', no: 'नहीं', close: 'बंद करें' },
};

const ta: Record<string, string | NestedTranslation> = {
  app: { name: 'பிரசுனெட்', portal: 'மாணவர் போர்டல்', login: 'உள்நுழை', logout: 'வெளியேறு', loading: 'ஏற்றுகிறது...', error: 'பிழை', success: 'வெற்றி', submit: 'சமர்ப்பி', cancel: 'ரத்துசெய்', send: 'அனுப்பு', save: 'சேமி', delete: 'நீக்கு', edit: 'திருத்து', view: 'பார்', search: 'தேடு', filter: 'வடிகட்டு', export: 'ஏற்றுமதி', print: 'அச்சிடு', back: 'பின்', next: 'அடுத்து', previous: 'முந்தைய', noData: 'தரவு எதுவும் இல்லை.', welcome: 'மீண்டும் வரவேற்கிறோம்', hello: 'வணக்கம்', settings: 'அமைப்புகள்', help: 'உதவி', profile: 'சுயவிவரம்' },
  login: {
    title: 'மாணவர் உள்நுழைவு', email: 'மின்னஞ்சல் முகவரி', password: 'கடவுச்சொல்',
    placeholder: { email: 'உங்கள் மின்னஞ்சலை உள்ளிடுக', password: 'உங்கள் கடவுச்சொல்லை உள்ளிடுக' },
    button: 'உள்நுழை', error: { empty: 'மின்னஞ்சல் மற்றும் கடவுச்சொல் இரண்டையும் உள்ளிடவும்', failed: 'உள்நுழைவு தோல்வி', connection: 'இணைப்புப் பிழை. மீண்டும் முயற்சிக்கவும்.' },
    success: 'உள்நுழைவு வெற்றி!',
  },
  tabs: { dashboard: 'டாஷ்போர்டு', academics: 'கல்வி', messages: 'செய்திகள்', attendance: 'வருகை', schedule: 'அட்டவணை', library: 'நூலகம்', exams: 'தேர்வுகள்', finance: 'நிதி', teachers: 'ஆசிரியர்கள்', events: 'நிகழ்வுகள்', support: 'ஆதரவு', health: 'உடல்நலம்' },
  dashboard: {
    welcome: 'பிரசுனெட்டின் மாணவர் டாஷ்போர்டுடன் உங்கள் கல்வியைக் கண்காணிக்கவும்.',
    currentClass: 'தற்போதைய வகுப்பு', section: 'பிரிவு', teachers: 'ஆசிரியர்கள்', attendance: 'வருகை',
    academicProfile: 'கல்வி சுயவிவரம்', fullName: 'முழுப் பெயர்', rollNumber: 'எண்', class: 'வகுப்பு',
    quickActions: 'விரைவு செயல்கள்', viewAssignments: 'பணிகளைப் பார்', checkSchedule: 'அட்டவணையைப் பார்', viewGrades: 'மதிப்பெண்களைப் பார்',
  },
};

const te: Record<string, string | NestedTranslation> = {
  app: { name: 'ప్రసునెట్', portal: 'విద్యార్థి పోర్టల్', login: 'లాగిన్', logout: 'లాగ్అవుట్', loading: 'లోడ్ అవుతోంది...', error: 'లోపం', success: 'విజయం', submit: 'సమర్పించు', cancel: 'రద్దు', send: 'పంపు', save: 'సేవ్', delete: 'తొలగించు', edit: 'సవరించు', view: 'చూడు', search: 'వెతుకు', filter: 'ఫిల్టర్', export: 'ఎగుమతి', print: 'ప్రింట్', back: 'వెనక్కి', next: 'తదుపరి', previous: 'మునుపటి', noData: 'డేటా అందుబాటులో లేదు.', welcome: 'తిరిగి స్వాగతం', hello: 'నమస్కారం', settings: 'సెట్టింగ్స్', help: 'సహాయం', profile: 'ప్రొఫైల్' },
  login: {
    title: 'విద్యార్థి లాగిన్', email: 'ఇమెయిల్ చిరునామా', password: 'పాస్వర్డ్',
    placeholder: { email: 'మీ ఇమెయిల్ నమోదు చేయండి', password: 'మీ పాస్వర్డ్ నమోదు చేయండి' },
    button: 'సైన్ ఇన్', error: { empty: 'దయచేసి ఇమెయిల్ మరియు పాస్వర్డ్ రెండింటినీ నమోదు చేయండి', failed: 'లాగిన్ విఫలమైంది', connection: 'కనెక్షన్ లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.' },
    success: 'లాగిన్ విజయవంతం!',
  },
  tabs: { dashboard: 'డ్యాష్బోర్డ్', academics: 'విద్యా', messages: 'సందేశాలు', attendance: 'హాజరు', schedule: 'షెడ్యూల్', library: 'లైబ్రరీ', exams: 'పరీక్షలు', finance: 'ఫైనాన్స్', teachers: 'ఉపాధ్యాయులు', events: 'ఈవెంట్స్', support: 'సపోర్ట్', health: 'ఆరోగ్యం' },
  dashboard: {
    welcome: 'ప్రసునెట్ విద్యార్థి డ్యాష్బోర్డ్తో మీ అకడమిక్స్ను ట్రాక్ చేయండి.',
    currentClass: 'ప్రస్తుత తరగతి', section: 'సెక్షన్', teachers: 'ఉపాధ్యాయులు', attendance: 'హాజరు',
    academicProfile: 'విద్యా ప్రొఫైల్', fullName: 'పూర్తి పేరు', rollNumber: 'రోల్ నంబర్', class: 'తరగతి',
    quickActions: 'శీఘ్ర చర్యలు', viewAssignments: 'అసైన్మెంట్లు చూడు', checkSchedule: 'షెడ్యూల్ తనిఖీ', viewGrades: 'గ్రేడ్లు చూడు',
  },
};

const bn: Record<string, string | NestedTranslation> = {
  app: { name: 'প্রসুনেট', portal: 'ছাত্র পোর্টাল', login: 'লগইন', logout: 'লগআউট', loading: 'লোড হচ্ছে...', error: 'ত্রুটি', success: 'সফল', submit: 'জমা দিন', cancel: 'বাতিল', send: 'পাঠান', save: 'সংরক্ষণ', delete: 'মুছুন', edit: 'সম্পাদনা', view: 'দেখুন', search: 'অনুসন্ধান', filter: 'ফিল্টার', export: 'রপ্তানি', print: 'প্রিন্ট', back: 'পেছনে', next: 'পরবর্তী', previous: 'পূর্ববর্তী', noData: 'কোনো তথ্য নেই।', welcome: 'আবার স্বাগতম', hello: 'হ্যালো', settings: 'সেটিংস', help: 'সাহায্য', profile: 'প্রোফাইল' },
  login: {
    title: 'ছাত্র লগইন', email: 'ইমেইল ঠিকানা', password: 'পাসওয়ার্ড',
    placeholder: { email: 'আপনার ইমেইল লিখুন', password: 'আপনার পাসওয়ার্ড লিখুন' },
    button: 'সাইন ইন', error: { empty: 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড উভয়ই লিখুন', failed: 'লগইন ব্যর্থ', connection: 'সংযোগ ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।' },
    success: 'লগইন সফল!',
  },
  tabs: { dashboard: 'ড্যাশবোর্ড', academics: 'শিক্ষাগত', messages: 'বার্তা', attendance: 'উপস্থিতি', schedule: 'সময়সূচী', library: 'গ্রন্থাগার', exams: 'পরীক্ষা', finance: 'অর্থ', teachers: 'শিক্ষক', events: 'ইভেন্ট', support: 'সহায়তা', health: 'স্বাস্থ্য' },
  dashboard: {
    welcome: 'প্রসুনেটের ছাত্র ড্যাশবোর্ডের সাথে আপনার শিক্ষাগত অগ্রগতি ট্র্যাক করুন।',
    currentClass: 'বর্তমান শ্রেণী', section: 'শাখা', teachers: 'শিক্ষক', attendance: 'উপস্থিতি',
    academicProfile: 'শিক্ষাগত প্রোফাইল', fullName: 'পুরো নাম', rollNumber: 'রোল নম্বর', class: 'শ্রেণী',
    quickActions: 'দ্রুত কর্ম', viewAssignments: 'অ্যাসাইনমেন্ট দেখুন', checkSchedule: 'সময়সূচী দেখুন', viewGrades: 'গ্রেড দেখুন',
  },
};

const mr: Record<string, string | NestedTranslation> = {
  app: { name: 'प्रसुनेट', portal: 'विद्यार्थी पोर्टल', login: 'लॉगिन', logout: 'लॉगआउट', loading: 'लोड करत आहे...', error: 'त्रुटी', success: 'यश', submit: 'सबमिट करा', cancel: 'रद्द करा', send: 'पाठवा', save: 'जतन करा', delete: 'हटवा', edit: 'संपादित करा', view: 'पहा', search: 'शोधा', filter: 'फिल्टर', export: 'निर्यात', print: 'प्रिंट', back: 'मागे', next: 'पुढे', previous: 'मागील', noData: 'डेटा उपलब्ध नाही.', welcome: 'पुन्हा स्वागत आहे', hello: 'नमस्कार', settings: 'सेटिंग्ज', help: 'मदत', profile: 'प्रोफाइल' },
  login: {
    title: 'विद्यार्थी लॉगिन', email: 'ईमेल पत्ता', password: 'पासवर्ड',
    placeholder: { email: 'तुमचा ईमेल प्रविष्ट करा', password: 'तुमचा पासवर्ड प्रविष्ट करा' },
    button: 'साइन इन', error: { empty: 'कृपया ईमेल आणि पासवर्ड दोन्ही प्रविष्ट करा', failed: 'लॉगिन अयशस्वी', connection: 'कनेक्शन त्रुटी. कृपया पुन्हा प्रयत्न करा.' },
    success: 'लॉगिन यशस्वी!',
  },
  tabs: { dashboard: 'डॅशबोर्ड', academics: 'शैक्षणिक', messages: 'संदेश', attendance: 'उपस्थिती', schedule: 'वेळापत्रक', library: 'ग्रंथालय', exams: 'परीक्षा', finance: 'वित्त', teachers: 'शिक्षक', events: 'कार्यक्रम', support: 'मदत', health: 'आरोग्य' },
  dashboard: {
    welcome: 'प्रसुनेटच्या विद्यार्थी डॅशबोर्डसह तुमच्या शैक्षणिक गोष्टींवर लक्ष ठेवा.',
    currentClass: 'सध्याचा वर्ग', section: 'विभाग', teachers: 'शिक्षक', attendance: 'उपस्थिती',
    academicProfile: 'शैक्षणिक प्रोफाइल', fullName: 'पूर्ण नाव', rollNumber: 'रोल क्रमांक', class: 'वर्ग',
    quickActions: 'त्वरित क्रिया', viewAssignments: 'असाइनमेंट पहा', checkSchedule: 'वेळापत्रक पहा', viewGrades: 'ग्रेड पहा',
  },
};

const gu: Record<string, string | NestedTranslation> = {
  app: { name: 'પ્રસુનેટ', portal: 'વિદ્યાર્થી પોર્ટલ', login: 'લૉગિન', logout: 'લૉગઆઉટ', loading: 'લોડ થાય છે...', error: 'ભૂલ', success: 'સફળતા', submit: 'સબમિટ કરો', cancel: 'રદ કરો', send: 'મોકલો', save: 'સાચવો', delete: 'કાઢી નાખો', edit: 'સંપાદિત કરો', view: 'જુઓ', search: 'શોધો', filter: 'ફિલ્ટર', export: 'નિકાસ', print: 'પ્રિન્ટ', back: 'પાછળ', next: 'આગળ', previous: 'પાછલું', noData: 'કોઈ ડેટા ઉપલબ્ધ નથી.', welcome: 'ફરીથી સ્વાગત છે', hello: 'નમસ્તે', settings: 'સેટિંગ્સ', help: 'મદદ', profile: 'પ્રોફાઇલ' },
  login: {
    title: 'વિદ્યાર્થી લૉગિન', email: 'ઇમેઇલ સરનામું', password: 'પાસવર્ડ',
    placeholder: { email: 'તમારો ઇમેઇલ દાખલ કરો', password: 'તમારો પાસવર્ડ દાખલ કરો' },
    button: 'સાઇન ઇન', error: { empty: 'કૃપા કરીને ઇમેઇલ અને પાસવર્ડ બંને દાખલ કરો', failed: 'લૉગિન નિષ્ફળ', connection: 'કનેક્શન ભૂલ. કૃપા કરીને ફરી પ્રયાસ કરો.' },
    success: 'લૉગિન સફળ!',
  },
  tabs: { dashboard: 'ડેશબોર્ડ', academics: 'શૈક્ષણિક', messages: 'સંદેશાઓ', attendance: 'હાજરી', schedule: 'અનુસૂચિ', library: 'પુસ્તકાલય', exams: 'પરીક્ષાઓ', finance: 'નાણાં', teachers: 'શિક્ષકો', events: 'ઇવેન્ટ્સ', support: 'સહાય', health: 'આરોગ્ય' },
  dashboard: {
    welcome: 'પ્રસુનેટના વિદ્યાર્થી ડેશબોર્ડ સાથે તમારા શૈક્ષણિક પર નજર રાખો.',
    currentClass: 'વર્તમાન વર્ગ', section: 'વિભાગ', teachers: 'શિક્ષકો', attendance: 'હાજરી',
    academicProfile: 'શૈક્ષણિક પ્રોફાઇલ', fullName: 'પૂરું નામ', rollNumber: 'રોલ નંબર', class: 'વર્ગ',
    quickActions: 'ઝડપી ક્રિયાઓ', viewAssignments: 'અસાઇનમેન્ટ જુઓ', checkSchedule: 'અનુસૂચિ તપાસો', viewGrades: 'ગ્રેડ જુઓ',
  },
};

export const translations: Record<LanguageCode, Record<string, string | NestedTranslation>> = {
  en, hi, ta, te, bn, mr, gu,
};

export function getNestedValue(obj: Record<string, string | NestedTranslation>, path: string): string {
  const keys = path.split('.');
  let current: any = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}
