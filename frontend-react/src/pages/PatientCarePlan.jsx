// import React, { useEffect, useMemo, useState } from "react";
// import ApiService from "../services/ApiService";
// import DashboardLayout from "../components/DashboardLayout";

// const theme = {
//   cardBg: "#ffffff",
//   cardBorder: "#e5e7eb",
//   cardShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
//   borderRadius: "12px",
//   borderRadiusSmall: "999px",
//   textMuted: "#6b7280",
//   textDark: "#111827",
//   accent: "#2563eb",
//   accentSoft: "#dbeafe",
//   success: "#15803d",
//   warning: "#b45309",
//   danger: "#b91c1c",
//   fontSmall: "0.85rem",
//   fontXs: "0.75rem",
//   fontWeightBold: 600,
// };

// function GoalCard({ goal }) {
//   const current =
//     typeof goal.currentValue === "number" ? goal.currentValue : null;
//   const target =
//     typeof goal.targetValue === "number" && goal.targetValue > 0
//       ? goal.targetValue
//       : null;

//   const pct =
//     current !== null && target !== null
//       ? Math.min(100, Math.round((current / target) * 100))
//       : null;

//   let barColor = theme.accent;
//   if (pct !== null) {
//     if (pct < 60) barColor = theme.danger;
//     else if (pct < 100) barColor = theme.warning;
//     else barColor = theme.success;
//   }

//   return (
//     <div
//       style={{
//         background: theme.cardBg,
//         borderRadius: theme.borderRadius,
//         border: `1px solid ${theme.cardBorder}`,
//         boxShadow: theme.cardShadow,
//         padding: 12,
//       }}
//     >
//       <div className="flex items-center justify-between mb-1">
//         <div className="text-sm font-semibold text-gray-800">
//           {goal.label || goal.type}
//         </div>
//         {pct !== null && (
//           <div className="text-xs font-semibold" style={{ color: barColor }}>
//             {pct}%
//           </div>
//         )}
//       </div>

//       <div className="text-xs text-gray-500 mb-2">
//         {current !== null && (
//           <>
//             Current: {current}
//             {goal.unit ? ` ${goal.unit}` : ""}
//           </>
//         )}
//         {target !== null && (
//           <>
//             {"  "}Target: {target}
//             {goal.unit ? ` ${goal.unit}` : ""}
//           </>
//         )}
//       </div>

//       {pct !== null && (
//         <div
//           style={{
//             width: "100%",
//             height: 6,
//             borderRadius: 999,
//             background: "#e5e7eb",
//             overflow: "hidden",
//           }}
//         >
//           <div
//             style={{
//               width: `${pct}%`,
//               height: "100%",
//               background: barColor,
//               transition: "width 0.3s ease",
//             }}
//           />
//         </div>
//       )}

//       {goal.status && (
//         <div className="mt-1 text-xs text-gray-500 capitalize">
//           Status: {goal.status.replace("_", " ")}
//         </div>
//       )}
//     </div>
//   );
// }

// function PatientCarePlan() {
//   const [loading, setLoading] = useState(false);
//   const [plans, setPlans] = useState([]); // all plans for this patient
//   const [error, setError] = useState("");
//   const [selectedDoctorId, setSelectedDoctorId] = useState("all");
//   const [selectedPlanId, setSelectedPlanId] = useState(null);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         setLoading(true);
//         setError(""); 
//         console.log('Fetching care plans with token:', token);
//         const res = await ApiService.request('/care-plans/mine', 'GET', null, token);
//         const allPlans = Array.isArray(res.data?.plans) ? res.data.plans : [];
//         setPlans(allPlans);
//         if (allPlans.length > 0) {
//           setSelectedPlanId(allPlans[0]._id);
//         }
//       } catch (err) {
//         console.error(err);
//         if (err.response && err.response.status === 404) {
//           setError(
//             "No care plan is available yet. Your doctor will share one with you after reviewing your data."
//           );
//         } else {
//           setError("Failed to load your care plans. Please try again later.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPlans();
//   }, [token]);

