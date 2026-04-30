import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import WebsiteEditorTypes "types/websiteeditor";
import WebsiteEditorLib "lib/websiteeditor";



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

  // Comment type for the blog comment system.
  // Status matrix:
  //   pending  → approved=false, rejected=false
  //   approved → approved=true,  rejected=false
  //   rejected → approved=false, rejected=true
  type Comment = {
    id : Text;
    postId : Text;
    parentId : ?Text;
    authorName : Text;
    authorEmail : Text;
    content : Text;
    createdAt : Int;
    approved : Bool;
    rejected : Bool;
    edited : Bool;
  };

  func compareBlogPost(a : BlogPost, b : BlogPost) : Order.Order {
    Nat.compare(a.id, b.id);
  };

  // State — enhanced orthogonal persistence: all actor state persists automatically
  // across upgrades without the stable keyword. Do NOT add stable here.
  let blogsMap = Map.empty<Nat, BlogPost>();
  // contactsMap kept for backward compatibility (old type without serviceOfInterest).
  let contactsMap = Map.empty<Nat, OldContactSubmission>();
  // contactsMapV2 kept for backward compatibility (ContactSubmission with serviceOfInterest only).
  let contactsMapV2 = Map.empty<Nat, ContactSubmission>();
  // contactsMapV3 uses ContactSubmissionV3 with preferredContactMethod, privacyConsent, attachedFiles.
  let contactsMapV3 = Map.empty<Nat, ContactSubmissionV3>();
  // commentsMap stores all blog comments keyed by comment id (Text).
  // Migration: if old storage had CommentV1 (without rejected), it is migrated by
  // the platform migration function below, which adds rejected=false to all entries.
  let commentsMap = Map.empty<Text, Comment>();
  var nextBlogPostId : Nat = 1;
  var nextContactId : Nat = 1;
  var nextCommentId : Nat = 1;
  // seedVersion kept for backward-compatibility with existing canister stable memory schema.
  // Seeding is unconditional and idempotent — this value is no longer used as a gate.
  var seedVersion : Nat = 0;
  // Tracks unread application submissions for admin notification badge.
  var unreadApplicationCount : Nat = 0;

  var testimonialsArray : [Testimonial] = [
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

  // Helper: upsert a seed post by title.
  // - If a post with `newTitle` already exists: update its title, summary, content, imageUrl, and category (keeps id, author, publishedDate).
  // - Else if a post with `oldTitle` exists (title is changing): update its title, summary, content, imageUrl, and category.
  // - Else: insert as a brand-new post with the intended id (or nextBlogPostId if that id is taken).
  // `oldTitle` should equal `newTitle` for posts whose titles have not changed.
  // All 14 seed posts use this function for full idempotent upsert on every startup.
  func upsertSeedPost(post : BlogPost, oldTitle : Text) {
    // 1. Try to find by new title
    var foundId : ?Nat = null;
    for ((k, existing) in blogsMap.entries()) {
      if (existing.title == post.title) {
        foundId := ?k;
      };
    };
    switch (foundId) {
      case (?existingId) {
        // Post already exists with new title — update all mutable fields (keep id, author, publishedDate)
        switch (blogsMap.get(existingId)) {
          case (?existing) {
            let updated : BlogPost = {
              existing with
              title = post.title;
              summary = post.summary;
              content = post.content;
              imageUrl = post.imageUrl;
              category = post.category;
            };
            blogsMap.remove(existingId);
            blogsMap.add(existingId, updated);
          };
          case null {};
        };
      };
      case null {
        // 2. Try to find by old title (handles title changes)
        var oldFoundId : ?Nat = null;
        for ((k, existing) in blogsMap.entries()) {
          if (existing.title == oldTitle) {
            oldFoundId := ?k;
          };
        };
        switch (oldFoundId) {
          case (?existingId) {
            // Post exists with old title — update all mutable fields
            switch (blogsMap.get(existingId)) {
              case (?existing) {
                let updated : BlogPost = {
                  existing with
                  title = post.title;
                  summary = post.summary;
                  content = post.content;
                  imageUrl = post.imageUrl;
                  category = post.category;
                };
                blogsMap.remove(existingId);
                blogsMap.add(existingId, updated);
              };
              case null {};
            };
          };
          case null {
            // 3. Post not found at all — insert fresh
            if (blogsMap.get(post.id) == null) {
              blogsMap.add(post.id, post);
              if (post.id >= nextBlogPostId) {
                nextBlogPostId := post.id + 1;
              };
            } else {
              let newPost : BlogPost = { post with id = nextBlogPostId };
              blogsMap.add(nextBlogPostId, newPost);
              nextBlogPostId += 1;
            };
          };
        };
      };
    };
  };

  // Idempotent seeding: runs unconditionally on every canister initialization.
  // upsertSeedPost updates all mutable fields (title, summary, content, imageUrl, category)
  // for any existing post found by title, and inserts if missing. All 14 posts use this function.
  func seedBlogPosts() {

  upsertSeedPost({
    id = 1;
    title = "Your Ultimate Guide to Studying Abroad in 2026";
    summary = "Studying abroad in 2026 opens doors to top universities worldwide. Discover the best countries, scholarships, and how Modern Education Consult can guide your journey.";
    content = "Studying abroad is one of the most transformative decisions you can make. Whether you dream of ivy-league halls in the UK, cutting-edge research labs in Germany, or sun-soaked campuses in Australia, 2026 is the perfect year to take that leap.\n\nWhy Study Abroad?\nA foreign degree opens doors that a local degree simply cannot. Employers worldwide value the adaptability, language skills, and global perspective that international students bring. Beyond career benefits, you gain lifelong friendships, cultural immersion, and personal growth that money cannot buy.\n\nTop Countries for International Students in 2026\nUnited Kingdom - Home to Oxford, Cambridge, and over 130 universities ranked in the global top 1000. Post-study work visa allows 2 years of work experience after graduation.\nCanada - Affordable tuition, multicultural cities, and one of the world's most welcoming immigration pathways. The Post-Graduation Work Permit (PGWP) can lead directly to permanent residency.\nGermany - Free or near-free tuition at public universities, even for international students. Engineering, medicine, and technology programs are world-class.\nAustralia - Top 8 Group of Eight universities, stunning lifestyle, and a straightforward student visa process. Graduate visa allows 2-4 years of work after studies.\nUnited Arab Emirates - Emerging education hub with campuses from NYU, Sorbonne, and other global brands. Tax-free salaries after graduation.\n\nHow to Choose the Right University\n1. Define your goal - Do you want research, industry connections, or immigration pathways?\n2. Check rankings - QS World Rankings and THE Rankings are reliable guides.\n3. Review entry requirements - Most require IELTS 6.0-7.0 or TOEFL 80-100.\n4. Compare costs - Tuition + living costs vary enormously between countries.\n5. Look for scholarships - Many universities offer merit-based aid to international students.\n\nScholarships to Apply For in 2026\n- Chevening Scholarships (UK) - Fully funded, for future leaders\n- DAAD Scholarships (Germany) - Research and full degree programs\n- Vanier Canada Graduate Scholarships - For doctoral students\n- Australia Awards - Full scholarships from the Australian government\n- Mastercard Foundation Scholars Program - For African students\n\nHow Modern Education Consult Can Help\nNavigating applications, visa requirements, and scholarship deadlines alone is overwhelming. Our team at Modern Education Consult has helped hundreds of students from Rwanda and across Africa secure placements in top universities worldwide.\nWe offer free initial consultation, university shortlisting, application and SOP review, visa application support, and pre-departure briefing.\n\nCall us today on +250 798979720 or WhatsApp +250 795780073 to start your journey.";
    author = "Modern Education Consult";
    publishedDate = 1_767_225_600_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Study Abroad";
  }, "Your Ultimate Guide to Studying Abroad in 2026");

  upsertSeedPost({
    id = 2;
    title = "International Job Opportunities in 2026: Your Complete Guide to Working Abroad";
    summary = "The global job market is booming. Discover top countries hiring international workers, step-by-step application guidance, and how Modern Education Consult connects Rwandan professionals worldwide.";
    content = "The global job market is booming and borders are more open than ever for skilled workers. If you have been dreaming of building a career abroad, 2026 offers exceptional opportunities across multiple industries and countries.\n\nWhy Work Abroad in 2026?\n- Higher salaries - Even entry-level roles in UAE, Canada, or Germany pay 3-5x more than equivalent roles in many African countries\n- Career acceleration - International experience puts your CV in a completely different league\n- Immigration pathways - Many countries offer residency or citizenship after a few years of skilled work\n- Quality of life - Access to world-class healthcare, education, and infrastructure\n\nTop Countries Hiring International Workers in 2026\n\nUnited Arab Emirates\nThe UAE remains one of the most accessible destinations for international workers. Construction, hospitality, logistics, healthcare, and technology sectors are all actively recruiting.\nAverage salaries:\n- Construction worker: AED 2,500-5,000/month\n- Nurse/Healthcare: AED 8,000-15,000/month\n- IT Professional: AED 12,000-25,000/month\n\nCanada\nCanada's Express Entry system is designed to attract skilled workers. The country needs over 400,000 new immigrants per year through 2026 to fill labor shortages.\nIn-demand roles: Nurses, engineers, truck drivers, IT specialists, trades workers\n\nUnited Kingdom\nThe UK Skilled Worker Visa allows employers to sponsor international candidates. Healthcare (NHS), tech, and finance are top hiring sectors.\n\nGermany\nGermany faces a shortage of 600,000 skilled workers. The Skilled Immigration Act makes it easier than ever for non-EU nationals to get work visas.\n\nQatar\nPost-World Cup infrastructure projects continue. Construction, hospitality, and logistics workers are in high demand.\n\nStep-by-Step Application Process\n1. Assess your qualifications - Get your certificates verified and translated if needed\n2. Research job boards - LinkedIn, Indeed, Bayt (UAE/Gulf), Job Bank (Canada)\n3. Polish your CV - International CVs differ from local ones; our team can help\n4. Get language certified - IELTS or equivalent is required for most English-speaking countries\n5. Secure a job offer - Many employers sponsor visas once they select you\n6. Apply for your work visa - Processing times vary: UAE 2-4 weeks, Canada 3-6 months, UK 3-8 weeks\n\nHow Modern Education Consult Can Help\nWe specialize in connecting Rwandan and African professionals with legitimate international job opportunities.\n\nContact us today: Phone: +250 798979720 | WhatsApp: +250 795780073\nEmail: moderneducationconsult2026@gmail.com\nOffice: Kigali and Musanze, Rwanda";
    author = "Modern Education Consult";
    publishedDate = 1_767_484_800_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  }, "International Job Opportunities in 2026: Your Complete Guide to Working Abroad");

  upsertSeedPost({
    id = 3;
    title = "Working in the UAE: What Rwandan Professionals Need to Know";
    summary = "The UAE offers tax-free salaries, fast visa processing, and strong demand for skilled workers. Learn everything Rwandan professionals need to know about working in Dubai and Abu Dhabi.";
    content = "The United Arab Emirates — particularly Dubai and Abu Dhabi — has become one of the most sought-after destinations for Rwandan and East African professionals. Tax-free salaries, world-class infrastructure, and a booming economy make it an attractive option for those ready to work abroad.\n\nWhy the UAE?\n- Zero income tax — Your full salary is yours to keep\n- Strong demand for skilled workers — Construction, hospitality, healthcare, logistics, and IT are all actively hiring\n- Fast visa processing — Work visas can be processed in as little as 2-4 weeks\n- East African community — A large and welcoming African community already established in the UAE\n- Gateway to global opportunities — UAE experience on your CV opens doors worldwide\n\nTop Industries Hiring in the UAE in 2026\n\nConstruction & Engineering\nMajor infrastructure projects across Dubai, Abu Dhabi, and the Northern Emirates continue to drive demand. Civil engineers, project managers, electricians, plumbers, and general laborers are in high demand.\nTypical salary range: AED 1,800 - AED 8,000/month depending on role and experience.\n\nHospitality & Tourism\nThe UAE welcomed over 20 million tourists in 2025 and targets more in 2026. Hotels, resorts, restaurants, and airlines hire large numbers of international staff.\nTypical salary range: AED 2,000 - AED 6,000/month plus accommodation and meals.\n\nHealthcare\nNurses, medical assistants, lab technicians, and pharmacists are highly sought after. Many roles come with free housing, flights, and medical insurance.\nTypical salary range: AED 5,000 - AED 18,000/month.\n\nLogistics & Warehousing\nWith Dubai as a global trade hub, logistics companies constantly recruit warehouse staff, drivers, forklift operators, and freight coordinators.\nTypical salary range: AED 1,500 - AED 5,000/month.\n\nHow to Apply for a UAE Work Visa\n1. Secure a job offer — You cannot apply for a UAE work visa without an employer sponsor\n2. Submit documents — Passport, academic certificates, police clearance, medical certificate\n3. Pass medical exam — Required for all UAE work visas\n4. Receive your visa — Employment visa stamped in your passport\n5. Emirates ID — Issued on arrival, required for all official transactions\n\nImportant Tips for Rwandan Professionals\n- Always use verified recruitment agencies — scams targeting Africans are common\n- Ensure your contract is signed and stamped before you travel\n- Never pay for a job — Legitimate employers do not charge placement fees\n- Learn basic Arabic phrases — it goes a long way in daily life\n- Respect local customs — dress modestly in public spaces\n\nHow Modern Education Consult Can Help\nWe connect Rwandan professionals with verified, legitimate employers in the UAE. Our team handles everything from CV preparation and document verification to visa application and pre-departure briefing.\n\nContact us: Phone: +250 798979720 | WhatsApp: +250 795780073\nEmail: moderneducationconsult2026@gmail.com\nOffices: Kigali and Musanze, Rwanda";
    author = "Modern Education Consult";
    publishedDate = 1_767_744_000_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  }, "Working in the UAE: What Rwandan Professionals Need to Know");

  upsertSeedPost({
    id = 4;
    title = "How to Apply for a Canadian Study Permit in 2026";
    summary = "Canada offers world-class universities and a clear pathway to permanent residency. Follow this step-by-step guide to apply for your Canadian Study Permit in 2026.";
    content = "Canada remains one of the top destinations for international students, offering world-class universities, diverse cities, and a clear pathway to permanent residency. But before you can study in Canada, you need a Study Permit. This guide walks you through every step of the process.\n\nWhat Is a Canadian Study Permit?\nA Study Permit is a document issued by Immigration, Refugees and Citizenship Canada (IRCC) that allows foreign nationals to study at a Designated Learning Institution (DLI) in Canada. Most programs longer than 6 months require a study permit.\n\nStep-by-Step Application Process\n\nStep 1: Get Your Letter of Acceptance\nYou must first be accepted by a Designated Learning Institution (DLI). Apply to your chosen university or college and obtain your official acceptance letter before applying for the permit.\n\nStep 2: Gather Required Documents\n- Valid passport (at least 6 months beyond your intended stay)\n- Letter of Acceptance from a DLI\n- Proof of financial support (tuition + CAD 10,000/year for living expenses)\n- Passport-sized photos\n- Statement of Purpose (SOP) — Why you want to study in Canada\n- Academic transcripts and certificates\n- English proficiency test (IELTS 6.0+ or TOEFL 80+)\n- Police clearance certificate\n- Medical exam (if required for your country)\n\nStep 3: Create an IRCC Online Account\nGo to the official IRCC website (canada.ca) and create your account. All applications are now submitted online.\n\nStep 4: Complete the Application Form\nFill in the IMM 1294 form (Application for a Study Permit). Be honest and accurate — any inconsistency can lead to rejection.\n\nStep 5: Pay the Application Fee\nThe study permit application fee is CAD 150 (approximately USD 110). Pay online via credit/debit card.\n\nStep 6: Submit Biometrics\nFirst-time applicants from Rwanda must provide biometrics (fingerprints and photo) at a Visa Application Centre. The fee is CAD 85.\n\nStep 7: Attend the Interview (If Required)\nSome applicants are called for an interview at the Canadian High Commission. Be prepared to explain your study plans, funding sources, and ties to Rwanda.\n\nStep 8: Wait for a Decision\nProcessing times vary. Check the IRCC website for current wait times — typically 4-12 weeks for online applications.\n\nCommon Reasons for Study Permit Rejection\n- Insufficient proof of funds\n- Weak Statement of Purpose\n- Lack of ties to home country\n- Incomplete documentation\n- Criminal record or failed medical exam\n\nPost-Graduation Work Permit (PGWP)\nAfter completing your studies, you can apply for a Post-Graduation Work Permit (PGWP) valid for up to 3 years. This can be a stepping stone to Canadian Permanent Residency through Express Entry.\n\nHow Modern Education Consult Can Help\nOur team guides you through every step — from choosing the right Canadian university and writing your SOP to preparing your financial documents and submitting your visa application.\n\nContact us today: Phone: +250 798979720 | WhatsApp: +250 795780073\nEmail: moderneducationconsult2026@gmail.com\nOffices: Kigali and Musanze, Rwanda";
    author = "Modern Education Consult";
    publishedDate = 1_769_817_600_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Application Guides";
  }, "How to Apply for a Canadian Study Permit in 2026");

  upsertSeedPost({
    id = 5;
    title = "Top 5 Scholarships for African Students Studying Abroad in 2026";
    summary = "Dozens of prestigious scholarships are specifically designed for African applicants. Here are the top 5 you should apply for in 2026, with expert tips on how to win them.";
    content = "Financing an international education is one of the biggest concerns for African students. The good news is that dozens of prestigious scholarships are specifically designed for African applicants. Here are the top 5 you should be applying for in 2026.\n\n1. Mastercard Foundation Scholars Program\nCoverage: Fully funded — tuition, living expenses, flights, health insurance\nPartner Universities: University of Toronto, McGill, Edinburgh, UC Berkeley, and more\nEligibility: African students with academic excellence and demonstrated leadership\nFocus: Scholars are expected to return and contribute to Africa after graduation\nTip: The Mastercard Foundation looks for community leaders, not just academic achievers. Document your community work carefully.\n\n2. Chevening Scholarships (UK)\nCoverage: Fully funded — tuition, living allowance, flights, visa fees\nCountry: United Kingdom\nEligibility: Citizens of eligible countries (Rwanda included) with 2+ years work experience\nDegree Level: One-year Master's degree\nDeadline: Typically November each year for the following academic year.\nTip: Chevening values leadership and networking potential. Your essays should show how you plan to use your UK education to lead change back home.\n\n3. DAAD Scholarships (Germany)\nCoverage: Monthly stipend, travel allowance, health insurance\nCountry: Germany\nEligibility: Recent graduates and young professionals from developing countries\nPrograms: Masters and PhD research programs\nWhy Germany: Public university tuition is free or very low even without the scholarship — the DAAD covers your living costs.\nTip: A strong research proposal and connection with a German supervisor significantly increases your chances.\n\n4. Australia Awards Scholarships\nCoverage: Fully funded — tuition, living costs, flights, health cover\nCountry: Australia\nEligibility: Citizens of participating developing countries (Rwanda included)\nPrograms: Undergraduate and postgraduate degrees\nDeadline: Typically April-May each year for the following year intake.\nTip: Australia Awards favors applicants who work in government, NGOs, or development sectors. Show how your studies will contribute to Rwanda's development.\n\n5. Erasmus Mundus Joint Masters (EMJM)\nCoverage: Fully funded — tuition across multiple EU countries, monthly allowance, travel\nCountry: European Union (you study in 2-3 countries)\nEligibility: Open to all nationalities; highly competitive\nPrograms: Joint Master's degrees across multiple top EU universities\nTip: Erasmus Mundus is extremely competitive. Apply to multiple programs and make your motivation letter exceptional.\n\nGeneral Tips for Scholarship Applications\n1. Start early — most deadlines are 6-12 months before the program starts\n2. Get strong academic references — from lecturers who know your work well\n3. Write honest, specific personal statements\n4. Show community impact, not just grades\n5. Apply to multiple scholarships simultaneously\n\nHow Modern Education Consult Can Help\nWe help you identify the right scholarships, prepare compelling applications, and submit everything before deadlines.\n\nContact us: Phone: +250 798979720 | WhatsApp: +250 795780073\nEmail: moderneducationconsult2026@gmail.com\nOffices: Kigali and Musanze, Rwanda";
    author = "Modern Education Consult";
    publishedDate = 1_770_076_800_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Scholarships";
  }, "Top 5 Scholarships for African Students Studying Abroad in 2026");

  upsertSeedPost({
    id = 6;
    title = "New Intake: Online Degree Programs Opening for 2026 Enrollment";
    summary = "Earn internationally recognized qualifications without leaving Rwanda. Applications are now open for our 2026 online degree programs in Business, Data Science, Digital Marketing, and more.";
    content = "We are excited to announce new online degree program intakes for the 2026 academic year. These programs are designed for working professionals and recent graduates who want to earn internationally recognized qualifications without leaving Rwanda.\n\nAvailable Programs: Business Administration (MBA), Data science, Digital marketing, Business Management, and Hospitality management.\n\nAll programs are fully accredited by their respective institutions and recognized by the Rwanda Higher Education Council.\n\nApplications are now open. Spots are limited, and priority is given to early applicants. Financial support options, including installment payment plans, are available.\n\nVisit our Online Degree Programs page or contact us directly to begin your application. Our academic advisors are ready to help you choose the right program.";
    author = "Modern Education Consult";
    publishedDate = 1_770_336_000_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Online Courses";
  }, "New Intake: Online Degree Programs Opening for 2026 Enrollment");

  upsertSeedPost({
    id = 7;
    title = "IELTS vs TOEFL vs Duolingo: Which English Language Test Should You Choose?";
    summary = "Choosing between IELTS, TOEFL, and Duolingo? This complete comparison covers features, costs, acceptance, and which test best suits your goals for study, work, or immigration.";
    content = "If you're planning to study, work, or immigrate abroad, proving your English language proficiency is often a key requirement. Three of the most recognized English tests are IELTS, TOEFL, and Duolingo English Test. Each test has unique features, benefits, and requirements. Choosing the right one depends on your goals, destination country, budget, and preferred testing style.\n\n1. IELTS (International English Language Testing System)\nIELTS is one of the most widely accepted English language tests worldwide. It is commonly required for study, work, and immigration purposes.\n\nKey Features:\n- Available in two versions: Academic and General Training\n- Accepted in countries like the UK, Canada, Australia, New Zealand, and many European institutions\n- Tests four skills: Listening, Reading, Writing, and Speaking\n- Speaking section is conducted face-to-face with an examiner\n\nDuration: Approximately 2 hours 45 minutes\n\nBest For:\n- Study abroad applications\n- Immigration (especially Canada, UK, Australia)\n- Candidates who prefer human interaction in speaking tests\n\nAdvantages:\n- Highly recognized globally\n- Flexible for academic and immigration purposes\n- Multiple test dates available\n\n2. TOEFL (Test of English as a Foreign Language)\nTOEFL is widely accepted, especially by universities in the United States and Canada. It is entirely computer-based and focuses on academic English.\n\nKey Features:\n- Internet-based test (TOEFL iBT)\n- Accepted by thousands of universities worldwide\n- Tests Listening, Reading, Writing, and Speaking\n- Speaking section recorded via microphone\n\nDuration: Approximately 2 hours\n\nBest For:\n- Students applying to US and Canadian universities\n- Candidates comfortable with computer-based testing\n- Academic-focused English evaluation\n\nAdvantages:\n- Fully online format\n- Faster results (usually within 4-8 days)\n- Strong academic recognition\n\n3. Duolingo English Test\nThe Duolingo English Test is a newer, more flexible, and affordable option. Many universities now accept it as an alternative to IELTS or TOEFL.\n\nKey Features:\n- Fully online test taken from home\n- Adaptive test (questions adjust to your level)\n- Tests Reading, Writing, Listening, and Speaking\n- Includes video interview and writing sample\n\nDuration: About 1 hour\n\nBest For:\n- Students needing a quick and affordable option\n- Applicants with limited access to test centers\n- Last-minute application deadlines\n\nAdvantages:\n- Lower cost compared to IELTS and TOEFL\n- Quick results (within 48 hours)\n- Convenient at-home testing\n\nComparison Overview\nFeature | IELTS | TOEFL | Duolingo\nTest Format | Paper/Computer | Computer-based | Online from home\nDuration | ~2h 45min | ~2h | ~1h\nSpeaking | Face-to-face | Recorded | Recorded\nResults Time | 3-13 days | 4-8 days | 48 hours\nCost | Higher | Higher | Lower\nAcceptance | Very wide | Very wide | Growing\n\nWhich Test Should You Choose?\n\nChoose IELTS if:\n- You are applying for immigration\n- Your institution specifically requires IELTS\n- You prefer face-to-face speaking\n\nChoose TOEFL if:\n- You are applying to US universities\n- You prefer computer-based testing\n- You are comfortable speaking into a microphone\n\nChoose Duolingo if:\n- You need a quick and affordable option\n- Your institution accepts Duolingo\n- You want to test from home\n\nFinal Thoughts\nAll three tests — IELTS, TOEFL, and Duolingo — are valuable and widely accepted. The best choice depends on your destination country, timeline, budget, and personal preference. Always check your university or immigration requirements before deciding.\n\nNeed help choosing the right English test? Our team is ready to guide you and support your study abroad journey professionally. Contact us today for expert assistance.";
    author = "Modern Education Consult";
    publishedDate = 1_770_595_200_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Language Programs";
  }, "IELTS vs TOEFL: Which English Test Should You Choose?");

  upsertSeedPost({
    id = 8;
    title = "From Kigali to Toronto: Sarah's Success Story";
    summary = "Sarah Uwimana dreamed of studying computer science abroad. Discover how Modern Education Consult guided her to a University of Toronto offer with a 70% scholarship.";
    content = "Sarah Uwimana always dreamed of studying computer science abroad. When she first approached Modern Education Consult, she was unsure which university to apply to or how to strengthen her application.\n\nOur team worked with Sarah to identify her strengths, prepare a compelling personal statement, and target universities that matched her academic profile and financial situation. We identified scholarship opportunities and helped her craft applications that highlighted her exceptional potential.\n\nThree months later, Sarah received an offer from the University of Toronto along with a significant scholarship covering 70% of her tuition. Today, she is thriving in her second year, with plans to intern at a leading tech company.\n\n'Modern Education Consult changed my life,' Sarah says. 'They believed in me when I was unsure, and guided me every step of the way.'\n\nIf Sarah's story resonates with you, reach out to us today. Your journey could be next.";
    author = "Modern Education Consult";
    publishedDate = 1_772_236_800_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_5.09.53_pm-019d1b4c-dcc6-760f-ae6c-133c88423003-1.jpeg";
    category = "Success Stories";
  }, "From Kigali to Toronto: Sarah's Success Story");

  upsertSeedPost({
    id = 9;
    title = "Work in Dubai: Your Complete Guide to Building a Career in the UAE";
    summary = "Dubai offers zero income tax, high salaries, and exceptional career opportunities. This complete guide covers top industries, visa steps, salary ranges, and tips for Rwandan professionals.";
    content = "Dubai has transformed itself from a desert trading post into a global business hub in just a few decades. Today, it is home to the tallest building on earth, the world's busiest international airport, and one of the most dynamic job markets anywhere. For ambitious professionals from Rwanda and across Africa, Dubai represents a genuine gateway to a better career and a higher standard of living.\n\nWhy Work in Dubai?\n- Zero income tax — Every dirham you earn is yours to keep\n- High salaries — Dubai salaries are 3-6x higher than equivalent roles in many African countries\n- Career acceleration — A Dubai posting on your CV commands respect globally\n- Multicultural environment — Over 200 nationalities live and work in Dubai; Africans are a well-established community\n- World-class infrastructure — Healthcare, transport, schools, and safety standards are exceptional\n- Proximity to Africa — Just 5-7 hours by flight from Kigali, making home visits easy\n\nTop Industries Hiring in Dubai in 2026\n\nConstruction & Real Estate\nDubai's skyline never stops growing. The Expo City district, new metro lines, and luxury residential developments all require engineers, project managers, electricians, plumbers, surveyors, and general laborers.\nTypical salaries:\n- Civil/Structural Engineer: AED 8,000 - AED 18,000/month\n- Project Manager: AED 15,000 - AED 30,000/month\n- Skilled Tradesperson (electrician, plumber): AED 2,500 - AED 6,000/month\n- General Laborer: AED 1,000 - AED 2,000/month + accommodation\n\nHospitality & Tourism\nDubai welcomed over 17 million tourists in 2025 and is targeting 25 million by 2027. Five-star hotels, world-class restaurants, cruise terminals, and theme parks are constantly hiring.\nRoles in demand: Guest relations officers, F&B staff, chefs, housekeeping supervisors, concierge staff\nTypical salaries: AED 2,000 - AED 6,000/month + accommodation + meals + service charge\n\nHealthcare\nDubai Health Authority (DHA) and private hospital groups are aggressively recruiting international healthcare professionals.\nRoles in demand: Registered nurses, general practitioners, dental assistants, physiotherapists, medical lab technicians\nTypical salaries: AED 6,000 - AED 20,000/month + housing allowance + flight tickets\n\nInformation Technology\nDubai's smart city ambitions and a growing fintech sector create strong demand for software developers, cybersecurity experts, data analysts, and IT support specialists.\nTypical salaries: AED 10,000 - AED 30,000/month depending on seniority\n\nRetail & Customer Service\nDubai Mall is the world's largest shopping center. Retail chains, luxury brands, and e-commerce platforms hire large customer service and sales teams.\nTypical salaries: AED 2,000 - AED 5,000/month + commission\n\nHow to Get a Work Visa for Dubai\nDubai work visas are employer-sponsored, meaning you need a job offer before applying.\n\nStep 1 — Secure a job offer\nUse LinkedIn, Bayt.com, GulfTalent, or work with a licensed recruitment agency like Modern Education Consult.\n\nStep 2 — Medical fitness test\nAll Dubai work visa applicants must pass a medical exam (blood test, chest X-ray) — this is done in the UAE after arrival on a visit or employment entry visa.\n\nStep 3 — Emirates ID\nOnce medical clearance is received, your employer processes your Emirates ID and residence visa stamp.\n\nStep 4 — Work permit issued\nYour work permit is tied to your employer via the Ministry of Human Resources and Emiratisation (MOHRE).\nProcessing time: 2-6 weeks from job offer to visa stamp.\n\nKey Tips for Rwandan Professionals\n1. Never pay a placement fee — Legitimate Dubai employers do not charge workers for jobs. Walk away from any agency that asks for upfront payment.\n2. Read your contract carefully — Ensure salary, accommodation terms, working hours, and annual leave are specified in writing before you travel.\n3. Check GDRFA and MOHRE status — Once in Dubai, verify your work permit is registered with official UAE government portals.\n4. Build an Arabic vocabulary — Even 20-30 basic phrases will set you apart from other international applicants.\n5. Respect local laws and customs — Dubai is modern and open, but public behavior standards and dress codes apply.\n\nDubai vs. Abu Dhabi: Which Should You Target?\nBoth are excellent options. Dubai is more commercial, cosmopolitan, and diverse — ideal for hospitality, retail, and private sector roles. Abu Dhabi has more government-linked companies, oil & gas sector jobs, and slightly higher average salaries for professional roles. We can help you identify which emirate is best suited to your profession.\n\nHow Modern Education Consult Can Help\nWe specialize in connecting Rwandan and African professionals with verified, legitimate employers in Dubai and across the UAE. We handle:\n- CV preparation tailored for the Gulf market\n- Document verification and attestation\n- Interview coaching\n- Job placement support\n- Visa application guidance\n- Pre-departure orientation\n\nContact us today: Phone: +250 798979720 | WhatsApp: +250 795780073\nEmail: moderneducationconsult2026@gmail.com\nOffices: Kigali and Musanze, Rwanda";
    author = "Modern Education Consult";
    publishedDate = 1_772_496_000_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  }, "Work in Dubai: Your Complete Guide to Building a Career in the UAE");

  upsertSeedPost({
    id = 10;
    title = "Work in Qatar: Opportunities, Salaries, and How to Get There in 2026";
    summary = "Qatar offers tax-free income, competitive packages, and continued infrastructure investment. Discover the top sectors, salary ranges, visa process, and workers' rights for professionals in 2026.";
    content = "Qatar is one of the wealthiest nations per capita on earth, driven by vast natural gas reserves and a bold national vision to become a global hub for business, sport, and culture. The country is investing billions in infrastructure, healthcare, education, and tourism — and it needs talented international workers to make that vision a reality.\n\nWhy Qatar Is a Top Destination for African Workers in 2026\n- Tax-free income — No personal income tax whatsoever\n- High demand for workers — Continued infrastructure investment post-2022 FIFA World Cup\n- Growing African professional community — Rwandans, Ugandans, Kenyans, Nigerians, and others are well-established\n- Competitive packages — Many roles include free accommodation, transport, and annual flight tickets\n- Safety and stability — Qatar is one of the safest countries in the world\n- Strategic location — Qatar Airways connects Doha to over 160 destinations globally\n\nKey Industries Hiring in Qatar in 2026\n\nConstruction & Infrastructure\nDespite the World Cup being complete, Qatar is still building. The Lusail City expansion, new metro lines, healthcare facilities, and tourism infrastructure require thousands of workers.\nRoles in demand: Civil engineers, quantity surveyors, MEP engineers, site supervisors, skilled tradespeople, general laborers\nTypical salaries:\n- Civil Engineer: QAR 6,000 - QAR 15,000/month\n- Site Supervisor: QAR 4,000 - QAR 8,000/month\n- Skilled Laborer: QAR 800 - QAR 2,500/month + accommodation + meals\n\nOil & Gas\nQatar is the world's largest exporter of liquefied natural gas (LNG). QatarEnergy and its contractors constantly hire technical professionals.\nRoles in demand: Petroleum engineers, safety officers, process technicians, instrument technicians, logistics coordinators\nTypical salaries: QAR 8,000 - QAR 25,000/month depending on specialty\n\nHealthcare\nHamad Medical Corporation (HMC) and the expanding private healthcare sector in Qatar are actively recruiting internationally trained professionals.\nRoles in demand: Registered nurses, specialist doctors, physiotherapists, lab technicians, radiographers\nTypical salaries: QAR 7,000 - QAR 18,000/month + housing + flight tickets\n\nHospitality & Tourism\nQatar's National Tourism Council targets 6 million visitors per year by 2030. Luxury hotels, Katara Cultural Village, and Lusail Boulevard are all expanding hospitality operations.\nRoles in demand: Hotel managers, front desk agents, F&B supervisors, chefs, housekeeping staff\nTypical salaries: QAR 2,500 - QAR 7,000/month + accommodation\n\nEducation\nQatar's Education City hosts branches of Georgetown, Cornell, Northwestern, and other global universities. There is strong demand for qualified teachers and education administrators.\nRoles in demand: Secondary school teachers (STEM subjects), university lecturers, curriculum developers\nTypical salaries: QAR 8,000 - QAR 18,000/month + housing + school fees for children\n\nHow to Apply for a Qatar Work Visa\n\nStep 1 — Secure a Job Offer\nYou must have an employer sponsor to work legally in Qatar. Apply via LinkedIn, GulfTalent, or through Modern Education Consult's placement service.\n\nStep 2 — Employer Applies for Your Work Visa\nYour employer submits your documents to the Ministry of Interior (MOI). Required documents: passport copy, academic certificates, work experience letters.\n\nStep 3 — Medical and Background Check\nYou will be required to pass a medical exam and provide a police clearance certificate.\n\nStep 4 — Residence Permit (Qatar ID)\nUpon arrival, your employer processes your Residence Permit (Iqama) — this is your legal identity document in Qatar.\nProcessing time: 2-8 weeks.\n\nWorkers' Rights in Qatar\nQatar has recently made significant labor law reforms:\n- Minimum wage: QAR 1,000/month + accommodation and food allowances\n- Workers can now change jobs without employer permission (end of the old kafala system restriction)\n- All workers must receive salaries through the Wage Protection System (WPS)\n- Rest periods during extreme heat (outdoor work restricted June-September midday)\n\nPractical Tips for Rwandan Professionals\n1. Verify your employer — Check the Ministry of Interior employer portal before traveling\n2. Understand your contract — Ensure salary, benefits, and job role match exactly what was promised\n3. Never pay a placement fee — Legitimate Qatari employers do not charge workers\n4. Register with Rwanda's Embassy in Qatar — For safety and consular support\n5. Learn basic Arabic greetings — It is appreciated by Qatari colleagues and managers\n\nHow Modern Education Consult Can Help\nWe connect Rwandan professionals with verified employers in Qatar and handle the full process from CV preparation to pre-departure orientation.\n\nContact us: Phone: +250 798979720 | WhatsApp: +250 795780073\nEmail: moderneducationconsult2026@gmail.com\nOffices: Kigali and Musanze, Rwanda";
    author = "Modern Education Consult";
    publishedDate = 1_772_755_200_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  }, "Work in Qatar: Opportunities, Salaries, and How to Get There in 2026");

  upsertSeedPost({
    id = 11;
    title = "Work in Mauritius: The African Professional's Guide to Island Career Opportunities";
    summary = "Mauritius combines a strong economy with English and French as official languages — ideal for Rwandan professionals. Discover top sectors, work permit options, and how to build your career on the island.";
    content = "Mauritius is far more than a tourist paradise. This small island nation in the Indian Ocean has built one of Africa's most robust economies, with a business-friendly environment, political stability, and an open immigration policy that makes it an increasingly attractive destination for professionals from Rwanda and across the continent.\n\nWhy Mauritius Stands Out in 2026\n- English and French official languages — Ideal for Rwandans who are bilingual\n- No personal income tax on foreign-sourced income — Favorable tax regime\n- African Union member — Shared development agenda with the rest of the continent\n- Ease of doing business — Ranked among Africa's top 3 most competitive economies\n- Gateway to global markets — Strong financial services and international business sector\n- High quality of life — Clean environment, low crime, excellent healthcare\n- Growing ICT sector — Government strategy to become Africa's leading tech hub\n\nKey Sectors Hiring in Mauritius in 2026\n\nFinancial Services & Banking\nMauritius is a major international financial center, home to hundreds of global investment funds, private equity firms, and management companies.\nRoles in demand: Fund accountants, compliance officers, AML analysts, tax advisors, corporate secretaries\nTypical salaries: MUR 40,000 - MUR 120,000/month (approximately USD 900 - USD 2,700)\n\nInformation & Communication Technology (ICT)\nThe Mauritius government is investing heavily in its ICT sector. Ebene Cyber City is a growing tech hub with both local and international companies.\nRoles in demand: Software developers, UI/UX designers, data analysts, cybersecurity specialists, project managers\nTypical salaries: MUR 50,000 - MUR 150,000/month\n\nTourism & Hospitality\nMauritius attracts over 1.3 million tourists annually. Luxury resorts — many of which are global brands — hire internationally trained hospitality professionals.\nRoles in demand: Hotel managers, F&B supervisors, guest relations officers, spa therapists, chefs\nTypical salaries: MUR 25,000 - MUR 70,000/month + accommodation\n\nHealthcare\nWith growing medical tourism and a public healthcare system under expansion, Mauritius needs qualified medical professionals.\nRoles in demand: Specialist doctors, nurses, physiotherapists, medical technicians\nTypical salaries: MUR 60,000 - MUR 200,000/month depending on specialty\n\nEducation\nInternational schools and private universities are growing rapidly in Mauritius, creating demand for qualified teachers and academic professionals.\nRoles in demand: Secondary teachers (STEM and languages), university lecturers, curriculum designers\nTypical salaries: MUR 35,000 - MUR 90,000/month\n\nHow to Get a Work Permit in Mauritius\nMauritius has one of the most streamlined work permit systems in Africa.\n\nOption 1 — Employer-Sponsored Work Permit\n- Your employer in Mauritius applies to the Economic Development Board (EDB)\n- Processing time: 3-6 weeks\n- Minimum salary threshold: MUR 30,000/month for most professional categories\n\nOption 2 — Premium Visa (for remote workers and professionals)\n- Allows you to live and work remotely in Mauritius for up to 1 year\n- Renewable annually\n- Requirements: Proof of employment abroad and minimum monthly income of USD 1,500\n\nOption 3 — Occupation Permit (for investors, professionals, and self-employed)\n- A combination work and residence permit\n- Valid for up to 3 years, renewable\n- Professional category requires a job offer with minimum MUR 30,000/month salary\n\nWhy Mauritius Is Ideal for Rwandan Professionals\nRwandans have a natural advantage in Mauritius:\n- Language compatibility — French and English are both official languages of Rwanda and Mauritius\n- Cultural familiarity — Shared African identity and values\n- Direct flights — Mauritius Airlines connects Kigali and Mauritius regularly\n- COMESA membership — Both countries are members, facilitating trade and professional mobility\n- No visa required for short visits — Rwandan passport holders can visit Mauritius visa-free\n\nPractical Tips\n1. Research cost of living — While salaries are lower than Gulf countries, the cost of living in Mauritius is also significantly lower\n2. Check professional certifications — Ensure your qualifications are recognized by Mauritius authorities\n3. Build a local network — The Mauritius professional community is small and relationship-driven\n4. Learn French — Even basic French greatly expands your job opportunities\n5. Use LinkedIn — Many Mauritius-based companies post internationally on LinkedIn\n\nHow Modern Education Consult Can Help\nWe assist Rwandan professionals in identifying job opportunities in Mauritius, preparing targeted CVs for the Mauritian market, and guiding you through the occupation permit or work permit process.\n\nContact us today: Phone: +250 798979720 | WhatsApp: +250 795780073\nEmail: moderneducationconsult2026@gmail.com\nOffices: Kigali and Musanze, Rwanda";
    author = "Modern Education Consult";
    publishedDate = 1_773_014_400_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  }, "Work in Mauritius: The African Professional's Guide to Island Career Opportunities");

  upsertSeedPost({
    id = 12;
    title = "Work in Spain: How African Professionals Can Build a Career in Europe's Sunshine Economy";
    summary = "Spain is Europe's gateway for skilled international workers. Explore top hiring sectors, visa options, salary ranges, language tips, and how African professionals can build a career in Spain in 2026.";
    content = "Spain is the fourth-largest economy in the Eurozone and one of Europe's most dynamic job markets. Known for its exceptional quality of life, rich culture, and warm climate, Spain is increasingly opening its doors to skilled international workers — including professionals from Africa who are ready to contribute to Europe's growing economy.\n\nWhy Spain in 2026?\n- EU gateway — Working in Spain can open doors to the entire European Union\n- New immigration-friendly policies — Spain's 2022 Immigration Reform expanded pathways for skilled workers\n- Digital Nomad Visa — One of Europe's most attractive remote work visas\n- Strong quality of life — World-renowned food, culture, healthcare, and Mediterranean lifestyle\n- Large African diaspora — Established Moroccan, Senegalese, and sub-Saharan African communities\n- Growing sectors — Tech, healthcare, tourism, and agriculture all have significant labor shortages\n- Pathway to EU residency — After 5 years of legal residence, you can apply for long-term EU residency\n\nKey Sectors Hiring in Spain in 2026\n\nTechnology & Startups\nSpain — particularly Madrid and Barcelona — has a booming tech startup ecosystem. Spanish tech companies and international firms with Spanish offices are actively hiring software engineers, data scientists, and product managers.\nRoles in demand: Full-stack developers, DevOps engineers, data analysts, UX designers, cybersecurity professionals\nTypical salaries: EUR 28,000 - EUR 65,000/year (EUR 2,300 - EUR 5,400/month)\n\nHealthcare & Social Services\nSpain faces a significant shortage of healthcare workers, particularly in rural regions. The Spanish National Health System (SNS) actively recruits internationally trained doctors and nurses.\nRoles in demand: Doctors (GPs and specialists), registered nurses, physiotherapists, social workers, nursing home caregivers\nTypical salaries:\n- Doctor: EUR 3,500 - EUR 6,000/month\n- Nurse: EUR 1,800 - EUR 3,000/month\n- Caregiver: EUR 1,200 - EUR 1,800/month\n\nTourism & Hospitality\nSpain is the second most visited country in the world, receiving over 85 million tourists in 2025. The Balearic Islands, Costa del Sol, Barcelona, and Madrid all have year-round hospitality demand.\nRoles in demand: Hotel managers, F&B staff, receptionists, tour guides, chefs\nTypical salaries: EUR 1,300 - EUR 2,500/month (higher in luxury properties)\n\nAgriculture\nSpain is Europe's fruit and vegetable garden. Seasonal and permanent agricultural workers are in high demand, particularly in Andalusia, Murcia, and Catalonia.\nRoles in demand: Fruit pickers, greenhouse workers, agricultural supervisors, quality control inspectors\nTypical salaries: EUR 1,100 - EUR 1,600/month (accommodation often provided)\n\nConstruction\nSpain's housing market is recovering strongly after years of underbuilding. Infrastructure projects in renewable energy and urban renewal are driving construction hiring.\nRoles in demand: Civil engineers, project managers, electricians, plumbers, construction laborers\nTypical salaries: EUR 1,400 - EUR 3,500/month\n\nHow to Work Legally in Spain\n\nOption 1 — Highly Qualified Worker Visa (EU Blue Card)\nDesigned for professionals with a university degree and a job offer earning above EUR 37,000/year.\n- Valid for 1-4 years, renewable\n- Allows family reunification\n- Pathway to EU long-term residency\n\nOption 2 — Spain Digital Nomad Visa\nLaunched in 2023, this allows remote workers and freelancers to live in Spain while working for clients outside Spain.\n- Minimum monthly income: EUR 2,646 (200% of minimum wage)\n- Valid for 1 year, renewable up to 5 years\n- Favorable 15% flat tax rate for the first 5 years (Beckham Law)\n\nOption 3 — Employer-Sponsored Work Visa\nFor workers with a specific job offer from a Spanish employer. The employer initiates the process with Spain's State Public Employment Service (SEPE).\n\nOption 4 — Seasonal Work Visa\nFor agricultural and tourism workers needed for specific seasons — typically 6-9 months, renewable.\n\nLanguage Requirements\nSpanish (Castellano) is essential for most roles in Spain. We recommend reaching at least B1-B2 level (intermediate) before applying. However, in tech and international companies in Madrid and Barcelona, English is often sufficient.\nRwandans who speak French have an advantage — French is mutually intelligible with Spanish to a significant degree, making learning Spanish much faster.\n\nPractical Tips for Rwandan Professionals\n1. Learn Spanish — Even A2-B1 level Spanish dramatically increases your job opportunities\n2. Get your documents apostilled — Rwandan educational certificates must be officially recognized in Spain\n3. Use LinkedIn Spain — Infojobs.net and LinkedIn are the primary job portals in Spain\n4. Understand the Spanish work culture — Spain values relationships and trust; professional networking matters\n5. Know your rights — Spain has strong labor protections; join a trade union if needed\n6. Check NIE requirements — All foreigners working in Spain need a Foreigner Identification Number (NIE)\n\nSpain vs. Other European Destinations\nCompared to Germany or the Netherlands, Spain offers a lower cost of living, easier entry for non-EU workers, warmer climate, and a more relaxed pace of life. Salaries are lower than Northern Europe, but so is the cost of housing, food, and daily life. For many African professionals, Spain offers the best quality-of-life-to-income ratio in Europe.\n\nHow Modern Education Consult Can Help\nWe help Rwandan and African professionals navigate the Spanish work visa process, prepare targeted CV and cover letters for Spanish employers, and connect with legitimate job opportunities in Spain.\n\nContact us today: Phone: +250 798979720 | WhatsApp: +250 795780073\nEmail: moderneducationconsult2026@gmail.com\nOffices: Kigali and Musanze, Rwanda";
    author = "Modern Education Consult";
    publishedDate = 1_773_273_600_000_000_000;
    imageUrl = "/assets/uploads/whatsapp_image_2026-03-23_at_6.32.17_pm-019d1b93-da71-7606-8d69-ca7b926a72fa-1.jpeg";
    category = "International Jobs";
  }, "Work in Spain: How African Professionals Can Build a Career in Europe's Sunshine Economy");

  upsertSeedPost({
    id = 13;
    title = "Nsengiyumva Ibasumba Alain Aristide's Successful journey to work in Germany";
    summary = "Alain Aristide's journey from Rwanda to a stable career in Germany is a testament to what the right professional guidance can achieve. Read how Modern Education Consult made his European dream a reality.";
    content = "Working in Europe is a dream for many professionals seeking career growth, international exposure, and better opportunities. For Nsengiyumva Ibasumba Alain Aristide, that dream became a reality with the professional support and guidance of Modern Education Consult. His journey to Germany is a testament to how the right guidance can transform ambition into success.\n\nThe Dream to Work in Germany\nAlain Aristide had always aspired to work in Europe, particularly in Germany, known for its strong economy, demand for skilled workers, and excellent working conditions. However, navigating international job applications, visa requirements, and documentation can be overwhelming.\nThat's when he reached out to Modern Education Consult, seeking expert assistance to guide him through the entire process.\n\nProfessional Guidance from Modern Education Consult\nFrom the first consultation, Modern Education Consult provided Alain with a clear roadmap. The team assisted him with:\n- Career counseling and country selection\n- Understanding Germany's labor market requirements\n- CV optimization according to European standards\n- Job search guidance and application support\n- Document preparation and verification\n- Work visa application assistance\nThis structured support helped Alain approach the process with confidence and clarity.\n\nApplication and Recruitment Process\nWith professional guidance, Alain prepared a competitive application. Modern Education Consult helped him:\n- Tailor his CV for German employers\n- Prepare for interviews\n- Organize required academic and professional documents\n- Submit applications to suitable opportunities\nAfter a successful recruitment process, Alain received a job offer — a major milestone in his journey.\n\nVisa Support and Relocation\nThe visa process can be one of the most challenging stages. Modern Education Consult provided step-by-step assistance, including:\n- Work visa documentation checklist\n- Application submission guidance\n- Interview preparation\n- Travel and relocation advice\nThanks to this support, Alain successfully obtained his German work visa and prepared for his move to Europe.\n\nStarting a New Life in Germany\nUpon arrival in Germany, Alain began his new professional journey. He experienced:\n- A structured and professional work environment\n- Opportunities for career growth\n- Competitive salary and benefits\n- Exposure to international work standards\n- Improved quality of life\nAlthough adapting to a new culture and environment required effort, he remained focused and determined.\n\nOvercoming Challenges\nLike many professionals working abroad, Alain faced some initial challenges such as:\n- Language differences\n- Cultural adaptation\n- Weather changes\n- Administrative procedures\nWith determination and continuous support, he successfully integrated into his new environment and grew both professionally and personally.\n\nA Success Story Made Possible\nToday, Nsengiyumva Ibasumba Alain Aristide has built a stable career and a new life in Germany. His journey highlights:\n- The importance of professional guidance\n- The value of preparation\n- The impact of determination and persistence\n- The opportunities available in Europe for skilled professionals\n\nMessage to Aspiring Candidates\nAlain encourages others who wish to work abroad to:\n- Seek professional guidance\n- Prepare documents early\n- Improve communication skills\n- Stay committed to their goals\n- Be patient throughout the process\n\nConclusion\nThe successful journey of Nsengiyumva Ibasumba Alain Aristide demonstrates how Modern Education Consult continues to help professionals achieve their international career goals. With expert support, proper preparation, and determination, working in Germany and building a new life in Europe is possible.\nIf you are planning to work abroad, let this inspiring story motivate you to take the first step toward your global career.";
    author = "Modern Education Consult";
    publishedDate = 1_774_915_200_000_000_000;
    imageUrl = "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80";
    category = "Success Stories";
  }, "Work in Germany: How Nsengiyumva Ibasumba Alain Aristide Built a New Life in Europe");

    upsertSeedPost({
    id = 14;
    title = "French Language Proficiency Programs: TEF Canada & TCF Canada";
    summary = "Préparez-vous aux examens TEF Canada et TCF Canada grâce à une formation experte en français. Améliorez vos compétences, augmentez vos points d'immigration et réalisez votre projet au Canada en toute confiance.";
    content = "=== FRANÇAIS ===\n\nLa maîtrise du français est l'une des étapes les plus importantes pour toute personne souhaitant étudier, travailler ou immigrer au Canada. Dans notre institution, nous proposons des programmes spécialisés de préparation aux deux examens de langue française les plus reconnus : TEF Canada et TCF Canada.\n\nPourquoi la maîtrise du français est importante pour le Canada\nLe Canada est officiellement bilingue. Démontrer un bon niveau de français peut considérablement augmenter vos chances dans les systèmes d'immigration comme Entrée express, en vous permettant de gagner des points supplémentaires dans le système de classement global (CRS).\n\nTEF Canada (Test d'Évaluation de Français)\nLe TEF Canada est un test reconnu à l'international évaluant : Compréhension orale, Compréhension écrite, Expression orale, Expression écrite. Reconnu par IRCC pour les demandes d'immigration canadienne.\n\nTCF Canada (Test de Connaissance du Français)\nLe TCF Canada est un examen officiel reconnu par IRCC. Format simplifié, résultats rapides, adapté aux demandes d'immigration et de citoyenneté.\n\nTEF vs TCF : Choisissez le TEF si vous êtes à l'aise avec des évaluations détaillées. Choisissez le TCF si vous préférez un format plus simple.\n\nNotre programme comprend : formation en grammaire et vocabulaire, exercices de compréhension, sessions de pratique orale, correction de l'expression écrite, examens blancs, accompagnement immigration.\n\nInscrivez-vous dès aujourd'hui et faites le premier pas vers votre rêve canadien.\n\n=== ENGLISH ===\n\nMastering French is one of the most valuable steps for anyone planning to study, work, or immigrate to Canada. We offer specialized preparation programs for TEF Canada and TCF Canada — certifications accepted by Canadian immigration authorities and key to Express Entry pathways.\n\nWhy French Proficiency Matters for Canada\nCanada is officially bilingual. French proficiency earns additional CRS points in Express Entry, significantly boosting your immigration chances.\n\nTEF Canada (Test d'Évaluation de Français)\nThe TEF Canada is an internationally recognized French language test that measures: Listening comprehension, Reading comprehension, Speaking skills, Writing skills. Required for Canadian immigration applications and recognized by IRCC.\n\nTCF Canada (Test de Connaissance du Français)\nThe TCF Canada is another official French proficiency exam recognized by IRCC. Simplified format, fast results, suitable for immigration and citizenship applications.\n\nTEF vs TCF: Choose TEF Canada if you are comfortable with detailed writing and speaking evaluations. Choose TCF Canada if you prefer a more structured and simplified test format.\n\nOur French Language Preparation Program includes: Comprehensive French grammar and vocabulary training, Listening and reading practice using real exam materials, Speaking sessions with expert instructors, Writing correction and feedback, Mock exams under real test conditions, Immigration-focused guidance for Canada applications.\n\nEnroll in our French language proficiency program today and take the first step toward your Canadian dream.\n\nContact us: Phone: +250 798979720 | WhatsApp: +250 795780073\nEmail: moderneducationconsult2026@gmail.com\nOffices: Kigali and Musanze, Rwanda";
    author = "Modern Education Consult";
    publishedDate = 1_776_536_400_000_000_000;
    imageUrl = "/assets/uploads/bd33db92-589d-4260-a870-59b5278d3b02-1.jpg";
    category = "Language Programs";
  }, "French Language Proficiency Programs: TEF Canada & TCF Canada");
  }; // end seedBlogPosts()

  // Run seeding unconditionally on every canister startup (fresh install and upgrades).
  seedBlogPosts();

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
    unreadApplicationCount += 1;
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

  // ─── Comment System ───────────────────────────────────────────────────────

  // Submit a new comment (always pending until admin approves).
  public shared func submitComment(postId : Text, parentId : ?Text, authorName : Text, authorEmail : Text, content : Text) : async Text {
    let commentId = nextCommentId.toText();
    nextCommentId += 1;
    let comment : Comment = {
      id = commentId;
      postId;
      parentId;
      authorName;
      authorEmail;
      content;
      createdAt = Time.now();
      approved = false;
      rejected = false;
      edited = false;
    };
    commentsMap.add(commentId, comment);
    commentId;
  };

  // Approve a pending comment — admin only (caller must not be anonymous).
  public shared ({ caller }) func approveComment(commentId : Text) : async Bool {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    switch (commentsMap.get(commentId)) {
      case (null) { false };
      case (?existing) {
        let updated : Comment = { existing with approved = true; rejected = false };
        commentsMap.remove(commentId);
        commentsMap.add(commentId, updated);
        true;
      };
    };
  };

  // Reject a pending comment — sets approved=false and rejected=true. Admin only.
  // Comment is retained in storage (not deleted) for admin review.
  public shared ({ caller }) func rejectComment(commentId : Text) : async Bool {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    switch (commentsMap.get(commentId)) {
      case (null) { false };
      case (?existing) {
        let updated : Comment = { existing with approved = false; rejected = true };
        commentsMap.remove(commentId);
        commentsMap.add(commentId, updated);
        true;
      };
    };
  };

  // Edit a comment's content — admin only.
  public shared ({ caller }) func editComment(commentId : Text, newContent : Text) : async Bool {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    switch (commentsMap.get(commentId)) {
      case (null) { false };
      case (?existing) {
        let updated : Comment = { existing with content = newContent; edited = true };
        commentsMap.remove(commentId);
        commentsMap.add(commentId, updated);
        true;
      };
    };
  };

  // Delete a comment — admin only.
  public shared ({ caller }) func deleteComment(commentId : Text) : async Bool {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    switch (commentsMap.get(commentId)) {
      case (null) { false };
      case (_) {
        commentsMap.remove(commentId);
        true;
      };
    };
  };

  // Unapprove a comment — restores it to pending state (approved=false, rejected=false).
  // Works from either approved or rejected state. Admin only.
  public shared ({ caller }) func unapproveComment(commentId : Text) : async Bool {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    switch (commentsMap.get(commentId)) {
      case (null) { false };
      case (?existing) {
        let updated : Comment = { existing with approved = false; rejected = false };
        commentsMap.remove(commentId);
        commentsMap.add(commentId, updated);
        true;
      };
    };
  };

  // Get approved comments for a specific post (public).
  // Only returns comments that are approved=true AND rejected=false.
  public query func getCommentsForPost(postId : Text) : async [Comment] {
    commentsMap.values().toArray().filter(func(c : Comment) : Bool {
      c.postId == postId and c.approved and not c.rejected
    });
  };

  // Get all pending (unapproved, not rejected) comments — admin only.
  public shared query ({ caller }) func getPendingComments() : async [Comment] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    commentsMap.values().toArray().filter(func(c : Comment) : Bool {
      not c.approved and not c.rejected
    });
  };

  // Get all rejected comments — admin only.
  public shared query ({ caller }) func getRejectedComments() : async [Comment] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    commentsMap.values().toArray().filter(func(c : Comment) : Bool { c.rejected });
  };

  // Get count of pending comments (approved=false, rejected=false) for the admin badge.
  public shared query ({ caller }) func getCommentCount() : async Nat {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    var count = 0;
    for (c in commentsMap.values()) {
      if (not c.approved and not c.rejected) { count += 1 };
    };
    count;
  };

  // Get ALL comments (pending + approved + rejected) — admin only.
  public shared query ({ caller }) func getAllComments() : async [Comment] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    commentsMap.values().toArray();
  };

  // ─── Application Notifications ───────────────────────────────────────────

  // Get count of unread application submissions for the admin notification badge.
  public query func getUnreadApplicationCount() : async Nat {
    unreadApplicationCount;
  };

  // Mark all application submissions as read (resets the unread badge counter).
  public shared ({ caller }) func markApplicationsAsRead() : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    unreadApplicationCount := 0;
  };

  // ─── Website Editor State ────────────────────────────────────────────────

  let websitePagesMap    = Map.empty<Nat, WebsiteEditorTypes.WebsitePage>();
  let websiteMediaMap    = Map.empty<Nat, WebsiteEditorTypes.MediaItem>();
  let websiteConfigMap   = Map.empty<Nat, WebsiteEditorTypes.GlobalConfig>();
  // Page version history: pageId -> list of snapshots (max 5 per page)
  let websiteVersionsMap = Map.empty<Nat, List.List<WebsiteEditorTypes.PageVersionSnapshot>>();
  var nextWebsitePageId : Nat = 1;
  var nextMediaItemId   : Nat = 1;
  var nextNavMenuItemId : Nat = 1;

  // Seed default pages and global config on every startup (idempotent)
  WebsiteEditorLib.seedDefaultPages(websitePagesMap, nextWebsitePageId);
  WebsiteEditorLib.seedDefaultConfig(websiteConfigMap);

  // ─── Website Editor: Page Management (admin-only) ────────────────────────

  public shared ({ caller }) func createWebsitePage(title : Text, slug : Text) : async WebsiteEditorTypes.Result<Nat, Text> {
    if (caller.isAnonymous()) { return #err("Unauthorized") };
    let result = WebsiteEditorLib.createPage(websitePagesMap, nextWebsitePageId, title, slug);
    switch (result) {
      case (#ok(newId)) { nextWebsitePageId := newId + 1; #ok(newId) };
      case (#err(e)) { #err(e) };
    };
  };

  public shared ({ caller }) func editWebsitePage(id : Nat, title : Text, slug : Text) : async WebsiteEditorTypes.Result<(), Text> {
    if (caller.isAnonymous()) { return #err("Unauthorized") };
    WebsiteEditorLib.editPage(websitePagesMap, id, title, slug);
  };

  public shared ({ caller }) func deleteWebsitePage(id : Nat) : async WebsiteEditorTypes.Result<(), Text> {
    if (caller.isAnonymous()) { return #err("Unauthorized") };
    WebsiteEditorLib.deletePage(websitePagesMap, id);
  };

  public shared ({ caller }) func savePageSections(pageId : Nat, sections : [WebsiteEditorTypes.PageSection]) : async WebsiteEditorTypes.Result<(), Text> {
    if (caller.isAnonymous()) { return #err("Unauthorized") };
    WebsiteEditorLib.savePageSections(websitePagesMap, websiteVersionsMap, pageId, sections);
  };

  // ─── Website Editor: Page Queries (public) ───────────────────────────────

  public query func getAllWebsitePages() : async [WebsiteEditorTypes.WebsitePage] {
    WebsiteEditorLib.getAllPages(websitePagesMap);
  };

  public query func getWebsitePageById(id : Nat) : async ?WebsiteEditorTypes.WebsitePage {
    WebsiteEditorLib.getPageById(websitePagesMap, id);
  };

  // ─── Website Editor: Version History ─────────────────────────────────────

  public query func getPageVersions(slug : Text) : async WebsiteEditorTypes.Result<[WebsiteEditorTypes.PageVersionSummary], Text> {
    WebsiteEditorLib.getPageVersions(websitePagesMap, websiteVersionsMap, slug);
  };

  public shared ({ caller }) func restorePageVersion(slug : Text, version : Nat) : async WebsiteEditorTypes.Result<(), Text> {
    if (caller.isAnonymous()) { return #err("Unauthorized") };
    WebsiteEditorLib.restorePageVersion(websitePagesMap, websiteVersionsMap, slug, version);
  };

  // ─── Website Editor: Media Library ───────────────────────────────────────

  public shared ({ caller }) func uploadMediaItem(filename : Text, mimeType : Text, base64Data : Text) : async WebsiteEditorTypes.Result<Nat, Text> {
    if (caller.isAnonymous()) { return #err("Unauthorized") };
    let result = WebsiteEditorLib.uploadMedia(websiteMediaMap, nextMediaItemId, filename, mimeType, base64Data);
    switch (result) {
      case (#ok(newId)) { nextMediaItemId := newId + 1; #ok(newId) };
      case (#err(e)) { #err(e) };
    };
  };

  public query func getMediaLibrary() : async [WebsiteEditorTypes.MediaItem] {
    WebsiteEditorLib.getAllMedia(websiteMediaMap);
  };

  public shared ({ caller }) func deleteMediaItem(id : Nat) : async WebsiteEditorTypes.Result<(), Text> {
    if (caller.isAnonymous()) { return #err("Unauthorized") };
    WebsiteEditorLib.deleteMedia(websiteMediaMap, id);
  };

  // ─── Website Editor: Global Config ───────────────────────────────────────

  public shared ({ caller }) func updateGlobalConfig(config : WebsiteEditorTypes.GlobalConfig) : async WebsiteEditorTypes.Result<(), Text> {
    if (caller.isAnonymous()) { return #err("Unauthorized") };
    WebsiteEditorLib.updateConfig(websiteConfigMap, config);
  };

  public query func getGlobalConfig() : async ?WebsiteEditorTypes.GlobalConfig {
    WebsiteEditorLib.getConfig(websiteConfigMap);
  };
};
