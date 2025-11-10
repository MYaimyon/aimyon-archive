async function loadComponent(selector, path) {
    const container = document.querySelector(selector);
    if (!container) {
        return;
    }
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        container.innerHTML = html;
        try {
            const event = new CustomEvent('component:loaded', { detail: { selector, path } });
            document.dispatchEvent(event);
            // If header loaded, ensure auth script is present and render controls
            if (String(path).includes('header.html')) {
                if (!window.__authLoaded) {
                    const s = document.createElement('script');
                    s.src = '../assets/js/auth.js';
                    s.onload = () => {
                        window.__authLoaded = true;
                        if (window.Auth?.renderNavAuth) window.Auth.renderNavAuth();
                    };
                    document.head.appendChild(s);
                } else {
                    if (window.Auth?.renderNavAuth) window.Auth.renderNavAuth();
                }
            }
        } catch {}
    } catch (error) {
        console.error(`컴포넌트 로드 실패 (${path}):`, error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponent('#header-placeholder', '../components/header.html');
  loadComponent('#sidebar-placeholder', '../components/sidebar.html');
  loadComponent('#footer-placeholder', '../components/footer.html');
});

function showTab(tabName, evt) {
    const panes = document.querySelectorAll('.tab-pane');
    const buttons = document.querySelectorAll('.tab-btn');

    panes.forEach(pane => pane.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    const target = document.getElementById(tabName);
    if (target) target.classList.add('active');

    const sourceButton = evt?.target || window.event?.target;
    if (sourceButton && sourceButton.classList) {
        sourceButton.classList.add('active');
    }
}
