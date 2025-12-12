const express = require("express");
const { 
    createAICarePlanDraft,
    // generateAiDraft,
    sendCarePlan,
    getMyLatestCarePlan,
    getMyCarePlans

} = require("../controllers/carePlanController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/ai-draft", authMiddleware, 
    createAICarePlanDraft
    // generateAiDraft
);

// router.post(
//   "/send",
//   authMiddleware,
//   sendCarePlan
// );

// // Patient fetches latest care plan
// router.get(
//   "/mine/latest",
//   authMiddleware, // generic auth, for patients
//   getMyLatestCarePlan
// );
router.post("/send", authMiddleware, sendCarePlan);
router.get("/mine", authMiddleware, getMyCarePlans);    
router.get("/mine/latest", authMiddleware, getMyLatestCarePlan);

module.exports = router;
