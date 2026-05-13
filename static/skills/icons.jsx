// Icons — Lucide-style outline, 1.8 stroke, currentColor
const Icon = ({ name, size = 18, stroke = 1.8 }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "search": return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "x": return <svg {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case "menu": return <svg {...props}><path d="M4 7h16M4 12h12M4 17h16"/></svg>;
    case "bell": return <svg {...props}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
    case "msg": return <svg {...props}><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7a8.4 8.4 0 1 1 16.1-3.8z"/></svg>;
    case "play": return <svg {...props} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>;
    case "user": return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "grid": return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>;
    case "bug": return <svg {...props}><path d="M8 2 6 4M16 2l2 2M9 8h6a4 4 0 0 1 4 4v3a7 7 0 0 1-14 0v-3a4 4 0 0 1 4-4Z"/><path d="M3 12h2M19 12h2M5 17l-2 2M19 17l2 2M5 7 3 5M19 7l2-2M12 11v9"/></svg>;
    case "monitor": return <svg {...props}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
    case "server": return <svg {...props}><rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/></svg>;
    case "database": return <svg {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6"/></svg>;
    case "cloud": return <svg {...props}><path d="M17 18a4 4 0 0 0 1-7.87 6 6 0 0 0-11.79-1A4.5 4.5 0 0 0 6.5 18Z"/></svg>;
    case "smartphone": return <svg {...props}><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>;
    case "bar-chart": return <svg {...props}><path d="M3 20h18M7 16V9M12 16V5M17 16v-4"/></svg>;
    case "brain": return <svg {...props}><path d="M12 5a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0-3 3v1a3 3 0 0 0 1 5.5V16a3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 2-1V5Z"/><path d="M12 5a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1 3 3v1a3 3 0 0 1-1 5.5V16a3 3 0 0 1-3 3 3 3 0 0 1-3 3 3 3 0 0 1-2-1"/></svg>;
    case "pen-tool": return <svg {...props}><path d="m12 19 7-7 3 3-7 7-3-3Z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
    case "kanban": return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7v10M14 7v6"/></svg>;
    case "chevron-right": return <svg {...props}><path d="m9 6 6 6-6 6"/></svg>;
    case "chevron-left": return <svg {...props}><path d="m15 6-6 6 6 6"/></svg>;
    case "chevron-down": return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>;
    case "check": return <svg {...props}><path d="M20 6 9 17l-5-5"/></svg>;
    case "check-circle": return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 6-6"/></svg>;
    case "badge-check": return (
      <svg {...props}>
        <path d="M12 2.5 13.8 4l2.3-.5.8 2.2 2.2.8L18.6 8.8 20 11l-1.6 1.8.6 2.3-2.2.8-.8 2.2-2.3-.6L12 19.1l-1.7-1.6-2.3.6-.8-2.2-2.2-.8L5.4 13 4 11l1.6-1.8L5 6.9l2.2-.8L8 4l2.3.5L12 2.5Z"/>
        <circle cx="12" cy="11.3" r="4.2"/>
        <path d="m10 11.4 1.4 1.4 3-3"/>
      </svg>
    );
    case "shield-check": return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "users": return <svg {...props}><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="8" r="3"/><path d="M22 19a5 5 0 0 0-7-4.5"/></svg>;
    case "briefcase": return <svg {...props}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>;
    case "flame": return (
      <svg {...props}>
        <path d="M13 2c.5 3 2.5 4.5 4 7 1.5 2.5 2 4.5 2 6.5a7 7 0 0 1-14 0c0-3 1.5-5 3-7 .5 1.2 1.5 1.8 2.5 1.8 0-2.5-.5-4.5 2.5-8.3Z"/>
        <path d="M12.5 12c.6 1.6 2 2.4 2 4a2.5 2.5 0 0 1-5 0c0-1.5 1.5-2.5 1.5-4 .8.5 1 .5 1.5 0Z"/>
      </svg>
    );
    case "home": return <svg {...props}><path d="M3 11 12 3l9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>;
    case "clipboard-check": return <svg {...props}><rect x="8" y="2.5" width="8" height="4" rx="1.2"/><path d="M16 4.5h2a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V6A1.5 1.5 0 0 1 6 4.5h2"/><rect x="8" y="10" width="8" height="8" rx="1.4"/><path d="m10 14 1.6 1.6L14.5 12.5"/></svg>;
    case "file-text": return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>;
    case "file-user": return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><circle cx="12" cy="13" r="2"/><path d="M9 19a3 3 0 0 1 6 0"/></svg>;
    case "bookmark": return <svg {...props}><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>;
    case "building": return <svg {...props}><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>;
    case "help": return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></svg>;
    case "logout": return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case "reset": return <svg {...props}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>;
    case "crown": return <svg {...props}><path d="m3 7 4 5 5-7 5 7 4-5v11H3V7Z"/></svg>;
    case "layers": return <svg {...props}><path d="M12 2 2 8l10 6 10-6-10-6Z"/><path d="m2 14 10 6 10-6M2 11l10 6 10-6"/></svg>;
    case "graduation": return <svg {...props}><path d="m22 10-10-5L2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 10v6"/></svg>;
    case "code": return <svg {...props}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>;
    case "code-2": return <svg {...props}><path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14 4 10 20"/></svg>;
    case "component": return <svg {...props}><path d="M12 2 7 7l5 5 5-5-5-5Z"/><path d="m2 12 5-5 5 5-5 5-5-5ZM12 12l5-5 5 5-5 5-5-5ZM7 17l5-5 5 5-5 5-5-5Z"/></svg>;
    case "container": return <svg {...props}><path d="M22 7.7 12 2 2 7.7v8.6L12 22l10-5.7V7.7Z"/><path d="M12 22V12M22 7.7 12 12 2 7.7M7 5l10 5.7"/></svg>;
    case "plug": return <svg {...props}><path d="M12 22v-5M9 7V2M15 7V2M5 10h14v3a7 7 0 0 1-14 0v-3Z"/></svg>;
    case "workflow": return <svg {...props}><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M6 9v3a2 2 0 0 0 2 2h4M18 9v3a2 2 0 0 1-2 2h-4"/></svg>;
    case "git-branch": return <svg {...props}><circle cx="6" cy="3" r="2"/><circle cx="6" cy="21" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 5v14M6 14a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-3"/></svg>;
    case "bot": return <svg {...props}><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 4v4M8 14h.01M16 14h.01M10 18h4"/><path d="M2 14h2M20 14h2"/></svg>;
    default: return null;
  }
};

window.Icon = Icon;
