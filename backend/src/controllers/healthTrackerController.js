// backend/src/controllers/healthTrackerController.js
const { google } = require("googleapis");
const dotenv = require("dotenv");
const GoogleFitToken = require("../models/googleFitToken");
const Patient = require("../models/patient");

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI =
  process.env.REDIRECT_URI ||
  "http://localhost:5000/api/health-tracker/auth-callback";

// full scopes set
const scopes = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.blood_glucose.read",
  "https://www.googleapis.com/auth/fitness.blood_pressure.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.body_temperature.read",
  "https://www.googleapis.com/auth/fitness.location.read",
  "https://www.googleapis.com/auth/fitness.nutrition.read",
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
  "https://www.googleapis.com/auth/fitness.reproductive_health.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
];

const getOAuth2Client = () =>
  new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// helpers
const buildDatasetId = (days) => {
  const now = Date.now();
  const rangeMs = days * 24 * 60 * 60 * 1000;
  return {
    now,
    datasetId: `${(now - rangeMs) * 1000000}-${now * 1000000}`,
  };
};

const buildDummySteps = (now) => {
  const dayMs = 24 * 60 * 60 * 1000;
  const makePoint = (dayOffset, steps) => {
    const start = now - (dayOffset + 1) * dayMs;
    const end = now - dayOffset * dayMs;
    return {
      startTimeNanos: String(start * 1e6),
      endTimeNanos: String(end * 1e6),
      dataTypeName: "com.google.step_count.delta",
      value: [{ intVal: steps }],
    };
  };
  const base = [
    4200, 6800, 5300, 9100, 7500, 3000, 8500,
    6000, 7200, 4000, 9500, 8100, 5000, 8800,
  ];
  return base.map((steps, idx) => makePoint(13 - idx, steps));
};

const buildDummyHeartRate = (now) => {
  const hourMs = 60 * 60 * 1000;
  const makePoint = (hoursAgo, bpm) => {
    const end = now - hoursAgo * hourMs;
    const start = end - 5 * 60 * 1000;
    return {
      startTimeNanos: String(start * 1e6),
      endTimeNanos: String(end * 1e6),
      dataTypeName: "com.google.heart_rate.bpm",
      value: [{ fpVal: bpm }],
    };
  };
  const bpms = [72, 65, 78, 70, 75, 80, 68, 74];
  return bpms.map((bpm, idx) => makePoint((bpms.length - 1 - idx) * 6, bpm));
};

const buildDummySleep = (now) => {
  const hourMs = 60 * 60 * 1000;
  const nights = 5;
  const res = [];
  for (let i = 0; i < nights; i++) {
    const end =
      now - (i + 1) * 24 * hourMs + 7 * hourMs; // wake 7am
    const start = end - 7.5 * hourMs;
    res.push({
      startTimeNanos: String(start * 1e6),
      endTimeNanos: String(end * 1e6),
      dataTypeName: "com.google.sleep.segment",
      value: [{ intVal: 1 }],
    });
  }
  return res;
};

const buildDummyDistance = (now) => {
  const dayMs = 24 * 60 * 60 * 1000;
  const makePoint = (dayOffset, meters) => {
    const start = now - (dayOffset + 1) * dayMs;
    const end = now - dayOffset * dayMs;
    return {
      startTimeNanos: String(start * 1e6),
      endTimeNanos: String(end * 1e6),
      dataTypeName: "com.google.distance.delta",
      value: [{ fpVal: meters }],
    };
  };
  const base = [
    2500, 3200, 4100, 5000, 3800,
    1000, 4500, 5200, 3000, 6000,
  ];
  return base.map((m, idx) => makePoint(9 - idx, m));
};

const buildDummyWeight = (now) => {
  const dayMs = 24 * 60 * 60 * 1000;
  const makePoint = (dayOffset, kg) => {
    const t = now - dayOffset * dayMs;
    return {
      startTimeNanos: String(t * 1e6),
      endTimeNanos: String((t + 5 * 60 * 1000) * 1e6),
      dataTypeName: "com.google.weight",
      value: [{ fpVal: kg }],
    };
  };
  const weights = [70.5, 70.4, 70.6, 70.3, 70.7];
  return weights.map((w, idx) => makePoint(idx * 7, w));
};

