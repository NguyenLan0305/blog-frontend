/**
 * pages.js
 * Secondary pages: Categories page + Tags page
 * Depends on: app.js (S, toast, callApi), nav.js (navigate), filters.js, sidebar.js, posts.js
 */

// 🔥 CẬP NHẬT 1: Chuyển thành Mảng màu (Array) để gán xoay vòng cho các Danh mục động từ Database
var CAT_COLORS_ARRAY = [
    { bg:'rgba(124,111,247,.1)', bd:'rgba(124,111,247,.25)', fg:'var(--purple)' },
    { bg:'rgba(62,207,176,.08)', bd:'rgba(62,207,176,.25)',  fg:'var(--teal)'   },
    { bg:'rgba(233,168,76,.08)', bd:'rgba(233,168,76,.25)', fg:'var(--gold)'   },
    { bg:'rgba(251,191,36,.08)', bd:'rgba(251,191,36,.2)',  fg:'var(--gold)'       },
    { bg:'rgba(248,113,113,.08)',bd:'rgba(248,113,113,.2)', fg:'var(--red)'       }
];

function buildCatPage() {
    var $g = $('#cat-grid').empty();

    // Hiện chữ Loading cho chuyên nghiệp trong lúc chờ Backend trả data
    $g.append('<div class="col-12 text-center text-muted py-4">Đang tải danh mục...</div>');

    // 🚀 GỌI API THẬT
    callApi('/categories', 'GET').done(function(res) {
        $g.empty();

        // Tùy theo cấu trúc ApiResponse của bạn bên Java
        var categoriesList = res.result || res;

        $.each(categoriesList, function(index, c){
            // 🔥 Lấy màu xoay vòng dựa trên số thứ tự (index) của danh mục
            var col = CAT_COLORS_ARRAY[index % CAT_COLORS_ARRAY.length];

            $g.append(
                $('<div class="col-sm-6 col-md-4">').append(
                    $('<div class="cat-card">').css({
                        background:col.bg, border:'1px solid '+col.bd, borderRadius:'var(--r)', cursor: 'pointer'
                    }).html(
                        '<div style="font-size:1.35rem;margin-bottom:.5rem;">📂</div>' +
                        '<div style="font-family:Playfair Display,serif;font-size:1.1rem;font-weight:700;color:' + col.fg + ';margin-bottom:.3rem;">' + c.name + '</div>' +
                        '<div style="font-size:.8rem;color:var(--t3);">' + (c.postCount || 0) + ' articles</div>'
                    ).on('click', function(){
                        S.cat = c.id; // Giữ lại UUID để khi bấm vào nó filter bài viết chính xác

                        // 🔥 CẬP NHẬT 2: Đồng bộ URL lên thanh địa chỉ (Share Link)
                        window.history.pushState({}, '', '/category/' + c.slug);

                        navigate('home');

                        // Cập nhật lại giao diện các khu vực khác
                        if (typeof renderCatTabs === 'function') renderCatTabs();
                        if (typeof renderSbCategories === 'function') renderSbCategories(); // Đổi màu bên Sidebar nếu có
                        if (typeof renderPosts === 'function') renderPosts();

                        toast('Đã lọc theo: ' + c.name);
                    })
                )
            );
        });
    });
}

function buildTagsPage() {
    var $g = $('#tags-grid').empty();
    $g.append('<div class="text-muted py-3">Đang tải thẻ...</div>');

    // GỌI API THẬT
    callApi('/tags', 'GET').done(function(res) {
        $g.empty();

        var tagsList = res.result || res;

        $.each(tagsList, function(_, t){
            $g.append(
                $('<button class="sb-tag" style="font-size:.9rem;padding:.4rem .85rem;margin:.3rem;">').html(
                    '<span style="opacity:.45;">#</span>' + t.name +
                    '<span style="font-size:.65rem;opacity:.55;font-family:Inter,sans-serif;margin-left:.15rem;">(' + (t.postCount || 0) + ')</span>'
                ).on('click', function(){
                    S.tag = t.id; // Lấy UUID của Tag

                    // 🔥 CẬP NHẬT 3: Đồng bộ URL cho Tag (Ví dụ: /tag/java-1234...)
                    window.history.pushState({}, '', '/tag/' + t.slug);

                    navigate('home');

                    if (typeof renderTagChips === 'function') renderTagChips();
                    if (typeof renderSbTags === 'function') renderSbTags();
                    if (typeof renderPosts === 'function') renderPosts();

                    toast('Đã lọc theo thẻ: #' + t.name);
                })
            );
        });
    });
}