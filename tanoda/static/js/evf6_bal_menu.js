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

    window.addEventListener('resize', checkWidth);
    checkWidth();
});