// Master switch for ad monetization on Pandvinder.
//
// Set ADS_ENABLED to true once Google AdSense has approved the site and
// you've filled in your publisher ID below, then commit + push to redeploy.
// Everything ad-related - the consent banner, the privacy policy link, and
// the AdSense script itself - is driven off this one flag.
const ADS_ENABLED = false;

// From your AdSense dashboard, looks like "ca-pub-1234567890123456".
const ADSENSE_PUBLISHER_ID = "ca-pub-1231365130153877";

// Powers the optional Groep (shared leaderboard) feature. Leave both blank
// to keep it off - the Groep panel shows a friendly placeholder instead of
// trying to connect. Fill in once you've created a Supabase project, run
// the schema SQL from the redesign plan, and enabled Anonymous sign-ins
// under Authentication settings there.
const SUPABASE_URL = "https://api.pandfinder.nl";
const SUPABASE_ANON_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc5MTM3OTYyMCwiZXhwIjo0OTQ3MDUzMjIwLCJyb2xlIjoiYW5vbiJ9.VbkOXZFnV5vbbJqDnjcQnBCBXdrlsJaJx1Cxh-btQfY";