// ---------- OAuth entry ----------

exports.getGoogleAuthenticate = (req, res) => {
  console.log("Generating Google OAuth URL...");
  const oauth2Client = getOAuth2Client();
  const { userID } = req.body;

  console.log("userID in getGoogleAuthenticate:", userID);
  const state = JSON.stringify({ appUserId: userID });

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state,
  });
  res.status(200).json({ url });
};

exports.handleAuthCallback = async (req, res) => {
  console.log("Handling auth callback...");
  const oauth2Client = getOAuth2Client();

  try {
    const { code, error, state } = req.query;
    if (error) {
      return res.status(400).send(`Google OAuth Error: ${error}`);
    }
    if (!code) {
      return res
        .status(400)
        .send("Google did not supply an authorization code");
    }

    let appUserId = null;
    if (state) {
      try {
        const parsed = JSON.parse(state);
        console.log("Parsed state:", parsed);
        appUserId = parsed.appUserId;
      } catch {
        appUserId = null;
      }
    }

    if (!appUserId) {
      return res
        .status(400)
        .send("Missing app user ID in OAuth state. Please retry connect.");
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("Obtained tokens:", tokens);

    await GoogleFitToken.findOneAndUpdate(
      { user: appUserId },
      {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.redirect("http://localhost:3000/show-google-fit");
  } catch (err) {
    console.error("Error in Google OAuth callback:", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------- shared helper to actually call Google Fit ----------

async function fetchGoogleFitBundle(fitness, now, datasetId) {
  // 1) Steps
  const stepsResp = await fitness.users.dataSources.datasets.get({
    userId: "me",
    dataSourceId:
      "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
    datasetId,
  });
  let steps = stepsResp.data;
  if (!steps.point || steps.point.length === 0) {
    steps = { ...steps, point: buildDummySteps(now), __dummy: true };
  }

  // 2) Heart rate
  const hrResp = await fitness.users.dataSources.datasets.get({
    userId: "me",
    dataSourceId:
      "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm",
    datasetId,
  });
  let heartRate = hrResp.data;
  if (!heartRate.point || heartRate.point.length === 0) {
    heartRate = {
      ...heartRate,
      point: buildDummyHeartRate(now),
      __dummy: true,
    };
  }

  // 3) Sleep
  const sleepResp = await fitness.users.dataSources.datasets.get({
    userId: "me",
    dataSourceId:
      "derived:com.google.sleep.segment:com.google.android.gms:merged",
    datasetId,
  });
  let sleep = sleepResp.data;
  if (!sleep.point || sleep.point.length === 0) {
    sleep = { ...sleep, point: buildDummySleep(now), __dummy: true };
  }

  // 4) Distance
  const distResp = await fitness.users.dataSources.datasets.get({
    userId: "me",
    dataSourceId:
      "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta",
    datasetId,
  });
  let distance = distResp.data;
  if (!distance.point || distance.point.length === 0) {
    distance = {
      ...distance,
      point: buildDummyDistance(now),
      __dummy: true,
    };
  }

  // 5) Weight
  const weightResp = await fitness.users.dataSources.datasets.get({
    userId: "me",
    dataSourceId:
      "derived:com.google.weight:com.google.android.gms:merge_weight",
    datasetId,
  });
  let weight = weightResp.data;
  if (!weight.point || weight.point.length === 0) {
    weight = { ...weight, point: buildDummyWeight(now), __dummy: true };
  }

  return { steps, heartRate, sleep, distance, weight };
}

// ---------- Patient self view ----------

exports.getFitnessData = async (req, res) => {
  try {
    console.log("Inside fetch data for user >>>> getFitnessData:", req.user);
    const appUserId = req.user.id;

    const stored = await GoogleFitToken.findOne({ user: appUserId });
    if (!stored || !stored.access_token) {
      return res
        .status(401)
        .json({ error: "User has not connected Google Fit" });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: stored.access_token,
      refresh_token: stored.refresh_token,
      scope: stored.scope,
      token_type: stored.token_type,
      expiry_date: stored.expiry_date,
    });

    const fitness = google.fitness({ version: "v1", auth: oauth2Client });
    const { now, datasetId } = buildDatasetId(14);

    let payload;
    try {
      payload = await fetchGoogleFitBundle(fitness, now, datasetId);
    } catch (err) {
      const isInvalidGrant =
        (err.code === 400 || err.status === 400) &&
        err.response?.data?.error === "invalid_grant";
      if (isInvalidGrant) {
        console.warn(
          "Google Fit refresh token invalid/expired for user:",
          appUserId
        );
        await GoogleFitToken.deleteOne({ user: appUserId });
        return res.status(401).json({
          error:
            "Google Fit access expired or revoked. Please reconnect your Google Fit account.",
          needsReconnect: true,
        });
      }
      throw err;
    }

    return res.json(payload);
  } catch (err) {
    console.error("Error fetching Fitness data:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getFitStatus = async (req, res) => {
  const stored = await GoogleFitToken.findOne({ user: req.user.id });
  res.json({ connected: !!stored && !!stored.access_token });
};

// ---------- Sharing: patient selects which doctors can see data ----------

exports.setGoogleFitShare = async (req, res) => {
  try {
    console.log('userID',req.user.id);
    const userId = req.user.id;
    const { doctorId, share } = req.body;
    console.log('Request to set share:', { userId, doctorId, share });
    if (req.user.role.toLowerCase() !== "patient") {
      return res.status(403).json({ error: "Only patients can share data." });
    }

    const pat = await Patient.findById(userId);
    console.log('Patient found:', pat);
    if (!pat) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    const doctorObjectId = doctorId;

    if (share) {
      console.log('Sharing Google Fit data with doctor:', doctorObjectId);
      if (
        !pat.sharedGoogleFitWith.some(
          (id) => String(id) === String(doctorObjectId)
        ) 
      ) {
        console.log('Adding doctor to shared list');
        pat.sharedGoogleFitWith.push(doctorObjectId);
      }
    } else {
      console.log('Revoking Google Fit data share from doctor:', doctorObjectId);
      pat.sharedGoogleFitWith = pat.sharedGoogleFitWith.filter(
        (id) => String(id) !== String(doctorObjectId)
      );
    }

    await pat.save();
    res.json({ success: true, sharedWith: pat.sharedGoogleFitWith });
  } catch (err) {
    console.error("Error setting Google Fit share:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ---------- Doctor view of patient data ----------

exports.getPatientGoogleFitData = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "Doctors only" });
    }

    const { patientId } = req.params;

    const pat = await Patient.findById(patientId);
    if (!pat) return res.status(404).json({ error: "Patient not found" });

    const allowed = pat.sharedGoogleFitWith.some(
      (id) => String(id) === String(req.user.id)
    );
    if (!allowed) {
      return res
        .status(403)
        .json({ error: "Patient has not shared data with you" });
    }

    const patientUserId = pat.user;
    const stored = await GoogleFitToken.findOne({ user: patientUserId });
    if (!stored || !stored.access_token) {
      return res
        .status(404)
        .json({ error: "Patient has no Google Fit connection" });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: stored.access_token,
      refresh_token: stored.refresh_token,
      scope: stored.scope,
      token_type: stored.token_type,
      expiry_date: stored.expiry_date,
    });

    const fitness = google.fitness({ version: "v1", auth: oauth2Client });
    const { now, datasetId } = buildDatasetId(14);

    let payload;
    try {
      payload = await fetchGoogleFitBundle(fitness, now, datasetId);
    } catch (err) {
      const isInvalidGrant =
        (err.code === 400 || err.status === 400) &&
        err.response?.data?.error === "invalid_grant";
      if (isInvalidGrant) {
        console.warn(
          "Google Fit refresh token invalid/expired for patient:",
          patientUserId
        );
        await GoogleFitToken.deleteOne({ user: patientUserId });
        return res.status(401).json({
          error:
            "Patient’s Google Fit access expired or revoked. Ask the patient to reconnect Google Fit.",
          needsReconnect: true,
        });
      }
      throw err;
    }

    return res.json(payload);
  } catch (err) {
    console.error("Error fetching patient Google Fit data:", err);
    res.status(500).json({ error: err.message });
  }
};

// BELOW getFitStatus, ABOVE setGoogleFitShare

// list patients who have shared Google Fit with this doctor
exports.getSharedPatients = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "Doctors only" });
    }

    const doctorId = req.user.id;

    const patients = await Patient.find({
      sharedGoogleFitWith: doctorId,
    })
      .select("_id fullName age")
      .lean();

    return res.json(patients || []);
  } catch (err) {
    console.error("Error fetching shared patients:", err);
    res.status(500).json({ error: err.message });
  }
};


