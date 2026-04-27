/**
 * sidebar.js (Phiên bản gọi API - Hỗ trợ Lọc Kép Combined Filtering)
 * Sidebar widgets: Categories (Stories from all interests) + Trending
 * Depends on: app.js (S, toast, callApi, excerpt), posts.js (renderPosts), filters.js (renderCatTabs)
 */

// ==========================================
// 1. RENDER CATEGORIES (Khu vực: Stories from all interests)
// ==========================================
function renderSbCategories() {
    var $el = $('#sb-categories');

    // Hiện chữ Loading nhỏ xíu
    $el.html('<div class="text-muted py-2" style="font-size: 0.85rem;">Đang tải chủ đề...</div>');

    // Gọi API lấy danh sách Categories
    callApi('/categories', 'GET').done(function(res) {
        $el.empty();
        var catsList = res.result || res;

        // Render từng nút category (dạng pill)
        $.each(catsList, function(_, c){
            // Kiểm tra xem ID này có đang được chọn làm bộ lọc (S.cat) không
            var isActive = (S.cat === c.id) ? ' active' : '';

            // Nội dung nút: Tên danh mục + Số lượng bài viết
            var btnHtml = c.name + '<span style="opacity: 0.6; font-size: 0.75rem; margin-left: 5px; font-family: Inter, sans-serif;">(' + (c.postCount || 0) + ')</span>';

            var $btn = $('<a href="javascript:void(0)" class="cat-pill' + isActive + '">')
                .html(btnHtml)
                .on('click', function(e){
                    e.preventDefault();

                    // Logic tắt/bật: Bấm lần 1 là chọn, bấm lần nữa là bỏ lọc
                    S.cat = (S.cat === c.id) ? null : c.id;

                    // TUYỆT ĐỐI KHÔNG GHI S.keyword = null Ở ĐÂY (Để giữ lại từ khóa nếu đang search)

                    // Đổi URL trình duyệt thông minh (Hỗ trợ Lọc Kép)
                    let newUrl = '/';
                    let params = new URLSearchParams();

                    if (S.keyword) params.append('q', S.keyword); // Nếu đang có search, nhét search vào URL
                    if (S.cat) params.append('cat', S.cat);       // Nếu có danh mục, nhét danh mục vào URL

                    if (params.toString() !== '') {
                        newUrl += '?' + params.toString(); // Kết quả: /?q=html&cat=id-cua-programming
                    }
                    window.history.pushState({}, '', newUrl);

                    // Render lại màu nút ở chính Sidebar này
                    renderSbCategories();

                    // Đồng bộ màu sắc với thanh Category nằm ngang ở giữa trang (nếu có file filters.js)
                    if (typeof renderCatTabs === 'function') renderCatTabs();

                    // Render lại danh sách bài viết (Nó sẽ tự động gọi API /filter gồm cả 2 thông số)
                    if (typeof renderPosts === 'function') renderPosts();
                });

            $el.append($btn);
        });
    });
}

// ==========================================
// 2. RENDER TRENDING (Khu vực: Trending Now)
// ==========================================
function renderSbTrending() {
    var $el = $('#sb-trending');

    // Hiện chữ Loading nhỏ xíu
    $el.html('<div class="text-muted py-3" style="font-size: 0.85rem;">Đang tải xu hướng...</div>');

    // Gọi API lấy toàn bộ bài viết
    callApi('/blogs', 'GET').done(function(res) {
        $el.empty();
        var allPosts = res.result || res;

        // Sắp xếp các bài viết theo Lượt đọc (totalReads) giảm dần, sau đó chỉ cắt lấy 5 bài đầu tiên
        var trendingPosts = allPosts.sort(function(a, b) {
            return (b.totalReads || 0) - (a.totalReads || 0);
        }).slice(0, 5);

        $.each(trendingPosts, function(i, p){
            // Lấy tên Category từ DTO
            var catName = p.category ? p.category.name : 'Chưa phân loại';

            // Tính thời gian đọc an toàn với dữ liệu JSON của Editor.js
            var plainTextContent = excerpt(p.content, 99999);
            var readingTime = Math.ceil((plainTextContent.split(/\s+/).length || 1) / 200);
            if (readingTime === 0) readingTime = 1;

            $el.append(
                $('<div class="tr-item">').html(
                    '<div class="tr-n">0' + (i+1) + '</div>' +
                    '<div>' +
                    '<div class="tr-ttl">' + p.title + '</div>' +
                    '<div class="tr-meta">' + readingTime + ' min · ' + catName + '</div>' +
                    '</div>'
                ).on('click', function(){
                    // Mở khóa chuyển trang chi tiết với URL chuẩn 3NF
                    window.location.href = '/pages/post.html?id=' + p.slug;
                })
            );
        });
    });
}