/**
 * posts.js
 */

// ─────────────── HÀM XỬ LÝ TEXT THÔNG MINH ───────────────
function extractText(content, len) {
    if (!content) return '';
    let plainText = "";

    try {
        const parsed = JSON.parse(content);
        if (parsed && parsed.blocks) {
            parsed.blocks.forEach(b => {
                if (b.data && b.data.text) plainText += b.data.text + " ";
            });
        } else {
            plainText = content;
        }
    } catch (e) {
        plainText = content;
    }

    var div = document.createElement("div");
    div.innerHTML = plainText;
    var text = div.textContent || div.innerText || "";
    text = text.trim();

    return text.length > len ? text.substring(0, len) + '...' : text;
}

// ─────────────── 1. HÀM XÂY DỰNG GIAO DIỆN THẺ BÀI VIẾT ───────────────
function buildCard(p) {
    var catName = p.category ? p.category.name : 'Chưa phân loại';
    var authorName = p.author ? p.author.username : 'Anonymous';
    var authorAvatar = (p.author && p.author.avatarUrl) ? p.author.avatarUrl : `https://ui-avatars.com/api/?name=${authorName}&background=f8fafc&color=6d5df6`;
    var dateStr = fmtDate(p.createdAt);

    // Trích xuất mô tả
    var postExcerpt = p.description ? p.description : extractText(p.content, 180);

    // Ảnh thumbnail
    var bannerUrl = p.banner ? p.banner : 'https://placehold.co/600x400/f8fafc/667085?text=No+Image';

    // Tính thời gian đọc
    let plainTextContent = extractText(p.content, 99999);
    let readingTime = Math.ceil((plainTextContent.split(/\s+/).length || 1) / 200);
    if (readingTime === 0) readingTime = 1;

    // 🔥 XỬ LÝ DANH SÁCH TAG (Nằm gọn ngang hàng, fix lỗi ##) 🔥
    let tagsHtml = '';
    if (p.tags && p.tags.length > 0) {
        tagsHtml = '<div class="d-flex align-items-center flex-wrap gap-2">';
        let maxTags = 3;
        for (let i = 0; i < Math.min(p.tags.length, maxTags); i++) {
            // Dọn dẹp mọi dấu # bị thừa từ Database trước khi thêm dấu # chuẩn
            let cleanTag = p.tags[i].name.replace(/^#+/, '');
            tagsHtml += `<span class="badge border fw-normal" style="background: rgba(172,138,255,0.05); color: var(--muted); border-color: rgba(66,72,85,0.3) !important; font-size: 0.75rem;">#${cleanTag}</span>`;
        }
        if (p.tags.length > maxTags) {
            tagsHtml += `<span class="badge border fw-normal text-muted" style="background: transparent; border-color: rgba(66,72,85,0.2) !important; font-size: 0.75rem;">+${p.tags.length - maxTags}</span>`;
        }
        tagsHtml += '</div>';
    }

    // Khởi tạo Card
    var $card = $('<article class="d-flex flex-column flex-sm-row gap-3 gap-sm-4 py-4 border-bottom" style="border-color: rgba(66,72,85,0.4) !important; border-bottom-width: 1px !important; cursor: pointer; transition: background 0.2s;">')
        .hover(
            function() { $(this).css('background-color', 'var(--secondary)'); },
            function() { $(this).css('background-color', 'transparent'); }
        )
        .on('click', function(){
            window.location.href = '/pages/post.html?id=' + p.slug;
        });

    var cardHtml = `
        <div class="flex-grow-1 order-2 order-sm-1 d-flex flex-column">
            
            <div class="d-flex align-items-center gap-2 mb-3" style="font-size: 0.85rem; color: var(--muted);">
                <img src="${authorAvatar}" alt="Avatar" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
                <span class="text-[var(--primary)] fw-bold">${authorName}</span>
                <span>•</span>
                <span>${dateStr}</span>
            </div>

            <h2 class="mb-2" style="font-family: 'Newsreader', serif; font-size: 1.5rem; font-weight: 700; color: var(--text); line-height: 1.3;">
                ${p.title}
            </h2>

            <p class="mb-2" style="color: var(--muted); font-size: 0.95rem; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${postExcerpt}
            </p>

            <div class="d-flex align-items-center flex-wrap gap-3 mt-auto pt-3" style="font-size: 0.8rem; color: var(--muted);">
                <span style="background: rgba(224, 229, 245, 0.15); padding: 0.3rem 0.8rem; border-radius: 9999px; color: var(--primary); font-weight: 500;">
                    ${catName}
                </span>
                
                ${tagsHtml}
              
                <div class="ms-auto d-flex align-items-center">
                    <span class="like-btn d-flex align-items-center gap-1" style="padding: 0.2rem 0.5rem; color:var(--muted);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span class="like-count">${p.totalLikes || 0}</span>
                    </span>
                </div>
            </div>
        </div>

        <div class="flex-shrink-0 order-1 order-sm-2 mb-3 mb-sm-0">
            <img src="${bannerUrl}" alt="${p.title}" style="width: 100%; max-width: 150px; height: 130px; object-fit: cover; border-radius: 8px; background: var(--bg-card-h); display: block;">
        </div>
    `;

    $card.html(cardHtml);
    return $card;
}

// ─────────────── 2. HIỆU ỨNG LOADING (SKELETON) ───────────────
function skeletons(n) {
    var h = '';
    for (var i = 0; i < n; i++) {
        h += '<div class="d-flex gap-4 py-4 border-bottom" style="border-color: rgba(66,72,85,0.4) !important; border-bottom-width: 1px !important;">' +
            '<div class="flex-grow-1">' +
            '<span class="sk mb-2" style="width:150px;height:16px;display:block;"></span>' +
            '<span class="sk mb-2" style="width:78%;height:28px;display:block;"></span>' +
            '<span class="sk mb-2" style="width:100%;height:16px;display:block;"></span>' +
            '<span class="sk" style="width:68%;height:16px;display:block;"></span>' +
            '</div>' +
            '<div class="flex-shrink-0 d-none d-sm-block">' +
            '<span class="sk" style="width:150px;height:130px;display:block;border-radius:8px;"></span>' +
            '</div>' +
            '</div>';
    }
    return h;
}

// ─────────────── 3. HÀM CẬP NHẬT BANNER BỘ LỌC ───────────────
function updateFilterBanner() {
    var $banner = $('#active-filter-banner');
    var activeFiltersHtml = '';

    if (S.keyword) {
        activeFiltersHtml += `
            <span class="badge border p-2 me-2 d-inline-flex align-items-center gap-2" style="font-size: 0.85rem; background: var(--card); color: var(--text);">
                <span class="text-muted">Search:</span> <strong>${S.keyword}</strong>
                <span class="btn-remove-filter" data-type="keyword" style="cursor:pointer; color: var(--red);">✖</span>
            </span>`;
    }

    if (S.cat) {
        var activeCatName = 'Active';
        if (typeof CATEGORIES !== 'undefined') {
            var foundCat = CATEGORIES.find(c => c.id === S.cat);
            if (foundCat) activeCatName = foundCat.name;
        }

        activeFiltersHtml += `
            <span class="badge border p-2 me-2 d-inline-flex align-items-center gap-2" style="font-size: 0.85rem; background: var(--card); color: var(--text);">
                <span class="text-muted">Category:</span> <strong>${activeCatName}</strong>
                <span class="btn-remove-filter" data-type="cat" style="cursor:pointer; color: var(--red);">✖</span>
            </span>`;
    }

    if (activeFiltersHtml !== '') {
        $banner.html(`
            <div class="d-flex align-items-center justify-content-between p-3 rounded mb-3" style="background: rgba(124,111,247,0.05); border: 1px dashed rgba(124,111,247,0.3);">
                <div class="d-flex align-items-center flex-wrap">
                    <span class="me-3" style="color: var(--text); font-size: 0.9rem;">Active filters:</span>
                    ${activeFiltersHtml}
                </div>
                <button class="btn btn-sm btn-clear-filter text-muted" style="background: none; border: none; font-size: 0.85rem; text-decoration: underline;">
                    Clear All
                </button>
            </div>
        `).slideDown(200);
    } else {
        $banner.slideUp(200);
    }
}

$(document).on('click', '.btn-remove-filter', function() {
    var type = $(this).data('type');
    if (type === 'keyword') {
        S.keyword = null;
        $('#nav-search-input, #mob-search-input').val('');
    } else if (type === 'cat') {
        S.cat = null;
    }
    if (typeof updateUrlWithFilters === 'function') updateUrlWithFilters();
    else window.history.pushState({}, '', window.location.pathname);

    if (typeof renderCatTabs === 'function') renderCatTabs();
    if (typeof renderSbCategories === 'function') renderSbCategories();
    renderPosts();
});

$(document).on('click', '.btn-clear-filter', function() {
    S.keyword = null; S.cat = null; S.tag = null;
    $('#nav-search-input, #mob-search-input').val('');
    if (typeof updateUrlWithFilters === 'function') updateUrlWithFilters();
    else window.history.pushState({}, '', window.location.pathname);

    if (typeof renderCatTabs === 'function') renderCatTabs();
    if (typeof renderSbCategories === 'function') renderSbCategories();
    if (typeof renderTags === 'function') renderTags();
    renderPosts();
});

// ─────────────── 4. HÀM CHÍNH ĐỂ RENDER DANH SÁCH BÀI VIẾT ───────────────
function renderPosts() {
    var $list = $('#post-list'), $cnt = $('#pcount');
    $list.html(skeletons(3));
    $cnt.html('Đang tải bài viết...');

    updateFilterBanner();

    let apiUrl = '/blogs/filter?';
    if (S.keyword) apiUrl += 'keyword=' + encodeURIComponent(S.keyword) + '&';
    if (S.cat) apiUrl += 'categoryId=' + encodeURIComponent(S.cat) + '&';

    callApi(apiUrl, 'GET').done(function(res) {
        var filteredPosts = res.result || res;

        if (!S.sort) {
            S.sort = 'createdAt,desc';
        }

        var parts = S.sort.split(',');
        var f = parts[0];
        var d = parts[1];

        filteredPosts.sort(function(a, b){
            var va = a[f] || '';
            var vb = b[f] || '';

            if (f === 'title') {
                va = va.toString().toLowerCase();
                vb = vb.toString().toLowerCase();
            }

            if (va < vb) return d === 'asc' ? -1 : 1;
            if (va > vb) return d === 'asc' ?  1 : -1;
            return 0;
        });

        $list.empty();
        $cnt.html('Showing <strong>' + filteredPosts.length + '</strong> article' + (filteredPosts.length !== 1 ? 's' : ''));

        if (filteredPosts.length === 0) {
            $list.html('<div class="text-center py-5" style="color: var(--muted);"><span class="material-symbols-outlined" style="font-size:3rem; opacity:0.5;">search_off</span><p class="mt-3">Không tìm thấy bài viết nào thỏa mãn bộ lọc!</p></div>');
            return;
        }

        $.each(filteredPosts, function(_, p){
            $list.append(buildCard(p));
        });
    });
}

// ─────────────── 5. XỬ LÝ SỰ KIỆN SẮP XẾP (SORT) ───────────────
$(document).ready(function() {
    if (!S.sort) {
        S.sort = 'createdAt,desc';
    }
    $('#sort-sel').val(S.sort);
});

$(document).on('change', '#sort-sel', function() {
    S.sort = $(this).val();
    renderPosts();
});
