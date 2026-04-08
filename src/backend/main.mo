import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type ContactSubmission = {
    fullName : Text;
    phoneNumber : Text;
    email : Text;
    countryOfInterest : Text;
    message : Text;
    timestamp : Time.Time;
  };

  type BlogPost = {
    id : Nat;
    title : Text;
    summary : Text;
    content : Text;
    author : Text;
    publishedDate : Time.Time;
    imageUrl : Text;
    category : Text;
  };

  type Testimonial = {
    clientName : Text;
    quote : Text;
    country : Text;
    photoUrl : Text;
  };

  func compareBlogPost(a : BlogPost, b : BlogPost) : Order.Order {
    Nat.compare(a.id, b.id);
  };

  // Stable storage — persists across upgrades and redeployments
  stable var stableBlogPosts : [BlogPost] = [];
  stable var stableContacts : [ContactSubmission] = [];
  stable var nextBlogPostId : Nat = 1;
  stable var nextContactId : Nat = 1;
  stable var seeded : Bool = false; // retained for upgrade compatibility
  stable var seedVersion : Nat = 0;

  // Working data structures rebuilt from stable storage on startup
  var blogsMap = Map.empty<Nat, BlogPost>();
  var contactsMap = Map.empty<Nat, ContactSubmission>();

  // Rebuild blogs map from stable data
  for (post in stableBlogPosts.vals()) {
    blogsMap.add(post.id, post);
    if (post.id >= nextBlogPostId) {
      nextBlogPostId := post.id + 1;
    };
  };

  // Rebuild contacts map from stable data
  for (contact in stableContacts.vals()) {
    contactsMap.add(nextContactId, contact);
    nextContactId += 1;
  };

  // Seed all 8 blog posts if storage is empty
  if (seedVersion < 1) {
    seedVersion := 1;
    // Reset map for clean re-seed
    blogsMap := Map.empty<Nat, BlogPost>();
    nextBlogPostId := 1;

    let post1 : BlogPost = {
      id = nextBlogPostId;
      title = "Your Ultimate Guide to Studying Abroad in 2026";
      summary = "Planning to study abroad in 2026? Discover the best countries, top universities, scholarship opportunities, and step-by-step application tips to make your dream a reality.";
      content = "# Your Ultimate Guide to Studying Abroad in 2026\n\nStudying abroad is one of the most transformative decisions you can make. Whether you dream of ivy-league halls in the UK, cutting-edge research labs in Germany, or sun-soaked campuses in Australia, 2026 is the perfect year to take that leap.\n\n## Why Study Abroad?\n\nA foreign degree opens doors that a local degree simply cannot. Employers worldwide value the adaptability, language skills, and global perspective that international students bring. Beyond career benefits, you gain lifelong friendships, cultural immersion, and personal growth that money cannot buy.\n\n## Top Countries for International Students in 2026\n\n**United Kingdom** - Home to Oxford, Cambridge, and over 130 universities ranked in the global top 1000. Post-study work visa allows 2 years of work experience after graduation.\n\n**Canada** - Affordable tuition, multicultural cities, and one of the world's most welcoming immigration pathways. The Post-Graduation Work Permit (PGWP) can lead directly to permanent residency.\n\n**Germany** - Free or near-free tuition at public universities, even for international students. Engineering, medicine, and technology programs are world-class.\n\n**Australia** - Top 8 Group of Eight universities, stunning lifestyle, and a straightforward student visa process. Graduate visa allows 2-4 years of work after studies.\n\n**United Arab Emirates** - Emerging education hub with campuses from NYU, Sorbonne, and other global brands. Tax-free salaries after graduation.\n\n## How to Choose the Right University\n\n1. Define your goal - Do you want research, industry connections, or immigration pathways?\n2. Check rankings - QS World Rankings and THE Rankings are reliable guides.\n3. Review entry requirements - Most require IELTS 6.0-7.0 or TOEFL 80-100.\n4. Compare costs - Tuition + living costs vary enormously between countries.\n5. Look for scholarships - Many universities offer merit-based aid to international students.\n\n## Scholarships to Apply For in 2026\n\n- Chevening Scholarships (UK) - Fully funded, for future leaders\n- DAAD Scholarships (Germany) - Research and full degree programs\n- Vanier Canada Graduate Scholarships - For doctoral students\n- Australia Awards - Full scholarships from the Australian government\n- Mastercard Foundation Scholars Program - For African students\n\n## How Modern Education Consult Can Help\n\nNavigating applications, visa requirements, and scholarship deadlines alone is overwhelming. Our team at Modern Education Consult has helped hundreds of students from Rwanda and across Africa secure placements in top universities worldwide.\n\nWe offer free initial consultation, university shortlisting, application and SOP review, visa application support, and pre-departure briefing.\n\nCall us today on +250 798979720 or WhatsApp +250 795780073 to start your journey.";
      author = "Modern Education Consult";
      publishedDate = 1_742_000_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
      category = "Study Abroad";
    };
    blogsMap.add(nextBlogPostId, post1);
    nextBlogPostId += 1;

    let post2 : BlogPost = {
      id = nextBlogPostId;
      title = "International Job Opportunities in 2026: Your Complete Guide to Working Abroad";
      summary = "Discover the top countries hiring international workers in 2026, in-demand sectors, salary guides, and how to land your first job abroad with the right documents and support.";
      content = "# International Job Opportunities in 2026: Your Complete Guide to Working Abroad\n\nThe global job market is booming and borders are more open than ever for skilled workers. If you have been dreaming of building a career abroad, 2026 offers exceptional opportunities across multiple industries and countries.\n\n## Why Work Abroad in 2026?\n\n- Higher salaries - Even entry-level roles in UAE, Canada, or Germany pay 3-5x more than equivalent roles in many African countries\n- Career acceleration - International experience puts your CV in a completely different league\n- Immigration pathways - Many countries offer residency or citizenship after a few years of skilled work\n- Quality of life - Access to world-class healthcare, education, and infrastructure\n\n## Top Countries Hiring International Workers in 2026\n\n### United Arab Emirates\nThe UAE remains one of the most accessible destinations for international workers. Construction, hospitality, logistics, healthcare, and technology sectors are all actively recruiting.\n\nAverage salaries:\n- Construction worker: AED 2,500-5,000/month\n- Nurse/Healthcare: AED 8,000-15,000/month\n- IT Professional: AED 12,000-25,000/month\n\n### Canada\nCanada's Express Entry system is designed to attract skilled workers. The country needs over 400,000 new immigrants per year through 2026 to fill labor shortages.\n\nIn-demand roles: Nurses, engineers, truck drivers, IT specialists, trades workers\n\n### United Kingdom\nThe UK Skilled Worker Visa allows employers to sponsor international candidates. Healthcare (NHS), tech, and finance are top hiring sectors.\n\n### Germany\nGermany faces a shortage of 600,000 skilled workers. The Skilled Immigration Act makes it easier than ever for non-EU nationals to get work visas.\n\n### Qatar\nPost-World Cup infrastructure projects continue. Construction, hospitality, and logistics workers are in high demand.\n\n## Step-by-Step Application Process\n\n1. Assess your qualifications - Get your certificates verified and translated if needed\n2. Research job boards - LinkedIn, Indeed, Bayt (UAE/Gulf), Job Bank (Canada)\n3. Polish your CV - International CVs differ from local ones; our team can help\n4. Get language certified - IELTS or equivalent is required for most English-speaking countries\n5. Secure a job offer - Many employers sponsor visas once they select you\n6. Apply for your work visa - Processing times vary: UAE 2-4 weeks, Canada 3-6 months, UK 3-8 weeks\n\n## How Modern Education Consult Can Help\n\nWe specialize in connecting Rwandan and African professionals with legitimate international job opportunities.\n\nContact us today:\n- Phone: +250 798979720\n- WhatsApp: +250 795780073\n- Email: moderneducationconsult2026@gmail.com\n- Office: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_742_100_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
      category = "International Jobs";
    };
    blogsMap.add(nextBlogPostId, post2);
    nextBlogPostId += 1;

    let post3 : BlogPost = {
      id = nextBlogPostId;
      title = "Working in the UAE: What Rwandan Professionals Need to Know";
      summary = "Thinking about working in the UAE? This guide covers visa requirements, top industries, salary expectations, cultural tips, and how Rwandan professionals can secure legitimate job offers in Dubai and beyond.";
      content = "# Working in the UAE: What Rwandan Professionals Need to Know\n\nThe United Arab Emirates — particularly Dubai and Abu Dhabi — has become one of the most sought-after destinations for Rwandan and East African professionals. Tax-free salaries, world-class infrastructure, and a booming economy make it an attractive option for those ready to work abroad.\n\n## Why the UAE?\n\n- **Zero income tax** — Your full salary is yours to keep\n- **Strong demand for skilled workers** — Construction, hospitality, healthcare, logistics, and IT are all actively hiring\n- **Fast visa processing** — Work visas can be processed in as little as 2-4 weeks\n- **East African community** — A large and welcoming African community already established in the UAE\n- **Gateway to global opportunities** — UAE experience on your CV opens doors worldwide\n\n## Top Industries Hiring in the UAE in 2026\n\n### Construction & Engineering\nMajor infrastructure projects across Dubai, Abu Dhabi, and the Northern Emirates continue to drive demand. Civil engineers, project managers, electricians, plumbers, and general laborers are in high demand.\n\nTypical salary range: AED 1,800 - AED 8,000/month depending on role and experience.\n\n### Hospitality & Tourism\nThe UAE welcomed over 20 million tourists in 2025 and targets more in 2026. Hotels, resorts, restaurants, and airlines hire large numbers of international staff.\n\nTypical salary range: AED 2,000 - AED 6,000/month plus accommodation and meals.\n\n### Healthcare\nNurses, medical assistants, lab technicians, and pharmacists are highly sought after. Many roles come with free housing, flights, and medical insurance.\n\nTypical salary range: AED 5,000 - AED 18,000/month.\n\n### Logistics & Warehousing\nWith Dubai as a global trade hub, logistics companies constantly recruit warehouse staff, drivers, forklift operators, and freight coordinators.\n\nTypical salary range: AED 1,500 - AED 5,000/month.\n\n## How to Apply for a UAE Work Visa\n\n1. **Secure a job offer** — You cannot apply for a UAE work visa without an employer sponsor\n2. **Submit documents** — Passport, academic certificates, police clearance, medical certificate\n3. **Pass medical exam** — Required for all UAE work visas\n4. **Receive your visa** — Employment visa stamped in your passport\n5. **Emirates ID** — Issued on arrival, required for all official transactions\n\n## Important Tips for Rwandan Professionals\n\n- Always use **verified recruitment agencies** — scams targeting Africans are common\n- Ensure your contract is **signed and stamped** before you travel\n- **Never pay for a job** — Legitimate employers do not charge placement fees\n- Learn basic Arabic phrases — it goes a long way in daily life\n- Respect local customs — dress modestly in public spaces\n\n## How Modern Education Consult Can Help\n\nWe connect Rwandan professionals with verified, legitimate employers in the UAE. Our team handles everything from CV preparation and document verification to visa application and pre-departure briefing.\n\nContact us:\n- Phone: +250 798979720\n- WhatsApp: +250 795780073\n- Email: moderneducationconsult2026@gmail.com\n- Offices: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_742_200_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
      category = "International Jobs";
    };
    blogsMap.add(nextBlogPostId, post3);
    nextBlogPostId += 1;

    let post4 : BlogPost = {
      id = nextBlogPostId;
      title = "How to Apply for a Canadian Study Permit in 2026";
      summary = "A step-by-step guide to applying for a Canadian study permit in 2026 — from letter of acceptance to visa approval, including documents needed, fees, processing times, and common mistakes to avoid.";
      content = "# How to Apply for a Canadian Study Permit in 2026\n\nCanada remains one of the top destinations for international students, offering world-class universities, diverse cities, and a clear pathway to permanent residency. But before you can study in Canada, you need a Study Permit. This guide walks you through every step of the process.\n\n## What Is a Canadian Study Permit?\n\nA Study Permit is a document issued by Immigration, Refugees and Citizenship Canada (IRCC) that allows foreign nationals to study at a Designated Learning Institution (DLI) in Canada. Most programs longer than 6 months require a study permit.\n\n## Step-by-Step Application Process\n\n### Step 1: Get Your Letter of Acceptance\nYou must first be accepted by a Designated Learning Institution (DLI). Apply to your chosen university or college and obtain your official acceptance letter before applying for the permit.\n\n### Step 2: Gather Required Documents\n\n- Valid passport (at least 6 months beyond your intended stay)\n- Letter of Acceptance from a DLI\n- Proof of financial support (tuition + CAD 10,000/year for living expenses)\n- Passport-sized photos\n- Statement of Purpose (SOP) — Why you want to study in Canada\n- Academic transcripts and certificates\n- English proficiency test (IELTS 6.0+ or TOEFL 80+)\n- Police clearance certificate\n- Medical exam (if required for your country)\n\n### Step 3: Create an IRCC Online Account\nGo to the official IRCC website (canada.ca) and create your account. All applications are now submitted online.\n\n### Step 4: Complete the Application Form\nFill in the IMM 1294 form (Application for a Study Permit). Be honest and accurate — any inconsistency can lead to rejection.\n\n### Step 5: Pay the Application Fee\nThe study permit application fee is CAD 150 (approximately USD 110). Pay online via credit/debit card.\n\n### Step 6: Submit Biometrics\nFirst-time applicants from Rwanda must provide biometrics (fingerprints and photo) at a Visa Application Centre. The fee is CAD 85.\n\n### Step 7: Attend the Interview (If Required)\nSome applicants are called for an interview at the Canadian High Commission. Be prepared to explain your study plans, funding sources, and ties to Rwanda.\n\n### Step 8: Wait for a Decision\nProcessing times vary. Check the IRCC website for current wait times — typically 4-12 weeks for online applications.\n\n## Common Reasons for Study Permit Rejection\n\n- Insufficient proof of funds\n- Weak Statement of Purpose\n- Lack of ties to home country\n- Incomplete documentation\n- Criminal record or failed medical exam\n\n## Post-Graduation Work Permit (PGWP)\n\nAfter completing your studies, you can apply for a Post-Graduation Work Permit (PGWP) valid for up to 3 years. This can be a stepping stone to Canadian Permanent Residency through Express Entry.\n\n## How Modern Education Consult Can Help\n\nOur team guides you through every step — from choosing the right Canadian university and writing your SOP to preparing your financial documents and submitting your visa application.\n\nContact us today:\n- Phone: +250 798979720\n- WhatsApp: +250 795780073\n- Email: moderneducationconsult2026@gmail.com\n- Offices: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_742_300_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
      category = "Application Guides";
    };
    blogsMap.add(nextBlogPostId, post4);
    nextBlogPostId += 1;

    let post5 : BlogPost = {
      id = nextBlogPostId;
      title = "Top 5 Scholarships for African Students Studying Abroad in 2026";
      summary = "Discover the top 5 fully funded and partial scholarships available to African students in 2026 — including eligibility, application deadlines, and tips on how to win them.";
      content = "# Top 5 Scholarships for African Students Studying Abroad in 2026\n\nFinancing an international education is one of the biggest concerns for African students. The good news is that dozens of prestigious scholarships are specifically designed for African applicants. Here are the top 5 you should be applying for in 2026.\n\n---\n\n## 1. Mastercard Foundation Scholars Program\n\n**Coverage:** Fully funded — tuition, living expenses, flights, health insurance\n**Partner Universities:** University of Toronto, McGill, Edinburgh, UC Berkeley, and more\n**Eligibility:** African students with academic excellence and demonstrated leadership\n**Focus:** Scholars are expected to return and contribute to Africa after graduation\n\n**Tip:** The Mastercard Foundation looks for community leaders, not just academic achievers. Document your community work carefully.\n\n---\n\n## 2. Chevening Scholarships (UK)\n\n**Coverage:** Fully funded — tuition, living allowance, flights, visa fees\n**Country:** United Kingdom\n**Eligibility:** Citizens of eligible countries (Rwanda included) with 2+ years work experience\n**Degree Level:** One-year Master's degree\n\n**Deadline:** Typically November each year for the following academic year.\n\n**Tip:** Chevening values leadership and networking potential. Your essays should show how you plan to use your UK education to lead change back home.\n\n---\n\n## 3. DAAD Scholarships (Germany)\n\n**Coverage:** Monthly stipend, travel allowance, health insurance\n**Country:** Germany\n**Eligibility:** Recent graduates and young professionals from developing countries\n**Programs:** Masters and PhD research programs\n\n**Why Germany:** Public university tuition is free or very low even without the scholarship — the DAAD covers your living costs.\n\n**Tip:** A strong research proposal and connection with a German supervisor significantly increases your chances.\n\n---\n\n## 4. Australia Awards Scholarships\n\n**Coverage:** Fully funded — tuition, living costs, flights, health cover\n**Country:** Australia\n**Eligibility:** Citizens of participating developing countries (Rwanda included)\n**Programs:** Undergraduate and postgraduate degrees\n\n**Deadline:** Typically April-May each year for the following year intake.\n\n**Tip:** Australia Awards favors applicants who work in government, NGOs, or development sectors. Show how your studies will contribute to Rwanda's development.\n\n---\n\n## 5. Erasmus Mundus Joint Masters (EMJM)\n\n**Coverage:** Fully funded — tuition across multiple EU countries, monthly allowance, travel\n**Country:** European Union (you study in 2-3 countries)\n**Eligibility:** Open to all nationalities; highly competitive\n**Programs:** Joint Master's degrees across multiple top EU universities\n\n**Tip:** Erasmus Mundus is extremely competitive. Apply to multiple programs and make your motivation letter exceptional.\n\n---\n\n## General Tips for Scholarship Applications\n\n1. Start early — most deadlines are 6-12 months before the program starts\n2. Get strong academic references — from lecturers who know your work well\n3. Write honest, specific personal statements\n4. Show community impact, not just grades\n5. Apply to multiple scholarships simultaneously\n\n## How Modern Education Consult Can Help\n\nWe help you identify the right scholarships, prepare compelling applications, and submit everything before deadlines.\n\nContact us:\n- Phone: +250 798979720\n- WhatsApp: +250 795780073\n- Email: moderneducationconsult2026@gmail.com\n- Offices: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_742_400_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
      category = "Scholarships";
    };
    blogsMap.add(nextBlogPostId, post5);
    nextBlogPostId += 1;

    let post6 : BlogPost = {
      id = nextBlogPostId;
      title = "New Intake: Online Degree Programs Opening for 2026 Enrollment";
      summary = "Several top universities are opening online degree enrollments for 2026. Here are the best accredited online programs in business, IT, healthcare, and education — with application deadlines and fees.";
      content = "# New Intake: Online Degree Programs Opening for 2026 Enrollment\n\nThe demand for flexible, internationally recognized online degrees has never been higher. In 2026, leading universities across the UK, USA, Canada, and Australia are opening new intake periods for fully online programs that allow African students to earn internationally accredited qualifications without leaving home.\n\n## Why Choose an Online Degree in 2026?\n\n- **Study from anywhere** — No need to relocate or disrupt your career\n- **Internationally recognized** — Same degree as on-campus students\n- **Flexible schedule** — Many programs are part-time friendly\n- **Lower cost** — Online tuition is often 30-50% cheaper than on-campus programs\n- **Career advancement** — A foreign online degree significantly boosts your salary and promotion prospects\n\n## Top Online Programs Opening for 2026 Intake\n\n### Business & Management\n\n**University of London (UK) — Online BSc Business Administration**\n- Duration: 3 years (part-time available)\n- Tuition: approx. USD 7,000/year\n- Entry: A-Levels or equivalent\n- Deadline: Rolling admissions — Apply early for January 2026 intake\n\n**Quantic School of Business & Technology — MBA**\n- Duration: 11 months (accelerated)\n- Tuition: USD 9,600 total (merit scholarships available)\n- Entry: Bachelor's degree + work experience\n- Intake: Multiple cohorts in 2026\n\n### Information Technology & Computer Science\n\n**University of People — BSc Computer Science**\n- Duration: 4 years\n- Tuition: Pay-per-course model; very affordable\n- Entry: High school certificate\n- Intake: Every 2 months\n\n**Georgia Tech (USA) — Online Master of Science in Computer Science (OMSCS)**\n- Duration: 2-3 years\n- Tuition: approx. USD 7,000 total (one of the cheapest accredited MSCS degrees globally)\n- Entry: Bachelor's in CS or related field\n- Deadline: Applications open September-December for January 2026 intake\n\n### Healthcare & Public Health\n\n**Johns Hopkins University — Online Master of Public Health (MPH)**\n- Duration: 2 years part-time\n- Tuition: approx. USD 20,000/year\n- Entry: Bachelor's degree + healthcare/public health background\n- Scholarships: Available for African students\n\n### Education\n\n**University of Edinburgh — Online MSc Education**\n- Duration: 2 years part-time\n- Tuition: approx. GBP 8,000 total\n- Entry: First degree in any subject\n- Intake: September 2026\n\n## How to Choose the Right Online Program\n\n1. Verify accreditation — Check that the university is recognized by your country and international bodies\n2. Review the curriculum — Make sure content is relevant to your career goals\n3. Check technology requirements — Stable internet and a good laptop are essential\n4. Look for student support — Good online programs have active tutors and communities\n5. Calculate the ROI — Will this degree increase your earning potential enough to justify the cost?\n\n## How Modern Education Consult Can Help\n\nWe help you shortlist the right online programs, prepare your application, and access scholarship opportunities.\n\nContact us today:\n- Phone: +250 798979720\n- WhatsApp: +250 795780073\n- Email: moderneducationconsult2026@gmail.com\n- Offices: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_742_500_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
      category = "Online Courses";
    };
    blogsMap.add(nextBlogPostId, post6);
    nextBlogPostId += 1;

    let post7 : BlogPost = {
      id = nextBlogPostId;
      title = "IELTS vs TOEFL: Which English Test Should You Choose?";
      summary = "Choosing between IELTS and TOEFL? This guide compares both tests across format, scoring, cost, university acceptance, and which one is best suited for your study or work abroad goal in 2026.";
      content = "# IELTS vs TOEFL: Which English Test Should You Choose?\n\nIf you are planning to study or work abroad in an English-speaking country, you will almost certainly need to prove your English proficiency. The two most widely accepted tests are IELTS (International English Language Testing System) and TOEFL (Test of English as a Foreign Language). But which one is right for you?\n\n## What Is IELTS?\n\nIELTS is jointly managed by the British Council, IDP: IELTS Australia, and Cambridge Assessment English. It is available in two formats:\n\n- **IELTS Academic** — For university admissions and professional registration\n- **IELTS General Training** — For migration and work visas (UK, Canada, Australia)\n\nIELTS uses a 9-band score system. Most universities require 6.0-7.0, and most immigration programs require 6.0+.\n\n## What Is TOEFL?\n\nTOEFL is developed and administered by ETS (Educational Testing Service), based in the USA. The TOEFL iBT (internet-based test) is the standard version. It is scored out of 120.\n\nMost universities require a score of 80-100. Top universities like MIT or Harvard may require 100+.\n\n## Head-to-Head Comparison\n\n### Test Format\n\n| Feature | IELTS | TOEFL iBT |\n|---|---|---|\n| Listening | 4 sections, various accents | 4 tasks, North American accent |\n| Reading | 3 long passages | 3-4 academic passages |\n| Writing | 2 tasks (describe graph + essay) | 1 integrated + 1 independent essay |\n| Speaking | Face-to-face with examiner | Recorded responses |\n| Duration | 2 hrs 45 min | About 3 hours |\n\n### Scoring\n\n| Score | IELTS Equivalent | TOEFL Equivalent |\n|---|---|---|\n| Advanced | 7.0-8.0 | 94-114 |\n| Upper Intermediate | 6.0-6.5 | 72-93 |\n| Intermediate | 5.0-5.5 | 42-71 |\n\n### Cost\n\n- **IELTS**: Approximately USD 200-240 (varies by country)\n- **TOEFL iBT**: Approximately USD 190-230 (varies by country)\n\n### Acceptance\n\n- **IELTS**: Accepted by 11,000+ institutions globally; required for UK, Canadian, and Australian immigration\n- **TOEFL**: Accepted by 11,500+ institutions globally; more common for US university admissions\n\n## Which One Should You Choose?\n\n**Choose IELTS if:**\n- You are applying to UK, Australian, or Canadian universities\n- You are applying for a UK, Canadian, or Australian visa\n- You prefer speaking face-to-face rather than into a microphone\n- You want more flexibility in test dates and locations\n\n**Choose TOEFL if:**\n- You are applying primarily to US universities\n- You are more comfortable with computer-based typing than handwriting\n- You prefer integrated (reading + listening + writing) task formats\n\n**Our recommendation for Rwandan students:** IELTS is more widely used for African students pursuing UK, Canada, and Australian pathways. Start with IELTS unless your target school specifically prefers TOEFL.\n\n## How to Prepare\n\n1. Take a free official practice test for both to see which feels more comfortable\n2. Study for at least 2-3 months before your exam date\n3. Focus on your weakest skill — most Rwandan students find Speaking and Writing need the most work\n4. Use official prep materials — Cambridge IELTS books, ETS TOEFL prep\n\n## How Modern Education Consult Can Help\n\nWe offer IELTS and TOEFL preparation guidance, study materials, and help registering for your test. We also assist with university applications once you have your score.\n\nContact us:\n- Phone: +250 798979720\n- WhatsApp: +250 795780073\n- Email: moderneducationconsult2026@gmail.com\n- Offices: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_742_600_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
      category = "Language Programs";
    };
    blogsMap.add(nextBlogPostId, post7);
    nextBlogPostId += 1;

    let post8 : BlogPost = {
      id = nextBlogPostId;
      title = "From Kigali to Toronto: Sarah's Success Story";
      summary = "Sarah Uwimana always dreamed of studying in Canada. Read how she went from a small neighbourhood in Kigali to a fully funded Master's program at the University of Toronto — and the exact steps she took.";
      content = "# From Kigali to Toronto: Sarah's Success Story\n\n*Names used with permission. Some details changed for privacy.*\n\nSarah Uwimana grew up in Remera, Kigali. She had always been an exceptional student — finishing top of her class at secondary school and earning a Bachelor's degree in Public Health from the University of Rwanda with First Class Honours. But like many ambitious Rwandan graduates, she felt stuck.\n\n\"I had the grades, I had the desire, but I had no idea how to actually get to a university abroad,\" Sarah told us. \"The process seemed impossible to navigate alone.\"\n\n## The First Step: Reaching Out\n\nIn early 2024, Sarah walked into the Modern Education Consult office in Kigali. She had one goal: study Public Health at a top Canadian university. She had heard about the Mastercard Foundation Scholars Program but didn't know where to begin.\n\nOur team sat with her for two hours. We reviewed her academic record, discussed her career goals, and mapped out a realistic plan. Within the first session, we had identified four Canadian universities with strong Public Health programs that partnered with the Mastercard Foundation: University of Toronto, McGill University, University of British Columbia, and Dalhousie University.\n\n## Building Her Application\n\nOver the next three months, Sarah worked closely with our counselors:\n\n- **IELTS preparation**: Sarah scored 7.5 overall — well above the required 6.5\n- **Statement of Purpose**: We helped her craft a compelling narrative that connected her community health work in Musanze with her global ambitions\n- **References**: We guided her on approaching professors who could write substantive, specific letters\n- **Mastercard Foundation essay**: This required showing how she planned to return to Rwanda and lead change — Sarah's experience running a health education program for young women made this essay powerful and authentic\n\n## The Wait — And the Result\n\nSarah submitted applications to all four universities in November 2024. The waiting was the hardest part. Then, in February 2025, an email arrived from the University of Toronto:\n\n*\"Dear Sarah, we are pleased to offer you admission to the Master of Public Health program...\"*\n\nTwo weeks later, confirmation came: she had been awarded a Mastercard Foundation Scholarship — fully funded, covering tuition, accommodation, flights, and a monthly living allowance.\n\n\"I cried. My mother cried. The whole family celebrated,\" Sarah recalls. \"I could not believe it was real.\"\n\n## Life in Toronto\n\nSarah arrived in Toronto in September 2025 and is now completing her first year of her MPH. She is specializing in Global Health Policy, with a focus on maternal and child health in sub-Saharan Africa.\n\n\"Toronto is incredible. The university is like nothing I had ever seen. But what keeps me grounded is knowing why I am here — to come back and make a real difference in Rwanda,\" she says.\n\n## What Sarah Wants Other Rwandan Students to Know\n\n1. **The opportunity is real** — Fully funded scholarships for African students exist and are awarded every year\n2. **Your story matters** — International scholarship committees want authentic applicants, not perfect ones\n3. **Start early** — Sarah began preparing 18 months before her intended start date\n4. **Get professional guidance** — \"I would not have made it without the team at Modern Education Consult,\" she says plainly\n\n## Start Your Journey Today\n\nSarah's story is not unique — it is one of many. Every year, our team at Modern Education Consult helps Rwandan students and professionals reach universities and workplaces across Canada, the UK, Germany, Australia, and the UAE.\n\nYour story could be next.\n\n- Phone: +250 798979720\n- WhatsApp: +250 795780073\n- Email: moderneducationconsult2026@gmail.com\n- Offices: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_742_700_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
      category = "Success Stories";
    };
    blogsMap.add(nextBlogPostId, post8);
    nextBlogPostId += 1;

    stableBlogPosts := blogsMap.values().toArray();
  };

  // Seed 4 new work-abroad blog posts
  if (seedVersion < 2) {
    seedVersion := 2;

    let postDubai : BlogPost = {
      id = nextBlogPostId;
      title = "Work in Dubai: Your Complete Guide to Building a Career in the UAE";
      summary = "Dubai is one of the world's most exciting job markets — tax-free salaries, rapid career growth, and a cosmopolitan lifestyle. Here is everything Rwandan and African professionals need to know to secure a job in Dubai in 2026.";
      content = "# Work in Dubai: Your Complete Guide to Building a Career in the UAE

Dubai has transformed itself from a desert trading post into a global business hub in just a few decades. Today, it is home to the tallest building on earth, the world's busiest international airport, and one of the most dynamic job markets anywhere. For ambitious professionals from Rwanda and across Africa, Dubai represents a genuine gateway to a better career and a higher standard of living.

## Why Work in Dubai?

- **Zero income tax** — Every dirham you earn is yours to keep
- **High salaries** — Dubai salaries are 3-6x higher than equivalent roles in many African countries
- **Career acceleration** — A Dubai posting on your CV commands respect globally
- **Multicultural environment** — Over 200 nationalities live and work in Dubai; Africans are a well-established community
- **World-class infrastructure** — Healthcare, transport, schools, and safety standards are exceptional
- **Proximity to Africa** — Just 5-7 hours by flight from Kigali, making home visits easy

## Top Industries Hiring in Dubai in 2026

### Construction & Real Estate
Dubai's skyline never stops growing. The Expo City district, new metro lines, and luxury residential developments all require engineers, project managers, electricians, plumbers, surveyors, and general laborers.

**Typical salaries:**
- Civil/Structural Engineer: AED 8,000 – AED 18,000/month
- Project Manager: AED 15,000 – AED 30,000/month
- Skilled Tradesperson (electrician, plumber): AED 2,500 – AED 6,000/month
- General Laborer: AED 1,000 – AED 2,000/month + accommodation

### Hospitality & Tourism
Dubai welcomed over 17 million tourists in 2025 and is targeting 25 million by 2027. Five-star hotels, world-class restaurants, cruise terminals, and theme parks are constantly hiring.

**Roles in demand:** Guest relations officers, F&B staff, chefs, housekeeping supervisors, concierge staff

**Typical salaries:** AED 2,000 – AED 6,000/month + accommodation + meals + service charge

### Healthcare
Dubai Health Authority (DHA) and private hospital groups are aggressively recruiting international healthcare professionals.

**Roles in demand:** Registered nurses, general practitioners, dental assistants, physiotherapists, medical lab technicians

**Typical salaries:** AED 6,000 – AED 20,000/month + housing allowance + flight tickets

### Information Technology
Dubai's smart city ambitions and a growing fintech sector create strong demand for software developers, cybersecurity experts, data analysts, and IT support specialists.

**Typical salaries:** AED 10,000 – AED 30,000/month depending on seniority

### Retail & Customer Service
Dubai Mall is the world's largest shopping center. Retail chains, luxury brands, and e-commerce platforms hire large customer service and sales teams.

**Typical salaries:** AED 2,000 – AED 5,000/month + commission

## How to Get a Work Visa for Dubai

Dubai work visas are employer-sponsored, meaning you need a job offer before applying.

**Step 1 — Secure a job offer**
Use LinkedIn, Bayt.com, GulfTalent, or work with a licensed recruitment agency like Modern Education Consult.

**Step 2 — Medical fitness test**
All Dubai work visa applicants must pass a medical exam (blood test, chest X-ray) — this is done in the UAE after arrival on a visit or employment entry visa.

**Step 3 — Emirates ID**
Once medical clearance is received, your employer processes your Emirates ID and residence visa stamp.

**Step 4 — Work permit issued**
Your work permit is tied to your employer via the Ministry of Human Resources and Emiratisation (MOHRE).

**Processing time:** 2–6 weeks from job offer to visa stamp.

## Key Tips for Rwandan Professionals

1. **Never pay a placement fee** — Legitimate Dubai employers do not charge workers for jobs. Walk away from any agency that asks for upfront payment.
2. **Read your contract carefully** — Ensure salary, accommodation terms, working hours, and annual leave are specified in writing before you travel.
3. **Check GDRFA and MOHRE status** — Once in Dubai, verify your work permit is registered with official UAE government portals.
4. **Build an Arabic vocabulary** — Even 20-30 basic phrases will set you apart from other international applicants.
5. **Respect local laws and customs** — Dubai is modern and open, but public behavior standards and dress codes apply.

## Dubai vs. Abu Dhabi: Which Should You Target?

Both are excellent options. Dubai is more commercial, cosmopolitan, and diverse — ideal for hospitality, retail, and private sector roles. Abu Dhabi has more government-linked companies, oil & gas sector jobs, and slightly higher average salaries for professional roles. We can help you identify which emirate is best suited to your profession.

## How Modern Education Consult Can Help

We specialize in connecting Rwandan and African professionals with verified, legitimate employers in Dubai and across the UAE. We handle:

- CV preparation tailored for the Gulf market
- Document verification and attestation
- Interview coaching
- Job placement support
- Visa application guidance
- Pre-departure orientation

Contact us today:
- Phone: +250 798979720
- WhatsApp: +250 795780073
- Email: moderneducationconsult2026@gmail.com
- Offices: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_743_000_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
      category = "International Jobs";
    };
    blogsMap.add(nextBlogPostId, postDubai);
    nextBlogPostId += 1;

    let postQatar : BlogPost = {
      id = nextBlogPostId;
      title = "Work in Qatar: Opportunities, Salaries, and How to Get There in 2026";
      summary = "Qatar's booming economy, tax-free salaries, and major infrastructure investments make it one of the best destinations for African professionals in 2026. Here is your complete guide to working in Qatar.";
      content = "# Work in Qatar: Opportunities, Salaries, and How to Get There in 2026

Qatar is one of the wealthiest nations per capita on earth, driven by vast natural gas reserves and a bold national vision to become a global hub for business, sport, and culture. The country is investing billions in infrastructure, healthcare, education, and tourism — and it needs talented international workers to make that vision a reality.

## Why Qatar Is a Top Destination for African Workers in 2026

- **Tax-free income** — No personal income tax whatsoever
- **High demand for workers** — Continued infrastructure investment post-2022 FIFA World Cup
- **Growing African professional community** — Rwandans, Ugandans, Kenyans, Nigerians, and others are well-established
- **Competitive packages** — Many roles include free accommodation, transport, and annual flight tickets
- **Safety and stability** — Qatar is one of the safest countries in the world
- **Strategic location** — Qatar Airways connects Doha to over 160 destinations globally

## Key Industries Hiring in Qatar in 2026

### Construction & Infrastructure
Despite the World Cup being complete, Qatar is still building. The Lusail City expansion, new metro lines, healthcare facilities, and tourism infrastructure require thousands of workers.

**Roles in demand:** Civil engineers, quantity surveyors, MEP engineers, site supervisors, skilled tradespeople, general laborers

**Typical salaries:**
- Civil Engineer: QAR 6,000 – QAR 15,000/month
- Site Supervisor: QAR 4,000 – QAR 8,000/month
- Skilled Laborer: QAR 800 – QAR 2,500/month + accommodation + meals

### Oil & Gas
Qatar is the world's largest exporter of liquefied natural gas (LNG). QatarEnergy and its contractors constantly hire technical professionals.

**Roles in demand:** Petroleum engineers, safety officers, process technicians, instrument technicians, logistics coordinators

**Typical salaries:** QAR 8,000 – QAR 25,000/month depending on specialty

### Healthcare
Hamad Medical Corporation (HMC) and the expanding private healthcare sector in Qatar are actively recruiting internationally trained professionals.

**Roles in demand:** Registered nurses, specialist doctors, physiotherapists, lab technicians, radiographers

**Typical salaries:** QAR 7,000 – QAR 18,000/month + housing + flight tickets

### Hospitality & Tourism
Qatar's National Tourism Council targets 6 million visitors per year by 2030. Luxury hotels, Katara Cultural Village, and Lusail Boulevard are all expanding hospitality operations.

**Roles in demand:** Hotel managers, front desk agents, F&B supervisors, chefs, housekeeping staff

**Typical salaries:** QAR 2,500 – QAR 7,000/month + accommodation

### Education
Qatar's Education City hosts branches of Georgetown, Cornell, Northwestern, and other global universities. There is strong demand for qualified teachers and education administrators.

**Roles in demand:** Secondary school teachers (STEM subjects), university lecturers, curriculum developers

**Typical salaries:** QAR 8,000 – QAR 18,000/month + housing + school fees for children

## How to Apply for a Qatar Work Visa

**Step 1 — Secure a Job Offer**
You must have an employer sponsor to work legally in Qatar. Apply via LinkedIn, GulfTalent, or through Modern Education Consult's placement service.

**Step 2 — Employer Applies for Your Work Visa**
Your employer submits your documents to the Ministry of Interior (MOI). Required documents: passport copy, academic certificates, work experience letters.

**Step 3 — Medical and Background Check**
You will be required to pass a medical exam and provide a police clearance certificate.

**Step 4 — Residence Permit (Qatar ID)**
Upon arrival, your employer processes your Residence Permit (Iqama) — this is your legal identity document in Qatar.

**Processing time:** 2–8 weeks.

## Workers' Rights in Qatar

Qatar has recently made significant labor law reforms:
- Minimum wage: QAR 1,000/month + accommodation and food allowances
- Workers can now change jobs without employer permission (end of the old kafala system restriction)
- All workers must receive salaries through the Wage Protection System (WPS)
- Rest periods during extreme heat (outdoor work restricted June–September midday)

## Practical Tips for Rwandan Professionals

1. **Verify your employer** — Check the Ministry of Interior employer portal before traveling
2. **Understand your contract** — Ensure salary, benefits, and job role match exactly what was promised
3. **Never pay a placement fee** — Legitimate Qatari employers do not charge workers
4. **Register with Rwanda's Embassy in Qatar** — For safety and consular support
5. **Learn basic Arabic greetings** — It is appreciated by Qatari colleagues and managers

## How Modern Education Consult Can Help

We connect Rwandan professionals with verified employers in Qatar and handle the full process from CV preparation to pre-departure orientation.

Contact us:
- Phone: +250 798979720
- WhatsApp: +250 795780073
- Email: moderneducationconsult2026@gmail.com
- Offices: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_743_100_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
      category = "International Jobs";
    };
    blogsMap.add(nextBlogPostId, postQatar);
    nextBlogPostId += 1;

    let postMauritius : BlogPost = {
      id = nextBlogPostId;
      title = "Work in Mauritius: The African Professional's Guide to Island Career Opportunities";
      summary = "Mauritius is rapidly becoming a top destination for African professionals — offering a stable economy, English-speaking environment, visa-friendly policies, and a gateway to global business. Here's everything you need to know.";
      content = "# Work in Mauritius: The African Professional's Guide to Island Career Opportunities

Mauritius is far more than a tourist paradise. This small island nation in the Indian Ocean has built one of Africa's most robust economies, with a business-friendly environment, political stability, and an open immigration policy that makes it an increasingly attractive destination for professionals from Rwanda and across the continent.

## Why Mauritius Stands Out in 2026

- **English and French official languages** — Ideal for Rwandans who are bilingual
- **No personal income tax on foreign-sourced income** — Favorable tax regime
- **African Union member** — Shared development agenda with the rest of the continent
- **Ease of doing business** — Ranked among Africa's top 3 most competitive economies
- **Gateway to global markets** — Strong financial services and international business sector
- **High quality of life** — Clean environment, low crime, excellent healthcare
- **Growing ICT sector** — Government strategy to become Africa's leading tech hub

## Key Sectors Hiring in Mauritius in 2026

### Financial Services & Banking
Mauritius is a major international financial center, home to hundreds of global investment funds, private equity firms, and management companies.

**Roles in demand:** Fund accountants, compliance officers, AML analysts, tax advisors, corporate secretaries

**Typical salaries:** MUR 40,000 – MUR 120,000/month (approximately USD 900 – USD 2,700)

### Information & Communication Technology (ICT)
The Mauritius government is investing heavily in its ICT sector. Ebene Cyber City is a growing tech hub with both local and international companies.

**Roles in demand:** Software developers, UI/UX designers, data analysts, cybersecurity specialists, project managers

**Typical salaries:** MUR 50,000 – MUR 150,000/month

### Tourism & Hospitality
Mauritius attracts over 1.3 million tourists annually. Luxury resorts — many of which are global brands — hire internationally trained hospitality professionals.

**Roles in demand:** Hotel managers, F&B supervisors, guest relations officers, spa therapists, chefs

**Typical salaries:** MUR 25,000 – MUR 70,000/month + accommodation

### Healthcare
With growing medical tourism and a public healthcare system under expansion, Mauritius needs qualified medical professionals.

**Roles in demand:** Specialist doctors, nurses, physiotherapists, medical technicians

**Typical salaries:** MUR 60,000 – MUR 200,000/month depending on specialty

### Education
International schools and private universities are growing rapidly in Mauritius, creating demand for qualified teachers and academic professionals.

**Roles in demand:** Secondary teachers (STEM and languages), university lecturers, curriculum designers

**Typical salaries:** MUR 35,000 – MUR 90,000/month

## How to Get a Work Permit in Mauritius

Mauritius has one of the most streamlined work permit systems in Africa.

**Option 1 — Employer-Sponsored Work Permit**
- Your employer in Mauritius applies to the Economic Development Board (EDB)
- Processing time: 3–6 weeks
- Minimum salary threshold: MUR 30,000/month for most professional categories

**Option 2 — Premium Visa (for remote workers and professionals)**
- Allows you to live and work remotely in Mauritius for up to 1 year
- Renewable annually
- Requirements: Proof of employment abroad and minimum monthly income of USD 1,500

**Option 3 — Occupation Permit (for investors, professionals, and self-employed)**
- A combination work and residence permit
- Valid for up to 3 years, renewable
- Professional category requires a job offer with minimum MUR 30,000/month salary

## Why Mauritius Is Ideal for Rwandan Professionals

Rwandans have a natural advantage in Mauritius:

- **Language compatibility** — French and English are both official languages of Rwanda and Mauritius
- **Cultural familiarity** — Shared African identity and values
- **Direct flights** — Mauritius Airlines connects Kigali and Mauritius regularly
- **COMESA membership** — Both countries are members, facilitating trade and professional mobility
- **No visa required for short visits** — Rwandan passport holders can visit Mauritius visa-free

## Practical Tips

1. **Research cost of living** — While salaries are lower than Gulf countries, the cost of living in Mauritius is also significantly lower
2. **Check professional certifications** — Ensure your qualifications are recognized by Mauritius authorities
3. **Build a local network** — The Mauritius professional community is small and relationship-driven
4. **Learn French** — Even basic French greatly expands your job opportunities
5. **Use LinkedIn** — Many Mauritius-based companies post internationally on LinkedIn

## How Modern Education Consult Can Help

We assist Rwandan professionals in identifying job opportunities in Mauritius, preparing targeted CVs for the Mauritian market, and guiding you through the occupation permit or work permit process.

Contact us today:
- Phone: +250 798979720
- WhatsApp: +250 795780073
- Email: moderneducationconsult2026@gmail.com
- Offices: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_743_200_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
      category = "International Jobs";
    };
    blogsMap.add(nextBlogPostId, postMauritius);
    nextBlogPostId += 1;

    let postSpain : BlogPost = {
      id = nextBlogPostId;
      title = "Work in Spain: How African Professionals Can Build a Career in Europe's Sunshine Economy";
      summary = "Spain is opening its doors to skilled international workers like never before. With a new digital nomad visa, strong demand in tech and healthcare, and a vibrant quality of life, 2026 is the year to consider Spain as your next career destination.";
      content = "# Work in Spain: How African Professionals Can Build a Career in Europe's Sunshine Economy

Spain is the fourth-largest economy in the Eurozone and one of Europe's most dynamic job markets. Known for its exceptional quality of life, rich culture, and warm climate, Spain is increasingly opening its doors to skilled international workers — including professionals from Africa who are ready to contribute to Europe's growing economy.

## Why Spain in 2026?

- **EU gateway** — Working in Spain can open doors to the entire European Union
- **New immigration-friendly policies** — Spain's 2022 Immigration Reform expanded pathways for skilled workers
- **Digital Nomad Visa** — One of Europe's most attractive remote work visas
- **Strong quality of life** — World-renowned food, culture, healthcare, and Mediterranean lifestyle
- **Large African diaspora** — Established Moroccan, Senegalese, and sub-Saharan African communities
- **Growing sectors** — Tech, healthcare, tourism, and agriculture all have significant labor shortages
- **Pathway to EU residency** — After 5 years of legal residence, you can apply for long-term EU residency

## Key Sectors Hiring in Spain in 2026

### Technology & Startups
Spain — particularly Madrid and Barcelona — has a booming tech startup ecosystem. Spanish tech companies and international firms with Spanish offices are actively hiring software engineers, data scientists, and product managers.

**Roles in demand:** Full-stack developers, DevOps engineers, data analysts, UX designers, cybersecurity professionals

**Typical salaries:** EUR 28,000 – EUR 65,000/year (EUR 2,300 – EUR 5,400/month)

### Healthcare & Social Services
Spain faces a significant shortage of healthcare workers, particularly in rural regions. The Spanish National Health System (SNS) actively recruits internationally trained doctors and nurses.

**Roles in demand:** Doctors (GPs and specialists), registered nurses, physiotherapists, social workers, nursing home caregivers

**Typical salaries:**
- Doctor: EUR 3,500 – EUR 6,000/month
- Nurse: EUR 1,800 – EUR 3,000/month
- Caregiver: EUR 1,200 – EUR 1,800/month

### Tourism & Hospitality
Spain is the second most visited country in the world, receiving over 85 million tourists in 2025. The Balearic Islands, Costa del Sol, Barcelona, and Madrid all have year-round hospitality demand.

**Roles in demand:** Hotel managers, F&B staff, receptionists, tour guides, chefs

**Typical salaries:** EUR 1,300 – EUR 2,500/month (higher in luxury properties)

### Agriculture
Spain is Europe's fruit and vegetable garden. Seasonal and permanent agricultural workers are in high demand, particularly in Andalusia, Murcia, and Catalonia.

**Roles in demand:** Fruit pickers, greenhouse workers, agricultural supervisors, quality control inspectors

**Typical salaries:** EUR 1,100 – EUR 1,600/month (accommodation often provided)

### Construction
Spain's housing market is recovering strongly after years of underbuilding. Infrastructure projects in renewable energy and urban renewal are driving construction hiring.

**Roles in demand:** Civil engineers, project managers, electricians, plumbers, construction laborers

**Typical salaries:** EUR 1,400 – EUR 3,500/month

## How to Work Legally in Spain

### Option 1 — Highly Qualified Worker Visa (EU Blue Card)
Designed for professionals with a university degree and a job offer earning above EUR 37,000/year.
- Valid for 1-4 years, renewable
- Allows family reunification
- Pathway to EU long-term residency

### Option 2 — Spain Digital Nomad Visa
Launched in 2023, this allows remote workers and freelancers to live in Spain while working for clients outside Spain.
- Minimum monthly income: EUR 2,646 (200% of minimum wage)
- Valid for 1 year, renewable up to 5 years
- Favorable 15% flat tax rate for the first 5 years (Beckham Law)

### Option 3 — Employer-Sponsored Work Visa
For workers with a specific job offer from a Spanish employer. The employer initiates the process with Spain's State Public Employment Service (SEPE).

### Option 4 — Seasonal Work Visa
For agricultural and tourism workers needed for specific seasons — typically 6-9 months, renewable.

## Language Requirements

Spanish (Castellano) is essential for most roles in Spain. We recommend reaching at least B1-B2 level (intermediate) before applying. However, in tech and international companies in Madrid and Barcelona, English is often sufficient.

Rwandans who speak French have an advantage — French is mutually intelligible with Spanish to a significant degree, making learning Spanish much faster.

## Practical Tips for Rwandan Professionals

1. **Learn Spanish** — Even A2-B1 level Spanish dramatically increases your job opportunities
2. **Get your documents apostilled** — Rwandan educational certificates must be officially recognized in Spain
3. **Use LinkedIn Spain** — Infojobs.net and LinkedIn are the primary job portals in Spain
4. **Understand the Spanish work culture** — Spain values relationships and trust; professional networking matters
5. **Know your rights** — Spain has strong labor protections; join a trade union if needed
6. **Check NIE requirements** — All foreigners working in Spain need a Foreigner Identification Number (NIE)

## Spain vs. Other European Destinations

Compared to Germany or the Netherlands, Spain offers a lower cost of living, easier entry for non-EU workers, warmer climate, and a more relaxed pace of life. Salaries are lower than Northern Europe, but so is the cost of housing, food, and daily life. For many African professionals, Spain offers the best quality-of-life-to-income ratio in Europe.

## How Modern Education Consult Can Help

We help Rwandan and African professionals navigate the Spanish work visa process, prepare targeted CV and cover letters for Spanish employers, and connect with legitimate job opportunities in Spain.

Contact us today:
- Phone: +250 798979720
- WhatsApp: +250 795780073
- Email: moderneducationconsult2026@gmail.com
- Offices: Kigali and Musanze, Rwanda";
      author = "Modern Education Consult";
      publishedDate = 1_743_300_000_000_000_000;
      imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
      category = "International Jobs";
    };
    blogsMap.add(nextBlogPostId, postSpain);
    nextBlogPostId += 1;

    stableBlogPosts := blogsMap.values().toArray();
  };



  // Seed success story: Work in Germany - Nsengiyumva Ibasumba Alain Aristide
  if (seedVersion < 3) {
    seedVersion := 3;

    let postGermany : BlogPost = {
      id = nextBlogPostId;
      title = "Work in Germany: How Nsengiyumva Ibasumba Alain Aristide Built a New Life in Europe";
      summary = "From Kigali to Germany — Nsengiyumva Ibasumba Alain Aristide shares his inspiring journey of securing a skilled worker visa, adapting to life in Germany, and building a successful career in one of Europe's strongest economies.";
      content = "# Work in Germany: How Nsengiyumva Ibasumba Alain Aristide Built a New Life in Europe\n\n*Published with full permission of the client.*\n\nWhen Nsengiyumva Ibasumba Alain Aristide first walked into the Modern Education Consult office in Kigali, he had a clear goal but no clear path. He had a degree in mechanical engineering, five years of solid work experience at a manufacturing company in Rwanda, and a burning desire to take his career to the next level. He had heard that Germany was one of the best destinations for skilled African professionals — but the process seemed complex and out of reach.\n\nToday, Alain Aristide is living and working in Stuttgart, Germany, earning the equivalent of over ten times his previous salary, and building a career that most of his peers could only dream of.\n\nThis is his story.\n\n## Why Germany?\n\nAlain Aristide explains: I chose Germany because it is the engineering capital of the world. Brands like Mercedes-Benz, Bosch, Siemens, and BMW — these are the companies I studied in university. The idea of working alongside German engineers excited me deeply.\n\nGermany is the fourth-largest economy in the world with a chronic shortage of over 600,000 skilled workers. The Skilled Immigration Act (Fachkraefteeinwanderungsgesetz) has opened its doors wide to qualified international professionals — and for Alain Aristide, this legislation became his gateway.\n\n## The Process: Step by Step\n\n### Step 1: Qualification Recognition (Anerkennung)\n\nThe first step for any non-EU professional moving to Germany is having foreign qualifications officially recognized by the Central Office for Foreign Education (ZAB). Alain Aristide submitted his degree transcripts, translation certificates, and employment history. Our team at Modern Education Consult guided him through every document and deadline.\n\n**Timeline:** 3-4 months for recognition approval\n\n### Step 2: German Language Preparation\n\nMost German employers require at least B1 level German for technical roles. Alain Aristide enrolled in an intensive German language course and achieved **B2 certification** in six months.\n\nHe recalls: The language was the hardest part. But once I started understanding German, everything became easier — not just job hunting, but connecting with colleagues and building friendships.\n\n### Step 3: Job Search and Application\n\nWith his qualifications recognized and his B2 certificate in hand, our team supported Alain Aristide in:\n\n- Creating a **German-standard CV (Lebenslauf)** — quite different from a Rwandan or Anglo-Saxon CV\n- Writing a compelling **cover letter (Anschreiben)** in German\n- Identifying target companies and submitting applications via LinkedIn, XING, and the Federal Employment Agency (BA) portal\n- Preparing for **German-style interviews**, which are formal, structured, and highly detail-oriented\n\nAfter eight weeks of targeted applications, he received two interview invitations and was offered a position as a **Mechanical Design Engineer** at a mid-sized manufacturing company in the Stuttgart region.\n\n### Step 4: The Skilled Worker Visa (Fachkraeftevisa)\n\nWith a signed employment contract in hand, Alain Aristide applied for the German Skilled Worker Visa at the German Embassy in Kigali.\n\n**Documents required:**\n- Valid passport\n- Signed employment contract\n- Qualification recognition certificate\n- German language certificate (B2)\n- Proof of accommodation in Germany\n- Health insurance enrollment confirmation\n- Visa application form and fee\n\n**Processing time:** 6-8 weeks\n\nHe recalls: The embassy staff were professional and efficient. The Modern Education Consult team had prepared all my documents perfectly, so there were no surprises.\n\n## Life in Stuttgart\n\nAlain Aristide arrived in Stuttgart in March 2025 and has now completed over a year of work in Germany.\n\n**His package as a Mechanical Design Engineer:**\n- Gross salary: EUR 48,000/year\n- Health insurance covered by employer\n- 25 days annual leave\n- Relocation support for first 3 months\n\n**On the work culture:** German work culture is very different from what I was used to. Punctuality is taken extremely seriously. Communication is direct. But once you adapt, you appreciate the efficiency — things get done, decisions are made clearly and quickly.\n\n**On community:** Stuttgart has a growing African community. Alain Aristide has connected with Rwandan and other East African professionals through local diaspora networks and football clubs.\n\n## His Advice to Other Rwandan Professionals\n\n1. **Start German language as early as possible.** It is non-negotiable and opens every door.\n2. **Get qualifications recognized first.** Do not wait for a job offer — start Anerkennung immediately.\n3. **Work with a trusted consultancy.** Modern Education Consult saved me months of confusion and costly mistakes.\n4. **Be patient but persistent.** The process takes 6-12 months, but every step is manageable with proper guidance.\n5. **Embrace the culture.** Learning German is not just language — it is respect for your new home.\n\n## Why Now Is the Right Time for Germany\n\nGermany needs skilled workers urgently. The government has simplified immigration rules further, allowing professionals with recognized qualifications to apply for a Job Seeker Visa (Jobsuchvisum) and look for employment in person. There has never been a better moment for skilled African professionals to make the move.\n\n**In-demand sectors in Germany:**\n- Engineering (mechanical, civil, electrical, software)\n- Healthcare (nurses, doctors, physiotherapists)\n- IT and software development\n- Skilled trades (electricians, plumbers, welders)\n- Hospitality and care services\n\n## How Modern Education Consult Can Help You\n\nJust as we helped Nsengiyumva Ibasumba Alain Aristide navigate every step from qualification recognition to visa approval, we can do the same for you. Our Germany placement service includes qualification recognition guidance, language course referrals, German-format CV writing, job matching, interview preparation, visa documentation support, and pre-departure briefing.\n\n**Contact us today:**\n- Phone: +250 798979720\n- WhatsApp: +250 795780073\n- Email: moderneducationconsult2026@gmail.com\n- Offices: Kigali and Musanze, Rwanda\n\n*Your German journey starts with one conversation. Let us help you take that first step.*";
      author = "Modern Education Consult";
      publishedDate = 1_743_400_000_000_000_000;
      imageUrl = "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80";
      category = "Success Stories";
    };
    blogsMap.add(nextBlogPostId, postGermany);
    nextBlogPostId += 1;

    stableBlogPosts := blogsMap.values().toArray();
  };

  // Persist to stable storage before each upgrade
  system func preupgrade() {
    stableBlogPosts := blogsMap.values().toArray();
    stableContacts := contactsMap.values().toArray();
  };

  stable var testimonialsArray : [Testimonial] = [
    {
      clientName = "John Doe";
      quote = "Modern Education Consult helped me achieve my dream of studying in the UK!";
      country = "United Kingdom";
      photoUrl = "https://example.com/photo1.jpg";
    },
    {
      clientName = "Maria Garcia";
      quote = "The team guided me through the entire application process. Highly recommended!";
      country = "Canada";
      photoUrl = "https://example.com/photo2.jpg";
    },
    {
      clientName = "Ahmed Ali";
      quote = "Thanks to Mec, I am now studying engineering in Australia.";
      country = "Australia";
      photoUrl = "https://example.com/photo3.jpg";
    },
    {
      clientName = "Nsengiyumva Ibasumba Alain Aristide";
      quote = "Modern Education Consult guided me through every step — from credential recognition to German B2 preparation and landing my engineering job in Stuttgart. Their support made my dream of working in Germany a reality.";
      country = "Now working in Germany";
      photoUrl = "/assets/uploads/bd33db92-589d-4260-a870-59b5278d3b02-1.jpg";
    },
  ];

  public shared func submitContact(fullName : Text, phoneNumber : Text, email : Text, countryOfInterest : Text, message : Text) : async () {
    let timestamp = Time.now();
    let submission : ContactSubmission = {
      fullName;
      phoneNumber;
      email;
      countryOfInterest;
      message;
      timestamp;
    };
    contactsMap.add(nextContactId, submission);
    nextContactId += 1;
  };

  public query func getAllContacts() : async [ContactSubmission] {
    contactsMap.values().toArray();
  };

  public shared func addBlogPost(title : Text, summary : Text, content : Text, author : Text, imageUrl : Text, category : Text) : async () {
    let blogPost : BlogPost = {
      id = nextBlogPostId;
      title;
      summary;
      content;
      author;
      publishedDate = Time.now();
      imageUrl;
      category;
    };
    blogsMap.add(nextBlogPostId, blogPost);
    nextBlogPostId += 1;
    stableBlogPosts := blogsMap.values().toArray();
  };

  public shared func editBlogPost(id : Nat, title : Text, summary : Text, content : Text, author : Text, imageUrl : Text, category : Text) : async () {
    switch (blogsMap.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?existing) {
        let updated : BlogPost = {
          id = existing.id;
          title;
          summary;
          content;
          author;
          publishedDate = existing.publishedDate;
          imageUrl;
          category;
        };
        blogsMap.remove(id);
        blogsMap.add(id, updated);
        stableBlogPosts := blogsMap.values().toArray();
      };
    };
  };

  public shared func deleteBlogPost(id : Nat) : async () {
    blogsMap.remove(id);
    stableBlogPosts := blogsMap.values().toArray();
  };

  public query func getAllBlogPosts() : async [BlogPost] {
    blogsMap.values().toArray().sort(compareBlogPost);
  };

  public query func getBlogPostById(id : Nat) : async BlogPost {
    switch (blogsMap.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?post) { post };
    };
  };

  public query func getAllTestimonials() : async [Testimonial] {
    testimonialsArray;
  };
};
