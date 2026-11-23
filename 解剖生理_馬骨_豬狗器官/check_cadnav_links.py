import urllib.request
import re

req = urllib.request.Request('https://www.cadnav.com/', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', 'ignore')
links = re.findall(r'href="([^"]+)"', html)
for l in sorted(set(links)):
    if 'model' in l or '3d' in l:
        print(l)
