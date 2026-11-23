import urllib.request
import re

def search_category(cat, max_pages=15):
    for p in range(1, max_pages + 1):
        if p == 1:
            url = f"https://www.cadnav.com/3d-models/{cat}/"
        else:
            url = f"https://www.cadnav.com/3d-models/{cat}/list_{p}.html"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                html = resp.read().decode('utf-8', 'ignore')
                items = re.findall(r'href="(/3d-models/model-\d+\.html)"[^>]*title="([^"]+)"', html)
                for href, title in items:
                    t_low = title.lower()
                    if any(w in t_low for w in ['dog', 'pig', 'swine', 'canine', 'porcine', 'organ', 'heart', 'lung', 'liver', 'stomach', 'kidney', 'brain', 'spleen', 'intestine', 'viscera', 'skeleton', 'anatomy']):
                        print(f"[{cat} p{p}] {title} -> https://www.cadnav.com{href}")
        except Exception as e:
            # print(f"Error {cat} p{p}: {e}")
            pass

print("Searching animal...")
search_category("animal", 25)
print("Searching hospital...")
search_category("hospital", 10)
print("Searching human...")
search_category("human", 15)
