/**
 * SkillBaseHire — Profile Photo Upload Component
 * Pencil-button + dropdown (Replace / Delete) with drag & drop, client-side
 * compression, preview modal, and XHR progress indicator.
 */
(function (global) {
  'use strict';

  var MAX_BYTES = 100 * 1024;  // 100 KB
  var MAX_DIM   = 400;
  var ERR_MSG   = 'Only JPG, JPEG, PNG, and WEBP images up to 100 KB are allowed.';

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function (e) {
        var img = new Image();
        img.onerror = reject;
        img.onload = function () {
          var dim    = Math.min(img.width, img.height);
          var outDim = Math.min(dim, MAX_DIM);
          var canvas = document.createElement('canvas');
          canvas.width  = outDim;
          canvas.height = outDim;
          var ctx  = canvas.getContext('2d');
          var srcX = (img.width  - dim) / 2;
          var srcY = (img.height - dim) / 2;
          ctx.drawImage(img, srcX, srcY, dim, dim, 0, 0, outDim, outDim);
          var quality = 0.92;
          var tryEncode = function () {
            canvas.toBlob(function (blob) {
              if (!blob) { reject(new Error('encode failed')); return; }
              if (blob.size <= MAX_BYTES || quality <= 0.10) {
                resolve(blob);
              } else {
                quality = Math.max(0.10, quality - 0.08);
                tryEncode();
              }
            }, 'image/jpeg', quality);
          };
          tryEncode();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  class PhotoUpload {
    constructor(opts) {
      this.el        = document.getElementById(opts.el);
      this.uploadUrl = opts.uploadUrl;
      this.removeUrl = opts.removeUrl;
      this.photo     = opts.photo;
      this.name      = opts.name || '?';
      this.size      = opts.size || 92;
      this._open     = false;
      if (!this.el) return;
      this._mount();
    }

    _mount() {
      var s        = this.size;
      var btnSize  = Math.round(Math.max(22, s * 0.30));
      var fontSize = Math.round(s * 0.38);

      this.el.style.cssText = 'position:relative;display:inline-block;width:' + s + 'px;height:' + s + 'px;';

      /* avatar circle */
      this._circle = document.createElement('div');
      this._circle.style.cssText = [
        'width:' + s + 'px;height:' + s + 'px;border-radius:50%;overflow:hidden;',
        'background:linear-gradient(135deg,#4F46E5,#7C3AED);',
        'display:flex;align-items:center;justify-content:center;',
        'font-size:' + fontSize + 'px;font-weight:800;color:#fff;user-select:none;',
        'flex-shrink:0;transition:opacity .15s;',
      ].join('');
      this._setAvatarContent();

      /* pencil edit button */
      this._editBtn = document.createElement('button');
      this._editBtn.type = 'button';
      this._editBtn.setAttribute('aria-label', 'Edit photo');
      this._editBtn.style.cssText = [
        'position:absolute;bottom:2px;right:2px;',
        'width:' + btnSize + 'px;height:' + btnSize + 'px;border-radius:50%;',
        'background:#e2e8f0;border:2px solid #fff;',
        'cursor:pointer;display:flex;align-items:center;justify-content:center;',
        'box-shadow:0 1px 4px rgba(0,0,0,.18);',
        'transition:background .15s;z-index:2;padding:0;',
      ].join('');
      var iconSize = Math.round(btnSize * 0.48);
      this._editBtn.innerHTML = '<svg width="' + iconSize + '" height="' + iconSize + '" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
      this._editBtn.onmouseenter = () => { this._editBtn.style.background = '#cbd5e1'; };
      this._editBtn.onmouseleave = () => { this._editBtn.style.background = '#e2e8f0'; };

      /* dropdown */
      this._dropdown = document.createElement('div');
      this._dropdown.style.cssText = [
        'position:absolute;bottom:' + (btnSize + 8) + 'px;right:0;',
        'background:#fff;border-radius:10px;',
        'box-shadow:0 8px 24px rgba(0,0,0,.16),0 0 0 1px rgba(0,0,0,.06);',
        'overflow:hidden;min-width:120px;display:none;z-index:100;',
      ].join('');

      var mkItem = (label, color) => {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.style.cssText = 'display:block;width:100%;padding:.6rem 1rem;text-align:left;font-size:.8125rem;font-weight:500;color:' + color + ';background:transparent;border:none;cursor:pointer;transition:background .12s;';
        btn.onmouseenter = () => { btn.style.background = color === '#dc2626' ? '#fef2f2' : '#f8fafc'; };
        btn.onmouseleave = () => { btn.style.background = 'transparent'; };
        return btn;
      };

      var replaceBtn = mkItem('Replace', '#0f172a');
      var divider    = document.createElement('div');
      divider.style.cssText = 'height:1px;background:#f1f5f9;';
      var deleteBtn  = mkItem('Delete', '#dc2626');

      replaceBtn.onclick = () => { this._closeDropdown(); this._fileInput.click(); };
      deleteBtn.onclick  = () => { this._closeDropdown(); this._remove(); };

      this._dropdown.appendChild(replaceBtn);
      this._dropdown.appendChild(divider);
      this._dropdown.appendChild(deleteBtn);

      /* hidden file input */
      this._fileInput = document.createElement('input');
      this._fileInput.type   = 'file';
      this._fileInput.accept = 'image/jpeg,image/png,image/webp';
      this._fileInput.style.display = 'none';
      this._fileInput.onchange = (e) => {
        var file = e.target.files[0];
        e.target.value = '';
        if (file) this._handleFile(file);
      };

      /* hint text (sibling, inserted after this.el in parent) */
      this._hintEl = document.createElement('p');
      this._hintEl.style.cssText = 'font-size:.7rem;color:#64748b;margin:.4rem 0 0;text-align:center;line-height:1.4;';
      this._hintEl.textContent = '';

      /* error element (sibling, inserted after hint) */
      this._errorEl = document.createElement('p');
      this._errorEl.style.cssText = 'display:none;font-size:.7rem;color:#dc2626;margin:.2rem 0 0;text-align:center;max-width:200px;line-height:1.4;';

      /* assemble inside this.el */
      this.el.appendChild(this._circle);
      this.el.appendChild(this._editBtn);
      this.el.appendChild(this._dropdown);
      this.el.appendChild(this._fileInput);

      /* insert hint + error as siblings after this.el */
      var parent = this.el.parentNode;
      if (parent) {
        var next = this.el.nextSibling;
        parent.insertBefore(this._hintEl, next);
        parent.insertBefore(this._errorEl, this._hintEl.nextSibling);
      }

      /* drag & drop on avatar circle */
      this._circle.addEventListener('dragenter', (e) => {
        e.preventDefault();
        this._circle.style.opacity = '.65';
      });
      this._circle.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      this._circle.addEventListener('dragleave', () => {
        this._circle.style.opacity = '1';
      });
      this._circle.addEventListener('drop', (e) => {
        e.preventDefault();
        this._circle.style.opacity = '1';
        var file = e.dataTransfer.files[0];
        if (file) this._handleFile(file);
      });

      /* edit button toggles dropdown */
      this._editBtn.onclick = (e) => { e.stopPropagation(); this._toggleDropdown(); };
      document.addEventListener('click', () => this._closeDropdown());
      this._dropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    _setAvatarContent() {
      this._circle.innerHTML = '';
      if (this.photo) {
        var img = document.createElement('img');
        img.src = '/static/uploads/photos/' + this.photo;
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

    _showError(msg) {
      this._errorEl.textContent = msg;
      this._errorEl.style.display = 'block';
    }

    _clearError() {
      this._errorEl.style.display = 'none';
      this._errorEl.textContent   = '';
    }

    _handleFile(file) {
      this._clearError();
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        this._showError(ERR_MSG);
        return;
      }
      compressImage(file).then((blob) => {
        if (blob.size > MAX_BYTES) {
          this._showError(ERR_MSG);
          return;
        }
        var previewUrl = URL.createObjectURL(blob);
        this._showModal(blob, previewUrl);
      }).catch(() => {
        this._showError('Could not process the image. Please try a different file.');
      });
    }

    _showModal(blob, previewUrl) {
      var overlay = document.createElement('div');
      overlay.style.cssText = [
        'position:fixed;inset:0;background:rgba(0,0,0,.55);',
        'display:flex;align-items:center;justify-content:center;z-index:9999;',
      ].join('');

      var card = document.createElement('div');
      card.style.cssText = [
        'background:#fff;border-radius:16px;padding:2rem 1.75rem;',
        'display:flex;flex-direction:column;align-items:center;gap:.875rem;',
        'max-width:300px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.28);',
      ].join('');

      var title = document.createElement('h3');
      title.textContent = 'Preview Photo';
      title.style.cssText = 'margin:0;font-size:1rem;font-weight:700;color:#0f172a;';

      var preview = document.createElement('img');
      preview.src = previewUrl;
      preview.style.cssText = 'width:120px;height:120px;border-radius:50%;object-fit:cover;box-shadow:0 4px 12px rgba(0,0,0,.14);flex-shrink:0;';

      var sizeNote = document.createElement('p');
      sizeNote.style.cssText = 'margin:0;font-size:.75rem;color:#64748b;';
      sizeNote.textContent = Math.ceil(blob.size / 1024) + ' KB';

      /* progress bar — hidden until upload starts */
      var progressWrap = document.createElement('div');
      progressWrap.style.cssText = 'width:100%;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;display:none;';
      var progressFill = document.createElement('div');
      progressFill.style.cssText = 'height:100%;width:0%;background:#4F46E5;transition:width .1s linear;border-radius:3px;';
      progressWrap.appendChild(progressFill);

      /* buttons */
      var btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:.625rem;width:100%;';

      var cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.cssText = 'flex:1;padding:.55rem;border-radius:8px;border:1.5px solid #e2e8f0;background:transparent;font-size:.875rem;font-weight:600;cursor:pointer;color:#475569;transition:background .12s;';
      cancelBtn.onmouseenter = () => { cancelBtn.style.background = '#f8fafc'; };
      cancelBtn.onmouseleave = () => { cancelBtn.style.background = 'transparent'; };

      var saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.textContent = 'Save Photo';
      saveBtn.style.cssText = 'flex:1;padding:.55rem;border-radius:8px;border:none;background:#4F46E5;color:#fff;font-size:.875rem;font-weight:600;cursor:pointer;transition:opacity .12s;';
      saveBtn.onmouseenter = () => { saveBtn.style.opacity = '.88'; };
      saveBtn.onmouseleave = () => { saveBtn.style.opacity = '1'; };

      var close = () => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
        URL.revokeObjectURL(previewUrl);
      };

      cancelBtn.onclick = close;
      overlay.onclick   = (e) => { if (e.target === overlay) close(); };

      saveBtn.onclick = () => {
        saveBtn.disabled    = true;
        cancelBtn.disabled  = true;
        saveBtn.textContent = 'Uploading…';
        saveBtn.style.opacity = '.65';
        progressWrap.style.display = 'block';
        this._upload(blob, progressFill, (err, filename) => {
          if (err) {
            close();
            this._showError('Upload failed. Please try again.');
            return;
          }
          this.photo = filename || null;
          this._applyPreview(previewUrl);
          close();
        });
      };

      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(saveBtn);
      card.appendChild(title);
      card.appendChild(preview);
      card.appendChild(sizeNote);
      card.appendChild(progressWrap);
      card.appendChild(btnRow);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    }

    _upload(blob, progressFill, callback) {
      var csrfMeta = document.querySelector('meta[name="csrf-token"]');
      var csrf     = csrfMeta ? csrfMeta.content : '';
      var fd       = new FormData();
      fd.append('photo', blob, 'photo.jpg');

      var xhr = new XMLHttpRequest();
      xhr.open('POST', this.uploadUrl, true);
      xhr.setRequestHeader('X-CSRFToken', csrf);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          progressFill.style.width = Math.round(e.loaded / e.total * 100) + '%';
        }
      };
      xhr.onload = () => {
        progressFill.style.width = '100%';
        if (xhr.status >= 200 && xhr.status < 300) {
          callback(null, xhr.responseText.trim());
        } else {
          callback(new Error('Upload failed'));
        }
      };
      xhr.onerror = () => callback(new Error('Network error'));
      xhr.send(fd);
    }

    _remove() {
      fetch(this.removeUrl, { method: 'POST' })
        .then((r) => { if (!r.ok) throw new Error(); })
        .then(() => {
          this.photo = null;
          this._circle.innerHTML = '';
          this._circle.textContent = this.name[0].toUpperCase();
          this._syncNavAvatar(null);
        })
        .catch(() => this._showError('Remove failed. Please try again.'));
    }

    _applyPreview(src) {
      this._circle.innerHTML = '';
      var img = document.createElement('img');
      img.src = src;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;';
      this._circle.appendChild(img);
      this._syncNavAvatar(src);
    }

    _syncNavAvatar(src) {
      var nav = document.querySelector('.nav-avatar img');
      if (nav && src) { nav.src = src; return; }
      var navDiv = document.querySelector('.nav-avatar');
      if (navDiv && !src) {
        navDiv.innerHTML = '';
        navDiv.textContent = this.name[0].toUpperCase();
      }
    }
  }

  global.PhotoUpload = PhotoUpload;
}(window));
