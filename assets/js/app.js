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

    //Dựa vào 'username' để check trạng thái UI
    get isAuth() { return localStorage.getItem('username') !== null; },
    get uname()  { return localStorage.getItem('username') || 'Guest'; }
};

/* ─────────────── HELPERS ─────────────── */

// 1. Format Ngày tháng
function fmtDate(iso) {
    if(!iso) return "N/A";
    return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

// 2. Tạo đoạn trích từ chuỗi JSON của Editor.js
function excerpt(s, n) {
    if (!s) return "";
    n = n || 200;
    let plainText = "";

    try {
        let parsedData = JSON.parse(s);
        if (parsedData && parsedData.blocks) {
            plainText = parsedData.blocks
                .filter(b => b.type === 'paragraph')
                .map(b => b.data.text.replace(/<[^>]*>/g, ''))
                .join(' ');
        }
    } catch (e) {
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

// 4. Lấy UUID từ chuỗi Slug
function extractIdFromSlug(slug) {
    if (!slug) return null;
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
    var ajaxConfig = {
        url: API_BASE_URL + endpoint,
        type: method,
        contentType: 'application/json',
        xhrFields: {
            withCredentials: true
        }
    };

    if (data) {
        ajaxConfig.data = JSON.stringify(data);
    }

    return $.ajax(ajaxConfig).fail(function(xhr) {
        console.error("API Error: ", xhr.responseText);
        if (xhr.status === 401 || xhr.status === 403) {
            toast("Phiên đăng nhập hết hạn hoặc không có quyền!");

            // Xóa dữ liệu User cũ ở Frontend (nếu Cookie thực sự hết hạn)
            if (localStorage.getItem('username')) {
                localStorage.removeItem('username');
                // Đá văng người dùng về trang login nếu họ đang làm thao tác cần quyền
                 window.location.href = '/pages/login.html';
            }
        }
    });
}