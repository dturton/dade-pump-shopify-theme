if (!customElements.get('breakdown-zoom')) {
  customElements.define(
    'breakdown-zoom',
    class BreakdownZoom extends HTMLElement {
      constructor() {
        super();
        this.image = this.querySelector('img');
        this.zoomSrc = this.dataset.zoomSrc || (this.image && this.image.src);
        this.overlay = null;
        this.scale = 1;
        this.translate = { x: 0, y: 0 };
        this.lastPointer = null;
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
      }

      connectedCallback() {
        if (!this.image) return;
        this.classList.add('breakdown-zoom--ready');
        this.image.setAttribute('role', 'button');
        this.image.setAttribute('tabindex', '0');
        this.image.setAttribute('aria-label', this.dataset.label || 'Open zoomed diagram');
        this.image.addEventListener('click', this.open);
        this.image.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.open();
          }
        });
      }

      open() {
        if (this.overlay) return;
        const overlay = document.createElement('div');
        overlay.className = 'breakdown-zoom__overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', this.dataset.label || 'Zoomed diagram');

        const stage = document.createElement('div');
        stage.className = 'breakdown-zoom__stage';

        const img = document.createElement('img');
        img.className = 'breakdown-zoom__img';
        img.src = this.zoomSrc;
        img.alt = this.image.alt || '';
        img.draggable = false;

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'breakdown-zoom__close';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = '&times;';

        const hint = document.createElement('div');
        hint.className = 'breakdown-zoom__hint';
        hint.textContent = 'Scroll or pinch to zoom · drag to pan · Esc to close';

        stage.appendChild(img);
        overlay.appendChild(closeBtn);
        overlay.appendChild(stage);
        overlay.appendChild(hint);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        this.overlay = overlay;
        this.stage = stage;
        this.zoomImg = img;
        this.scale = 1;
        this.translate = { x: 0, y: 0 };
        this.applyTransform();

        closeBtn.addEventListener('click', this.close);
        overlay.addEventListener('click', (event) => {
          if (event.target === overlay) this.close();
        });
        document.addEventListener('keydown', this.onKeydown);
        stage.addEventListener('wheel', this.onWheel, { passive: false });
        stage.addEventListener('pointerdown', this.onPointerDown);
        img.addEventListener('dblclick', () => this.toggleZoom());

        requestAnimationFrame(() => overlay.classList.add('is-open'));
        closeBtn.focus();
      }

      close() {
        if (!this.overlay) return;
        document.removeEventListener('keydown', this.onKeydown);
        document.body.style.overflow = '';
        this.overlay.remove();
        this.overlay = null;
        this.image.focus();
      }

      onKeydown(event) {
        if (event.key === 'Escape') this.close();
      }

      onWheel(event) {
        event.preventDefault();
        const delta = -event.deltaY * 0.0015;
        this.zoomAt(this.scale * (1 + delta), event.clientX, event.clientY);
      }

      toggleZoom() {
        if (this.scale > 1.01) {
          this.scale = 1;
          this.translate = { x: 0, y: 0 };
        } else {
          this.scale = 2.5;
        }
        this.applyTransform();
      }

      zoomAt(nextScale, clientX, clientY) {
        const clamped = Math.max(1, Math.min(6, nextScale));
        const rect = this.zoomImg.getBoundingClientRect();
        const offsetX = clientX - rect.left - rect.width / 2;
        const offsetY = clientY - rect.top - rect.height / 2;
        const ratio = clamped / this.scale;
        this.translate.x = (this.translate.x - offsetX) * ratio + offsetX;
        this.translate.y = (this.translate.y - offsetY) * ratio + offsetY;
        this.scale = clamped;
        if (this.scale === 1) this.translate = { x: 0, y: 0 };
        this.applyTransform();
      }

      onPointerDown(event) {
        if (this.scale <= 1) return;
        this.lastPointer = { x: event.clientX, y: event.clientY };
        this.stage.setPointerCapture(event.pointerId);
        this.stage.addEventListener('pointermove', this.onPointerMove);
        this.stage.addEventListener('pointerup', this.onPointerUp);
        this.stage.addEventListener('pointercancel', this.onPointerUp);
        this.stage.classList.add('is-panning');
      }

      onPointerMove(event) {
        if (!this.lastPointer) return;
        this.translate.x += event.clientX - this.lastPointer.x;
        this.translate.y += event.clientY - this.lastPointer.y;
        this.lastPointer = { x: event.clientX, y: event.clientY };
        this.applyTransform();
      }

      onPointerUp(event) {
        this.lastPointer = null;
        this.stage.releasePointerCapture(event.pointerId);
        this.stage.removeEventListener('pointermove', this.onPointerMove);
        this.stage.removeEventListener('pointerup', this.onPointerUp);
        this.stage.removeEventListener('pointercancel', this.onPointerUp);
        this.stage.classList.remove('is-panning');
      }

      applyTransform() {
        if (!this.zoomImg) return;
        this.zoomImg.style.transform = `translate(${this.translate.x}px, ${this.translate.y}px) scale(${this.scale})`;
        this.zoomImg.style.cursor = this.scale > 1 ? 'grab' : 'zoom-in';
      }
    }
  );
}
