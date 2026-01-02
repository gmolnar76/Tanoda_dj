document.addEventListener('DOMContentLoaded', function() {
    const kihivasStartBtn = document.getElementById('kihivas-start');
    const kihivasFeladatContainer = document.getElementById('kihivas-feladat-container');
    const kihivasValaszInput = document.getElementById('kihivas-valasz');
    const kihivasEllenorzesBtn = document.getElementById('kihivas-ellenorzes');
    const kihivasEredmenyDiv = document.getElementById('kihivas-eredmeny');
    const kihivasSzorzoSpan = document.getElementById('kihivas-szorzo');
    const kihivasSzorzandoSpan = document.getElementById('kihivas-szorzando');
    const kihivasIdoSpan = document.getElementById('kihivas-ido');
    const kihivasFeladatSzamSpan = document.getElementById('kihivas-feladat-szam');
    const kihivasOsszegzesDiv = document.getElementById('kihivas-osszegzes');
    const kihivasHelyesValaszokSpan = document.getElementById('kihivas-helyes-valaszok');
    const kihivasOsszpontszamSpan = document.getElementById('kihivas-osszpontszam');

    let kihivasIdo = 60;
    let kihivasFeladatSzam = 0;
    let kihivasHelyesValaszok = 0;
    let kihivasOsszpontszam = 0;
    let kihivasIdozito;

    function ujKihivasFeladat() {
        if (kihivasFeladatSzam >= 10) {
            befejezKihivas();
            return;
        }

        kihivasFeladatSzam++;
        kihivasFeladatSzamSpan.textContent = kihivasFeladatSzam;

        fetch('/egesz_szamok/szorzas/', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            kihivasSzorzoSpan.textContent = data.szorzo;
            kihivasSzorzandoSpan.textContent = data.szorzando;
            kihivasValaszInput.value = '';
            kihivasEredmenyDiv.style.display = 'none';
            kihivasValaszInput.focus();
        })
        .catch(error => {
            console.error('Hiba az új kihívás feladat lekérésekor:', error);
        });
    }

    function ellenorizKihivasValasz() {
        const szorzo = parseInt(kihivasSzorzoSpan.textContent);
        const szorzando = parseInt(kihivasSzorzandoSpan.textContent);
        const felhasznaloValasz = parseInt(kihivasValaszInput.value);

        fetch('/egesz_szamok/szorzas/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                mod: 'kihivas',
                szorzo: szorzo,
                szorzando: szorzando,
                valasz: felhasznaloValasz,
                valaszido: 0,  // Itt nem használunk válaszidőt
                nehezseg: 1  // A kihívásnál fix nehézséget használunk
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.eredmeny) {
                kihivasHelyesValaszok++;
                kihivasOsszpontszam += data.pontszam;
                kihivasEredmenyDiv.textContent = 'Helyes!';
                kihivasEredmenyDiv.className = 'alert alert-success';
            } else {
                kihivasEredmenyDiv.textContent = `Helytelen. A helyes válasz: ${data.helyes_valasz}`;
                kihivasEredmenyDiv.className = 'alert alert-danger';
            }

            kihivasEredmenyDiv.style.display = 'block';
            setTimeout(ujKihivasFeladat, 1000);
        })
        .catch(error => {
            console.error('Hiba a kihívás válasz ellenőrzésekor:', error);
        });
    }

    function befejezKihivas() {
        clearInterval(kihivasIdozito);
        kihivasFeladatContainer.style.display = 'none';
        kihivasOsszegzesDiv.style.display = 'block';
        kihivasHelyesValaszokSpan.textContent = kihivasHelyesValaszok;
        kihivasOsszpontszamSpan.textContent = kihivasOsszpontszam;

        fetch('/egesz_szamok/szorzas/?statisztika=kihivas')
        .then(response => response.json())
        .then(statisztika => {
            megjelenitKihivasStatisztika(statisztika);
        })
        .catch(error => {
            console.error('Hiba a kihívás statisztikák lekérésekor:', error);
        });
    }

    function megjelenitKihivasStatisztika(statisztika) {
        const statisztikaHTML = `
            <h4>Kihívás statisztikák</h4>
            <p>Összes kihívás: ${statisztika.osszes_kihivas}</p>
            <p>Átlagos pontszám: ${statisztika.atlag_pontszam.toFixed(2)}</p>
            <p>Legjobb pontszám: ${statisztika.legjobb_pontszam}</p>
            <h5>Utolsó kihívások:</h5>
            <ul>
                ${statisztika.utolso_kihivasok.map(k => `
                    <li>${new Date(k.datum).toLocaleDateString()}: ${k.pontszam} pont</li>
                `).join('')}
            </ul>
        `;
        kihivasOsszegzesDiv.innerHTML += statisztikaHTML;
    }

    function inditKihivas() {
        kihivasIdo = 60;
        kihivasFeladatSzam = 0;
        kihivasHelyesValaszok = 0;
        kihivasOsszpontszam = 0;

        kihivasFeladatContainer.style.display = 'block';
        kihivasOsszegzesDiv.style.display = 'none';

        ujKihivasFeladat();

        kihivasIdozito = setInterval(() => {
            kihivasIdo--;
            kihivasIdoSpan.textContent = kihivasIdo;
            if (kihivasIdo <= 0) {
                befejezKihivas();
            }
        }, 1000);
    }

    if (kihivasStartBtn) {
        kihivasStartBtn.addEventListener('click', inditKihivas);
    }

    if (kihivasEllenorzesBtn) {
        kihivasEllenorzesBtn.addEventListener('click', ellenorizKihivasValasz);
    }

    if (kihivasValaszInput) {
        kihivasValaszInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                ellenorizKihivasValasz();
            }
        });
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});