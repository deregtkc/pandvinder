// Master switch for ad monetization on Pandvinder.
//
// Set ADS_ENABLED to true once Google AdSense has approved the site and
// you've filled in your publisher ID below, then commit + push to redeploy.
// Everything ad-related — the consent banner, the privacy policy link, and
// the AdSense script itself — is driven off this one flag.
const ADS_ENABLED = false;

// From your AdSense dashboard, looks like "ca-pub-1234567890123456".
const ADSENSE_PUBLISHER_ID = "ca-pub-1231365130153877";

// Powers the optional Groep (shared leaderboard) feature. Leave both blank
// to keep it off — the Groep panel shows a friendly placeholder instead of
// trying to connect. Fill in once you've created a Supabase project, run
// the schema SQL from the redesign plan, and enabled Anonymous sign-ins
// under Authentication settings there.
const SUPABASE_URL = "https://yoixxamqqyyeqabbhfuc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaXh4YW1xcXl5ZXFhYmJoZnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MzU3MzUsImV4cCI6MjEwNDAxMTczNX0.jDtvRjVhpzHJyySycUrIiMskkuFYDtSIOBpouUG3opQ";
