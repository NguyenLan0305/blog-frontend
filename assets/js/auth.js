/**
 * auth.js
 */

function renderAuth() {
    // 1. Xác định vùng chứa và XÓA SẠCH trước khi vẽ lại
    var $d = $('#auth-area').empty();
    var $m = $('#mob-auth').empty();

    // 2.Chỉ dựa vào Username để xác định trạng thái UI
    const uname = localStorage.getItem('username');
    const isAuth = (uname !== null && uname.trim() !== "");

    if (isAuth) {
        /* ─────────────── TRẠNG THÁI: ĐÃ ĐĂNG NHẬP ─────────────── */
        const displayName = uname || 'Guest';

        /* Desktop: Nút chức năng */
        $d.append(
            $('<button class="btn-newpost">').html(
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Post'
            ).on('click', function(){ window.location.href = '/pages/blog-editor.html'; })
        );

        /* Avatar + Dropdown */
        var $wrap = $('<div style="position:relative;"></div>');
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
            $('.user-dd').not($dd).removeClass('open');
            $dd.toggleClass('open');
        });

        $wrap.append($av, $dd);
        $d.append($wrap);

    } else {
        /* ─────────────── TRẠNG THÁI: CHƯA ĐĂNG NHẬP ─────────────── */
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
    name = name.trim();
    var parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else {
        return name.slice(0, 2).toUpperCase();
    }
}

// Xử lý Log Out bảo mật với API
function handleLogout() {
    // 1. Gửi request báo cho Server tiêu hủy Cookie
    $.ajax({
        url: 'https://blog-inkwell.onrender.com/auth/logout',
        type: 'POST',
        xhrFields: {
            withCredentials: true
        },
        success: function() {
            clearFrontendAuth();
        },
        error: function(err) {
            console.error("Lỗi khi đăng xuất ở server:", err);
            // Dù server lỗi, vẫn xóa trạng thái ở Frontend để đảm bảo an toàn UI
            clearFrontendAuth();
        }
    });
}

// Hàm phụ trợ dọn dẹp Frontend
function clearFrontendAuth() {
    localStorage.removeItem('username');
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