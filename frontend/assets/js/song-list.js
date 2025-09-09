/**
 * Song List Page JavaScript
 * 곡 목록 페이지 전용 기능: 검색, 필터링, 애니메이션
 */

// 페이지 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // Song List 페이지에서만 실행
    if (document.querySelector('.songs-grid')) {
        initSongListFeatures();
    }
});

function initSongListFeatures() {
    const searchInput = document.getElementById('searchInput');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const songCards = document.querySelectorAll('.song-card');
    const songCountSpan = document.getElementById('songCount');
    const resetBtn = document.getElementById('resetBtn');
    
    let currentFilter = 'all';
    
    // 검색 기능 (엔터 키로만 검색)
    if (searchInput) {
        const handleSearch = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            filterSongs(searchTerm, currentFilter);
        };

        // 전체 보기 버튼 기능
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                // 검색어 초기화
                searchInput.value = '';
                // 전체 목록 표시
                filterSongs('', currentFilter);
                // 전체 보기 버튼 표시/숨기기
                if (resetBtn) {
                    if (searchTerm !== '') {
                        resetBtn.style.display = 'inline-block';  // 검색 중일 때 버튼 표시
                    } else {
                        resetBtn.style.display = 'none';          // 전체 목록일 때 버튼 숨김
                    }
                }
                // 버튼 숨기기
                resetBtn.style.display = 'none';
                // 검색바 포커스 해제
                searchInput.blur();
            });
        }
        
        // 엔터 키 입력 시에만 검색 실행
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
        
        // 검색어 초기화 (ESC 키)
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                filterSongs('', currentFilter);
                searchInput.blur();
            }
        });
        
        // 검색바 포커스 효과
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.style.transform = 'scale(1.02)';
        });
        
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.style.transform = 'scale(1)';
        });
    }
    
    // 필터 탭 기능
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // 활성 탭 변경
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // 현재 필터 업데이트
            currentFilter = e.target.dataset.filter;
            
            // 검색어와 함께 필터링
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            filterSongs(searchTerm, currentFilter);
        });
    });
    
    // 곡 필터링 함수
    function filterSongs(searchTerm, filterType) {
        let visibleCount = 0;
        
        songCards.forEach((card, index) => {
            const titleJpElement = card.querySelector('.song-title-jp');
            const titleKrElement = card.querySelector('.song-title-kr');
            const albumNameElement = card.querySelector('.album-name');
            
            const titleJp = titleJpElement ? titleJpElement.textContent.toLowerCase() : '';
            const titleKr = titleKrElement ? titleKrElement.textContent.toLowerCase() : '';
            const albumName = albumNameElement ? albumNameElement.textContent.toLowerCase() : '';
            const category = card.dataset.category;
            
            // 검색어 매칭
            const matchesSearch = searchTerm === '' || 
                titleJp.includes(searchTerm) || 
                titleKr.includes(searchTerm) || 
                albumName.includes(searchTerm);
            
            // 필터 매칭
            const matchesFilter = filterType === 'all' || category === filterType;
            
            // 카드 표시/숨기기
            if (matchesSearch && matchesFilter) {
                showCard(card);
                visibleCount++;
            } else {
                hideCard(card);
            }
        });
        
        // 곡 개수 업데이트
        if (songCountSpan) {
            animateCounter(songCountSpan, visibleCount);
        }
        
        // 검색 결과 없음 메시지
        setTimeout(() => {
            showNoResultsMessage(visibleCount === 0);
        }, 300);
        
        // 전체 보기 버튼 표시/숨기기
        if (resetBtn) {
            if (searchTerm !== '') {
                resetBtn.style.display = 'inline-block';  // 검색 중일 때 버튼 표시
            } else {
                resetBtn.style.display = 'none';          // 전체 목록일 때 버튼 숨김
            }
        }
    }
    
    // 카드 보이기 애니메이션
    function showCard(card) {
        card.style.display = 'block';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.95)';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 10);
    }
    
    // 카드 숨기기 애니메이션
    function hideCard(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(-20px) scale(0.95)';
        
        setTimeout(() => {
            card.style.display = 'none';
        }, 300);
    }
    
    // 숫자 카운터 애니메이션
    function animateCounter(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = targetValue > currentValue ? 1 : -1;
        const duration = 300;
        const steps = Math.abs(targetValue - currentValue);
        const stepDuration = steps > 0 ? duration / steps : 0;
        
        if (steps === 0) return;
        
        let current = currentValue;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            
            if (current === targetValue) {
                clearInterval(timer);
            }
        }, stepDuration);
    }
    
    // 검색 결과 없음 메시지
    function showNoResultsMessage(show) {
        let noResultsDiv = document.querySelector('.no-results-message');
        
        if (show && !noResultsDiv) {
            noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results-message';
            noResultsDiv.innerHTML = `
                <div style="
                    text-align: center; 
                    padding: 60px 20px; 
                    color: var(--text-secondary);
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                ">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🔍</div>
                    <h3 style="color: var(--primary-color); margin-bottom: 10px; font-size: 1.2rem;">검색 결과가 없습니다</h3>
                    <p style="color: var(--text-secondary);">다른 키워드로 검색해보세요</p>
                </div>
            `;
            
            const songsGrid = document.querySelector('.songs-grid');
            songsGrid.appendChild(noResultsDiv);
            
            // 애니메이션 효과
            setTimeout(() => {
                const messageContent = noResultsDiv.querySelector('div');
                messageContent.style.opacity = '1';
                messageContent.style.transform = 'translateY(0)';
            }, 10);
            
        } else if (!show && noResultsDiv) {
            const messageContent = noResultsDiv.querySelector('div');
            messageContent.style.opacity = '0';
            messageContent.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                noResultsDiv.remove();
            }, 300);
        }
    }
    
    // 초기 카드 스타일 설정
    songCards.forEach(card => {
        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
    });
    
    // 키보드 단축키 (선택적 기능)
    document.addEventListener('keydown', (e) => {
        // Ctrl + F 또는 / 키로 검색바 포커스
        if ((e.ctrlKey && e.key === 'f') || e.key === '/') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // ESC 키로 검색 초기화
        if (e.key === 'Escape' && searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    });
    
    // 초기 로드 애니메이션
    songCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    console.log('🎵 Song List JavaScript initialized!');
}