//   // Distinct doctors from plans
//   const doctors = useMemo(() => {
//     const map = new Map();
//     plans.forEach((p) => {
//       if (p.doctor && p.doctor._id) {
//         if (!map.has(p.doctor._id)) {
//           map.set(p.doctor._id, p.doctor);
//         }
//       }
//     });
//     return Array.from(map.values());
//   }, [plans]);

//   // Plans filtered by doctor
//   const filteredPlans = useMemo(() => {
//     if (selectedDoctorId === "all") return plans;
//     return plans.filter((p) => p.doctor && p.doctor._id === selectedDoctorId);
//   }, [plans, selectedDoctorId]);

//   // Currently selected plan (from filtered list)
//   const selectedPlan = useMemo(() => {
//     if (!filteredPlans.length) return null;
//     // If selectedPlanId is not in filtered, default to first filtered plan
//     const byId = filteredPlans.find((p) => p._id === selectedPlanId);
//     return byId || filteredPlans[0];
//   }, [filteredPlans, selectedPlanId]);

//   //   useEffect(() => {
//   //     if (filteredPlans.length && !selectedPlanId) {
//   //       setSelectedPlanId(filteredPlans[0]._id);
//   //     }
//   //   }, [filteredPlans, selectedPlanId]);
//   useEffect(() => {
//     if (!filteredPlans.length) return;
//     // only set once on first non-empty list
//     setSelectedPlanId((prev) => prev || filteredPlans[0]._id);
//   }, [filteredPlans]);

//   return (
//     <DashboardLayout>
//       <div className="page-header">
//         <h1 className="page-title">My Care Plans</h1>
//         <p className="page-subtitle">
//           View plans shared by your doctors and track your goals.
//         </p>
//       </div>

//       {loading && (
//         <div className="mt-4 text-sm text-gray-500">
//           Loading your care plans...
//         </div>
//       )}

//       {error && !loading && (
//         <div className="mt-4 text-sm text-red-600">{error}</div>
//       )}

//       {!loading && !error && plans.length === 0 && (
//         <div className="mt-4 text-sm text-gray-500">
//           No care plans yet. Your plans will appear here once your doctor shares
//           them.
//         </div>
//       )}

//       {!loading && plans.length > 0 && (
//         <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
//           {/* Left: filters + list of plans */}
//           <div className="lg:col-span-4 space-y-4">
//             <div
//               style={{
//                 background: theme.cardBg,
//                 borderRadius: theme.borderRadius,
//                 border: `1px solid ${theme.cardBorder}`,
//                 boxShadow: theme.cardShadow,
//                 padding: 16,
//               }}
//             >
//               <h2 className="text-sm font-semibold mb-2">Filter by doctor</h2>
//               <select
//                 className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 value={selectedDoctorId}
//                 onChange={(e) => {
//                   setSelectedDoctorId(e.target.value);
//                   setSelectedPlanId(null);
//                 }}
//               >
//                 <option value="all">All doctors</option>
//                 {doctors.map((d) => (
//                   <option key={d._id} value={d._id}>
//                     {d.fullName || d.email || "Doctor"}
//                   </option>
//                 ))}
//               </select>
//               <p className="text-xs text-gray-500 mt-1">
//                 Choose a doctor to see only plans created by them, or select
//                 “All doctors”.
//               </p>
//             </div>

