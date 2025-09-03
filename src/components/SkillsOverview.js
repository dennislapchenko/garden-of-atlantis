// import React from "react";
// import useGlobalData from "@docusaurus/useGlobalData";

// export default function Home() {
//   const globalData = useGlobalData();
//   const skills = globalData["skills-levels-plugin"]?.default?.skills || [];

//   return (
//     <div>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(4, 1fr)",
//           gap: "1rem",
//         }}
//       >
//         {skills.map((s) => {
//           const { current, max } = s.level || { current: 0, max: 99 };
//           const percent = Math.round((current / max) * 100);
//           return (
//             <div
//               key={s.title}
//               style={{
//                 border: "1px solid #ccc",
//                 borderRadius: "8px",
//                 padding: "0.5rem",
//               }}
//             >
//               <strong>{s.title}</strong>
//               <div
//                 style={{
//                   height: "10px",
//                   background: "#eee",
//                   borderRadius: "5px",
//                   overflow: "hidden",
//                   marginTop: "0.25rem",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: `${percent}%`,
//                     height: "100%",
//                     background: "#4caf50",
//                   }}
//                 />
//               </div>
//               <small>
//                 {current}/{max}
//               </small>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import useGlobalData from "@docusaurus/useGlobalData";

// export default function Home() {
//   const globalData = useGlobalData();
//   const skills = globalData["skills-levels-plugin"]?.default?.skills || [];

//   return (
//     <div>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(4, 1fr)",
//           gap: "1rem",
//         }}
//       >
//         {skills.map((s) => {
//           const { current, max } = s.level;
//           const percent = Math.round((current / max) * 100);
//           const iconPath = `/skills-icons/${s.title}.png`;

//           return (
//             <div
//               key={s.title}
//               style={{
//                 border: "1px solid #ccc",
//                 borderRadius: "8px",
//                 padding: "0.5rem",
//                 textAlign: "center",
//               }}
//             >
//               <img
//                 src={iconPath}
//                 width={48}
//                 height={48}
//                 style={{ marginBottom: "0.5rem" }}
//               />
//               <strong>{s.title}</strong>
//               <div
//                 style={{
//                   height: "10px",
//                   background: "#eee",
//                   borderRadius: "5px",
//                   overflow: "hidden",
//                   marginTop: "0.25rem",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: `${percent}%`,
//                     height: "100%",
//                     background: "#4caf50",
//                   }}
//                 />
//               </div>
//               <small>
//                 {current}/{max}
//               </small>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import useGlobalData from "@docusaurus/useGlobalData";

// // require.context will import all .png files from skills-icons folder
// const icons = require.context("../../static/img/skills-icons", false, /\.png$/);

// export default function Home() {
//   const globalData = useGlobalData();
//   const skills = globalData["skills-levels-plugin"]?.default?.skills || [];

//   return (
//     <div>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(4, 1fr)",
//           gap: "1rem",
//         }}
//       >
//         {skills.map((s) => {
//           const { current, max } = s.level;
//           const percent = Math.round((current / max) * 100);
//           let iconPath;
//           try {
//             iconPath = "img/skills-icons/" + s.title + ".png";
//           } catch {
//             iconPath = "hj"; // fallback if missing
//           }

//           return (
//             <div
//               key={s.title}
//               style={{
//                 border: "1px solid #ccc",
//                 borderRadius: "8px",
//                 padding: "0.5rem",
//                 textAlign: "center",
//               }}
//             >
//               {iconPath && (
//                 <img
//                   src={iconPath}
//                   width={48}
//                   height={48}
//                   style={{ marginBottom: "0.5rem" }}
//                 />
//               )}
//               <strong>{s.title}</strong>
//               <div
//                 style={{
//                   height: "10px",
//                   background: "#eee",
//                   borderRadius: "5px",
//                   overflow: "hidden",
//                   marginTop: "0.25rem",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: `${percent}%`,
//                     height: "100%",
//                     background: "#4caf50",
//                   }}
//                 />
//               </div>
//               <small>
//                 {current}/{max}
//               </small>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
import React from "react";
import useGlobalData from "@docusaurus/useGlobalData";

export default function Home() {
  const globalData = useGlobalData();
  const skills = globalData["skills-levels-plugin"]?.default?.skills || [];

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "2rem",
        }}
      >
        {skills.map((s) => {
          const { current, max } = s.level;
          const percent = Math.round((current / max) * 100);

          // Static folder path
          const iconPath = "img/skills-icons/" + s.title + ".png";

          // Build skill link (URL-friendly slug)
          const skillSlug = s.title.toLowerCase();
          const skillUrl = `skills/${skillSlug}/`;

          return (
            <div
              key={s.title}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "0.5rem",
              }}
            >
              <a
                href={skillUrl}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={
                    require("@site/static/img/skills-icons/" + s.title + ".png")
                      .default
                  }
                  width={64}
                  height={64}
                  alt={s.title}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                />
                <strong
                  style={{
                    fontSize: "1.1rem",
                    display: "block",
                    marginTop: "0.25rem",
                  }}
                >
                  {s.title}
                </strong>

                <div
                  style={{
                    width: "100%",
                    maxWidth: "120px",
                    height: "12px",
                    background: "#eee",
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: "100%",
                      background: "#2e7d32",
                    }}
                  />
                </div>
                <small style={{ fontSize: "0.9rem" }}>
                  {current}/{max}
                </small>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
