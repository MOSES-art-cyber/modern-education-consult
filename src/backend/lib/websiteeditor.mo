// Website Editor domain logic.
// Stateless module — all state maps are passed in via parameters.
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/websiteeditor";

module {

  // ─── Type aliases ───────────────────────────────────────────────────────────

  public type WebsitePage          = Types.WebsitePage;
  public type PageSection          = Types.PageSection;
  public type SectionField         = Types.SectionField;
  public type MediaItem            = Types.MediaItem;
  public type NavMenuItem          = Types.NavMenuItem;
  public type GlobalConfig         = Types.GlobalConfig;
  public type PageVersionSnapshot  = Types.PageVersionSnapshot;
  public type PageVersionSummary   = Types.PageVersionSummary;
  public type Result<T, E>         = Types.Result<T, E>;
  public type PagesMap             = Map.Map<Nat, WebsitePage>;
  public type MediaMap             = Map.Map<Nat, MediaItem>;
  public type ConfigMap            = Map.Map<Nat, GlobalConfig>;
  // version history: page id -> list of snapshots (newest last, max 5)
  public type VersionsMap          = Map.Map<Nat, List.List<PageVersionSnapshot>>;

  // ─── Internal helpers ───────────────────────────────────────────────────────

  func field(k : Text, v : Text) : SectionField { { key = k; value = v } };

  func section(id : Nat, sectionType : Text, order : Nat, fields : [SectionField]) : PageSection {
    { id; sectionType; fields; order };
  };

  // ─── Seeding ────────────────────────────────────────────────────────────────

  /// Seed default pages into `pagesMap` if they are missing (slug-based idempotency).
  /// Called unconditionally on canister startup.
  public func seedDefaultPages(pagesMap : PagesMap, _startId : Nat) {
    func seedPage(page : WebsitePage) {
      var exists = false;
      for ((_, p) in pagesMap.entries()) {
        if (p.slug == page.slug) { exists := true };
      };
      if (not exists) {
        pagesMap.add(page.id, page);
      };
    };

    let now = Time.now();

    // ── Homepage ──────────────────────────────────────────────────────────────
    seedPage({
      id = 1; title = "Homepage"; slug = "home"; isDefault = true;
      createdAt = now; updatedAt = now;
      sections = [
        section(1, "hero", 0, [
          field("headline", "Your Gateway to Global Education & Career Opportunities"),
          field("subheadline", "Expert guidance for studying abroad, international jobs, visa assistance, and career development"),
          field("heroImage", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200"),
          field("ctaText", "Start Your Journey"),
          field("ctaLink", "/contact"),
          field("ctaColor", "#0ea5e9"),
        ]),
        section(2, "about-preview", 1, [
          field("headline", "About Modern Education Consult"),
          field("text", "We are a professional consultancy dedicated to helping students and professionals achieve their international education and career goals."),
          field("image", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"),
          field("buttonText", "Learn More About Us"),
          field("buttonLink", "/about"),
        ]),
        section(3, "services-grid", 2, [
          field("headline", "Our Services"),
          field("subheadline", "Comprehensive support for every step of your international journey"),
        ]),
        section(4, "countries-grid", 3, [
          field("headline", "Countries We Cover"),
          field("subheadline", "Study or work in top destinations worldwide"),
        ]),
        section(5, "testimonials", 4, [
          field("headline", "What Our Clients Say"),
        ]),
        section(6, "blog-preview", 5, [
          field("headline", "Latest Updates & Articles"),
          field("viewAllLink", "/blog"),
        ]),
        section(7, "cta-section", 6, [
          field("headline", "Ready to Start Your Journey?"),
          field("text", "Get expert guidance tailored to your goals."),
          field("button1Text", "Apply Now"),
          field("button1Link", "/contact"),
          field("button2Text", "View Services"),
          field("button2Link", "/services"),
        ]),
      ];
    });

    // ── About Page ────────────────────────────────────────────────────────────
    seedPage({
      id = 2; title = "About Page"; slug = "about"; isDefault = true;
      createdAt = now; updatedAt = now;
      sections = [
        section(1, "hero", 0, [
          field("headline", "About Modern Education Consult"),
          field("subheadline", "Your trusted partner for international education and career opportunities"),
          field("heroImage", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200"),
        ]),
        section(2, "text-block", 1, [
          field("headline", "Who We Are"),
          field("text", "Modern Education Consult is a professional consultancy headquartered in Kigali, Rwanda, with offices in Musanze. We specialize in guiding students and professionals toward international education and career opportunities worldwide."),
        ]),
        section(3, "two-column", 2, [
          field("headline", "Our Mission"),
          field("text", "To empower individuals with the knowledge, resources, and support needed to access world-class education and career opportunities globally."),
          field("image", "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800"),
        ]),
        section(4, "text-block", 3, [
          field("headline", "Our Values"),
          field("text", "Integrity, Excellence, Student-First Approach, Global Perspective, Personalized Guidance"),
        ]),
        section(5, "team-section", 4, [
          field("headline", "Meet Our Team"),
          field("image", "/assets/uploads/team.jpg"),
        ]),
      ];
    });

    // ── Services Page ─────────────────────────────────────────────────────────
    seedPage({
      id = 3; title = "Services Page"; slug = "services"; isDefault = true;
      createdAt = now; updatedAt = now;
      sections = [
        section(1, "hero", 0, [
          field("headline", "Our Services"),
          field("subheadline", "Comprehensive solutions for your international education and career journey"),
          field("heroImage", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200"),
        ]),
        section(2, "services-grid", 1, [
          field("headline", "Study Abroad Programs"),
          field("subheadline", "From university applications to visa processing — we handle everything"),
        ]),
        section(3, "services-grid", 2, [
          field("headline", "International Job Placement"),
          field("subheadline", "Connect with employers worldwide and navigate work permit requirements"),
        ]),
        section(4, "cta-section", 3, [
          field("headline", "Ready to Get Started?"),
          field("text", "Contact us today for a free consultation."),
          field("button1Text", "Apply Now"),
          field("button1Link", "/contact"),
        ]),
      ];
    });

    // ── Countries Page ────────────────────────────────────────────────────────
    seedPage({
      id = 4; title = "Country Page"; slug = "countries"; isDefault = true;
      createdAt = now; updatedAt = now;
      sections = [
        section(1, "hero", 0, [
          field("headline", "Countries We Serve"),
          field("subheadline", "Study and work in top destinations worldwide"),
          field("heroImage", "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200"),
        ]),
        section(2, "countries-grid", 1, [
          field("headline", "Top Study & Work Destinations"),
        ]),
      ];
    });

    // ── Contact Page ──────────────────────────────────────────────────────────
    seedPage({
      id = 5; title = "Contact Page"; slug = "contact"; isDefault = true;
      createdAt = now; updatedAt = now;
      sections = [
        section(1, "hero", 0, [
          field("headline", "Contact Us"),
          field("subheadline", "Get in touch — we're here to help you every step of the way"),
          field("heroImage", "https://images.unsplash.com/photo-1423592707957-3b212afa6733?w=1200"),
        ]),
        section(2, "contact-info", 1, [
          field("phone", "+250 798979720"),
          field("whatsapp", "+250 795780073"),
          field("email", "moderneducationconsult2026@gmail.com"),
          field("address", "Kigali, Musanze, Rwanda"),
        ]),
      ];
    });

    // ── Online Degree Courses ─────────────────────────────────────────────────
    seedPage({
      id = 6; title = "Online Degree Courses"; slug = "online-degree-courses"; isDefault = true;
      createdAt = now; updatedAt = now;
      sections = [
        section(1, "hero", 0, [
          field("headline", "Online Degree Courses"),
          field("subheadline", "Access world-class degree programs from top universities"),
          field("heroImage", "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200"),
        ]),
        section(2, "text-block", 1, [
          field("headline", "Why Study Online?"),
          field("text", "Flexible, affordable, and globally recognized online degrees to advance your career from anywhere in the world."),
        ]),
      ];
    });

    // ── Professional Internships ──────────────────────────────────────────────
    seedPage({
      id = 7; title = "Professional Internships"; slug = "professional-internships"; isDefault = true;
      createdAt = now; updatedAt = now;
      sections = [
        section(1, "hero", 0, [
          field("headline", "Professional Internships"),
          field("subheadline", "Gain real-world experience with leading companies worldwide"),
          field("heroImage", "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200"),
        ]),
        section(2, "text-block", 1, [
          field("headline", "International Internship Opportunities"),
          field("text", "Build your professional network and gain the experience top employers look for."),
        ]),
      ];
    });

    // ── Language Proficiency ──────────────────────────────────────────────────
    seedPage({
      id = 8; title = "Language Proficiency Programs"; slug = "language-proficiency"; isDefault = true;
      createdAt = now; updatedAt = now;
      sections = [
        section(1, "hero", 0, [
          field("headline", "Language Proficiency Programs"),
          field("subheadline", "Master English and French for international opportunities"),
          field("heroImage", "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200"),
        ]),
        section(2, "text-block", 1, [
          field("headline", "Language Tests We Support"),
          field("text", "We guide you through IELTS, TOEFL, Duolingo English Test, TEF Canada, and TCF Canada preparation and application."),
        ]),
      ];
    });

    // ── Online Professional Courses ───────────────────────────────────────────
    seedPage({
      id = 9; title = "Online Professional Courses"; slug = "online-professional-courses"; isDefault = true;
      createdAt = now; updatedAt = now;
      sections = [
        section(1, "hero", 0, [
          field("headline", "Online Professional Courses"),
          field("subheadline", "Upskill with industry-recognized professional certifications"),
          field("heroImage", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"),
        ]),
        section(2, "text-block", 1, [
          field("headline", "Advance Your Career"),
          field("text", "From project management to digital marketing — choose from hundreds of professional courses."),
        ]),
      ];
    });
  };

  /// Seed a default GlobalConfig into `configMap` if it is empty.
  /// Called unconditionally on canister startup — idempotent.
  public func seedDefaultConfig(configMap : ConfigMap) {
    if (configMap.get(0) == null) {
      let defaultConfig : GlobalConfig = {
        siteTitle      = "Modern Education Consult";
        logoMediaId    = null;
        contactPhone   = "+250 798979720";
        contactEmail   = "moderneducationconsult2026@gmail.com";
        contactAddress = "Kigali and Musanze, Rwanda";
        footerContent  = "Modern Education Consult — Where education meets opportunities";
        navigationMenu = [
          { id = 1;  text = "Home";                    url = "/";                          order = 0  },
          { id = 2;  text = "About";                   url = "/about";                     order = 1  },
          { id = 3;  text = "Services";                url = "/services";                  order = 2  },
          { id = 4;  text = "Study Abroad";            url = "/services/study-abroad";     order = 3  },
          { id = 5;  text = "International Jobs";      url = "/services/international-jobs"; order = 4 },
          { id = 6;  text = "Visa Assistance";         url = "/services/visa-assistance";  order = 5  },
          { id = 7;  text = "Online Degree Courses";   url = "/online-degree-courses";     order = 6  },
          { id = 8;  text = "Professional Internships"; url = "/professional-internships"; order = 7  },
          { id = 9;  text = "Language Proficiency";    url = "/language-proficiency";      order = 8  },
          { id = 10; text = "Online Professional Courses"; url = "/online-professional-courses"; order = 9 },
          { id = 11; text = "Countries";               url = "/countries";                 order = 10 },
          { id = 12; text = "Canada";                  url = "/countries/canada";          order = 11 },
          { id = 13; text = "Germany";                 url = "/countries/germany";         order = 12 },
          { id = 14; text = "Blog";                    url = "/blog";                      order = 13 },
          { id = 15; text = "Contact";                 url = "/contact";                   order = 14 },
        ];
        updatedAt = Time.now();
      };
      configMap.add(0, defaultConfig);
    };
  };

  // ─── Page CRUD ──────────────────────────────────────────────────────────────

  /// Create a new page with the given title and slug.
  public func createPage(
    pagesMap : PagesMap,
    nextId   : Nat,
    title    : Text,
    slug     : Text,
  ) : Result<Nat, Text> {
    for ((_, p) in pagesMap.entries()) {
      if (p.slug == slug) { return #err("A page with slug '" # slug # "' already exists") };
    };
    let now = Time.now();
    let newPage : WebsitePage = {
      id        = nextId;
      title;
      slug;
      sections  = [];
      isDefault = false;
      createdAt = now;
      updatedAt = now;
    };
    pagesMap.add(nextId, newPage);
    #ok(nextId);
  };

  /// Edit the title and/or slug of an existing page.
  public func editPage(
    pagesMap : PagesMap,
    id       : Nat,
    title    : Text,
    slug     : Text,
  ) : Result<(), Text> {
    switch (pagesMap.get(id)) {
      case (null) { #err("Page not found") };
      case (?existing) {
        for ((k, p) in pagesMap.entries()) {
          if (p.slug == slug and k != id) {
            return #err("A page with slug '" # slug # "' already exists");
          };
        };
        let updated : WebsitePage = { existing with title; slug; updatedAt = Time.now() };
        pagesMap.remove(id);
        pagesMap.add(id, updated);
        #ok(());
      };
    };
  };

  /// Delete a page. Fails if the page is a default page.
  public func deletePage(
    pagesMap : PagesMap,
    id       : Nat,
  ) : Result<(), Text> {
    switch (pagesMap.get(id)) {
      case (null) { #err("Page not found") };
      case (?existing) {
        if (existing.isDefault) { return #err("Cannot delete a default page") };
        pagesMap.remove(id);
        #ok(());
      };
    };
  };

  /// Return all pages as an array, sorted by id ascending.
  public func getAllPages(pagesMap : PagesMap) : [WebsitePage] {
    let pages = pagesMap.values().toArray();
    pages.sort(func(a, b) = if (a.id < b.id) #less else if (a.id > b.id) #greater else #equal);
  };

  /// Return a single page by id.
  public func getPageById(pagesMap : PagesMap, id : Nat) : ?WebsitePage {
    pagesMap.get(id);
  };

  /// Replace all sections for the given page and save a version snapshot (max 5).
  public func savePageSections(
    pagesMap    : PagesMap,
    versionsMap : VersionsMap,
    pageId      : Nat,
    sections    : [PageSection],
  ) : Result<(), Text> {
    switch (pagesMap.get(pageId)) {
      case (null) { #err("Page not found") };
      case (?existing) {
        let now = Time.now();

        // Save current state as a snapshot before overwriting
        let currentSnapshots : List.List<PageVersionSnapshot> = switch (versionsMap.get(pageId)) {
          case (?snaps) { snaps };
          case null     { List.empty<PageVersionSnapshot>() };
        };

        // Determine next version number
        let nextVer : Nat = currentSnapshots.size() + 1;

        let snap : PageVersionSnapshot = {
          version      = nextVer;
          timestamp    = now;
          sections     = existing.sections;
        };

        // Append new snapshot, then keep only the last 5
        currentSnapshots.add(snap);
        let snapshotCount = currentSnapshots.size();
        if (snapshotCount > 5) {
          // Remove oldest entries (from the front) until we have 5
          let excess = snapshotCount - 5 : Nat;
          var removed = 0;
          let trimmed = List.empty<PageVersionSnapshot>();
          currentSnapshots.forEach(func(s : PageVersionSnapshot) {
            if (removed < excess) {
              removed += 1;
            } else {
              trimmed.add(s);
            }
          });
          currentSnapshots.clear();
          currentSnapshots.append(trimmed);
          // Re-number versions 1..5
          var i = 0;
          currentSnapshots.mapInPlace(func(s : PageVersionSnapshot) : PageVersionSnapshot {
            i += 1;
            { s with version = i }
          });
        };

        versionsMap.remove(pageId);
        versionsMap.add(pageId, currentSnapshots);

        // Update page with new sections
        let updated : WebsitePage = { existing with sections; updatedAt = now };
        pagesMap.remove(pageId);
        pagesMap.add(pageId, updated);
        #ok(());
      };
    };
  };

  // ─── Version History ────────────────────────────────────────────────────────

  /// Return all version summaries for a page (no sections payload).
  public func getPageVersions(
    pagesMap    : PagesMap,
    versionsMap : VersionsMap,
    slug        : Text,
  ) : Result<[PageVersionSummary], Text> {
    // Find page by slug
    var pageId : ?Nat = null;
    for ((k, p) in pagesMap.entries()) {
      if (p.slug == slug) { pageId := ?k };
    };
    switch (pageId) {
      case null { #err("Page not found") };
      case (?pid) {
        let snaps : List.List<PageVersionSnapshot> = switch (versionsMap.get(pid)) {
          case (?s) { s };
          case null { List.empty<PageVersionSnapshot>() };
        };
        let summaries = snaps.map<PageVersionSnapshot, PageVersionSummary>(func(s) {
          { version = s.version; timestamp = s.timestamp; sectionCount = s.sections.size() }
        });
        #ok(summaries.toArray());
      };
    };
  };

  /// Restore a page's sections from a specific snapshot version.
  public func restorePageVersion(
    pagesMap    : PagesMap,
    versionsMap : VersionsMap,
    slug        : Text,
    version     : Nat,
  ) : Result<(), Text> {
    // Find page by slug
    var pageId : ?Nat = null;
    for ((k, p) in pagesMap.entries()) {
      if (p.slug == slug) { pageId := ?k };
    };
    switch (pageId) {
      case null { #err("Page not found") };
      case (?pid) {
        let snaps : List.List<PageVersionSnapshot> = switch (versionsMap.get(pid)) {
          case (?s) { s };
          case null { return #err("No version history for this page") };
        };
        let snapOpt = snaps.find(func(s : PageVersionSnapshot) : Bool { s.version == version });
        switch (snapOpt) {
          case null { #err("Version " # version.toText() # " not found") };
          case (?snap) {
            switch (pagesMap.get(pid)) {
              case null { #err("Page not found in map") };
              case (?existing) {
                let updated : WebsitePage = { existing with sections = snap.sections; updatedAt = Time.now() };
                pagesMap.remove(pid);
                pagesMap.add(pid, updated);
                #ok(());
              };
            };
          };
        };
      };
    };
  };

  // ─── Media Library ──────────────────────────────────────────────────────────

  /// Upload a new media item (base64).
  public func uploadMedia(
    mediaMap   : MediaMap,
    nextId     : Nat,
    filename   : Text,
    mimeType   : Text,
    base64Data : Text,
  ) : Result<Nat, Text> {
    let item : MediaItem = {
      id = nextId;
      filename;
      mimeType;
      base64Data;
      uploadedAt = Time.now();
    };
    mediaMap.add(nextId, item);
    #ok(nextId);
  };

  /// Return all media items as an array, sorted by id ascending.
  public func getAllMedia(mediaMap : MediaMap) : [MediaItem] {
    let items = mediaMap.values().toArray();
    items.sort(func(a, b) = if (a.id < b.id) #less else if (a.id > b.id) #greater else #equal);
  };

  /// Delete a media item by id.
  public func deleteMedia(
    mediaMap : MediaMap,
    id       : Nat,
  ) : Result<(), Text> {
    switch (mediaMap.get(id)) {
      case (null) { #err("Media item not found") };
      case (_) { mediaMap.remove(id); #ok(()) };
    };
  };

  // ─── Global Config ──────────────────────────────────────────────────────────

  /// Persist the full global config (overwrites key 0).
  public func updateConfig(
    configMap : ConfigMap,
    config    : GlobalConfig,
  ) : Result<(), Text> {
    let updated : GlobalConfig = { config with updatedAt = Time.now() };
    configMap.remove(0);
    configMap.add(0, updated);
    #ok(());
  };

  /// Return the current global config (key 0), or null if not seeded yet.
  public func getConfig(configMap : ConfigMap) : ?GlobalConfig {
    configMap.get(0);
  };
};