//             <div
//               style={{
//                 background: theme.cardBg,
//                 borderRadius: theme.borderRadius,
//                 border: `1px solid ${theme.cardBorder}`,
//                 boxShadow: theme.cardShadow,
//                 padding: 16,
//               }}
//             >
//               <h2 className="text-sm font-semibold mb-2">Your plans</h2>
//               {filteredPlans.length === 0 ? (
//                 <p className="text-xs text-gray-500">
//                   No plans found for this doctor.
//                 </p>
//               ) : (
//                 <div className="space-y-2 max-h-[360px] overflow-y-auto">
//                   {filteredPlans.map((p) => (
//                     <button
//                       key={p._id}
//                       onClick={() => setSelectedPlanId(p._id)}
//                       className={`w-full text-left px-3 py-2 rounded-md text-xs ${
//                         selectedPlan && selectedPlan._id === p._id
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-50 hover:bg-gray-100 text-gray-800"
//                       }`}
//                     >
//                       <div className="font-medium">
//                         {p.doctor?.fullName || p.doctor?.email || "Doctor"}
//                       </div>
//                       <div className="text-[11px] text-gray-400">
//                         {new Date(p.createdAt).toLocaleString()}
//                       </div>
//                       <div className="text-[11px] text-gray-300 truncate">
//                         {p.patientFriendlyText?.overview || "No overview text"}
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right: selected plan details */}
//           <div className="lg:col-span-8 space-y-4">
//             {!selectedPlan && (
//               <div
//                 style={{
//                   background: theme.cardBg,
//                   borderRadius: theme.borderRadius,
//                   border: `1px dashed ${theme.cardBorder}`,
//                   padding: 20,
//                   textAlign: "center",
//                 }}
//               >
//                 <p className="text-sm text-gray-500">
//                   Select a plan from the left to view its details.
//                 </p>
//               </div>
//             )}

