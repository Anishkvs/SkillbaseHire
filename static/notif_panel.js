/* ── Notification Panel ── */
(function () {
  'use strict';

  /* ── State ── */
  let _open = false;
  let _notifs = [];
  let _pollTimer = null;
  let _ctxTarget = null;   // { notifId, element }

  /* ── DOM refs (resolved lazily after DOMContentLoaded) ── */
  let panel, overlay, list, headBadge, readAllBtn, ctx;

  /* ── Time-ago helper ── */
  function timeAgo(isoStr) {
    if (!isoStr) return '';
    const dt = new Date(isoStr.replace(' ', 'T'));
    const diff = Math.floor((Date.now() - dt.getTime()) / 1000);
    if (diff < 60)  return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 172800) return 'Yesterday';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return dt.toLocaleDateString('en-IN', {day:'numeric', month:'short'});
  }

  /* ── Type → icon SVG ── */
  const ICONS = {
    shortlisted:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    reviewing:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    rejected:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    skill_test:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    passed:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    job_match:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>',
    profile_viewed:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    interview:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    general:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
  };

  function iconFor(type) {
    return ICONS[type] || ICONS.general;
  }

  /* ── Render list ── */
  function render() {
    if (!list) return;

    const unread = _notifs.filter(n => !n.is_read);
    const read   = _notifs.filter(n =>  n.is_read);

    if (_notifs.length === 0) {
      list.innerHTML =
        '<div class="np-empty">' +
          '<div class="np-empty-icon">🔔</div>' +
          '<div class="np-empty-msg">No notifications yet</div>' +
        '</div>';
      return;
    }

    let html = '';

    if (unread.length) {
      html += '<div class="np-section-label">New</div>';
      html += unread.map(renderItem).join('');
    }

    if (read.length) {
      html += '<div class="np-section-label">Earlier</div>';
      html += read.map(renderItem).join('');
    }

    list.innerHTML = html;

    /* bind three-dot buttons */
    list.querySelectorAll('.np-more-btn').forEach(btn => {
      btn.addEventListener('click', onMoreClick);
    });

    /* bind item click to redirect */
    list.querySelectorAll('.np-item').forEach(item => {
      item.addEventListener('click', onItemClick);
    });
  }

  function renderItem(n) {
    const iconClass = 'np-icon-' + (n.type || 'general');
    const unreadClass = n.is_read ? '' : ' np-item-unread';
    return (
      '<div class="np-item' + unreadClass + '" data-id="' + n.id + '" data-url="' + (n.redirect_url || '') + '">' +
        '<div class="np-item-icon ' + iconClass + '">' + iconFor(n.type) + '</div>' +
        '<div class="np-item-body">' +
          '<div class="np-item-title">' + escHtml(n.title) + '</div>' +
          '<div class="np-item-msg">'   + escHtml(n.message) + '</div>' +
          '<div class="np-item-time">'  + timeAgo(n.created_at) + '</div>' +
        '</div>' +
        (!n.is_read ? '<div class="np-unread-dot"></div>' : '') +
        '<button class="np-more-btn" data-id="' + n.id + '" title="More" aria-label="More options">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>' +
        '</button>' +
      '</div>'
    );
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Update bell badges across page ── */
  function updateBell(count) {
    document.querySelectorAll('.np-badge, .nav-notif-badge').forEach(el => {
      if (count > 0) {
        el.textContent = count < 100 ? count : '99+';
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    document.querySelectorAll('.np-bell-btn').forEach(btn => {
      if (count > 0) {
        btn.classList.add('np-has-unread');
      } else {
        btn.classList.remove('np-has-unread');
      }
    });

    if (headBadge) {
      if (count > 0) {
        headBadge.textContent = count < 100 ? count : '99+';
        headBadge.style.display = '';
      } else {
        headBadge.style.display = 'none';
      }
    }
  }

  /* ── Fetch from API ── */
  function npFetch() {
    return fetch('/api/notifications', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(data => {
        _notifs = data.notifications || [];
        updateBell(data.unread_count || 0);
        render();
      })
      .catch(() => {});
  }

  /* ── Open / close ── */
  function openPanel() {
    if (_open) return;
    _open = true;
    panel.classList.add('np-open');
    overlay.classList.add('np-overlay-open');
    npFetch();
  }

  function closePanel() {
    if (!_open) return;
    _open = false;
    panel.classList.remove('np-open');
    overlay.classList.remove('np-overlay-open');
    closeCtx();
  }

  window.toggleNotifPanel = function () {
    _open ? closePanel() : openPanel();
  };

  /* ── Auto-poll ── */
  function startPoll() {
    if (_pollTimer) return;
    _pollTimer = setInterval(function () {
      if (!_open) npFetch();
    }, 30000);
    npFetch();
  }

  /* ── Item click ── */
  function onItemClick(e) {
    if (e.target.closest('.np-more-btn')) return;
    const item = e.currentTarget;
    const id   = parseInt(item.dataset.id, 10);
    const url  = item.dataset.url;

    const notif = _notifs.find(n => n.id === id);
    if (notif && !notif.is_read) {
      markRead(id);
    }

    closePanel();
    if (url) window.location.href = url;
  }

  /* ── Mark read ── */
  function markRead(id) {
    fetch('/api/notifications/' + id + '/read', {
      method: 'POST', credentials: 'same-origin'
    }).then(() => {
      const n = _notifs.find(n => n.id === id);
      if (n) n.is_read = true;
      const unread = _notifs.filter(n => !n.is_read).length;
      updateBell(unread);
      render();
    }).catch(() => {});
  }

  /* ── Delete ── */
  function deleteNotif(id) {
    fetch('/api/notifications/' + id + '/delete', {
      method: 'POST', credentials: 'same-origin'
    }).then(() => {
      _notifs = _notifs.filter(n => n.id !== id);
      const unread = _notifs.filter(n => !n.is_read).length;
      updateBell(unread);
      render();
    }).catch(() => {});
  }

  /* ── Read all ── */
  function readAll() {
    fetch('/api/notifications/read-all', {
      method: 'POST', credentials: 'same-origin'
    }).then(() => {
      _notifs.forEach(n => { n.is_read = true; });
      updateBell(0);
      render();
    }).catch(() => {});
  }

  /* ── Three-dot context menu ── */
  function onMoreClick(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const id  = parseInt(btn.dataset.id, 10);
    const rect = btn.getBoundingClientRect();

    _ctxTarget = { id };

    /* position */
    ctx.style.top  = (rect.bottom + 4) + 'px';
    ctx.style.left = Math.max(8, rect.right - 160) + 'px';

    /* update action labels */
    const notif = _notifs.find(n => n.id === id);
    const markReadBtn = ctx.querySelector('[data-action="mark-read"]');
    if (markReadBtn) {
      markReadBtn.style.display = (notif && !notif.is_read) ? '' : 'none';
    }

    ctx.classList.add('np-ctx-open');
  }

  function closeCtx() {
    ctx.classList.remove('np-ctx-open');
    _ctxTarget = null;
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', function () {
    panel    = document.getElementById('npPanel');
    overlay  = document.getElementById('npOverlay');
    list     = document.getElementById('npList');
    headBadge = document.getElementById('npHeadBadge');
    readAllBtn = document.getElementById('npReadAll');
    ctx      = document.getElementById('npCtx');

    if (!panel) return;

    overlay.addEventListener('click', closePanel);

    if (readAllBtn) {
      readAllBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        readAll();
      });
    }

    /* context menu actions */
    if (ctx) {
      ctx.querySelector('[data-action="mark-read"]').addEventListener('click', function () {
        if (_ctxTarget) markRead(_ctxTarget.id);
        closeCtx();
      });
      ctx.querySelector('[data-action="delete"]').addEventListener('click', function () {
        if (_ctxTarget) deleteNotif(_ctxTarget.id);
        closeCtx();
      });
      ctx.querySelector('[data-action="view"]').addEventListener('click', function () {
        if (_ctxTarget) {
          const n = _notifs.find(n => n.id === _ctxTarget.id);
          closeCtx();
          closePanel();
          if (n && n.redirect_url) window.location.href = n.redirect_url;
          else window.location.href = '/candidate/notifications';
        }
      });
      document.addEventListener('click', function (e) {
        if (!ctx.contains(e.target)) closeCtx();
      });
    }

    startPoll();
  });
})();
