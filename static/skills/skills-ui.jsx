// Skill cards + drawer + stats + filters

const STAT_CARDS = [
  { id: "total", label: "Total Skills", value: "120+", sub: "Across all categories", icon: "grid", bg: "#EFF6FF", fg: "#2563EB" },
  { id: "tests", label: "Skill Tests Available", value: "85+", sub: "With assessments", icon: "clipboard-check", bg: "#ECFDF5", fg: "#16A34A" },
  { id: "cats", label: "Verified Categories", value: "10+", sub: "Skill categories", icon: "badge-check", bg: "#F5F3FF", fg: "#7C3AED" },
  { id: "trend", label: "Trending Skills", value: "25+", sub: "In high demand", icon: "flame", bg: "#FFF7ED", fg: "#F97316" },
];

const StatCard = ({ s }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: s.bg, color: s.fg }}>
      <Icon name={s.icon} size={22} stroke={2}/>
    </div>
    <div className="stat-body">
      <div className="stat-label">{s.label}</div>
      <div className="stat-value">{s.value}</div>
      <div className="stat-sub">{s.sub}</div>
    </div>
  </div>
);

// SkillGlyph is provided by logos.jsx (with brand-logo support)

const LevelTag = ({ level }) => {
  const map = {
    Beginner: { bg: "#ecfdf5", fg: "#047857", border: "#a7f3d0" },
    Intermediate: { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe" },
    Advanced: { bg: "#fef3c7", fg: "#b45309", border: "#fcd34d" },
  };
  const t = map[level] || map.Beginner;
  return <span className="lvl-tag" style={{ background: t.bg, color: t.fg, borderColor: t.border }}>{level}</span>;
};

const formatN = n => n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K" : String(n);

const SkillCard = ({ skill, viewMode, onOpen, focused }) => {
  const verified = skill.verified;
  return (
    <button
      className={"skill-card" + (focused ? " is-focused" : "")}
      onClick={() => onOpen(skill)}
      aria-label={`Open ${skill.name} details`}
    >
      <div className="skill-head">
        <SkillGlyph glyph={skill.glyph} logo={SKILL_LOGO[skill.name]} />
      </div>
      <div className="skill-name">{skill.name}</div>
      <div className="skill-cat">{CATEGORIES.find(c => c.id === skill.cat)?.label}</div>
      <div className="skill-desc">{skill.desc}</div>
      <div className="skill-tags">
        <LevelTag level={skill.level} />
        {verified ? (
          <span className="badge badge-verified"><Icon name="check-circle" size={12}/> Verified</span>
        ) : (
          <span className="badge badge-coming"><Icon name="reset" size={12}/> Not Verified</span>
        )}
      </div>
      <div className="skill-stats">
        <div className="skill-stat"><Icon name="shield-check" size={14}/> <strong>{formatN(skill.candidates)}</strong> <span>Verified</span></div>
        <div className="skill-stat"><Icon name="briefcase" size={14}/> <strong>{skill.jobs}</strong> <span>Active Jobs</span></div>
      </div>
      <div className="skill-action">
        {!verified
          ? <span className="btn btn-ghost btn-block">Notify Me</span>
          : viewMode === "recruiter"
            ? <span className="btn btn-primary btn-block">Find Candidates</span>
            : <span className="btn btn-primary btn-block">Take Test</span>}
      </div>
    </button>
  );
};

const CategoryChips = ({ active, onChange }) => (
  <div className="chip-row" role="tablist">
    {CATEGORIES.map(c => (
      <button
        key={c.id}
        role="tab"
        aria-selected={active === c.id}
        className={"chip" + (active === c.id ? " is-active" : "")}
        onClick={() => onChange(c.id)}
      >
        <Icon name={c.icon} size={15} stroke={1.8}/> {c.label}
      </button>
    ))}
  </div>
);

const Empty = ({ onReset }) => (
  <div className="empty">
    <div className="empty-illus">
      <Icon name="search" size={28}/>
    </div>
    <div className="empty-title">No skills found</div>
    <div className="empty-msg">Try changing your search keyword or reset the filters.</div>
    <button className="btn btn-primary" onClick={onReset}>Reset Filters</button>
  </div>
);

const Drawer = ({ skill, onClose, viewMode }) => {
  if (!skill) return null;
  const topics = skill.topics || ["Core concepts", "Best practices", "Tooling", "Hands-on projects", "Real-world patterns", "Common pitfalls"];
  const related = skill.related || ["Related skill A", "Related skill B", "Related skill C", "Related skill D"];
  const jobs = skill.activeJobsList || [
    { title: "Senior " + skill.name + " Engineer", company: "Acme Corp", location: "Remote" },
    { title: skill.name + " Specialist", company: "Globex", location: "Bangalore" },
    { title: "Lead " + skill.name + " Developer", company: "Initech", location: "Hyderabad" },
  ];
  return (
    <>
      <div className="drawer-scrim" onClick={onClose}/>
      <aside className="drawer" role="dialog" aria-label={skill.name}>
        <button className="drawer-close icon-btn" onClick={onClose} aria-label="Close">
          <Icon name="x" size={18}/>
        </button>

        <div className="drawer-hero">
          <SkillGlyph glyph={skill.glyph} logo={SKILL_LOGO[skill.name]} size={48}/>
          <div>
            <h2 className="drawer-title">{skill.name}</h2>
            <div className="drawer-meta">
              <Icon name={CATEGORIES.find(c => c.id === skill.cat)?.icon} size={12}/>
              {CATEGORIES.find(c => c.id === skill.cat)?.label}
            </div>
          </div>
        </div>

        {skill.verified
          ? <div className="ver-pill ver-pill-on"><Icon name="check-circle" size={14}/> Verified Skill</div>
          : <div className="ver-pill ver-pill-off"><Icon name="reset" size={14}/> Test Coming Soon</div>}

        <p className="drawer-desc">{skill.longDesc || skill.desc}</p>

        <div className="drawer-section">
          <div className="d-section-title">Assessment Availability</div>
          {skill.verified
            ? <div className="avail-on"><Icon name="check" size={14}/> Skill test available</div>
            : <div className="avail-off"><Icon name="reset" size={14}/> No test yet — get notified when ready.</div>}
        </div>

        <div className="drawer-section">
          <div className="d-section-title">Difficulty Levels</div>
          <div className="d-levels">
            {["Beginner", "Intermediate", "Advanced"].map(l => (
              <span key={l} className={"d-level" + (l === skill.level ? " is-current" : "")}>{l}</span>
            ))}
          </div>
        </div>

        <div className="drawer-section">
          <div className="d-section-title">Topics Covered</div>
          <ul className="d-topics">
            {topics.slice(0, 7).map(t => <li key={t}><span className="d-topic-dot"/>{t}</li>)}
          </ul>
          {topics.length > 7 && <a className="d-link" href="#">View all topics ({topics.length})</a>}
        </div>

        <div className="drawer-section">
          <div className="d-section-title">Related Skills</div>
          <div className="d-related">
            {related.map(r => <span key={r} className="d-rel-chip">{r}</span>)}
          </div>
        </div>

        <div className="drawer-section">
          <div className="d-section-title">Active Jobs Requiring This Skill</div>
          <a className="d-link" href="#">{skill.jobs} Active Jobs</a>
          <div className="d-jobs">
            {jobs.map((j, i) => (
              <a key={i} href="#" className="d-job">
                <div>
                  <div className="d-job-title">{j.title}</div>
                  <div className="d-job-sub"><span>{j.company}</span> <span className="d-job-dot">·</span> <span>{j.location}</span></div>
                </div>
                <Icon name="chevron-right" size={16}/>
              </a>
            ))}
          </div>
          <a className="d-link" href="#">View all jobs</a>
        </div>

        <div className="drawer-cta">
          {!skill.verified ? (
            <button className="btn btn-primary btn-block btn-lg">Notify Me When Ready</button>
          ) : viewMode === "recruiter" ? (
            <button className="btn btn-primary btn-block btn-lg">Find Verified Candidates</button>
          ) : (
            <button className="btn btn-primary btn-block btn-lg">Take Skill Test</button>
          )}
          <button className="btn btn-ghost btn-block">View Skill Details</button>
        </div>
      </aside>
    </>
  );
};

window.STAT_CARDS = STAT_CARDS;
window.StatCard = StatCard;
window.SkillCard = SkillCard;
window.CategoryChips = CategoryChips;
window.Empty = Empty;
window.Drawer = Drawer;
window.formatN = formatN;
