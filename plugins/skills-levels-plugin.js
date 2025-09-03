const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

module.exports = function skillsLevelPlugin(context, options) {
  const { siteDir } = context;

  return {
    name: "skills-levels-plugin",

    async contentLoaded({ actions }) {
      const { setGlobalData } = actions;

      const docsDir = path.join(siteDir, "docs");
      const mdxFiles = getAllMdxFiles(docsDir);

      let skillsData = [];
      for (const filePath of mdxFiles) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data: frontMatter } = matter(raw);

        if (
          Array.isArray(frontMatter.tags) &&
          (frontMatter.tags.includes("Skills") || frontMatter.tags.length === 2)
        ) {
          // Extract level from tip admonition
          const level = extractLevelFromString(raw);

          if (!level) {
            // Skip pages with no level
            continue;
          }

          // Determine the title
          let title = frontMatter.title || path.basename(filePath, ".mdx");
          if (frontMatter.tags.length === 2) {
            title = frontMatter.tags[1];
          }

          skillsData.push({ title, level });
        }
      }

      // for (const skill of skillsData) {
      //   await generateSkillIcon(skill.title);
      // }

      setGlobalData({ skills: skillsData });
    },
  };
};

// Helper: extract Level from tip admonition
function extractLevelFromString(content) {
  const regex = /::::tip\[Level\][\s\n]+(\d+)\/(\d+)/m;
  const match = content.match(regex);
  if (!match) return null;
  return {
    current: parseInt(match[1], 10),
    max: parseInt(match[2], 10),
  };
}

// Helper: recursively find all .md/.mdx files
function getAllMdxFiles(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllMdxFiles(fullPath));
    } else if (/\.(md|mdx)$/.test(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSkillIcon(skillName) {
  const dir = path.join(__dirname, "..", "static", "skills-icons");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${skillName}.png`);
  if (fs.existsSync(filePath)) return; // skip if already exists

  const prompt = `Small 64x64 RPG skill icon for skill "${skillName}", pixel art, fantasy style, colorful, game icon`;

  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "auto",
  });

  const image_base64 = response.data[0].b64_json;
  const buffer = Buffer.from(image_base64, "base64");
  fs.writeFileSync(filePath, buffer);
}
