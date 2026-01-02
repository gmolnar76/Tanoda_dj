import sqlite3

# Csatlakozás az adatbázishoz
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Táblák lekérdezése
print("Adatbázis táblák:")
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = cursor.fetchall()
for table in tables:
    print(table[0])

# Kisebb példa: SzorzasGyakorlatSession tábla mezőinek listázása (ha létezik)
try:
    cursor.execute('PRAGMA table_info(egesz_szamok_szorzasgyakorlatsession)')
    columns = cursor.fetchall()
    print("\nSzorzasGyakorlatSession tábla mezői:")
    for column in columns:
        print(f"- {column[1]} ({column[2]})")
except sqlite3.OperationalError:
    print("\nA SzorzasGyakorlatSession tábla nem létezik.")

# HibasValasz tábla mezőinek listázása (ha létezik)
try:
    cursor.execute('PRAGMA table_info(egesz_szamok_hibasvalasz)')
    columns = cursor.fetchall()
    print("\nHibasValasz tábla mezői:")
    for column in columns:
        print(f"- {column[1]} ({column[2]})")
except sqlite3.OperationalError:
    print("\nA HibasValasz tábla nem létezik.")

# HelyesValasz tábla mezőinek listázása (ha létezik)
try:
    cursor.execute('PRAGMA table_info(egesz_szamok_helyesvalasz)')
    columns = cursor.fetchall()
    print("\nHelyesValasz tábla mezői:")
    for column in columns:
        print(f"- {column[1]} ({column[2]})")
except sqlite3.OperationalError:
    print("\nA HelyesValasz tábla nem létezik.")

# Kapcsolat zárása
conn.close()