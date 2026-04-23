/**
 * nav.js
 * Page navigation, auth state toggle, Avatar Sync & Advanced Notification Logic
 */

function navigate(page) {
    S.page = page;

    $('#p-home, #p-categories, #p-tags').hide();
    $('#p-' + page).show();

    $('[data-page]').removeClass('is-active');
    $('[data-page="' + page + '"]').addClass('is-active');

    if (page === 'categories' && typeof buildCatPage === 'function') buildCatPage();
    if (page === 'tags' && typeof buildTagsPage === 'function') buildTagsPage();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─────────────── AUTHENTICATION UI TOGGLE & AVATAR SYNC ─────────────── */
/* ─────────────── AUTHENTICATION UI TOGGLE & AVATAR SYNC ─────────────── */
function updateNavAuth() {
    const isAuth = S.isAuth;
    const uname = S.uname;
    const token = localStorage.getItem('token');

    if (isAuth && token) {
        $('.nav-guest').attr('style', 'display: none !important');
        $('.nav-user').attr('style', 'display: flex !important');
        $('#nav-username, #mob-nav-username').text(uname);

        // --- MỔ TOKEN ĐỂ CHECK QUYỀN ADMIN ---
        let isAdmin = false;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // Fix lỗi font tiếng Việt khi giải mã token
            const payload = JSON.parse(decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')));

            // Lấy quyền từ thuộc tính scope (Spring Boot trả về ở đây)
            const roles = payload.scope || payload.roles || "";
            if (roles.includes("ADMIN")) {
                isAdmin = true;
            }
        } catch (e) {
            console.error("Lỗi giải mã token:", e);
        }

        // --- CẬP NHẬT GIAO DIỆN THEO QUYỀN ---
        if (isAdmin) {
            $('#btn-desk-admin').show();
            $('#btn-mob-admin').attr('style', 'display: flex !important; color: var(--primary); font-weight: 600;');
            $('.d-role').text('Admin'); // Đổi chữ Author thành Admin
            $('.d-role').css('color', 'var(--primary)'); // Đổi màu chữ cho ngầu
        } else {
            $('#btn-desk-admin').hide();
            $('#btn-mob-admin').attr('style', 'display: none !important;');
            $('.d-role').text('Author'); // Trả về mặc định
            $('.d-role').css('color', 'var(--t2)');
        }

        // Lấy Avatar
        const savedAvatar = localStorage.getItem('avatarUrl');
        if (savedAvatar) {
            $('#nav-avatar, #mob-nav-avatar').html(`<img src="${savedAvatar}" alt="avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`);
        } else {
            const userInitials = typeof initials === 'function' ? initials(uname) : uname.charAt(0).toUpperCase();
            $('#nav-avatar, #mob-nav-avatar').text(userInitials);
        }

        callApi('/users/my-profile', 'GET').done(function(res) {
            if (res.result && res.result.avatarUrl && res.result.avatarUrl !== savedAvatar) {
                localStorage.setItem('avatarUrl', res.result.avatarUrl);
                $('#nav-avatar, #mob-nav-avatar').html(`<img src="${res.result.avatarUrl}" alt="avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`);
            }
        });

        checkUnreadNotifications();
    } else {
        // NẾU CHƯA ĐĂNG NHẬP
        $('.nav-guest').attr('style', 'display: flex !important');
        $('.nav-user').attr('style', 'display: none !important');
        $('#btn-desk-admin').hide();
        $('#btn-mob-admin').attr('style', 'display: none !important;');
    }
}

/* ─────────────── LOGIC ĐẾM VÀ TẮT THÔNG BÁO THÔNG MINH ─────────────── */
function checkUnreadNotifications() {
    // Lấy thời điểm người dùng click vào chuông lần cuối cùng
    const clearedTime = localStorage.getItem('notif_cleared_time') || 0;

    callApi('/notifications', 'GET').done(function(res) {
        const notifs = res.result || [];

        // Đếm những thông báo: Chưa đọc VÀ Mới hơn lần cuối cùng click chuông
        const unreadCount = notifs.filter(n => !n.read && new Date(n.createdAt).getTime() > clearedTime).length;

        if (unreadCount > 0) {
            $('#nav-notif-badge, #mob-notif-badge').text(unreadCount > 99 ? '99+' : unreadCount).removeClass('hidden').show();
        } else {
            $('#nav-notif-badge, #mob-notif-badge').hide().addClass('hidden');
        }
    });
}

// BẮT SỰ KIỆN: Khi người dùng CLICK VÀO QUẢ CHUÔNG ở Navbar / Mobile
$(document).on('click', 'a[href="/pages/notifications.html"]', function() {
    // Đánh dấu thời điểm hiện tại là "Đã xem tất cả"
    localStorage.setItem('notif_cleared_time', Date.now());
    // Ẩn chấm đỏ ngay lập tức cho mượt
    $('#nav-notif-badge, #mob-notif-badge').hide().addClass('hidden');
});

/* ─────────────── EVENT LISTENERS CƠ BẢN ─────────────── */
$(document).ready(function() {
    if (typeof updateNavAuth === 'function') updateNavAuth();
});

$(document).on('click', '[data-page]', function(){ navigate($(this).data('page')); });

$(document).on('click', '#nav-brand', function(e){
    if (typeof handleEditorNavigation === 'function') {
        e.preventDefault(); handleEditorNavigation(); return;
    }
    if ($('#p-home').length > 0) { navigate('home'); }
    else { window.location.href = '/index.html'; }
});

$(document).on('click', '#btn-logout, #btn-mob-logout', function(e) {
    e.preventDefault();

    // Xóa toàn bộ thông tin đăng nhập và cache
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatarUrl');
    localStorage.removeItem('notif_cleared_time');

    if (typeof S !== 'undefined') { S.isAuth = false; S.uname = null; }

    updateNavAuth();
    toast("Đã đăng xuất thành công!");

    var mobMenuEl = document.getElementById('mob-menu');
    if (mobMenuEl && typeof bootstrap !== 'undefined') {
        var mobMenu = bootstrap.Offcanvas.getInstance(mobMenuEl);
        if (mobMenu) mobMenu.hide();
    }

    setTimeout(function() {
        if ($('#p-home').length > 0) { navigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        else { window.location.href = '/index.html'; }
    }, 300);
});

/* ==========================================
   LOGIC TÌM KIẾM
   ========================================== */
let searchTimeout = null;
function getSearchHistory() { return JSON.parse(localStorage.getItem('inkwell_history') || '[]'); }
function saveSearchHistory(keyword) {
    if(!keyword) return;
    let history = getSearchHistory();
    history = history.filter(k => k.toLowerCase() !== keyword.toLowerCase());
    history.unshift(keyword);
    if(history.length > 5) history.pop();
    localStorage.setItem('inkwell_history', JSON.stringify(history));
}

function renderSearchDropdown($dd, keyword, suggestions = []) {
    $dd.empty();
    if (!keyword) {
        const history = getSearchHistory();
        if (history.length === 0) { $dd.hide(); return; }
        $dd.append('<div class="sd-title">Recent Searches</div>');
        history.forEach(h => {
            $dd.append(`
                <div class="sd-item btn-history" data-key="${h}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>${h}</span>
                </div>
            `);
        });
    } else {
        $dd.append('<div class="sd-title">Suggestions</div>');
        if (suggestions.length === 0) {
            $dd.append('<div class="px-3 py-2 text-muted" style="font-size:0.85rem;">Không tìm thấy kết quả nào.</div>');
        } else {
            suggestions.forEach(b => {
                $dd.append(`
                    <div class="sd-item text-decoration-none d-flex align-items-center btn-suggestion" data-title="${b.title}">
                        <div style="background: rgba(124,111,247,0.1); border-radius: 6px; padding: 6px; margin-right: 12px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <div class="flex-grow-1 overflow-hidden">
                            <div class="text-truncate fw-semibold" style="color: var(--t1); font-size: 0.9rem;">${b.title}</div>
                            <div class="text-truncate" style="color: var(--t3); font-size: 0.75rem; margin-top: 2px;">
                                <span style="color: var(--purple); font-weight: 500;">@${b.authorName || 'Anonymous'}</span> · ${b.categoryName || 'Khác'}
                            </div>
                        </div>
                    </div>
                `);
            });
        }
    }
    $dd.show();
}

$(document).on('input', '#nav-search-input, #mob-search-input', function() {
    clearTimeout(searchTimeout);
    const keyword = $(this).val().trim();
    const isMobile = $(this).attr('id') === 'mob-search-input';
    const $dd = isMobile ? $('#mob-search-dropdown') : $('#desk-search-dropdown');

    if (keyword.length === 0) { renderSearchDropdown($dd, ''); return; }

    searchTimeout = setTimeout(() => {
        callApi('/blogs/search/suggestions?keyword=' + encodeURIComponent(keyword), 'GET')
            .done(function(res) { renderSearchDropdown($dd, keyword, res.result || res); });
    }, 300);
});

$(document).on('focus', '#nav-search-input, #mob-search-input', function() {
    const keyword = $(this).val().trim();
    const isMobile = $(this).attr('id') === 'mob-search-input';
    const $dd = isMobile ? $('#mob-search-dropdown') : $('#desk-search-dropdown');
    if (keyword.length === 0) renderSearchDropdown($dd, '');
});

$(document).on('click', function(e) {
    if (!$(e.target).closest('.search-wrapper').length) {
        $('#desk-search-dropdown, #mob-search-dropdown').hide();
    }
});

function executeSearch(keyword) {
    if(!keyword) return;
    $('#nav-search-input, #mob-search-input').val(keyword);
    saveSearchHistory(keyword);
    $('#desk-search-dropdown, #mob-search-dropdown').hide();

    S.keyword = keyword; S.cat = null; S.tag = null;
    window.history.pushState({}, '', '?q=' + encodeURIComponent(keyword));

    if (typeof renderCatTabs === 'function') renderCatTabs();
    if (typeof renderPosts === 'function') renderPosts();

    var mobMenuEl = document.getElementById('mob-menu');
    if (mobMenuEl && typeof bootstrap !== 'undefined') {
        var mobMenu = bootstrap.Offcanvas.getInstance(mobMenuEl);
        if (mobMenu) mobMenu.hide();
    }
}

$(document).on('keypress', '#nav-search-input, #mob-search-input', function(e) {
    if (e.which === 13) { e.preventDefault(); executeSearch($(this).val().trim()); }
});

$(document).on('click', '.btn-history', function() { executeSearch($(this).data('key')); });
$(document).on('click', '.btn-suggestion', function() { executeSearch($(this).data('title')); });