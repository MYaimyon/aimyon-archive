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

//페이지 로드 완료 후 헤더/푸터 로드
document.addEventListener('DOMContentLoaded', () => {
                        //DOMContentLoaded = "HTML 다 읽혔을 때" 이벤트
    loadComponent('#header-placeholder', '../components/header.html');
    loadComponent('#footer-placeholder', '../components/footer.html');
    //HTML이 준비되면 자동으로 헤더/푸터 로드
});

//탭 전환 함수 (song-detail 페이지용)
function showTab(tabName) {
    //모든 탭 비활성화
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    //선택된 탭 활성화
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