//             {selectedPlan && (
//               <>
//                 <div
//                   style={{
//                     background: theme.cardBg,
//                     borderRadius: theme.borderRadius,
//                     border: `1px solid ${theme.cardBorder}`,
//                     boxShadow: theme.cardShadow,
//                     padding: 16,
//                   }}
//                 >
//                   <div className="flex items-center justify-between mb-2">
//                     <div>
//                       <h2 className="text-sm font-semibold mb-0.5">
//                         Plan from{" "}
//                         {selectedPlan.doctor?.fullName ||
//                           selectedPlan.doctor?.email ||
//                           "Doctor"}
//                       </h2>
//                       <p className="text-xs text-gray-500">
//                         Shared on{" "}
//                         {new Date(selectedPlan.createdAt).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                   <p className="text-sm text-gray-800 whitespace-pre-line">
//                     {selectedPlan.patientFriendlyText?.overview ||
//                       "Your doctor has not added an overview yet."}
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {selectedPlan.fullLetter && (
//                     <div
//                       style={{
//                         background: theme.cardBg,
//                         borderRadius: theme.borderRadius,
//                         border: `1px solid ${theme.cardBorder}`,
//                         boxShadow: theme.cardShadow,
//                         padding: 16,
//                       }}
//                     >
//                       <h3 className="text-sm font-semibold mb-1">
//                         Full message from your doctor
//                       </h3>
//                       <p className="text-sm text-gray-800 whitespace-pre-line">
//                         {selectedPlan.fullLetter}
//                       </p>
//                     </div>
//                   )}
//                   {/* <div
//                     style={{
//                       background: theme.cardBg,
//                       borderRadius: theme.borderRadius,
//                       border: `1px solid ${theme.cardBorder}`,
//                       boxShadow: theme.cardShadow,
//                       padding: 16,
//                     }}
//                   >
//                     <h3 className="text-sm font-semibold mb-1">Activity</h3>
//                     <p className="text-sm text-gray-800 whitespace-pre-line">
//                       {selectedPlan.patientFriendlyText?.activity ||
//                         "No specific activity instructions yet."}
//                     </p>
//                   </div>

//                   <div
//                     style={{
//                       background: theme.cardBg,
//                       borderRadius: theme.borderRadius,
//                       border: `1px solid ${theme.cardBorder}`,
//                       boxShadow: theme.cardShadow,
//                       padding: 16,
//                     }}
//                   >
//                     <h3 className="text-sm font-semibold mb-1">Weight</h3>
//                     <p className="text-sm text-gray-800 whitespace-pre-line">
//                       {selectedPlan.patientFriendlyText?.weight ||
//                         "No specific weight guidance yet."}
//                     </p>
//                   </div>

//                   <div
//                     style={{
//                       background: theme.cardBg,
//                       borderRadius: theme.borderRadius,
//                       border: `1px solid ${theme.cardBorder}`,
//                       boxShadow: theme.cardShadow,
//                       padding: 16,
//                     }}
//                   >
//                     <h3 className="text-sm font-semibold mb-1">
//                       Sleep & follow‑up
//                     </h3>
//                     <p className="text-sm text-gray-800 whitespace-pre-line mb-2">
//                       {selectedPlan.patientFriendlyText?.sleep ||
//                         "No specific sleep guidance yet."}
//                     </p>
//                     <p className="text-sm text-gray-800 whitespace-pre-line">
//                       {selectedPlan.patientFriendlyText?.followUp
//                         ? `Follow‑up:\n${selectedPlan.patientFriendlyText.followUp}`
//                         : "Your doctor will let you know when to follow up."}
//                     </p>
//                   </div>

//                   <div
//                     style={{
//                       background: theme.cardBg,
//                       borderRadius: theme.borderRadius,
//                       border: `1px solid ${theme.cardBorder}`,
//                       boxShadow: theme.cardShadow,
//                       padding: 16,
//                     }}
//                   >
//                     <h3 className="text-sm font-semibold mb-2">Goals</h3>
//                     {(!selectedPlan.goals ||
//                       selectedPlan.goals.length === 0) && (
//                       <p className="text-sm text-gray-500">
//                         Your doctor has not added specific numeric goals yet.
//                       </p>
//                     )}
//                     {selectedPlan.goals && selectedPlan.goals.length > 0 && (
//                       <div className="grid grid-cols-1 gap-3">
//                         {selectedPlan.goals.map((g, idx) => (
//                           <GoalCard key={idx} goal={g} />
//                         ))}
//                       </div>
//                     )}
//                   </div> */}
//                 </div>

//                 <div
//                   style={{
//                     background: "#eff6ff",
//                     borderRadius: theme.borderRadius,
//                     border: `1px solid #bfdbfe`,
//                     padding: 14,
//                   }}
//                 >
//                   <h3 className="text-xs font-semibold text-blue-800 mb-1">
//                     Reminder
//                   </h3>
//                   <p className="text-xs text-blue-900">
//                     This plan is guidance only. If anything feels wrong or
//                     unclear, use the app to message your doctor or book a visit.
//                   </p>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </DashboardLayout>
//   );
// }

// export default PatientCarePlan;
// src/pages/PatientCarePlan.jsx
import React, { useEffect, useMemo, useState } from "react";
import ApiService from "../services/ApiService";
import DashboardLayout from "../components/DashboardLayout";

const theme = {
  cardBg: "#ffffff",
  cardBorder: "#e5e7eb",
  cardShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
  borderRadius: "12px",
  borderRadiusSmall: "999px",
  textMuted: "#6b7280",
  textDark: "#111827",
  accent: "#2563eb",
  accentSoft: "#dbeafe",
  success: "#15803d",
  warning: "#b45309",
  danger: "#b91c1c",
  fontSmall: "0.85rem",
  fontXs: "0.75rem",
  fontWeightBold: 600,
};

function GoalCard({ goal }) {
  const current =
    typeof goal.currentValue === "number" ? goal.currentValue : null;
  const target =
    typeof goal.targetValue === "number" && goal.targetValue > 0
      ? goal.targetValue
      : null;

  const pct =
    current !== null && target !== null
      ? Math.min(100, Math.round((current / target) * 100))
      : null;

  let barColor = theme.accent;
  if (pct !== null) {
    if (pct < 60) barColor = theme.danger;
    else if (pct < 100) barColor = theme.warning;
    else barColor = theme.success;
  }

  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: theme.cardShadow,
        padding: 12,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold text-gray-800">
          {goal.label || goal.type}
        </div>
        {pct !== null && (
          <div className="text-xs font-semibold" style={{ color: barColor }}>
            {pct}%
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 mb-2">
        {current !== null && (
          <>
            Current: {current}
            {goal.unit ? ` ${goal.unit}` : ""}
          </>
        )}
        {target !== null && (
          <>
            {"  "}
            Target: {target}
            {goal.unit ? ` ${goal.unit}` : ""}
          </>
        )}
      </div>

      {pct !== null && (
        <div
          style={{
            width: "100%",
            height: 6,
            borderRadius: 999,
            background: "#e5e7eb",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: barColor,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      {goal.status && (
        <div className="mt-1 text-xs text-gray-500 capitalize">
          Status: {goal.status.replace("_", " ")}
        </div>
      )}
    </div>
  );
}

function PatientCarePlan() {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]); // all plans for this patient
  const [error, setError] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("Fetching care plans with token:", token);
        const res = await ApiService.request(
          "/care-plans/mine",
          "GET",
          null,
          token
        );
        const allPlans = Array.isArray(res.data?.plans) ? res.data.plans : [];
        console.log("Fetched plans:", allPlans,res.data);
        setPlans(allPlans);
        if (allPlans.length > 0) {
          setSelectedPlanId(allPlans[0]._id);
        }
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 404) {
          setError(
            "No care plan is available yet. Your doctor will share one with you after reviewing your data."
          );
        } else {
          setError("Failed to load your care plans. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [token]);

  // Distinct doctors from plans
  const doctors = useMemo(() => {
    const map = new Map();
    console.log('plansssssssssss', plans);
    plans.forEach((p) => {
      if (p.doctor && p.doctor._id) {
        if (!map.has(p.doctor._id)) {
          map.set(p.doctor._id, p.doctor);
        }
      }
    });
    return Array.from(map.values());
  }, [plans]);

  // Plans filtered by doctor
  const filteredPlans = useMemo(() => {
    if (selectedDoctorId === "all") return plans;
    return plans.filter((p) => p.doctor && p.doctor._id === selectedDoctorId);
  }, [plans, selectedDoctorId]);

  // Currently selected plan (from filtered list)
  const selectedPlan = useMemo(() => {
    if (!filteredPlans.length) return null;
    const byId = filteredPlans.find((p) => p._id === selectedPlanId);
    return byId || filteredPlans[0];
  }, [filteredPlans, selectedPlanId]);

  // ensure selectedPlanId set once when filteredPlans first becomes non-empty
  useEffect(() => {
    if (!filteredPlans.length) return;
    setSelectedPlanId((prev) => prev || filteredPlans[0]._id);
  }, [filteredPlans]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Care Plans</h1>
        <p className="page-subtitle">
          View plans shared by your doctors and track your goals.
        </p>
      </div>

      {loading && (
        <div className="mt-4 text-sm text-gray-500">
          Loading your care plans...
        </div>
      )}

      {error && !loading && (
        <div className="mt-4 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="mt-4 text-sm text-gray-500">
          No care plans yet. Your plans will appear here once your doctor
          shares them.
        </div>
      )}

      {!loading && plans.length > 0 && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: filters + list of plans */}
          <div className="lg:col-span-4 space-y-4">
            <div
              style={{
                background: theme.cardBg,
                borderRadius: theme.borderRadius,
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: theme.cardShadow,
                padding: 16,
              }}
            >
              <h2 className="text-sm font-semibold mb-2">Filter by doctor</h2>
              <select
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setSelectedPlanId(null);
                }}
              >
                <option value="all">All doctors</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.fullName || d.email || "Doctor"}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose a doctor to see only plans created by them, or select “All
                doctors”.
              </p>
            </div>

            <div
              style={{
                background: theme.cardBg,
                borderRadius: theme.borderRadius,
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: theme.cardShadow,
                padding: 16,
              }}
            >
              <h2 className="text-sm font-semibold mb-2">Your plans</h2>
              {filteredPlans.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No plans found for this doctor.
                </p>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {filteredPlans.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => setSelectedPlanId(p._id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs ${
                        selectedPlan && selectedPlan._id === p._id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="font-medium">
                        {p.doctor?.fullName || p.doctor?.email || "Doctor"}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(p.createdAt).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-gray-300 truncate">
                        {p.patientFriendlyText?.overview || "No overview text"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: selected plan details */}
          <div className="lg:col-span-8 space-y-4">
            {!selectedPlan && (
              <div
                style={{
                  background: theme.cardBg,
                  borderRadius: theme.borderRadius,
                  border: `1px dashed ${theme.cardBorder}`,
                  padding: 20,
                  textAlign: "center",
                }}
              >
                <p className="text-sm text-gray-500">
                  Select a plan from the left to view its details.
                </p>
              </div>
            )}

            {selectedPlan && (
              <>
                {/* Header card */}
                <div
                  style={{
                    background: theme.cardBg,
                    borderRadius: theme.borderRadius,
                    border: `1px solid ${theme.cardBorder}`,
                    boxShadow: theme.cardShadow,
                    padding: 16,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-sm font-semibold mb-0.5">
                        Plan from{" "}
                        {selectedPlan.doctor?.fullName ||
                          selectedPlan.doctor?.email ||
                          "Doctor"}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Shared on{" "}
                        {new Date(selectedPlan.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-line">
                    {selectedPlan.patientFriendlyText?.overview ||
                      "Your doctor has not added an overview yet."}
                  </p>
                </div>

                {/* Main content: two columns on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: full letter */}
                  <div
                    style={{
                      background: theme.cardBg,
                      borderRadius: theme.borderRadius,
                      border: `1px solid ${theme.cardBorder}`,
                      boxShadow: theme.cardShadow,
                      padding: 16,
                    }}
                  >
                    <h3 className="text-sm font-semibold mb-1">
                      Full message from your doctor
                    </h3>
                    <p className="text-sm text-gray-800 whitespace-pre-line">
                      {selectedPlan.fullLetter ||
                        "Your doctor has not added a detailed message yet."}
                    </p>
                  </div>

                  {/* Right: compact structured summary + goals */}
                  <div className="space-y-3">
                    <div
                      style={{
                        background: theme.cardBg,
                        borderRadius: theme.cardRadius,
                        border: `1px solid ${theme.cardBorder}`,
                        boxShadow: theme.cardShadow,
                        padding: 16,
                      }}
                    >
                      <h3 className="text-sm font-semibold mb-1">
                        Quick summary
                      </h3>
                      <p className="text-xs text-gray-500 mb-1">
                        Key points from your plan in a shorter format.
                      </p>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-700">
                          <span className="font-semibold">Activity: </span>
                          {selectedPlan.patientFriendlyText?.activity ||
                            "No specific activity instructions yet."}
                        </div>
                        <div className="text-xs text-gray-700">
                          <span className="font-semibold">Weight: </span>
                          {selectedPlan.patientFriendlyText?.weight ||
                            "No specific weight guidance yet."}
                        </div>
                        <div className="text-xs text-gray-700 whitespace-pre-line">
                          <span className="font-semibold">
                            Sleep & follow‑up:{" "}
                          </span>
                          {(selectedPlan.patientFriendlyText?.sleep || "") +
                            (selectedPlan.patientFriendlyText?.followUp
                              ? `\n\nFollow‑up:\n${selectedPlan.patientFriendlyText.followUp}`
                              : !selectedPlan.patientFriendlyText?.sleep
                              ? "Your doctor will let you know when to follow up."
                              : "")}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: theme.cardBg,
                        borderRadius: theme.cardBg,
                        border: `1px solid ${theme.cardBorder}`,
                        boxShadow: theme.cardShadow,
                        padding: 16,
                      }}
                    >
                      <h3 className="text-sm font-semibold mb-2">Goals</h3>
                      {(!selectedPlan.goals ||
                        selectedPlan.goals.length === 0) && (
                        <p className="text-sm text-gray-500">
                          Your doctor has not added specific numeric goals yet.
                        </p>
                      )}
                      {selectedPlan.goals &&
                        selectedPlan.goals.length > 0 && (
                          <div className="grid grid-cols-1 gap-3">
                            {selectedPlan.goals.map((g, idx) => (
                              <GoalCard key={idx} goal={g} />
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Reminder box */}
                <div
                  style={{
                    background: "#eff6ff",
                    borderRadius: theme.borderRadius,
                    border: `1px solid #bfdbfe`,
                    padding: 14,
                  }}
                >
                  <h3 className="text-xs font-semibold text-blue-800 mb-1">
                    Reminder
                  </h3>
                  <p className="text-xs text-blue-900">
                    This plan is guidance only. If anything feels wrong or
                    unclear, use the app to message your doctor or book a visit.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default PatientCarePlan;
