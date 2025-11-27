const { google } = require("googleapis");
const dotenv = require("dotenv");
const session = require("express-session"); // Add this to your Express app setup
dotenv.config();

// Use .env for secrets instead of hardcoded values
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:5000/api/health-tracker/auth-callback";

const scopes = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.body.read",
];

// Instantiate client per request for user-isolated state (still stateless, but session stores tokens)
const getOAuth2Client = () =>
  new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

exports.getGoogleAuthenticate = (req, res) => {
  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state:JSON.stringify({ callbackUrl: req.query.callbackUrl, userID : req.query.useriD }) // Optional: pass state if needed
  });
  console.log("Generated Google OAuth URL:", url);
  res.status(200).json({ url });
};

exports.handleAuthCallback = async (req, res) => {
  console.log("Handling auth callback...");
  //const oauth2Client = getOAuth2Client();
  try {
    const { code, error } = req.query;
    console.log("queryyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",req,code,error);
    if (error) {
      console.log("Auth error:", error);
      return res.status(400).send(`Google OAuth Error: ${error}`);
    }
    if (!code) {
      console.log("No code returned from Google");
      return res.status(400).send("Google did not supply an authorization code");
    }
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens for this session (requires express-session middleware on your app)
    req.session.tokens = tokens;

    // Redirect user back to frontend after auth
    res.redirect("http://localhost:3000/health-data");
  } catch (err) {
    console.error("Error in Google OAuth callback:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getFitnessData = async (req, res) => {
  // Ensure tokens exist
  if (!req.session || !req.session.tokens) {
    return res.status(401).json({ error: "User not authenticated with Google Fit" });
  }
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(req.session.tokens);

  const fitness = google.fitness({ version: 'v1', auth: oauth2Client });
  try {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const datasetId = `${(now - oneDayMs) * 1000000}-${now * 1000000}`;
    const data = await fitness.users.dataSources.datasets.get({
      userId: 'me',
      dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
      datasetId,
    });
    res.json(data.data);
  } catch (err) {
    console.error("Error fetching Fitness data:", err);
    res.status(500).json({ error: err.message });
  }
};
