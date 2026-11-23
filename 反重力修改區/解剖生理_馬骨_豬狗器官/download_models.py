import urllib.request
import os

final_url = "https://www.cadnav.com/plus/download.php?open=2&id=45947&uhash=baaceb412e921dee40f2d292"
req = urllib.request.Request(final_url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': 'https://www.cadnav.com/plus/download.php?open=0&aid=45947&cid=3'
})

out_dir = r"C:\Users\user\.gemini\antigravity\scratch\vet_anatomy_quiz\models"
os.makedirs(out_dir, exist_ok=True)
out_file = os.path.join(out_dir, "horse_skeleton_pkg.zip")

print("Downloading horse skeleton model package...")
try:
    with urllib.request.urlopen(req) as resp:
        print("Response headers:", resp.headers)
        with open(out_file, "wb") as f:
            f.write(resp.read())
    print(f"Downloaded successfully! File size: {os.path.getsize(out_file)} bytes")
except Exception as e:
    print("Download error:", e)
