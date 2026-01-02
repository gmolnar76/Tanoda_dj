// Fejszámolás tippek és stratégiák különböző szorzási esetekhez
// Ez a fájl tartalmazza az üzeneteket, amiket a felhasználó kap, hogy fejben könnyebben tudjon számolni

const SzorzasTippek = {
    /**
     * Speciális szorzótábla minták
     */
    specialis: {
        // 9-es szorzótábla - számjegyek összege 9
        kilences: {
            felismer: (szorzo, szorzando) => {
                return szorzo === 9 || szorzando === 9;
            },
            leiras: "A 9-es szorzótábla különleges mintát mutat!",
            magyarazat: "Az eredmény számjegyeinek összege mindig 9. Például: 9×7=63 → 6+3=9, vagy 9×8=72 → 7+2=9.",
            trick: "Gyors módszer: Vedd a szorzandót, vonj ki belőle 1-et (ez lesz az első számjegy), majd írd utána azt a számjegyet, ami a 9-re kiegészíti. Pl. 9×7 esetén: 7-1=6, és 9-6=3, tehát az eredmény 63."
        },
        
        // 11-es szorzótábla - egyjegyű számoknál dupla számjegy, kétjegyűeknél összeg a közepére
        tizenegyes: {
            felismer: (szorzo, szorzando) => {
                return szorzo === 11 || szorzando === 11;
            },
            leiras: "A 11-gyel való szorzás egyszerű szabályt követ!",
            magyarazat: "Egyjegyű számok esetén egyszerűen duplikáld a számjegyet: 11×4 = 44. Kétjegyű számoknál: írd le az első és utolsó számjegyet, középre pedig a két számjegy összegét: 11×25 = 275 (2, 2+5=7, 5).",
            trick: "Ha a számjegyek összege nagyobb 9-nél, akkor az első számjegyhez hozzá kell adni 1-et: 11×78 = 858, mert 7, 7+8=15, tehát 7+1=8, és 5, 8."
        },
        
        // 5-ös szorzótábla - fele a 10-szer annyinak
        otos: {
            felismer: (szorzo, szorzando) => {
                return szorzo === 5 || szorzando === 5;
            },
            leiras: "Az 5-tel való szorzás a 10-zel való szorzás felét jelenti!",
            magyarazat: "Szorozz 10-zel, majd oszd el 2-vel. Például: 5×38 = 10×38÷2 = 380÷2 = 190.",
            trick: "Páros számoknál: felezd a számot, majd szorózd 10-zel. Példa: 5×64 = 32×10 = 320. Páratlan számoknál: felezd a csökkentett számot, majd 10-zel szorozva adj hozzá 5-öt. Példa: 5×13 = 5×(12+1) = 5×12 + 5×1 = 60+5 = 65."
        },
        
        // 25-tel való szorzás - negyede a 100-szor annyinak
        huszonotos: {
            felismer: (szorzo, szorzando) => {
                return szorzo === 25 || szorzando === 25;
            },
            leiras: "A 25-tel való szorzás a 100-zal való szorzás negyedét jelenti!",
            magyarazat: "Szorozz 100-zal, majd oszd el 4-gyel. Például: 25×48 = 100×48÷4 = 4800÷4 = 1200.",
            trick: "Oszd el a számot 4-gyel, majd szoroz 100-zal. Ha a szám nem osztható 4-gyel, bontsd fel: 25×17 = 25×16 + 25×1 = 400 + 25 = 425."
        }
    },
    
    /**
     * Negatív számokkal való szorzás szabályai
     */
    negativ: {
        leiras: "A negatív számokkal való szorzásnál figyelj az előjelszabályra!",
        magyarazat: "Két azonos előjelű szám szorzata pozitív, két különböző előjelű szám szorzata negatív.",
        trick: "Szorozd meg az abszolút értékeket, majd határozd meg az előjelet: azonos előjeleknél +, különböző előjeleknél -."
    },

    /**
     * Több jegyű számok szorzási technikái
     */
    tobbJegyu: {
        // Két jegyű szám szorzása egy jegyű számmal
        ketjegyuEgyjegyuvel: {
            felismer: (szorzo, szorzando) => {
                return (szorzo >= 10 && szorzo <= 99 && szorzando < 10) || 
                       (szorzando >= 10 && szorzando <= 99 && szorzo < 10);
            },
            leiras: "Kétjegyű szám szorzása egyjegyű számmal",
            magyarazat: "Bontsd fel a kétjegyű számot helyiérték szerint, majd szorozz külön-külön. Például: 47×6 = (40+7)×6 = 40×6 + 7×6 = 240 + 42 = 282.",
            trick: "Először szorozd meg a tízesek helyén álló számot, majd az egyesek helyén állót, végül add össze."
        },
        
        // Két jegyű szám szorzása 10-20-30 stb.-vel
        ketjegyuTizesekkel: {
            felismer: (szorzo, szorzando) => {
                return (szorzo % 10 === 0 && szorzo >= 10 && szorzo < 100) || 
                       (szorzando % 10 === 0 && szorzando >= 10 && szorzando < 100);
            },
            leiras: "Szorzás 10, 20, 30, stb. számokkal",
            magyarazat: "Ilyen szorzásnál szorozd meg a számot az első számjeggyel, majd az eredményhez írj egy 0-t a végére. Például: 47×30 = 47×3×10 = 141×10 = 1410.",
            trick: "Ha 80-nal kell szorozni, könnyebb lehet 8×10-zel szorozni: 43×80 = 43×8×10 = 344×10 = 3440."
        },
        
        // Két kétjegyű szám szorzása
        ketKetjegyu: {
            felismer: (szorzo, szorzando) => {
                return (szorzo >= 10 && szorzo <= 99 && szorzando >= 10 && szorzando <= 99);
            },
            leiras: "Kétjegyű számok szorzása fejben",
            magyarazat: "Használd a (a+b)×(c+d) = ac + ad + bc + bd algebrai szorzást. Például: 23×46 = (20+3)×(40+6) = 20×40 + 20×6 + 3×40 + 3×6 = 800 + 120 + 120 + 18 = 1058.",
            trick: "Tízesekkel kezdj, azután az egyjegyű szorzásokat végezd el, majd add össze."
        },
        
        // Közeli számok szorzása (pl. 99, 101)
        kozeliSzamok: {
            felismer: (szorzo, szorzando) => {
                return (Math.abs(szorzo - 100) <= 5) || (Math.abs(szorzando - 100) <= 5) || 
                       (Math.abs(szorzo - 1000) <= 5) || (Math.abs(szorzando - 1000) <= 5);
            },
            leiras: "Kerek számhoz közeli értékek szorzása",
            magyarazat: "Használd az (a±b)×c = a×c ± b×c algebrai azonosságot. Például: 98×45 = (100-2)×45 = 100×45 - 2×45 = 4500 - 90 = 4410.",
            trick: "Ha az egyik szám kicsit kisebb egy kerek számnál (pl. 98, 997), akkor szorozz a kerek számmal, majd vonj ki a megfelelő mennyiséget!"
        }
    },
    
    /**
     * Négyzetre emelés speciális technikái
     */
    negyzetreEmeles: {
        // Általános négyzetre emelés
        altalanos: {
            felismer: (szorzo, szorzando) => {
                return szorzo === szorzando;
            },
            leiras: "Négyzetre emelés - ugyanazon szám önmagával való szorzása",
            magyarazat: "Ismerd a gyakori négyzetre emeléseket: 11² = 121, 12² = 144, 15² = 225, stb.",
            trick: "Ha a szám közel van egy kerek számhoz, használd az (a±b)² = a² ± 2ab + b² képletet. Például: 48² = (50-2)² = 50² - 2×50×2 + 2² = 2500 - 200 + 4 = 2304."
        },
        
        // 5-re végződő számok négyzetre emelése
        otreVegzodo: {
            felismer: (szorzo, szorzando) => {
                return szorzo === szorzando && szorzo % 10 === 5;
            },
            leiras: "5-re végződő számok gyors négyzetre emelése",
            magyarazat: "Az 5-re végződő számok négyzeteinél az utolsó két számjegy mindig 25.",
            trick: "A tízes helyiértéket nézd: szorozzuk meg önmagával, majd adjunk hozzá annyi egységet, amennyi a szorzandó volt. Például: 85² = 8×9 | 25 = 72|25 = 7225."
        }
    },
    
    /**
     * Egyéb trükkök
     */
    egyeb: {
        // Szorzás 99, 999 stb.-vel
        kilencesek: {
            felismer: (szorzo, szorzando) => {
                return szorzo === 99 || szorzando === 99 || 
                       szorzo === 999 || szorzando === 999;
            },
            leiras: "Szorzás 99, 999 stb.-vel",
            magyarazat: "Szorozz 100-zal (írj két nullát a szám után), majd vonj ki az eredeti számot. Például: 46×99 = 46×100 - 46 = 4600 - 46 = 4554.",
            trick: "Általánosítva: N×99 = N×(100-1) = 100N - N = 100N - N. Hasonlóan: N×999 = N×1000 - N."
        },
        
        // Szorzás 101, 1001 stb.-vel
        szazegyesek: {
            felismer: (szorzo, szorzando) => {
                return szorzo === 101 || szorzando === 101 || 
                       szorzo === 1001 || szorzando === 1001;
            },
            leiras: "Szorzás 101, 1001 stb.-vel",
            magyarazat: "Szorozz 100-zal (írj két nullát a szám után), majd add hozzá az eredeti számot. Például: 36×101 = 36×100 + 36 = 3600 + 36 = 3636.",
            trick: "Általánosítva: N×101 = N×(100+1) = 100N + N. Hasonlóan: N×1001 = N×1000 + N."
        }
    }
};

