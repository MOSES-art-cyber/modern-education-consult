// Website Editor domain types.
// All types are immutable (no var fields) so they can cross the shared boundary.
module {

  /// A single field within a page section (key-value pair).
  public type SectionField = {
    key : Text;
    value : Text;
  };

  /// One content section on a page (e.g. hero, textBlock, imageBlock, buttonBlock, customHtml).
  public type PageSection = {
    id : Nat;
    sectionType : Text;
    fields : [SectionField];
    order : Nat;
  };

  /// A full website page with its sections.
  public type WebsitePage = {
    id : Nat;
    title : Text;
    slug : Text;
    sections : [PageSection];
    isDefault : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  /// A media item stored as base64 in the media library.
  public type MediaItem = {
    id : Nat;
    filename : Text;
    mimeType : Text;
    base64Data : Text;
    uploadedAt : Int;
  };

  /// A single navigation menu item.
  public type NavMenuItem = {
    id : Nat;
    text : Text;
    url : Text;
    order : Nat;
  };

  /// Global site-wide configuration (stored as a single entry at key 0).
  public type GlobalConfig = {
    siteTitle : Text;
    logoMediaId : ?Nat;
    contactPhone : Text;
    contactEmail : Text;
    contactAddress : Text;
    footerContent : Text;
    navigationMenu : [NavMenuItem];
    updatedAt : Int;
  };

  /// A snapshot of page sections for version history (max 5 per page).
  public type PageVersionSnapshot = {
    version : Nat;
    timestamp : Int;
    sections : [PageSection];
  };

  /// Summary of a version snapshot (returned by getPageVersions — no sections payload).
  public type PageVersionSummary = {
    version : Nat;
    timestamp : Int;
    sectionCount : Nat;
  };

  /// Result type alias for convenience.
  public type Result<T, E> = { #ok : T; #err : E };
};
