// Shell — Sidebar + Topbar
const { useState, useMemo, useEffect, useRef } = React;

const NAV_ITEMS = [
  { id: "dash", label: "Dashboard", icon: "home" },
  { id: "jobs", label: "Job Search", icon: "briefcase" },
  { id: "apps", label: "My Applications", icon: "file-text" },
  { id: "tests", label: "Skill Tests", icon: "clipboard-check" },
  { id: "myskills", label: "My Skills", icon: "badge-check" },
  { id: "resumes", label: "Resumes", icon: "file-user" },
  { id: "saved", label: "Saved Jobs", icon: "bookmark" },
  { id: "companies", label: "Companies", icon: "building" },
  { id: "messages", label: "Messages", icon: "msg", badge: 5 },
  { id: "notifications", label: "Notifications", icon: "bell", badge: 3 },
];

const EXPLORE_ITEMS = [
  { id: "skills", label: "Skills", icon: "grid", active: true },
  { id: "courses", label: "Courses", icon: "graduation" },
  { id: "assessments", label: "Assessments", icon: "layers" },
];

const FOOTER_ITEMS = [
  { id: "settings", label: "Settings", icon: "settings" },
  { id: "help", label: "Help & Support", icon: "help" },
  { id: "logout", label: "Logout", icon: "logout" },
];

const Logo = () => (
  <div className="brand">
    <div className="brand-mark" aria-hidden="true">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0" stopColor="#2563eb"/>
            <stop offset="1" stopColor="#06b6d4"/>
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#lg)"/>
        <path d="M10 20.5c1.6 1.3 3.6 2 5.8 2 3.2 0 5.2-1.5 5.2-3.7 0-2-1.4-3-4.4-3.6l-1.4-.3c-1.7-.4-2.4-.9-2.4-1.8 0-1 .9-1.7 2.5-1.7 1.6 0 2.7.6 3.6 1.6l2-1.8c-1.2-1.5-3-2.4-5.5-2.4-3 0-5.1 1.5-5.1 3.7 0 2 1.4 3 4.2 3.6l1.4.3c1.8.4 2.5.9 2.5 1.8 0 1.1-1 1.8-2.7 1.8-1.8 0-3.1-.7-4.1-1.7l-1.6 2.2Z" fill="#fff"/>
      </svg>
    </div>
    <div className="brand-text">SkillBaseHire</div>
  </div>
);

const NavLink = ({ item, active, compact }) => (
  <a className={"nav-link" + (active ? " is-active" : "")} href="#">
    <span className="nav-icon"><Icon name={item.icon} size={18}/></span>
    {!compact && <span className="nav-label">{item.label}</span>}
    {!compact && item.badge && <span className="nav-badge">{item.badge}</span>}
  </a>
);

const Sidebar = ({ compact }) => (
  <aside className={"sidebar" + (compact ? " is-compact" : "")}>
    <div className="sidebar-top">
      <Logo />
    </div>
    <nav className="sidebar-nav">
      <div className="nav-group">
        {NAV_ITEMS.map(i => <NavLink key={i.id} item={i} compact={compact} />)}
      </div>
      {!compact && <div className="nav-section">Explore</div>}
      <div className="nav-group">
        {EXPLORE_ITEMS.map(i => <NavLink key={i.id} item={i} active={i.active} compact={compact} />)}
      </div>
    </nav>

    {!compact && (
      <div className="premium-card">
        <div className="premium-icon"><Icon name="crown" size={20}/></div>
        <div className="premium-title">Unlock Premium Benefits</div>
        <div className="premium-desc">Access advanced job matches, insights and more.</div>
        <button className="btn btn-primary btn-block">
          Upgrade Now <Icon name="chevron-down" size={14}/>
        </button>
      </div>
    )}

    <div className="sidebar-foot">
      {FOOTER_ITEMS.map(i => <NavLink key={i.id} item={i} compact={compact} />)}
    </div>
  </aside>
);

const Topbar = ({ onToggleSidebar, viewMode }) => (
  <header className="topbar">
    <button className="icon-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
      <Icon name="menu" size={20}/>
    </button>
    <div className="topbar-search">
      <Icon name="search" size={16}/>
      <input placeholder="Search jobs, skills, companies..." />
    </div>
    <div className="topbar-right">
      <button className="icon-btn has-dot" aria-label="Notifications">
        <Icon name="bell" size={18}/>
        <span className="dot">3</span>
      </button>
      <button className="icon-btn" aria-label="Messages">
        <Icon name="msg" size={18}/>
      </button>
      <div className="user-chip">
        <div className="avatar">RK</div>
        <div className="user-meta">
          <div className="user-name">Rajesh Kumar</div>
          <div className="user-role">{viewMode === "recruiter" ? "Recruiter" : "Candidate"}</div>
        </div>
        <Icon name="chevron-down" size={14}/>
      </div>
    </div>
  </header>
);

window.Sidebar = Sidebar;
window.Topbar = Topbar;
