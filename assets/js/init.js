/**
 * init.js
 * File này đóng vai trò như một "công tắc" khởi động.
 * Khi người dùng vừa vào web, nó sẽ ra lệnh cho các file khác đi lấy dữ liệu từ Backend về.
 */

$(document).ready(function() {

    // ==========================================
    // 0. ĐỌC URL ĐỂ LẤY TRẠNG THÁI (Share Link)
    // ==========================================
    // Giả sử link của bạn có dạng: ?cat=lap-trinh-java-123e4567-e89b-12d3-a456-426614174000
    const urlParams = new URLSearchParams(window.location.search);
    const catSlug = urlParams.get('cat');

    if (catSlug) {
        // Gọi hàm extractIdFromSlug (đã viết ở app.js) để cắt lấy UUID
        S.cat = extractIdFromSlug(catSlug);
    }

    // ==========================================
    // KHU VỰC CHÍNH (MAIN CONTENT)
    // ==========================================

    // 1.Ra lệnh cho filters.js đi lấy danh sách Category và Tag
    if (typeof fetchAndRenderFilters === 'function') {
        fetchAndRenderFilters();
    }

    // 2. Ra lệnh cho posts.js đi lấy danh sách Bài viết
    // Vì S.cat đã được set ở bước 0 (nếu có), hàm renderPosts sẽ tự động gọi API lọc đúng danh mục!
    if (typeof renderPosts === 'function') {
        renderPosts();
    }

    // ==========================================
    // KHU VỰC CỘT BÊN PHẢI (SIDEBAR)
    // ==========================================

    // 3. Ra lệnh tải danh sách Category (Stories from all interests)
    if (typeof renderSbCategories === 'function') {
        renderSbCategories();
    }

    // 4. Ra lệnh tải danh sách Trending Now
    if (typeof renderSbTrending === 'function') {
        renderSbTrending();
    }
});