import urllib.request
import re

url = "https://www.cadnav.com/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', 'ignore')
        nav_links = re.findall(r'href="(/3d-models/[^"]*)"[^>]*>([^<]+)<', html)
        for h, t in set(nav_links):
            print(h, "->", t.strip())
except Exception as e:
    print("Error:", e)
