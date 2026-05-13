// Main app — wires search, filter, drawer, tweaks
const SORT_OPTIONS = [
  { id: "popular", label: "Popularity" },
  { id: "verified", label: "Most Verified" },
  { id: "jobs", label: "Most Jobs" },
  { id: "name", label: "Name (A–Z)" },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "viewMode": "candidate",
  "density": "comfortable",
  "showStats": true,
  "verifiedOnly": false,
  "primary": "#2563eb"
}/*EDITMODE-END*/;

const PALETTES = [
  { id: "#2563eb", hover: "#1d4ed8", soft: "#eff6ff" }, // blue
  { id: "#16a34a", hover: "#15803d", soft: "#ecfdf5" }, // green
  { id: "#7c3aed", hover: "#6d28d9", soft: "#f5f3ff" }, // violet
  { id: "#0f172a", hover: "#000000", soft: "#f1f5f9" }, // slate
];

const App = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("popular");
  const [openSkill, setOpenSkill] = useState(null);
  const [sidebarCompact, setSidebarCompact] = useState(false);

  // Apply primary color tweak
  useEffect(() => {
    const palette = PALETTES.find(p => p.id === t.primary) || PALETTES[0];
    document.documentElement.style.setProperty("--primary", palette.id);
    document.documentElement.style.setProperty("--primary-hover", palette.hover);
    document.documentElement.style.setProperty("--primary-soft", palette.soft);
  }, [t.primary]);

  const filtered = useMemo(() => {
    let r = SKILLS;
    if (cat !== "all") r = r.filter(s => s.cat === cat);
    if (t.verifiedOnly) r = r.filter(s => s.verified);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        (CATEGORIES.find(c => c.id === s.cat)?.label.toLowerCase().includes(q))
      );
    }
    const sorted = [...r];
    if (sort === "verified") sorted.sort((a, b) => b.candidates - a.candidates);
    else if (sort === "jobs") sorted.sort((a, b) => b.jobs - a.jobs);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => (b.candidates + b.jobs * 5) - (a.candidates + a.jobs * 5));
    return sorted;
  }, [search, cat, sort, t.verifiedOnly]);

  const reset = () => { setSearch(""); setCat("all"); setSort("popular"); };

  const isCompact = sidebarCompact || (typeof window !== "undefined" && window.innerWidth < 1080);

  return (
    <div className={"app" + (sidebarCompact ? " is-compact" : "")} data-density={t.density}>
      <Sidebar compact={sidebarCompact}/>
      <div className="main">
        <Topbar
          onToggleSidebar={() => setSidebarCompact(v => !v)}
          viewMode={t.viewMode}
        />
        <div className="content">
          {/* Page header */}
          <div className="page-head">
            <div>
              <h1 className="page-title">Explore Verified Skills</h1>
              <p className="page-sub">Browse skills, take assessments, and showcase your verified expertise to recruiters.</p>
            </div>
            <div className="page-cta">
              <button className="btn btn-primary"><Icon name="play" size={14}/> Start Skill Test</button>
              <button className="btn btn-secondary"><Icon name="user" size={14}/> View My Skills</button>
            </div>
          </div>

          {/* Search */}
          <div className="page-search">
            <Icon name="search" size={18}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skills, tools, technologies..."
            />
            {search && (
              <button className="clear" onClick={() => setSearch("")} aria-label="Clear search">
                <Icon name="x" size={16}/>
              </button>
            )}
          </div>

          {/* Stats */}
          {t.showStats && (
            <div className="stats">
              {STAT_CARDS.map(s => <StatCard key={s.id} s={s}/>)}
            </div>
          )}

          {/* Category chips */}
          <CategoryChips active={cat} onChange={setCat}/>

          {/* Results header */}
          <div className="results-head">
            <div className="results-count">
              <strong>{filtered.length}</strong>{cat === "all" && !search ? "+" : ""} skill{filtered.length !== 1 ? "s" : ""} found
              {cat !== "all" && <span style={{ color: "var(--text-3)" }}> · {CATEGORIES.find(c => c.id === cat)?.label}</span>}
            </div>
            <div className="results-tools">
              <div className="sort-select">
                <span>Sort by:</span>
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              <button className="btn btn-ghost" onClick={reset}>
                <Icon name="reset" size={14}/> Reset Filters
              </button>
            </div>
          </div>

          {/* Workspace: grid + drawer */}
          <div className={"workspace" + (openSkill ? " with-drawer" : "")}>
            <div className="skills-grid">
              {filtered.length === 0
                ? <Empty onReset={reset}/>
                : filtered.slice(0, 20).map(s => (
                    <SkillCard
                      key={s.name}
                      skill={s}
                      viewMode={t.viewMode}
                      onOpen={setOpenSkill}
                      focused={openSkill?.name === s.name}
                    />
                  ))}
            </div>
            {openSkill && <Drawer skill={openSkill} onClose={() => setOpenSkill(null)} viewMode={t.viewMode}/>}
          </div>

          {/* Pagination */}
          {filtered.length > 0 && <Pagination total={filtered.length}/>}
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Role view">
          <TweakRadio
            label="Viewing as"
            value={t.viewMode}
            options={[{ value: "candidate", label: "Candidate" }, { value: "recruiter", label: "Recruiter" }]}
            onChange={v => setTweak("viewMode", v)}
          />
        </TweakSection>
        <TweakSection label="Filters">
          <TweakToggle label="Verified only" value={t.verifiedOnly} onChange={v => setTweak("verifiedOnly", v)} />
          <TweakToggle label="Show stat cards" value={t.showStats} onChange={v => setTweak("showStats", v)} />
        </TweakSection>
        <TweakSection label="Theme">
          <TweakColor
            label="Accent color"
            value={t.primary}
            onChange={v => setTweak("primary", v)}
            options={PALETTES.map(p => p.id)}
          />
          <TweakRadio
            label="Density"
            value={t.density}
            options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]}
            onChange={v => setTweak("density", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

const Pagination = ({ total }) => {
  const [page, setPage] = useState(1);
  const max = Math.max(1, Math.ceil(total / 20));
  const pages = max <= 7 ? [...Array(max).keys()].map(i => i + 1) : [1, 2, 3, "…", max];
  return (
    <div className="pagination">
      <button className={"pg-btn" + (page === 1 ? " is-dis" : "")} onClick={() => setPage(p => Math.max(1, p - 1))}>
        <Icon name="chevron-left" size={14}/> Previous
      </button>
      {pages.map((p, i) => (
        <button
          key={i}
          className={"pg-btn" + (p === page ? " is-active" : "") + (p === "…" ? " is-dis" : "")}
          onClick={() => typeof p === "number" && setPage(p)}
        >{p}</button>
      ))}
      <button className={"pg-btn" + (page === max ? " is-dis" : "")} onClick={() => setPage(p => Math.min(max, p + 1))}>
        Next <Icon name="chevron-right" size={14}/>
      </button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
