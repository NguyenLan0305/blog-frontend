/**
 * app.js
 * Global state + shared helper functions
 */

/* ─────────────── STATE ─────────────── */
var S = {
    page:   'home',
    cat:    null,
    tag:    null,
    keyword: null, //  BIẾN NÀY ĐỂ LƯU TỪ KHÓA TÌM KIẾM
    sort:   'createdAt,desc',

    get isAuth() { return localStorage.getItem('token') !== null; },
    get uname()  { return localStorage.getItem('username') || 'Guest'; }
};

/* ─────────────── HELPERS ─────────────── */

// 1. Format Ngày tháng
function fmtDate(iso) {
    if(!iso) return "N/A";
    return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

// 2. 🔥 CẬP NHẬT: Tạo đoạn trích từ chuỗi JSON của Editor.js
function excerpt(s, n) {
    if (!s) return "";
    n = n || 200;
    let plainText = "";

    try {
        // Cố gắng parse chuỗi JSON từ Editor.js
        let parsedData = JSON.parse(s);
        if (parsedData && parsedData.blocks) {
            // Lọc ra các khối là đoạn văn (paragraph) và nối chúng lại
            plainText = parsedData.blocks
                .filter(b => b.type === 'paragraph')
                .map(b => b.data.text.replace(/<[^>]*>/g, '')) // Xóa thẻ b, i, a bên trong
                .join(' ');
        }
    } catch (e) {
        // Nếu parse lỗi (không phải JSON), thì xử lý như chuỗi HTML/Text bình thường
        plainText = s.replace(/<[^>]*>/g, '').trim();
    }

    if (plainText.length <= n) return plainText;
    return plainText.substring(0, n).split(' ').slice(0,-1).join(' ') + '…';
}

// 3. Lấy chữ cái đầu của Tên
function initials(name) {
    if(!name || name === 'Guest') return "?";
    var parts = name.trim().split(' ');
    if(parts.length === 1) return name.slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

// 4. 🔥 MỚI: Hàm hỗ trợ cắt lấy UUID từ chuỗi Slug (Dùng cho 3NF Backend)
function extractIdFromSlug(slug) {
    if (!slug) return null;
    // UUID luôn có độ dài cố định là 36 ký tự, nên ta chỉ cần cắt 36 ký tự cuối cùng
    return slug.slice(-36);
}

/* ─────────────── TOAST (Thông báo nhỏ) ─────────────── */
function toast(msg) {
    var $el = $('<div class="toast-item"><span class="toast-dot"></span><span>' + msg + '</span></div>');
    $('#toasts').append($el);
    setTimeout(function(){
        $el.fadeOut(300, function(){ $el.remove(); });
    }, 2800);
}

/* ─────────────── TRẠM TRUNG CHUYỂN API ─────────────── */
const API_BASE_URL = 'https://blog-inkwell.onrender.com';

function callApi(endpoint, method, data = null) {
    var token = localStorage.getItem('token');

    var ajaxConfig = {
        url: API_BASE_URL + endpoint,
        type: method,
        contentType: 'application/json',
        beforeSend: function(xhr) {
            if (token) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            }
        }
    };

    if (data) {
        ajaxConfig.data = JSON.stringify(data);
    }

    return $.ajax(ajaxConfig).fail(function(xhr) {
        console.error("API Error: ", xhr.responseText);
        if (xhr.status === 401 || xhr.status === 403) {
            toast("Phiên đăng nhập hết hạn hoặc không có quyền!");
        }
    });
}