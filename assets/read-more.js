if (!customElements.get('read-more')) {
  customElements.define(
    'read-more',
    class ReadMore extends HTMLElement {
      connectedCallback() {
        this.content = this.querySelector('[data-read-more-content]');
        this.button = this.querySelector('[data-read-more-toggle]');
        if (!this.content || !this.button) return;

        this.collapsedHeight = parseInt(this.dataset.collapsedHeight || '240', 10);
        this.expandedLabel = this.dataset.expandedLabel || 'Read less';
        this.collapsedLabel = this.dataset.collapsedLabel || 'Read more';

        this.evaluate();
        this.button.addEventListener('click', () => this.toggle());
        window.addEventListener('resize', () => this.evaluate());
      }

      evaluate() {
        if (this.classList.contains('is-expanded')) return;
        const needsClamp = this.content.scrollHeight > this.collapsedHeight + 8;
        this.classList.toggle('is-clampable', needsClamp);
        this.button.hidden = !needsClamp;
        if (needsClamp) {
          this.content.style.maxHeight = `${this.collapsedHeight}px`;
          this.button.textContent = this.collapsedLabel;
          this.button.setAttribute('aria-expanded', 'false');
        } else {
          this.content.style.maxHeight = '';
        }
      }

      toggle() {
        const expanded = this.classList.toggle('is-expanded');
        if (expanded) {
          this.content.style.maxHeight = `${this.content.scrollHeight}px`;
          this.button.textContent = this.expandedLabel;
          this.button.setAttribute('aria-expanded', 'true');
        } else {
          this.content.style.maxHeight = `${this.collapsedHeight}px`;
          this.button.textContent = this.collapsedLabel;
          this.button.setAttribute('aria-expanded', 'false');
          this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  );
}
