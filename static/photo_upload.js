/**
 * SkillBaseHire — Profile Photo Upload Component
 * Simple pencil-button + dropdown (Replace / Delete) design.
 */
(function (global) {
  'use strict';

  class PhotoUpload {
    constructor(opts) {
      this.el        = document.getElementById(opts.el);
      this.uploadUrl = opts.uploadUrl;
      this.removeUrl = opts.removeUrl;
      this.photo     = opts.photo;   // filename string or null
      this.name      = opts.name || '?';
      this.size      = opts.size || 92;
      this._open     = false;
      if (!this.el) return;
      this._mount();
    }

    _mount() {
      const s        = this.size;
      const btnSize  = Math.round(Math.max(22, s * 0.30));
      const fontSize = Math.round(s * 0.38);
      const initial  = this.name[0].toUpperCase();

      /* root wrapper */
      this.el.style.cssText = `position:relative;display:inline-block;width:${s}px;height:${s}px;`;

      /* avatar circle */
      this._circle = document.createElement('div');
      this._circle.style.cssText = `
        width:${s}px;height:${s}px;border-radius:50%;overflow:hidden;
        background:linear-gradient(135deg,#4F46E5,#7C3AED);
        display:flex;align-items:center;justify-content:center;
        font-size:${fontSize}px;font-weight:800;color:#fff;user-select:none;
        flex-shrink:0;
      `.replace(/\n\s+/g, '');
      this._setAvatarContent();

      /* pencil edit button */
      this._editBtn = document.createElement('button');
      this._editBtn.type = 'button';
      this._editBtn.setAttribute('aria-label', 'Edit photo');
      this._editBtn.style.cssText = `
        position:absolute;bottom:2px;right:2px;
        width:${btnSize}px;height:${btnSize}px;border-radius:50%;
        background:#e2e8f0;border:2px solid #fff;
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        box-shadow:0 1px 4px rgba(0,0,0,.18);
        transition:background .15s;z-index:2;padding:0;
      `.replace(/\n\s+/g, '');
      const iconSize = Math.round(btnSize * 0.48);
      this._editBtn.innerHTML = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
      this._editBtn.onmouseenter = () => { this._editBtn.style.background = '#cbd5e1'; };
      this._editBtn.onmouseleave = () => { this._editBtn.style.background = '#e2e8f0'; };

      /* dropdown */
      this._dropdown = document.createElement('div');
      this._dropdown.style.cssText = `
        position:absolute;bottom:${btnSize + 8}px;right:0;
        background:#fff;border-radius:10px;
        box-shadow:0 8px 24px rgba(0,0,0,.16),0 0 0 1px rgba(0,0,0,.06);
        overflow:hidden;min-width:120px;display:none;z-index:100;
      `.replace(/\n\s+/g, '');

      const mkItem = (label, color) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.style.cssText = `display:block;width:100%;padding:.6rem 1rem;text-align:left;font-size:.8125rem;font-weight:500;color:${color};background:transparent;border:none;cursor:pointer;transition:background .12s;`;
        btn.onmouseenter = () => { btn.style.background = color === '#dc2626' ? '#fef2f2' : '#f8fafc'; };
        btn.onmouseleave = () => { btn.style.background = 'transparent'; };
        return btn;
      };

      const replaceBtn = mkItem('Replace', '#0f172a');
      const divider    = document.createElement('div');
      divider.style.cssText = 'height:1px;background:#f1f5f9;';
      const deleteBtn  = mkItem('Delete', '#dc2626');

      replaceBtn.onclick = () => { this._closeDropdown(); this._fileInput.click(); };
      deleteBtn.onclick  = () => { this._closeDropdown(); this._remove(); };

      this._dropdown.appendChild(replaceBtn);
      this._dropdown.appendChild(divider);
      this._dropdown.appendChild(deleteBtn);

      /* hidden file input */
      this._fileInput = document.createElement('input');
      this._fileInput.type    = 'file';
      this._fileInput.accept  = 'image/jpeg,image/png,image/webp';
      this._fileInput.style.display = 'none';
      this._fileInput.onchange = (e) => {
        const file = e.target.files[0];
        e.target.value = '';
        if (file) this._upload(file);
      };

      /* assemble */
      this.el.appendChild(this._circle);
      this.el.appendChild(this._editBtn);
      this.el.appendChild(this._dropdown);
      this.el.appendChild(this._fileInput);

      /* events */
      this._editBtn.onclick = (e) => { e.stopPropagation(); this._toggleDropdown(); };
      document.addEventListener('click', () => this._closeDropdown());
      this._dropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    _setAvatarContent() {
      this._circle.innerHTML = '';
      if (this.photo) {
        const img = document.createElement('img');
        img.src = `/static/uploads/photos/${this.photo}`;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;';
        img.onerror = () => { this.photo = null; this._setAvatarContent(); };
        this._circle.appendChild(img);
      } else {
        this._circle.textContent = this.name[0].toUpperCase();
      }
    }

    _toggleDropdown() {
      this._open = !this._open;
      this._dropdown.style.display = this._open ? 'block' : 'none';
    }

    _closeDropdown() {
      this._open = false;
      this._dropdown.style.display = 'none';
    }

    _upload(file) {
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert('Only JPG, PNG, or WebP images are allowed.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Photo must be under 2 MB.');
        return;
      }
      const fd = new FormData();
      fd.append('photo', file);
      fetch(this.uploadUrl, { method: 'POST', body: fd })
        .then(r => { if (!r.ok) throw new Error('upload failed'); return r.text(); })
        .then(filename => {
          this.photo = filename.trim() || null;
          const blob = URL.createObjectURL(file);
          this._applyPreview(blob);
        })
        .catch(() => alert('Upload failed. Please try again.'));
    }

    _remove() {
      fetch(this.removeUrl, { method: 'POST' })
        .then(r => { if (!r.ok) throw new Error(); })
        .then(() => {
          this.photo = null;
          this._circle.innerHTML = '';
          this._circle.textContent = this.name[0].toUpperCase();
          this._syncNavAvatar(null);
        })
        .catch(() => alert('Remove failed. Please try again.'));
    }

    _applyPreview(src) {
      this._circle.innerHTML = '';
      const img = document.createElement('img');
      img.src = src;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;';
      this._circle.appendChild(img);
      this._syncNavAvatar(src);
    }

    _syncNavAvatar(src) {
      const nav = document.querySelector('.nav-avatar img');
      if (nav && src) { nav.src = src; return; }
      const navDiv = document.querySelector('.nav-avatar');
      if (navDiv && !src) {
        navDiv.innerHTML = '';
        navDiv.textContent = this.name[0].toUpperCase();
      }
    }
  }

  global.PhotoUpload = PhotoUpload;
}(window));
