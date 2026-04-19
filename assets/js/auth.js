/**
 * auth.js
 */

function renderAuth() {
    // 1. Xác định vùng chứa và XÓA SẠCH trước khi vẽ lại
    var $d = $('#auth-area').empty();
    var $m = $('#mob-auth').empty();

    // 2. Kiểm tra trạng thái thực tế
    const token = localStorage.getItem('token');
    const uname = localStorage.getItem('username'); // Sẽ lấy từ localStorage

    // Kiểm tra xem có Token không
    const isAuth = token !== null && token !== "";

    if (isAuth) {
        /* ─────────────── TRẠNG THÁI: ĐÃ ĐĂNG NHẬP ─────────────── */
        // Tên hiển thị (Nếu không có tên thì để Guest)
        const displayName = uname || 'Guest';

        /* Desktop: Nút chức năng */
        $d.append(
            $('<button class="btn-newpost">').html(
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Post'
            ).on('click', function(){ window.location.href = '/pages/blog-editor.html'; })
        );

        /* Avatar + Dropdown */
        var $wrap = $('<div style="position:relative;"></div>');
        // Hàm initials() lấy chữ cái đầu của tên (Ví dụ: "lan" -> "L")
        var $av   = $('<div class="avatar">').text(initials(displayName)).attr('title', displayName);
        var $dd   = $('<div class="user-dd">');

        $dd.append(
            $('<div class="dd-head">').html(
                '<div class="dn">' + displayName + '</div><div class="dr">Author</div>'
            )
        );

        $dd.append('<div class="dd-sep"></div>');

        // Nút Log Out
        $dd.append(
            $('<button class="dd-btn red">').html(
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Log Out'
            ).on('click', handleLogout)
        );

        $av.on('click', function(e){
            e.stopPropagation();
            $('.user-dd').not($dd).removeClass('open'); // Đóng các dropdown khác nếu có
            $dd.toggleClass('open');
        });

        $wrap.append($av, $dd);
        $d.append($wrap);

    } else {
        /* ─────────────── TRẠNG THÁI: CHƯA ĐĂNG NHẬP ─────────────── */
        // CHỈ HIỆN nút Login và Register ở đây
        $d.append(
            $('<button class="btn-login">').text('Log In').on('click', function(){
                window.location.href = '/pages/login.html';
            })
        );
        $d.append(
            $('<button class="btn-register">').text('Sign Up').on('click', function(){
                window.location.href = '/pages/register.html';
            })
        );
    }
}

function initials(name) {
    if (!name || name === 'Guest') return "?";

    // Xóa khoảng trắng thừa
    name = name.trim();
    var parts = name.split(' ');

    if (parts.length >= 2) {
        // Nếu có từ 2 từ trở lên: Lấy chữ đầu của từ đầu và từ cuối (VD: Lan Nguyen -> LN)
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else {
        // Nếu chỉ có 1 từ: Lấy 2 chữ cái đầu của từ đó (VD: lan -> LA)
        return name.slice(0, 2).toUpperCase();
    }
}

// Hàm xử lý Log Out
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    // Xóa thêm các thông tin khác nếu cần
    if(typeof toast === 'function') toast('Đã đăng xuất thành công.');

    setTimeout(() => {
        window.location.href = '/index.html';
    }, 500);
}

// GỌI HÀM KHI TRANG LOAD XONG
$(document).ready(function() {
    renderAuth();
});

/* Close dropdown on outside click */
$(document).on('click', function(){ $('.user-dd').removeClass('open'); });