// helper to build a simple summary from full bundle
function buildSummaryFromBundle(bundle) {
  const stepsPoints = bundle.steps?.point || [];
  const hrPoints = bundle.heartRate?.point || [];
  const distancePoints = bundle.distance?.point || [];
  const sleepPoints = bundle.sleep?.point || [];
  const weightPoints = bundle.weight?.point || [];

  const totalSteps = stepsPoints.reduce(
    (sum, p) => sum + (p.value?.[0]?.intVal || 0),
    0
  );

  const hrVals = hrPoints
    .map((p) => p.value?.[0]?.fpVal)
    .filter((v) => typeof v === "number");
  const averageHeartRate = hrVals.length
    ? Math.round(hrVals.reduce((a, b) => a + b, 0) / hrVals.length)
    : null;

  const latestWeight =
    weightPoints.length > 0
      ? weightPoints[weightPoints.length - 1].value?.[0]?.fpVal ?? null
      : null;

  return {
    sharedAt: Date.now(),
    totalStepsLast14Days: totalSteps,
    averageHeartRate,
    latestWeight,
    hasSleepData: sleepPoints.length > 0,
    hasDistanceData: distancePoints.length > 0,
  };
}

// NEW: summarized view for doctor
exports.getPatientGoogleFitSummary = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "Doctors only" });
    }

    const { patientId } = req.params;
    
    const pat = await Patient.findById(patientId);
    if (!pat) return res.status(404).json({ error: "Patient not found" });

    const allowed = pat.sharedGoogleFitWith.some(
      (id) => String(id) === String(req.user.id)
    );
    if (!allowed) {
      return res
        .status(403)
        .json({ error: "Patient has not shared data with you" });
    }

    console.log('Fetching summary for patient:', pat);
    const patientUserId = pat._id;
    const stored = await GoogleFitToken.findOne({ user: patientUserId });
    if (!stored || !stored.access_token) {
      return res
        .status(404)
        .json({ error: "Patient has no Google Fit connection" });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: stored.access_token,
      refresh_token: stored.refresh_token,
      scope: stored.scope,
      token_type: stored.token_type,
      expiry_date: stored.expiry_date,
    });

    const fitness = google.fitness({ version: "v1", auth: oauth2Client });
    const { now, datasetId } = buildDatasetId(14);

    let bundle;
    try {
      bundle = await fetchGoogleFitBundle(fitness, now, datasetId);
    } catch (err) {
      const isInvalidGrant =
        (err.code === 400 || err.status === 400) &&
        err.response?.data?.error === "invalid_grant";
      if (isInvalidGrant) {
        await GoogleFitToken.deleteOne({ user: patientUserId });
        return res.status(401).json({
          error:
            "Patient’s Google Fit access expired or revoked. Ask the patient to reconnect Google Fit.",
          needsReconnect: true,
        });
      }
      throw err;
    }

    const summary = buildSummaryFromBundle(bundle);
    return res.json(summary);
  } catch (err) {
    console.error("Error fetching patient Google Fit summary:", err);
    res.status(500).json({ error: err.message });
  }
};
