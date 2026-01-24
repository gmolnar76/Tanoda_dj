document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const toggleBtn = document.getElementById('sidebar-toggle');

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        content.classList.toggle('active');
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    function checkWidth() {
        if (window.innerWidth <= 767) {
            sidebar.classList.remove('active');
            content.classList.remove('active');
        }
    }

    function loadContent(url) {
        fetch(url)
        .then(r => r.text())
        .then(html => {
            content.innerHTML = html;

            // 🔑 I T T
            window.dispatchEvent(new Event('tanoda:content-ready'));
        });
    }


    window.addEventListener('resize', checkWidth);
    checkWidth();
});