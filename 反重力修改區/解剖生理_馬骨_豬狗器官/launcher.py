import os
import subprocess
import webbrowser

html_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "index.html"))
html_url = f"file:///{html_file.replace(os.sep, '/')}"

browsers = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]

launched = False
for b in browsers:
    if os.path.exists(b):
        try:
            subprocess.Popen([b, f"--app={html_url}", "--window-size=1360,860"])
            launched = True
            break
        except Exception:
            pass

if not launched:
    webbrowser.open(html_url)
