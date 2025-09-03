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
                    require("@site/static/img/skill-icons/" + s.title + ".png")
                      .default
                  }
                  width={64}
                  height={64}
                  alt={s.title}
                  style={{
                    borderRadius: "2px",
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
