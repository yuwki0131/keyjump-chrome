let markers = [];
let input = '';

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'activate') {
    activate();
  }
});

function activate() {
  if (markers.length) return;
  input = '';
  const links = Array.from(document.querySelectorAll("a[href]"))
    .filter(el => isVisible(el));
  markers = links.map((link, i) => createMarker(link, labelForIndex(i)));
  document.addEventListener('keydown', onKeyDown, true);
}

function deactivate() {
  markers.forEach(m => m.el.remove());
  markers = [];
  document.removeEventListener('keydown', onKeyDown, true);
  input = '';
}

function onKeyDown(e) {
  if (!markers.length) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    deactivate();
    return;
  }
  if (e.key.length === 1) {
    e.preventDefault();
    e.stopPropagation();
    input += e.key.toUpperCase();
    const active = markers.filter(m => m.label.startsWith(input));
    markers.forEach(m => {
      m.el.style.opacity = active.includes(m) ? '1' : '0.3';
    });
    if (active.length === 1 && active[0].label === input) {
      const link = active[0].link;
      deactivate();
      link.click();
    }
  }
}

function createMarker(link, label) {
  const rect = link.getBoundingClientRect();
  const marker = document.createElement('div');
  marker.textContent = label;
  Object.assign(marker.style, {
    position: 'absolute',
    top: `${window.scrollY + rect.top}px`,
    left: `${window.scrollX + rect.left}px`,
    background: 'yellow',
    color: 'black',
    padding: '2px 4px',
    fontSize: '12px',
    fontWeight: 'bold',
    zIndex: 9999,
  });
  document.body.appendChild(marker);
  return {label, link, el: marker};
}

function labelForIndex(index) {
  let label = '';
  index += 1;
  while (index > 0) {
    index -= 1;
    label = String.fromCharCode(65 + (index % 26)) + label;
    index = Math.floor(index / 26);
  }
  return label;
}

function isVisible(el) {
  if (el.getClientRects().length === 0) return false;
  for (let node = el; node; node = node.parentElement) {
    const style = window.getComputedStyle(node);
    if (style.visibility === 'hidden' || style.display === 'none') {
      return false;
    }
  }
  return true;
}
