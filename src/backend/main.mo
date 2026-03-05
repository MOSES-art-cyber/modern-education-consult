import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";

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
  };

  type Testimonial = {
    clientName : Text;
    quote : Text;
    country : Text;
    photoUrl : Text;
  };

  module BlogPost {
    public func compare(a : BlogPost, b : BlogPost) : Order.Order {
      Nat.compare(a.id, b.id);
    };

    public func compareByPublishedDate(a : BlogPost, b : BlogPost) : Order.Order {
      Int.compare(a.publishedDate, b.publishedDate);
    };
  };

  var nextBlogPostId = 4;
  let contactsMap = Map.empty<Nat, ContactSubmission>();
  let blogsMap = Map.empty<Nat, BlogPost>();
  var testimonialsArray = [
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
  ];

  // Initialize with sample blog posts
  public shared ({ caller }) func _init() : async () {
    let initialBlogPosts = [
      {
        id = 1;
        title = "Top 5 Benefits of Studying Abroad";
        summary = "Discover the life-changing advantages of pursuing education in a foreign country.";
        content = "Studying abroad offers unparalleled opportunities for personal growth, ...";
        author = "Jane Smith";
        publishedDate = 1_684_435_200; // Replace with actual timestamp
        imageUrl = "https://example.com/blog1.jpg";
      },
      {
        id = 2;
        title = "How to Choose the Right Country for Your Studies";
        summary = "A comprehensive guide to selecting the perfect study destination.";
        content = "When choosing a country to study in, consider factors such as language, ...";
        author = "Michael Johnson";
        publishedDate = 1_684_435_201; // Replace with actual timestamp
        imageUrl = "https://example.com/blog2.jpg";
      },
      {
        id = 3;
        title = "Visa Application Tips for International Students";
        summary = "Essential advice to help you navigate the student visa process.";
        content = "Applying for a student visa can be overwhelming, but with the right ...";
        author = "Sarah Lee";
        publishedDate = 1_684_435_202; // Replace with actual timestamp
        imageUrl = "https://example.com/blog3.jpg";
      },
    ];

    for (post in initialBlogPosts.values()) {
      blogsMap.add(post.id, post);
    };
  };

  // Contact Form
  public shared ({ caller }) func submitContact(fullName : Text, phoneNumber : Text, email : Text, countryOfInterest : Text, message : Text) : async () {
    let timestamp = Time.now();
    let submission : ContactSubmission = {
      fullName;
      phoneNumber;
      email;
      countryOfInterest;
      message;
      timestamp;
    };
    let id = contactsMap.size() + 1;
    contactsMap.add(id, submission);
  };

  public query ({ caller }) func getAllContacts() : async [ContactSubmission] {
    contactsMap.values().toArray();
  };

  // Blog Posts
  public shared ({ caller }) func addBlogPost(title : Text, summary : Text, content : Text, author : Text, imageUrl : Text) : async () {
    let blogPost : BlogPost = {
      id = nextBlogPostId;
      title;
      summary;
      content;
      author;
      publishedDate = Time.now();
      imageUrl;
    };
    blogsMap.add(nextBlogPostId, blogPost);
    nextBlogPostId += 1;
  };

  public query ({ caller }) func getAllBlogPosts() : async [BlogPost] {
    blogsMap.values().toArray().sort();
  };

  public query ({ caller }) func getBlogPostById(id : Nat) : async BlogPost {
    switch (blogsMap.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?post) { post };
    };
  };

  // Testimonials
  public query ({ caller }) func getAllTestimonials() : async [Testimonial] {
    testimonialsArray;
  };
};
