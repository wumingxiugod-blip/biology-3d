import urllib.request
import re

for page in range(1, 10):
    if page == 1:
        url = "https://www.cadnav.com/3d-models/anatomy/"
    else:
        url = f"https://www.cadnav.com/3d-models/anatomy/list_17_{page}.html"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            matches = re.findall(r'href="(/3d-models/model-[^"]+\.html)"[^>]*title="([^"]+)"', html)
            for href, title in matches:
                lower = title.lower()
                if any(w in lower for w in ["heart", "lung", "liver", "stomach", "kidney", "brain", "organ", "viscera", "digestive", "intestine", "animal", "dog", "pig"]):
                    print(f"Page {page}: {href} -> {title}")
    except Exception as e:
        print(f"Page {page} error: {e}")
        break