// Megfelelő trükk keresése a szorzandó és szorzó alapján
function talaljMegfeleloTrukkot(szorzo, szorzando) {
    // Abszolút értékekkel dolgozunk a mintafelismerésnél
    const absSzorzo = Math.abs(szorzo);
    const absSzorzando = Math.abs(szorzando);
    
    // Speciális szorzótáblák ellenőrzése
    for (const [key, trukk] of Object.entries(SzorzasTippek.specialis)) {
        if (trukk.felismer(absSzorzo, absSzorzando)) {
            return {
                leiras: trukk.leiras,
                magyarazat: trukk.magyarazat,
                trick: trukk.trick
            };
        }
    }
    
    // Négyzetre emelés ellenőrzése
    if (szorzo === szorzando) {
        if (absSzorzo % 10 === 5) {
            return SzorzasTippek.negyzetreEmeles.otreVegzodo;
        } else {
            return SzorzasTippek.negyzetreEmeles.altalanos;
        }
    }
    
    // Negatív számok kezelése
    if (szorzo < 0 || szorzando < 0) {
        return SzorzasTippek.negativ;
    }
    
    // Többjegyű számok trükkjei
    if (SzorzasTippek.egyeb.kilencesek.felismer(absSzorzo, absSzorzando)) {
        return SzorzasTippek.egyeb.kilencesek;
    }
    
    if (SzorzasTippek.egyeb.szazegyesek.felismer(absSzorzo, absSzorzando)) {
        return SzorzasTippek.egyeb.szazegyesek;
    }
    
    if (SzorzasTippek.tobbJegyu.kozeliSzamok.felismer(absSzorzo, absSzorzando)) {
        return SzorzasTippek.tobbJegyu.kozeliSzamok;
    }
    
    if (SzorzasTippek.tobbJegyu.ketjegyuTizesekkel.felismer(absSzorzo, absSzorzando)) {
        return SzorzasTippek.tobbJegyu.ketjegyuTizesekkel;
    }
    
    if (SzorzasTippek.tobbJegyu.ketjegyuEgyjegyuvel.felismer(absSzorzo, absSzorzando)) {
        return SzorzasTippek.tobbJegyu.ketjegyuEgyjegyuvel;
    }
    
    if (SzorzasTippek.tobbJegyu.ketKetjegyu.felismer(absSzorzo, absSzorzando)) {
        return SzorzasTippek.tobbJegyu.ketKetjegyu;
    }
    
    // Ha nem találtunk specifikus trükköt, adjunk egy általános tanácsot
    return {
        leiras: "Fejszámolási tipp",
        magyarazat: "Bontsd a számot helyiértékek szerint, majd szorozd és add össze a részeredményeket!",
        trick: `Például: ${szorzo}×${szorzando} esetén próbáld felbontani: ${szorzo} = ${Math.floor(szorzo/10)*10} + ${szorzo % 10}`
    };
}

export { SzorzasTippek, talaljMegfeleloTrukkot };