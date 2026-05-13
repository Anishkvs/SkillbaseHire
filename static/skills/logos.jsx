// Brand logo SVGs for skill cards — simple, recognizable marks rendered inside a tinted tile
const LOGOS = {
  selenium: (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
      <path d="M5 5h22v14c0 4-3 8-11 8S5 23 5 19V5Z" fill="#43B02A"/>
      <path d="M11 16l3 3 7-7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  javascript: (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <rect width="32" height="32" rx="4" fill="#F7DF1E"/>
      <text x="16" y="24" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="13" fill="#000">JS</text>
    </svg>
  ),
  typescript: (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <rect width="32" height="32" rx="4" fill="#3178C6"/>
      <text x="16" y="24" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="12" fill="#fff">TS</text>
    </svg>
  ),
  node: (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 2 3 9.5v13L16 30l13-7.5v-13L16 2Z" fill="#339933"/>
      <text x="16" y="20" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="9" fill="#fff">JS</text>
    </svg>
  ),
  postgres: (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
      <ellipse cx="16" cy="16" rx="13" ry="12" fill="#fff"/>
      <path d="M9 8c-1 4 0 8 1 11 1 3 4 6 6 6s4-2 5-4c1-3 1-7 2-10M16 6c4 0 7 1 8 4M11 14c1-3 4-4 7-3M14 16c2-1 5 0 6 2" stroke="#336791" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <circle cx="13" cy="13" r="1.4" fill="#336791"/>
    </svg>
  ),
  aws: (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <rect width="32" height="32" rx="4" fill="#232F3E"/>
      <text x="16" y="17" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="9" fill="#fff">aws</text>
      <path d="M6 22c4 2 16 2 20 0" stroke="#FF9900" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <path d="M23 21l3-1-1 3" stroke="#FF9900" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  react: (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
      <rect width="32" height="32" rx="4" fill="#fff"/>
      <circle cx="16" cy="16" r="2.2" fill="#61DAFB"/>
      <ellipse cx="16" cy="16" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.4" fill="none"/>
      <ellipse cx="16" cy="16" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.4" fill="none" transform="rotate(60 16 16)"/>
      <ellipse cx="16" cy="16" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.4" fill="none" transform="rotate(120 16 16)"/>
    </svg>
  ),
  python: (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
      <path d="M16 4c-5 0-5 2-5 4v2h5v1H8c-3 0-5 2-5 6s2 5 4 5h2v-3c0-2 2-4 5-4h6c2 0 4-1 4-4V8c0-2-2-4-4-4Zm-3 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" fill="#3776AB"/>
      <path d="M16 28c5 0 5-2 5-4v-2h-5v-1h8c3 0 5-2 5-6s-2-5-4-5h-2v3c0 2-2 4-5 4h-6c-2 0-4 1-4 4v3c0 2 2 4 4 4Zm3-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="#FFD43B"/>
    </svg>
  ),
  figma: (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
      <path d="M12 4h4v8h-4a4 4 0 0 1 0-8Z" fill="#F24E1E"/>
      <path d="M16 4h4a4 4 0 0 1 0 8h-4V4Z" fill="#FF7262"/>
      <path d="M16 12h4a4 4 0 0 1 0 8 4 4 0 0 1-4-4v-4Z" fill="#1ABCFE"/>
      <path d="M12 12h4v8h-4a4 4 0 0 1 0-8Z" fill="#A259FF"/>
      <path d="M12 20h4v4a4 4 0 1 1-4-4Z" fill="#0ACF83"/>
    </svg>
  ),
  docker: (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
      <rect width="32" height="32" rx="4" fill="#fff"/>
      <g fill="#2496ED">
        <rect x="6" y="14" width="3" height="3" rx=".4"/>
        <rect x="10" y="14" width="3" height="3" rx=".4"/>
        <rect x="14" y="14" width="3" height="3" rx=".4"/>
        <rect x="10" y="10" width="3" height="3" rx=".4"/>
        <rect x="14" y="10" width="3" height="3" rx=".4"/>
        <rect x="14" y="6" width="3" height="3" rx=".4"/>
      </g>
      <path d="M4 18c2 4 6 6 11 6 9 0 13-5 14-9-1 1-3 1-4 0-1 2-3 2-4 1-2 2-12 2-17 2Z" fill="#2496ED"/>
    </svg>
  ),
  flutter: (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
      <path d="M20 3 6 17l4 4L24 7l-4-4Z" fill="#02569B"/>
      <path d="M20 15 12 23l4 4 8-8-4-4Z" fill="#0175C2"/>
      <path d="m16 27 4 4h6l-6-6-4 2Z" fill="#02539A"/>
      <path d="m12 23 4-2 4 4-4 2-4-4Z" fill="#45D1FD" opacity=".85"/>
    </svg>
  ),
  powerbi: (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
      <rect width="32" height="32" rx="4" fill="#F2C811"/>
      <rect x="7" y="14" width="4" height="12" rx="1" fill="#fff"/>
      <rect x="14" y="9" width="4" height="17" rx="1" fill="#fff"/>
      <rect x="21" y="5" width="4" height="21" rx="1" fill="#fff"/>
    </svg>
  ),
  tensorflow: (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
      <path d="M16 3 5 9v14l11 6 11-6V9L16 3Z" fill="#fff"/>
      <path d="M16 5 7 10v12l9 5 9-5V10l-9-5Z" fill="#fff"/>
      <path d="M16 7v18l3-2V13l3-2-6-4Zm-2 3 3 2v4l-3-2v-4Z" fill="#FF6F00"/>
    </svg>
  ),
  html: (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <path d="M5 3l2 24 9 3 9-3 2-24H5Z" fill="#E34F26"/>
      <path d="M16 6v22l7-2 2-20H16Z" fill="#EF652A"/>
      <path d="M10 10h12l-.5 4H11.5l.3 3h10l-.8 7-6 2-6-2-.4-5h3l.2 2 3.2 1 3.2-1 .4-4H10.7L10 10Z" fill="#fff"/>
    </svg>
  ),
  css: (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <path d="M5 3l2 24 9 3 9-3 2-24H5Z" fill="#1572B6"/>
      <path d="M16 6v22l7-2 2-20H16Z" fill="#33A9DC"/>
      <path d="M10 10h12l-.5 4H11.5l.3 3h10l-.8 7-6 2-6-2-.4-5h3l.2 2 3.2 1 3.2-1 .4-4H10.7L10 10Z" fill="#fff"/>
    </svg>
  ),
  git: (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <rect width="32" height="32" rx="4" fill="#F05032"/>
      <g stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M9 9 23 23M16 9v14"/>
      </g>
      <g fill="#fff">
        <circle cx="9" cy="9" r="2.2"/>
        <circle cx="23" cy="23" r="2.2"/>
        <circle cx="16" cy="23" r="2.2"/>
      </g>
    </svg>
  ),
};

// Per-skill lucide icon overrides (otherwise we fall back to the category icon)
const SKILL_ICON = {
  "Selenium WebDriver": "bot",
  "JavaScript": "code-2",
  "TypeScript": "code-2",
  "Node.js": "server",
  "PostgreSQL": "database",
  "AWS": "cloud",
  "React.js": "component",
  "Python": "code",
  "Figma": "pen-tool",
  "Docker": "container",
  "Flutter": "smartphone",
  "Power BI": "bar-chart",
  "TensorFlow": "brain",
  "API Testing": "plug",
  "Appium": "smartphone",
  "Jenkins": "workflow",
  "Git": "git-branch",
};

// Lucide-style outline icon in a soft category-colored rounded square.
const SkillGlyph = ({ skill, glyph, size = 56 }) => {
  const s = skill || { cat: "all", name: (glyph && glyph.label) || "" };
  const cats = (typeof CATEGORIES !== "undefined") ? CATEGORIES : (window.CATEGORIES || []);
  const cat = cats.find(c => c.id === s.cat) || { bg: "#EEF2FF", fg: "#4F46E5", icon: "grid" };
  const iconName = SKILL_ICON[s.name] || cat.icon;
  const iconSize = size >= 56 ? 32 : Math.round(size * 0.55);
  return (
    <div className="glyph" style={{ background: cat.bg, color: cat.fg, width: size, height: size }}>
      <Icon name={iconName} size={iconSize} stroke={1.8}/>
    </div>
  );
};

// Map skill names → logo keys
const SKILL_LOGO = {
  "Selenium WebDriver": "selenium",
  "JavaScript": "javascript",
  "TypeScript": "typescript",
  "Node.js": "node",
  "PostgreSQL": "postgres",
  "AWS": "aws",
  "React.js": "react",
  "React Native": "react",
  "Python": "python",
  "Python for Data Analysis": "python",
  "Figma": "figma",
  "Docker": "docker",
  "Flutter": "flutter",
  "Power BI": "powerbi",
  "TensorFlow": "tensorflow",
  "HTML": "html",
  "CSS": "css",
  "Git": "git",
};

window.SkillGlyph = SkillGlyph;
window.SKILL_LOGO = SKILL_LOGO;
