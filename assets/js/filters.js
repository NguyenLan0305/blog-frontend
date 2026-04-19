/**
 * filters.js (Phiên bản đồng bộ API chuẩn - Hỗ trợ Lọc Kép)
 * Quản lý bộ lọc Category ngang và Tag dạng Chips
 * Depends on: app.js (S, callApi), posts.js (renderPosts), sidebar.js (renderSbCategories, renderSbTags)
 */

// Khai báo biến toàn cục
var CATEGORIES = [];
var TAGS = [];
var TOTAL_POSTS = 0;

// Hàm này sẽ được gọi lúc khởi tạo trang
function fetchAndRenderFilters() {

    // 1. Gọi API lấy danh sách Category
    callApi('/categories', 'GET').done(function(res) {
        CATEGORIES = res.result || res;

        // Cộng dồn số bài viết của từng danh mục để ra TỔNG SỐ BÀI (All Posts)
        TOTAL_POSTS = 0;
        $.each(CATEGORIES, function(_, c) {
            TOTAL_POSTS += (c.postCount || 0);
        });

        renderCatTabs();
    });

    // 2. Gọi API lấy danh sách Tag
    callApi('/tags', 'GET').done(function(res) {
        TAGS = res.result || res;
        renderTagChips();
    });
}

// ─────────────── HÀM HỖ TRỢ ĐỔI URL THÔNG MINH ───────────────
function updateUrlWithFilters() {
    let newUrl = '/';
    let params = new URLSearchParams();

    if (S.keyword) params.append('q', S.keyword);
    if (S.cat) params.append('cat', S.cat);
    if (S.tag) params.append('tag', S.tag); // Nếu bạn muốn gộp cả Tag vào bộ lọc

    if (params.toString() !== '') {
        newUrl += '?' + params.toString();
    }
    window.history.pushState({}, '', newUrl);
}

// ─────────────── RENDER CATEGORY TABS ───────────────
function renderCatTabs() {
    var $el = $('#cat-tabs').empty();

    if (!CATEGORIES || CATEGORIES.length === 0) {
        $el.append('<span class="text-muted" style="font-size: 0.85rem;">Đang tải bộ lọc...</span>');
        return;
    }

    // Nút "All Posts" mặc định
    $el.append(
        $('<button class="cat-btn' + (!S.cat ? ' on' : '') + '">').html(
            'All Posts <span style="font-size:.68rem;opacity:.65;margin-left:.25rem;">(' + TOTAL_POSTS + ')</span>'
        ).on('click', function(){
            S.cat = null; // Bỏ lọc Category (Nhưng vẫn giữ S.keyword nếu có)

            updateUrlWithFilters(); // Đổi URL an toàn

            renderCatTabs(); // Đổi màu nút ở thanh ngang
            if (typeof renderSbCategories === 'function') renderSbCategories(); // Đồng bộ thanh Sidebar
            if (typeof renderPosts === 'function') renderPosts(); // Lọc lại danh sách bài
        })
    );

    // In ra các nút Category từ Database
    $.each(CATEGORIES, function(_, c){
        $el.append(
            $('<button class="cat-btn' + (S.cat === c.id ? ' on' : '') + '">').html(
                c.name + '<span style="font-size:.68rem;opacity:.65;margin-left:.28rem;">(' + (c.postCount || 0) + ')</span>'
            ).on('click', function(){
                S.cat = (S.cat === c.id) ? null : c.id;

                updateUrlWithFilters(); // Đổi URL an toàn không làm mất keyword

                renderCatTabs();
                if (typeof renderSbCategories === 'function') renderSbCategories(); // Đồng bộ thanh Sidebar
                if (typeof renderPosts === 'function') renderPosts();
            })
        );
    });
}

// ─────────────── RENDER TAG CHIPS ───────────────
function renderTagChips() {
    var $el = $('#tag-chips').empty();

    if (!TAGS || TAGS.length === 0) {
        $el.append('<span class="text-muted" style="font-size: 0.85rem;">Đang tải thẻ...</span>');
        return;
    }

    // In ra các thẻ Tag dạng viên nhộng (Chips)
    $.each(TAGS, function(_, t){
        $el.append(
            $('<button class="tag-chip' + (S.tag === t.id ? ' on' : '') + '">').html(
                '#' + t.name +
                '<span style="font-size:.65rem;opacity:.6;margin-left:.2rem;">(' + (t.postCount || 0) + ')</span>'
            ).on('click', function(){
                S.tag = (S.tag === t.id) ? null : t.id;

                updateUrlWithFilters(); // Đổi URL an toàn

                renderTagChips(); // Đổi màu thẻ ở filter

                // Đồng bộ luôn trạng thái sáng/tối của Tag ở cột Sidebar (nếu có)
                if (typeof renderSbTags === 'function') renderSbTags();

                if (typeof renderPosts === 'function') renderPosts();
            })
        );
    });
}