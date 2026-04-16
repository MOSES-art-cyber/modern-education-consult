import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";



actor {
  // Old contact submission type (without serviceOfInterest) — kept for stable
  // memory compatibility. New submissions use ContactSubmissionV3.
  type OldContactSubmission = {
    fullName : Text;
    phoneNumber : Text;
    email : Text;
    countryOfInterest : Text;
    message : Text;
    timestamp : Time.Time;
  };

  // V2 type (with serviceOfInterest only) — kept for stable memory compatibility.
  type ContactSubmission = {
    fullName : Text;
    phoneNumber : Text;
    email : Text;
    countryOfInterest : Text;
    serviceOfInterest : ?Text;
    message : Text;
    timestamp : Time.Time;
  };

  // File attachment metadata — fileUrl may be a base64 data URL for display in admin panel.
  type FileAttachment = {
    fileName : Text;
    fileSize : Nat;
    fileType : Text;
    fileUrl : Text;
  };

  // V3 type — adds preferredContactMethod, privacyConsent, and attachedFiles.
  type ContactSubmissionV3 = {
    fullName : Text;
    phoneNumber : Text;
    email : Text;
    countryOfInterest : Text;
    serviceOfInterest : ?Text;
    message : Text;
    timestamp : Time.Time;
    preferredContactMethod : ?Text;
    privacyConsent : Bool;
    attachedFiles : [FileAttachment];
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

  // State — ALL variables declared stable for guaranteed persistence across upgrades.
  // The --default-persistent-actors flag alone is not reliable enough in production.
  stable var blogsMap = Map.empty<Nat, BlogPost>();
  // contactsMap kept for stable memory backward compatibility (old type without serviceOfInterest).
  // New submissions are stored in contactsMapV3 which includes all fields.
  stable var contactsMap = Map.empty<Nat, OldContactSubmission>();
  // contactsMapV2 kept for backward compatibility (ContactSubmission with serviceOfInterest only).
  stable var contactsMapV2 = Map.empty<Nat, ContactSubmission>();
  // contactsMapV3 uses ContactSubmissionV3 with preferredContactMethod, privacyConsent, attachedFiles.
  stable var contactsMapV3 = Map.empty<Nat, ContactSubmissionV3>();
  stable var nextBlogPostId : Nat = 1;
  stable var nextContactId : Nat = 1;
  // seedVersion kept for backward compatibility but no longer gates seeding.
  // Seeding is now idempotent: addSeedPost runs on every init and skips existing titles.
  stable var seedVersion : Nat = 0;

  stable var testimonialsArray : [Testimonial] = [
    {
      clientName = "RWEMA Blaise";
      quote = "Modern Education Consult helped me achieve my dream of studying in the UK!";
      country = "United Kingdom";
      photoUrl = "https://example.com/photo1.jpg";
    },
    {
      clientName = "IGABANEZA Clemence";
      quote = "The team guided me through the entire application process. Highly recommended!";
      country = "Canada";
      photoUrl = "https://example.com/photo2.jpg";
    },
    {
      clientName = "NSHUTI David";
      quote = "Thanks to Mec, I am now studying engineering in Australia.";
      country = "Australia";
      photoUrl = "https://example.com/photo3.jpg";
    },
    {
      clientName = "Nsengiyumva Ibasumba Alain Aristide";
      quote = "Modern Education Consult guided me every step of the way — from credential recognition and German B2 preparation to landing my engineering job in Stuttgart. It was the best decision I ever made.";
      country = "Germany";
      photoUrl = "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80";
    },
  ];

  // Helper: add a seed post only if no post with that title already exists.
  // This ensures user-added posts are NEVER wiped during re-seeding.
  func addSeedPost(post : BlogPost) {
    // Check if a post with the same title already exists
    var titleExists = false;
    for ((_, existing) in blogsMap.entries()) {
      if (existing.title == post.title) {
        titleExists := true;
      };
    };
    if (not titleExists) {
      // Find a safe ID: use the post's intended id if not taken, else use nextBlogPostId
      if (blogsMap.get(post.id) == null) {
        blogsMap.add(post.id, post);
        if (post.id >= nextBlogPostId) {
          nextBlogPostId := post.id + 1;
        };
      } else {
        // ID already taken by a different post — assign a new ID
        let newPost : BlogPost = { post with id = nextBlogPostId };
        blogsMap.add(nextBlogPostId, newPost);
        nextBlogPostId += 1;
      };
    };
    // If post with this title already exists, skip to avoid overwriting user edits
  };

  // Idempotent seeding: runs unconditionally on every canister initialization.
  // addSeedPost skips any post whose title already exists, so this is safe to call
  // on every deploy regardless of prior state. On a fresh/reset canister all 13 posts
  // are added. On a canister with existing data nothing is overwritten.
  seedVersion := 3; // mark as fully seeded (kept for backward compat)

  addSeedPost({
    id = 1;
    title = "Your Ultimate Guide to Studying Abroad in 2026";
    summary = "Planning to study abroad in 2026? Discover the best countries, top universities, scholarship opportunities, and step-by-step application tips to make your dream a reality.";
    content = "# Your Ultimate Guide to Studying Abroad in 2026\n\nStudying abroad is one of the most transformative decisions you can make. Whether you dream of ivy-league halls in the UK, cutting-edge research labs in Germany, or sun-soaked campuses in Australia, 2026 is the perfect year to take that leap.\n\n## Why Study Abroad?\n\nA foreign degree opens doors that a local degree simply cannot. Employers worldwide value the adaptability, language skills, and global perspective that international students bring. Beyond career benefits, you gain lifelong friendships, cultural immersion, and personal growth that money cannot buy.\n\n## Top Countries for International Students in 2026\n\n**United Kingdom** - Home to Oxford, Cambridge, and over 130 universities ranked in the global top 1000. Post-study work visa allows 2 years of work experience after graduation.\n\n**Canada** - Affordable tuition, multicultural cities, and one of the world's most welcoming immigration pathways. The Post-Graduation Work Permit (PGWP) can lead directly to permanent residency.\n\n**Germany** - Free or near-free tuition at public universities, even for international students. Engineering, medicine, and technology programs are world-class.\n\n**Australia** - Top 8 Group of Eight universities, stunning lifestyle, and a straightforward student visa process. Graduate visa allows 2-4 years of work after studies.\n\n**United Arab Emirates** - Emerging education hub with campuses from NYU, Sorbonne, and other global brands. Tax-free salaries after graduation.\n\n## How to Choose the Right University\n\n1. Define your goal - Do you want research, industry connections, or immigration pathways?\n2. Check rankings - QS World Rankings and THE Rankings are reliable guides.\n3. Review entry requirements - Most require IELTS 6.0-7.0 or TOEFL 80-100.\n4. Compare costs - Tuition + living costs vary enormously between countries.\n5. Look for scholarships - Many universities offer merit-based aid to international students.\n\n## Application Timeline for 2026 Intake\n\n- September 2025: Start researching programs\n- October-November 2025: Take IELTS/TOEFL\n- November-December 2025: Prepare documents\n- January-February 2026: Submit applications\n- March-April 2026: Receive offers\n- May-June 2026: Apply for student visa\n- September 2026: Start your program\n\nContact Modern Education Consult at +250 798979720 to start your journey today.";
    author = "Modern Education Consult";
    publishedDate = 1_767_225_600_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Study Abroad";
  });

  addSeedPost({
    id = 2;
    title = "International Job Opportunities in 2026: Your Complete Guide to Working Abroad";
    summary = "Discover the top countries hiring international workers in 2026, in-demand sectors, salary guides, and how to land your first job abroad with the right documents and support.";
    content = "# International Job Opportunities in 2026: Your Complete Guide to Working Abroad\n\nThe global job market is booming and borders are more open than ever for skilled workers. If you have been dreaming of building a career abroad, 2026 offers exceptional opportunities across multiple industries and countries.\n\n## Why Work Abroad in 2026?\n\n- Higher salaries - Even entry-level roles in UAE, Canada, or Germany pay 3-5x more than equivalent roles in many African countries\n- Career acceleration - International experience puts your CV in a completely different league\n- Immigration pathways - Many countries offer residency or citizenship after a few years of skilled work\n- Quality of life - Access to world-class healthcare, education, and infrastructure\n\n## Top Countries Hiring International Workers in 2026\n\n### United Arab Emirates\nThe UAE remains one of the most accessible destinations for international workers. Construction, hospitality, logistics, healthcare, and technology sectors are all actively recruiting.\n\nAverage salaries:\n- Construction worker: AED 2,500-5,000/month\n- Nurse/Healthcare: AED 8,000-15,000/month\n- IT Professional: AED 12,000-25,000/month\n\n### Canada\nCanada's Express Entry system is designed to attract skilled workers. The country needs over 400,000 new immigrants per year through 2026 to fill labor shortages.\n\nIn-demand roles: Nurses, engineers, truck drivers, IT specialists, trades workers\n\n### United Kingdom\nThe UK Skilled Worker Visa allows employers to sponsor international candidates. Healthcare (NHS), tech, and finance are top hiring sectors.\n\n### Germany\nGermany faces a shortage of 600,000 skilled workers. The Skilled Immigration Act makes it easier than ever for non-EU nationals to get work visas.\n\n### Qatar\nPost-World Cup infrastructure projects continue. Construction, hospitality, and logistics workers are in high demand.\n\n## Step-by-Step Application Process\n\n1. Assess your qualifications - Most countries require at minimum a secondary school certificate\n2. Get your documents certified - Apostille or notarization may be required\n3. Learn basic language skills - Even basic phrases in the local language help enormously\n4. Apply through legitimate channels - Use Modern Education Consult to avoid scams\n5. Prepare for interviews - Many employers conduct video interviews before sponsoring visas\n\nContact Modern Education Consult at +250 798979720 for placement support.";
    author = "Modern Education Consult";
    publishedDate = 1_767_484_800_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  });

  addSeedPost({
    id = 3;
    title = "Working in the UAE: What Rwandan Professionals Need to Know";
    summary = "Thinking about working in the UAE? This guide covers visa requirements, top industries, salary expectations, cultural tips, and how Rwandan professionals can secure legitimate job offers in Dubai and beyond.";
    content = "# Working in the UAE: What Rwandan Professionals Need to Know\n\nThe United Arab Emirates — particularly Dubai and Abu Dhabi — has become one of the most sought-after destinations for Rwandan and East African professionals. Tax-free salaries, world-class infrastructure, and a booming economy make it an attractive option for those ready to work abroad.\n\n## Why the UAE?\n\n- Zero income tax — Your full salary is yours to keep\n- Strong demand for skilled workers — Construction, hospitality, healthcare, logistics, and IT are all actively hiring\n- Fast visa processing — Work visas can be processed in as little as 2-4 weeks\n- East African community — A large and welcoming African community already established in the UAE\n- Gateway to global opportunities — UAE experience on your CV opens doors worldwide\n\n## Top Industries Hiring in the UAE in 2026\n\n### Construction and Engineering\nMajor infrastructure projects across Dubai, Abu Dhabi, and the Northern Emirates continue to drive demand.\n\nTypical salary range: AED 1,800 - AED 8,000/month depending on role and experience.\n\n### Hospitality and Tourism\nThe UAE welcomed over 20 million tourists in 2026 and targets more in 2027.\n\nTypical salary range: AED 2,000 - AED 6,000/month plus accommodation and meals.\n\n### Healthcare\nNurses, medical assistants, lab technicians, and pharmacists are highly sought after.\n\nTypical salary range: AED 5,000 - AED 18,000/month.\n\n### Logistics and Warehousing\nWith Dubai as a global trade hub, logistics companies constantly recruit warehouse staff and drivers.\n\nTypical salary range: AED 1,500 - AED 5,000/month.\n\n## How to Apply for a UAE Work Visa\n\n1. Secure a job offer from a UAE employer\n2. Your employer applies for a work permit from the Ministry of Human Resources\n3. You undergo a medical fitness test\n4. You receive your Emirates ID and residence visa\n\nContact Modern Education Consult at +250 798979720 for placement support.";
    author = "Modern Education Consult";
    publishedDate = 1_767_744_000_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  });

  addSeedPost({
    id = 4;
    title = "How to Apply for a Canadian Study Permit in 2026";
    summary = "A step-by-step guide to applying for a Canadian study permit in 2026 — from letter of acceptance to visa approval, including documents needed, fees, processing times, and common mistakes to avoid.";
    content = "# How to Apply for a Canadian Study Permit in 2026\n\nCanada remains one of the top destinations for international students, offering world-class universities, diverse cities, and a clear pathway to permanent residency. But before you can study in Canada, you need a Study Permit.\n\n## What Is a Canadian Study Permit?\n\nA Study Permit is a document issued by Immigration, Refugees and Citizenship Canada (IRCC) that allows foreign nationals to study at a Designated Learning Institution (DLI) in Canada.\n\n## Step-by-Step Application Process\n\n### Step 1: Get Your Letter of Acceptance\nYou must first be accepted by a Designated Learning Institution (DLI).\n\n### Step 2: Gather Required Documents\n\n- Valid passport\n- Letter of Acceptance from a DLI\n- Proof of financial support\n- Passport-sized photos\n- Statement of Purpose\n- Academic transcripts and certificates\n- English proficiency test (IELTS 6.0+ or TOEFL 80+)\n- Police clearance certificate\n\n### Step 3: Create an IRCC Online Account\nGo to the official IRCC website (canada.ca) and create your account.\n\n### Step 4: Complete the Application Form\nFill in the IMM 1294 form. Be honest and accurate.\n\n### Step 5: Pay the Application Fee\nThe study permit application fee is CAD 150.\n\n### Step 6: Submit Biometrics\nFirst-time applicants must provide biometrics at a Visa Application Centre.\n\n### Step 7: Wait for a Decision\nProcessing times vary: 4-12 weeks depending on the country and time of year.\n\n## Common Mistakes to Avoid\n\n- Submitting incomplete documents\n- Not demonstrating strong ties to Rwanda\n- Insufficient proof of funds\n- Inconsistencies in your application\n\nContact Modern Education Consult at +250 798979720 for full application support.";
    author = "Modern Education Consult";
    publishedDate = 1_769_817_600_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Application Guides";
  });

  addSeedPost({
    id = 5;
    title = "Top 5 Scholarships for African Students Studying Abroad in 2026";
    summary = "Discover the top 5 fully funded and partial scholarships available to African students in 2026 — including eligibility, application deadlines, and tips on how to win them.";
    content = "# Top 5 Scholarships for African Students Studying Abroad in 2026\n\nFinancing an international education is one of the biggest concerns for African students. The good news is that dozens of prestigious scholarships are specifically designed for African applicants.\n\n## 1. Mastercard Foundation Scholars Program\n\nCoverage: Fully funded — tuition, living expenses, flights, health insurance\nPartner Universities: University of Toronto, McGill, Edinburgh, UC Berkeley, and more\nEligibility: African students with academic excellence and demonstrated leadership\n\nTip: The Mastercard Foundation looks for community leaders, not just academic achievers.\n\n## 2. Chevening Scholarships (UK)\n\nCoverage: Fully funded — tuition, living allowance, flights, visa fees\nCountry: United Kingdom\nEligibility: Citizens of eligible countries (Rwanda included) with 2+ years work experience\nDegree Level: One-year Master's degree\n\nDeadline: Typically November each year.\n\n## 3. DAAD Scholarships (Germany)\n\nCoverage: Monthly stipend, travel allowance, health insurance\nCountry: Germany\nEligibility: Recent graduates and young professionals from developing countries\n\nWhy Germany: Public university tuition is free or very low even without the scholarship.\n\n## 4. Australia Awards Scholarships\n\nCoverage: Fully funded — tuition, living costs, airfare, health cover\nCountry: Australia\nEligibility: Citizens of eligible developing countries including Rwanda\n\n## 5. Rwandan Government Scholarships\n\nThe Government of Rwanda regularly offers bilateral scholarships to partner countries. Check the Rwanda Education Board for current opportunities.\n\nContact Modern Education Consult at +250 798979720 to get help applying for any of these scholarships.";
    author = "Modern Education Consult";
    publishedDate = 1_770_076_800_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Scholarships";
  });

  addSeedPost({
    id = 6;
    title = "New Intake: Online Degree Programs Opening for 2026 Enrollment";
    summary = "Several top universities are opening online degree enrollments for 2026. Here are the best accredited online programs in business, IT, healthcare, and education — with application deadlines and fees.";
    content = "# New Intake: Online Degree Programs Opening for 2026 Enrollment\n\nThe demand for flexible, internationally recognized online degrees has never been higher. In 2026, leading universities across the UK, USA, Canada, and Australia are opening new intake periods for fully online programs.\n\n## Why Choose an Online Degree in 2026?\n\n- Study from anywhere — No need to relocate or disrupt your career\n- Internationally recognized — Same degree as on-campus students\n- Flexible schedule — Many programs are part-time friendly\n- Lower cost — Online tuition is often 30-50% cheaper than on-campus programs\n\n## Top Online Programs Opening for 2026 Intake\n\n### Business and Management\n\nUniversity of London (UK) — Online BSc Business Administration\n- Duration: 3 years (part-time available)\n- Tuition: approx. USD 7,000/year\n- Deadline: Rolling admissions\n\nQuantic School of Business and Technology — MBA\n- Duration: 11 months (accelerated)\n- Tuition: USD 9,600 total\n\n### Information Technology\n\nUniversity of People — BSc Computer Science\n- Duration: 4 years\n- Intake: Every 2 months\n\nGeorgia Tech (USA) — Online Master of Science in Computer Science\n- Duration: 2-3 years\n- Tuition: approx. USD 7,000 total\n\n### Healthcare and Public Health\n\nJohns Hopkins Bloomberg School of Public Health — Online MPH\n- Duration: 2 years part-time\n- Tuition: varies; scholarships available\n\nContact Modern Education Consult at +250 798979720 for enrollment guidance.";
    author = "Modern Education Consult";
    publishedDate = 1_770_336_000_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Online Courses";
  });

  addSeedPost({
    id = 7;
    title = "IELTS vs TOEFL: Which English Test Should You Choose?";
    summary = "Choosing between IELTS and TOEFL? This guide compares both tests across format, scoring, cost, university acceptance, and which one is best suited for your study or work abroad goal in 2026.";
    content = "# IELTS vs TOEFL: Which English Test Should You Choose?\n\nIf you are planning to study or work abroad in an English-speaking country, you will almost certainly need to prove your English proficiency. The two most widely accepted tests are IELTS and TOEFL.\n\n## What Is IELTS?\n\nIELTS is jointly managed by the British Council, IDP: IELTS Australia, and Cambridge Assessment English. It is available in two formats:\n\n- IELTS Academic — For university admissions and professional registration\n- IELTS General Training — For migration and work visas (UK, Canada, Australia)\n\nIELTS uses a 9-band score system. Most universities require 6.0-7.0.\n\n## What Is TOEFL?\n\nTOEFL is developed and administered by ETS, based in the USA. The TOEFL iBT is the standard version. It is scored out of 120.\n\nMost universities require a score of 80-100.\n\n## Key Differences\n\n- IELTS Speaking: Face-to-face with examiner (more natural)\n- TOEFL Speaking: Recorded responses (more formal)\n- IELTS: Accepted for UK, Canada, Australia immigration\n- TOEFL: Preferred by many US universities\n- Both: Accepted by over 10,000 institutions worldwide\n\n## Which Should You Choose?\n\n- Going to the UK, Canada, or Australia? Choose IELTS.\n- Going to the USA? Either works, but TOEFL is more familiar to US admissions offices.\n- Prefer speaking to a real person? Choose IELTS.\n- More comfortable with computers? Choose TOEFL.\n\nModern Education Consult offers IELTS and TOEFL preparation courses. Contact us at +250 798979720.";
    author = "Modern Education Consult";
    publishedDate = 1_770_595_200_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Language Programs";
  });

  addSeedPost({
    id = 8;
    title = "From Kigali to Toronto: Sarah's Success Story";
    summary = "Sarah Uwimana always dreamed of studying in Canada. Read how she went from a small neighbourhood in Kigali to a fully funded Master's program at the University of Toronto — and the exact steps she took.";
    content = "# From Kigali to Toronto: Sarah's Success Story\n\nSarah Uwimana grew up in Remera, Kigali. She had always been an exceptional student — finishing top of her class at secondary school and earning a Bachelor's degree in Public Health from the University of Rwanda with First Class Honours. But like many ambitious Rwandan graduates, she felt stuck.\n\n\"I had the grades, I had the desire, but I had no idea how to actually get to a university abroad,\" Sarah told us.\n\n## The First Step: Reaching Out\n\nIn early 2024, Sarah walked into the Modern Education Consult office in Kigali. She had one goal: study Public Health at a top Canadian university.\n\nOur team sat with her for two hours. We reviewed her academic record, discussed her career goals, and mapped out a realistic plan. Within the first session, we had identified four Canadian universities with strong Public Health programs: University of Toronto, McGill University, University of British Columbia, and Dalhousie University.\n\n## Building Her Application\n\nOver the next three months, Sarah worked closely with our counselors:\n\n- IELTS preparation: Sarah scored 7.5 overall\n- Statement of Purpose: We helped her craft a compelling narrative\n- References: We guided her on approaching professors\n- Mastercard Foundation essay: Sarah's experience running a health education program made this essay powerful\n\n## The Result\n\nSarah was accepted to the University of Toronto with a full Mastercard Foundation scholarship — tuition, accommodation, flights, and living expenses, all covered.\n\n## Sarah's Advice\n\n\"Do not try to do this alone. Modern Education Consult knew the process inside out. They saved me from so many mistakes I would have made on my own. If you have the grades and the ambition, they can help you get there.\"\n\nContact us at +250 798979720 to start your journey.";
    author = "Modern Education Consult";
    publishedDate = 1_772_236_800_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Success Stories";
  });

  addSeedPost({
    id = 9;
    title = "Work in Dubai: Your Complete Guide to Building a Career in the UAE";
    summary = "Dubai is one of the world's most exciting job markets — tax-free salaries, rapid career growth, and a cosmopolitan lifestyle. Here is everything Rwandan and African professionals need to know to secure a job in Dubai in 2026.";
    content = "# Work in Dubai: Your Complete Guide to Building a Career in the UAE\n\nDubai has transformed itself from a desert trading post into a global business hub in just a few decades. Today, it is home to the tallest building on earth, the world's busiest international airport, and one of the most dynamic job markets anywhere.\n\n## Why Work in Dubai?\n\n- Zero income tax — Every dirham you earn is yours to keep\n- High salaries — Dubai salaries are 3-6x higher than equivalent roles in many African countries\n- Career acceleration — A Dubai posting on your CV commands respect globally\n- Multicultural environment — Over 200 nationalities live and work in Dubai\n- World-class infrastructure — Healthcare, transport, schools, and safety standards are exceptional\n- Proximity to Africa — Just 5-7 hours by flight from Kigali\n\n## Top Industries Hiring in Dubai in 2026\n\n### Construction and Real Estate\nDubai's skyline never stops growing. Engineers, project managers, electricians, plumbers, and general laborers are always in demand.\n\nTypical salaries:\n- Civil/Structural Engineer: AED 8,000 to AED 18,000/month\n- Project Manager: AED 15,000 to AED 30,000/month\n- Skilled Tradesperson: AED 2,500 to AED 6,000/month\n\n### Hospitality and Tourism\nDubai welcomed over 17 million tourists in 2026. Five-star hotels, restaurants, and theme parks are constantly hiring.\n\nTypical salaries: AED 2,000 to AED 6,000/month plus accommodation\n\n### Healthcare\nRoles in demand: Registered nurses, general practitioners, dental assistants, physiotherapists\nTypical salaries: AED 6,000 to AED 20,000/month plus housing allowance\n\n### Information Technology\nDubai's smart city ambitions create strong demand for software developers and data analysts.\nTypical salaries: AED 10,000 to AED 30,000/month\n\n## How to Get a Work Visa for Dubai\n\n1. Secure a job offer from a UAE employer\n2. Pass a medical fitness test\n3. Receive your Emirates ID and residence visa stamp\n4. Work permit is valid for 2 years, renewable\n\nContact Modern Education Consult at +250 798979720 for placement support.";
    author = "Modern Education Consult";
    publishedDate = 1_772_496_000_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  });

  addSeedPost({
    id = 10;
    title = "Work in Qatar: Opportunities, Salaries, and How to Get There in 2026";
    summary = "Qatar's booming economy, tax-free salaries, and major infrastructure investments make it one of the best destinations for African professionals in 2026. Here is your complete guide to working in Qatar.";
    content = "# Work in Qatar: Opportunities, Salaries, and How to Get There in 2026\n\nQatar is one of the wealthiest nations per capita on earth, driven by vast natural gas reserves and a bold national vision to become a global hub for business, sport, and culture.\n\n## Why Qatar Is a Top Destination for African Workers in 2026\n\n- Tax-free income — No personal income tax\n- High demand for workers — Continued infrastructure investment post-2022 FIFA World Cup\n- Growing African professional community\n- Competitive packages — Many roles include free accommodation and transport\n- Safety and stability — Qatar is one of the safest countries in the world\n\n## Key Industries Hiring in Qatar in 2026\n\n### Construction and Infrastructure\nCivil engineers, quantity surveyors, site supervisors, skilled tradespeople, general laborers.\n\nTypical salaries:\n- Civil Engineer: QAR 6,000 to QAR 15,000/month\n- Site Supervisor: QAR 4,000 to QAR 8,000/month\n- Skilled Laborer: QAR 800 to QAR 2,500/month plus accommodation\n\n### Oil and Gas\nQatar is the world's largest exporter of liquefied natural gas (LNG). QatarEnergy and its contractors hire petroleum engineers, safety officers, and process technicians.\n\nTypical salaries: QAR 8,000 to QAR 25,000/month\n\n### Healthcare\nRoles in demand: Registered nurses, specialist doctors, physiotherapists, lab technicians\nTypical salaries: QAR 7,000 to QAR 18,000/month plus housing\n\n### Hospitality and Tourism\nRoles in demand: Hotel managers, front desk agents, chefs, housekeeping staff\nTypical salaries: QAR 2,500 to QAR 7,000/month plus accommodation\n\n## How to Apply for a Qatar Work Visa\n\n1. Secure a Job Offer — Apply via LinkedIn, GulfTalent, or through Modern Education Consult\n2. Employer Applies for Your Work Visa — Submit passport copy, academic certificates, work experience letters\n3. Medical and Background Check\n4. Receive Residence Permit (Iqama) upon arrival\n\nProcessing time: 2 to 8 weeks.\n\nContact Modern Education Consult at +250 798979720 to start your Qatar job search today.";
    author = "Modern Education Consult";
    publishedDate = 1_772_755_200_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  });

  addSeedPost({
    id = 11;
    title = "Work in Mauritius: The African Professional's Guide to Island Career Opportunities";
    summary = "Mauritius is rapidly becoming a top destination for African professionals — offering a stable economy, English-speaking environment, visa-friendly policies, and a gateway to global business. Here's everything you need to know.";
    content = "# Work in Mauritius: The African Professional's Guide to Island Career Opportunities\n\nMauritius is far more than a tourist paradise. This small island nation in the Indian Ocean has built one of Africa's most robust economies, with a business-friendly environment and an open immigration policy.\n\n## Why Mauritius Stands Out in 2026\n\n- English and French official languages — Ideal for Rwandans who are bilingual\n- No personal income tax on foreign-sourced income\n- African Union member — Shared development agenda\n- Ease of doing business — Ranked among Africa's top 3 most competitive economies\n- High quality of life — Clean environment, low crime, excellent healthcare\n- Growing ICT sector\n\n## Key Sectors Hiring in Mauritius in 2026\n\n### Financial Services and Banking\nMauritius is a major international financial center. Roles in demand: Fund accountants, compliance officers, AML analysts, tax advisors.\nTypical salaries: MUR 40,000 to MUR 120,000/month\n\n### Information and Communication Technology\nRoles in demand: Software developers, UI/UX designers, data analysts, cybersecurity specialists.\nTypical salaries: MUR 50,000 to MUR 150,000/month\n\n### Tourism and Hospitality\nRoles in demand: Hotel managers, F&B supervisors, guest relations officers.\nTypical salaries: MUR 25,000 to MUR 70,000/month plus accommodation\n\n### Healthcare\nRoles in demand: Specialist doctors, nurses, physiotherapists.\nTypical salaries: MUR 60,000 to MUR 200,000/month\n\n## How to Get a Work Permit in Mauritius\n\nOption 1 — Employer-Sponsored Work Permit: Your employer applies to the Economic Development Board (EDB). Processing time: 3 to 6 weeks.\n\nOption 2 — Premium Visa: For remote workers. Allows you to live in Mauritius for up to 1 year. Requirements: Proof of employment abroad and minimum monthly income of USD 1,500.\n\nOption 3 — Occupation Permit: A combination work and residence permit valid for up to 3 years.\n\nContact Modern Education Consult at +250 798979720 to explore your Mauritius career options.";
    author = "Modern Education Consult";
    publishedDate = 1_773_014_400_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  });

  addSeedPost({
    id = 12;
    title = "Work in Spain: How African Professionals Can Build a Career in Europe's Sunshine Economy";
    summary = "Spain is opening its doors to skilled international workers like never before. With a new digital nomad visa, strong demand in tech and healthcare, and a vibrant quality of life, 2026 is the year to consider Spain as your next career destination.";
    content = "# Work in Spain: How African Professionals Can Build a Career in Europe's Sunshine Economy\n\nSpain is the fourth-largest economy in the Eurozone and one of Europe's most dynamic job markets. Known for its exceptional quality of life, rich culture, and warm climate, Spain is increasingly opening its doors to skilled international workers.\n\n## Why Spain in 2026?\n\n- EU gateway — Working in Spain can open doors to the entire European Union\n- New immigration-friendly policies — Spain's Immigration Reform expanded pathways for skilled workers\n- Digital Nomad Visa — One of Europe's most attractive remote work visas\n- Strong quality of life — World-renowned food, culture, healthcare, and Mediterranean lifestyle\n- Pathway to EU residency — After 5 years of legal residence, you can apply for long-term EU residency\n\n## Key Sectors Hiring in Spain in 2026\n\n### Technology and Startups\nSpain — particularly Madrid and Barcelona — has a booming tech startup ecosystem.\nRoles in demand: Full-stack developers, DevOps engineers, data analysts, UX designers\nTypical salaries: EUR 28,000 to EUR 65,000/year\n\n### Healthcare and Social Services\nSpain faces a significant shortage of healthcare workers.\nRoles in demand: Doctors, registered nurses, physiotherapists, caregivers\nTypical salaries: Nurse EUR 1,800 to EUR 3,000/month; Doctor EUR 3,500 to EUR 6,000/month\n\n### Tourism and Hospitality\nSpain is the second most visited country in the world.\nRoles in demand: Hotel managers, F&B staff, receptionists, tour guides\nTypical salaries: EUR 1,300 to EUR 2,500/month\n\n### Agriculture\nSpain is Europe's fruit and vegetable garden.\nRoles in demand: Fruit pickers, greenhouse workers, agricultural supervisors\nTypical salaries: EUR 1,100 to EUR 1,600/month\n\n## How to Work Legally in Spain\n\nOption 1 — Highly Qualified Worker Visa (EU Blue Card): For professionals with a university degree and a job offer earning above EUR 37,000/year.\n\nOption 2 — Spain Digital Nomad Visa: For remote workers earning at least EUR 2,646/month from foreign clients.\n\nOption 3 — Job Seeker Visa: Allows you to stay in Spain for up to 3 months while searching for work.\n\nContact Modern Education Consult at +250 798979720 to explore your Spain career pathway.";
    author = "Modern Education Consult";
    publishedDate = 1_773_273_600_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  });

  addSeedPost({
    id = 13;
    title = "Work in Germany: How Nsengiyumva Ibasumba Alain Aristide Built a New Life in Europe";
    summary = "From Kigali to Germany — Nsengiyumva Ibasumba Alain Aristide shares his inspiring journey of securing a skilled worker visa, adapting to life in Germany, and building a successful career in one of Europe's strongest economies.";
    content = "# Work in Germany: How Nsengiyumva Ibasumba Alain Aristide Built a New Life in Europe\n\nWhen Nsengiyumva Ibasumba Alain Aristide first walked into the Modern Education Consult office in Kigali, he had a clear goal but no clear path. He had a degree in mechanical engineering, five years of solid work experience, and a burning desire to take his career to the next level.\n\nToday, Alain Aristide is living and working in Stuttgart, Germany, earning the equivalent of over ten times his previous salary.\n\n## Why Germany?\n\nAlain Aristide explains: I chose Germany because it is the engineering capital of the world. Brands like Mercedes-Benz, Bosch, Siemens, and BMW — these are the companies I studied in university.\n\nGermany is the fourth-largest economy in the world with a chronic shortage of over 600,000 skilled workers. The Skilled Immigration Act (Fachkraefteeinwanderungsgesetz) has opened its doors wide to qualified international professionals.\n\n## The Process: Step by Step\n\n### Step 1: Qualification Recognition (Anerkennung)\n\nThe first step is having foreign qualifications officially recognized by the Central Office for Foreign Education (ZAB). Alain Aristide submitted his degree transcripts, translation certificates, and employment history.\n\nTimeline: 3-4 months for recognition approval.\n\n### Step 2: German Language Preparation\n\nMost German employers require at least B1 German, and Alain Aristide aimed higher — achieving B2 level through intensive study.\n\nTimeline: 6-9 months of dedicated study.\n\n### Step 3: Job Search\n\nWith recognition in hand and B2 German achieved, Alain Aristide created a German-format CV (Lebenslauf) and began applying. He received three interview invitations within four weeks.\n\n### Step 4: Skilled Worker Visa\n\nOnce he had a job offer, Modern Education Consult guided him through the Skilled Worker Visa application:\n- Visa application fee: EUR 75\n- Required documents: passport, recognition certificate, employment contract, language certificate, proof of accommodation\n- Processing time: 6-12 weeks\n\n### Step 5: Life in Stuttgart\n\nAlain Aristide now works as a mechanical engineer at a mid-sized manufacturing firm in Stuttgart. His gross salary is EUR 52,000/year.\n\n## Alain Aristide's Advice\n\n\"Start with the language. Everything else — the recognition, the job search, the visa — is manageable if you speak German. Modern Education Consult helped me at every single step. I could not have done this without them.\"\n\nContact Modern Education Consult at +250 798979720 to start your Germany journey today.";
    author = "Modern Education Consult";
    publishedDate = 1_774_915_200_000_000_000;
    imageUrl = "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80";
    category = "Success Stories";
  });

  public shared func submitContact(fullName : Text, phoneNumber : Text, email : Text, countryOfInterest : Text, serviceOfInterest : ?Text, message : Text, preferredContactMethod : ?Text, privacyConsent : Bool, attachedFiles : [FileAttachment]) : async () {
    let timestamp = Time.now();
    let submission : ContactSubmissionV3 = {
      fullName;
      phoneNumber;
      email;
      countryOfInterest;
      serviceOfInterest;
      message;
      timestamp;
      preferredContactMethod;
      privacyConsent;
      attachedFiles;
    };
    contactsMapV3.add(nextContactId, submission);
    nextContactId += 1;
  };

  public query func getAllContacts() : async [(Nat, ContactSubmissionV3)] {
    contactsMapV3.entries().toArray();
  };

  public shared func deleteContact(id : Nat) : async () {
    contactsMapV3.remove(id);
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
      };
    };
  };

  public shared func deleteBlogPost(id : Nat) : async () {
    blogsMap.remove(id);
  };

  public query func getAllBlogPosts() : async [BlogPost] {
    let postsArray = blogsMap.values().toArray();
    postsArray.sort(compareBlogPost);
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
