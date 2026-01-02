document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('content-container');
    const menuButtons = document.querySelectorAll('.menu-btn');

    function loadContent(target) {
        fetch(`/egesz_szamok/${target}/`)
            .then(response => response.text())
            .then(html => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                
                // Keressük meg a megfelelő tartalmat a válaszban
                const content = tempDiv.querySelector('#module-content');
                if (content) {
                    contentContainer.innerHTML = content.innerHTML;
                } else {
                    console.error('Nem található modul tartalom');
                }

                // Ha van bármilyen script a válaszban, azt is futtassuk le
                const scripts = tempDiv.getElementsByTagName('script');
                for (let script of scripts) {
                    eval(script.innerHTML);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            loadContent(target);
            
            // Aktív gomb stílusának kezelése
            menuButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Alapértelmezetten töltsük be a szorzás tartalmat
    loadContent('szorzas');
    menuButtons[0].classList.add('active');
});