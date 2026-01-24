import os

BASE = os.path.dirname(os.path.abspath(__file__))

# 1. Ellenőrzi a view-t
view_path = os.path.join(BASE, 'tanoda', 'views.py')
view_exists = False
if os.path.isfile(view_path):
	with open(view_path, encoding='utf-8') as f:
		for line in f:
			if 'def dashboard_view' in line:
				view_exists = True
				break

# 2. Ellenőrzi a template-et
template_path = os.path.join(BASE, 'templates', 'dashboard.html')
template_exists = os.path.isfile(template_path)

# 3. Ellenőrzi az urls.py-t
urls_path = os.path.join(BASE, 'tanoda', 'urls.py')
url_registered = False
if os.path.isfile(urls_path):
	with open(urls_path, encoding='utf-8') as f:
		for line in f:
			if 'dashboard_view' in line and 'path(' in line:
				url_registered = True
				break


print("--- KAPCSOLATLÁNC ELÉRÉSI UTAK ---")
print(f"View (dashboard_view):        {view_path}")
print(f"Template (dashboard.html):    {template_path}")
print(f"URLconf (urls.py):            {urls_path}")
print("-------------------------------")
print("dashboard_view definiálva:", view_exists)
print("dashboard.html létezik:", template_exists)
print("dashboard_view URL regisztrálva:", url_registered)

if not view_exists:
	print("HIBA: A dashboard_view nincs definiálva a views.py-ban.")
elif not template_exists:
	print("HIBA: A dashboard.html nem található a templates mappában.")
elif not url_registered:
	print("HIBA: A dashboard_view nincs regisztrálva az urls.py-ban.")
else:
	print("Minden komponens rendben, a dashboard.html-nek működnie kell.")
