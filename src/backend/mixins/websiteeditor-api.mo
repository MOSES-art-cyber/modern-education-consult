// Website Editor public API mixin.
// Exposes all admin-protected and public query endpoints.
// State is injected via mixin parameters.
import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/websiteeditor";
import WebsiteEditorLib "../lib/websiteeditor";

module {

  public type WebsitePage          = Types.WebsitePage;
  public type PageSection          = Types.PageSection;
  public type MediaItem            = Types.MediaItem;
  public type GlobalConfig         = Types.GlobalConfig;
  public type PageVersionSnapshot  = Types.PageVersionSnapshot;
  public type PageVersionSummary   = Types.PageVersionSummary;
  public type Result<T, E>         = Types.Result<T, E>;

  mixin (
    pagesMap              : Map.Map<Nat, WebsitePage>,
    mediaMap              : Map.Map<Nat, MediaItem>,
    configMap             : Map.Map<Nat, GlobalConfig>,
    versionsMap           : Map.Map<Nat, List.List<PageVersionSnapshot>>,
    nextWebsitePageIdRef  : { var v : Nat },
    nextMediaItemIdRef    : { var v : Nat },
    nextNavMenuItemIdRef  : { var v : Nat },
  ) {

    // ─── Page Management (admin-only) ──────────────────────────────────────

    /// Create a new website page.
    public shared ({ caller }) func createWebsitePage(
      title : Text,
      slug  : Text,
    ) : async Result<Nat, Text> {
      if (caller.isAnonymous()) { return #err("Unauthorized") };
      let result = WebsiteEditorLib.createPage(pagesMap, nextWebsitePageIdRef.v, title, slug);
      switch (result) {
        case (#ok(newId)) {
          nextWebsitePageIdRef.v := newId + 1;
          #ok(newId);
        };
        case (#err(e)) { #err(e) };
      };
    };

    /// Edit the title and slug of an existing page.
    public shared ({ caller }) func editWebsitePage(
      id    : Nat,
      title : Text,
      slug  : Text,
    ) : async Result<(), Text> {
      if (caller.isAnonymous()) { return #err("Unauthorized") };
      WebsiteEditorLib.editPage(pagesMap, id, title, slug);
    };

    /// Delete a non-default page.
    public shared ({ caller }) func deleteWebsitePage(
      id : Nat,
    ) : async Result<(), Text> {
      if (caller.isAnonymous()) { return #err("Unauthorized") };
      WebsiteEditorLib.deletePage(pagesMap, id);
    };

    /// Replace all sections for a page (publish content). Saves a version snapshot.
    public shared ({ caller }) func savePageSections(
      pageId   : Nat,
      sections : [PageSection],
    ) : async Result<(), Text> {
      if (caller.isAnonymous()) { return #err("Unauthorized") };
      WebsiteEditorLib.savePageSections(pagesMap, versionsMap, pageId, sections);
    };

    // ─── Page Queries (public) ─────────────────────────────────────────────

    /// Return all website pages.
    public query func getAllWebsitePages() : async [WebsitePage] {
      WebsiteEditorLib.getAllPages(pagesMap);
    };

    /// Return a single page by id.
    public query func getWebsitePageById(id : Nat) : async ?WebsitePage {
      WebsiteEditorLib.getPageById(pagesMap, id);
    };

    // ─── Version History ───────────────────────────────────────────────────

    /// Return version summaries for a page identified by slug.
    public query func getPageVersions(slug : Text) : async Result<[PageVersionSummary], Text> {
      WebsiteEditorLib.getPageVersions(pagesMap, versionsMap, slug);
    };

    /// Restore a page's sections from a saved version snapshot.
    public shared ({ caller }) func restorePageVersion(
      slug    : Text,
      version : Nat,
    ) : async Result<(), Text> {
      if (caller.isAnonymous()) { return #err("Unauthorized") };
      WebsiteEditorLib.restorePageVersion(pagesMap, versionsMap, slug, version);
    };

    // ─── Media Library (admin-only write, public read) ─────────────────────

    /// Upload a media item to the global media library.
    public shared ({ caller }) func uploadMediaItem(
      filename   : Text,
      mimeType   : Text,
      base64Data : Text,
    ) : async Result<Nat, Text> {
      if (caller.isAnonymous()) { return #err("Unauthorized") };
      let result = WebsiteEditorLib.uploadMedia(mediaMap, nextMediaItemIdRef.v, filename, mimeType, base64Data);
      switch (result) {
        case (#ok(newId)) {
          nextMediaItemIdRef.v := newId + 1;
          #ok(newId);
        };
        case (#err(e)) { #err(e) };
      };
    };

    /// Return all items in the media library.
    public query func getMediaLibrary() : async [MediaItem] {
      WebsiteEditorLib.getAllMedia(mediaMap);
    };

    /// Delete a media item from the library.
    public shared ({ caller }) func deleteMediaItem(
      id : Nat,
    ) : async Result<(), Text> {
      if (caller.isAnonymous()) { return #err("Unauthorized") };
      WebsiteEditorLib.deleteMedia(mediaMap, id);
    };

    // ─── Global Config (admin-only write, public read) ─────────────────────

    /// Overwrite the global site config.
    public shared ({ caller }) func updateGlobalConfig(
      config : GlobalConfig,
    ) : async Result<(), Text> {
      if (caller.isAnonymous()) { return #err("Unauthorized") };
      WebsiteEditorLib.updateConfig(configMap, config);
    };

    /// Return the current global site config.
    public query func getGlobalConfig() : async ?GlobalConfig {
      WebsiteEditorLib.getConfig(configMap);
    };
  };
};
