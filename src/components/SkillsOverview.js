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

import React from "react";
import useGlobalData from "@docusaurus/useGlobalData";

export default function Home() {
  const globalData = useGlobalData();
  const skills = globalData["skills-levels-plugin"]?.default?.skills || [];

  return (
    <div>
      <h1>Skill Overview</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        {skills.map((s) => {
          const { current, max } = s.level;
          const percent = Math.round((current / max) * 100);
          const iconPath = `/skills-icons/${s.title}.png`;

          return (
            <div
              key={s.title}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "0.5rem",
                textAlign: "center",
              }}
            >
              <img
                src={iconPath}
                width={48}
                height={48}
                style={{ marginBottom: "0.5rem" }}
              />
              <strong>{s.title}</strong>
              <div
                style={{
                  height: "10px",
                  background: "#eee",
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginTop: "0.25rem",
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: "#4caf50",
                  }}
                />
              </div>
              <small>
                {current}/{max}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
