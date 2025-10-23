async function loadComponent(selector, path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        document.querySelector(selector).innerHTML = html;
    } catch (error) {
        console.error(`컴포넌트 로드 실패 (${path}):`, error);
    }
}

// 페이지 로드 후 헤더/푸터 로드

document.addEventListener('DOMContentLoaded', () => {
    loadComponent('#header-placeholder', '../components/header.html');
    loadComponent('#footer-placeholder', '../components/footer.html');
});

// (legacy) 전역 탭 함수 - event 인자를 명시적으로 받도록 보정
function showTab(tabName, evt) {
    const panes = document.querySelectorAll('.tab-pane');
    const buttons = document.querySelectorAll('.tab-btn');

    panes.forEach(pane => pane.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    const target = document.getElementById(tabName);
    if (target) target.classList.add('active');
    if (evt && evt.target) evt.target.classList.add('active');
}
