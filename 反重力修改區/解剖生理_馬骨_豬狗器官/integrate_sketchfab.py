import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add CSS for source switcher
css_insert = """
    .source-switcher {
      display: flex;
      background: #1e293b;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 3px;
      gap: 4px;
    }
    .source-btn {
      padding: 5px 12px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .source-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.08);
    }
    .source-btn.active {
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      color: #ffffff;
    }
"""
content = content.replace("/* UI Overlay Layer */", css_insert + "\n    /* UI Overlay Layer */")

# 2. Add Sketchfab viewport HTML next to #webgl-canvas
html_viewport = """  <!-- WebGL 3D Canvas -->
  <canvas id="webgl-canvas"></canvas>

  <!-- Sketchfab 3D Viewport (karab44 Horse Skeleton) -->
  <div id="sketchfab-viewport" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; display: none; background: #080c15;">
    <iframe id="sketchfab-frame" title="Horse Skeleton 3D model - Sketchfab"
      src="https://sketchfab.com/models/8963e97beaec4dc88062287a6e5cab67/embed?autostart=1&internal=1&tracking=0&ui_ar=0&ui_infos=0&ui_snapshots=0&ui_stop=0&ui_theatre=1&ui_watermark=0"
      style="width: 100%; height: 100%; border: none;"
      allow="autoplay; fullscreen; xr-spatial-tracking"
      xr-spatial-tracking="true"
      allowfullscreen>
    </iframe>
  </div>"""

content = content.replace('  <!-- WebGL 3D Canvas -->\n  <canvas id="webgl-canvas"></canvas>', html_viewport)

# 3. Add Source switcher in top nav next to animal tabs
old_tabs = """      <!-- Animal Switcher Tabs -->
      <div class="animal-tabs">
        <button class="tab-btn active" data-animal="horse">
          <span>🐎</span>
          <span>馬骨骼 (全身)</span>
        </button>
        <button class="tab-btn" data-animal="dog">
          <span>🐕</span>
          <span>狗 (內臟器官)</span>
        </button>
        <button class="tab-btn" data-animal="pig">
          <span>🐖</span>
          <span>豬 (特徵器官)</span>
        </button>
      </div>"""

new_tabs = """      <!-- Animal Switcher Tabs -->
      <div class="animal-tabs">
        <button class="tab-btn active" data-animal="horse">
          <span>🐎</span>
          <span>馬骨骼 (全身)</span>
        </button>
        <button class="tab-btn" data-animal="dog">
          <span>🐕</span>
          <span>狗 (內臟器官)</span>
        </button>
        <button class="tab-btn" data-animal="pig">
          <span>🐖</span>
          <span>豬 (特徵器官)</span>
        </button>
      </div>

      <!-- 馬骨骼 3D 模型來源切換器 (Sketchfab vs 輕量 Three.js) -->
      <div class="source-switcher" id="horse-source-switcher">
        <button class="source-btn active" id="source-sketchfab-btn" title="查看使用者指定的 Sketchfab 專業醫學 3D 模型 (karab44)">
          <span>💎</span>
          <span>Sketchfab 專業模型</span>
        </button>
        <button class="source-btn" id="source-threejs-btn" title="切換為內建輕量獨立 3D 模型">
          <span>⚡</span>
          <span>輕量互動 3D</span>
        </button>
      </div>"""

content = content.replace(old_tabs, new_tabs)

# 4. Update JS logic in VetApp for horse 3D model source switching
old_switch = """    switchAnimal(animalKey) {
      this.currentAnimal = animalKey;
      Object.keys(this.models).forEach(k => {
        this.models[k].visible = (k === animalKey);
      });

      // 更新按鈕樣式
      document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.animal === animalKey);
      });

      // 重設視角適配
      this.resetCameraView();
      this.updateSidebarList();
      this.closeDetailCard();

      // 若在抽考模式，重新載入該動物題目庫
      if (this.currentMode === "quiz") {
        this.startQuiz();
      }
    }"""

new_switch = """    switchAnimal(animalKey) {
      this.currentAnimal = animalKey;
      const switcher = document.getElementById("horse-source-switcher");
      const sketchfabView = document.getElementById("sketchfab-viewport");
      const webglCanvas = document.getElementById("webgl-canvas");

      if (animalKey === "horse") {
        if (switcher) switcher.style.display = "flex";
        if (this.horse3DSource === "sketchfab") {
          sketchfabView.style.display = "block";
          webglCanvas.style.display = "none";
        } else {
          sketchfabView.style.display = "none";
          webglCanvas.style.display = "block";
        }
      } else {
        if (switcher) switcher.style.display = "none";
        sketchfabView.style.display = "none";
        webglCanvas.style.display = "block";
      }

      Object.keys(this.models).forEach(k => {
        this.models[k].visible = (k === animalKey);
      });

      // 更新按鈕樣式
      document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.animal === animalKey);
      });

      // 重設視角適配
      if (webglCanvas.style.display !== "none") {
        this.resetCameraView();
      }
      this.updateSidebarList();
      this.closeDetailCard();

      // 若在抽考模式，重新載入該動物題目庫
      if (this.currentMode === "quiz") {
        this.startQuiz();
      }
    }

    setHorse3DSource(source) {
      this.horse3DSource = source;
      const sketchfabView = document.getElementById("sketchfab-viewport");
      const webglCanvas = document.getElementById("webgl-canvas");
      const btnSf = document.getElementById("source-sketchfab-btn");
      const btnT3 = document.getElementById("source-threejs-btn");

      if (btnSf && btnT3) {
        btnSf.classList.toggle("active", source === "sketchfab");
        btnT3.classList.toggle("active", source === "threejs");
      }

      if (this.currentAnimal === "horse") {
        if (source === "sketchfab") {
          sketchfabView.style.display = "block";
          webglCanvas.style.display = "none";
        } else {
          sketchfabView.style.display = "none";
          webglCanvas.style.display = "block";
          this.resetCameraView();
        }
      }
    }"""

content = content.replace(old_switch, new_switch)

# 5. Initialize horse3DSource in constructor and add event listeners
old_constructor = """      this.currentAnimal = "horse"; // horse, dog, pig
      this.currentMode = "study";   // study, quiz"""

new_constructor = """      this.currentAnimal = "horse"; // horse, dog, pig
      this.currentMode = "study";   // study, quiz
      this.horse3DSource = "sketchfab"; // sketchfab, threejs"""

content = content.replace(old_constructor, new_constructor)

old_init_events = """      // 動物切換標籤
      document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.switchAnimal(btn.dataset.animal);
          this.sound.playClick();
        });
      });"""

new_init_events = """      // 動物切換標籤
      document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.switchAnimal(btn.dataset.animal);
          this.sound.playClick();
        });
      });

      // 馬骨骼 3D 模型來源切換 (Sketchfab vs Three.js)
      document.getElementById("source-sketchfab-btn")?.addEventListener("click", () => {
        this.setHorse3DSource("sketchfab");
        this.sound.playClick();
      });
      document.getElementById("source-threejs-btn")?.addEventListener("click", () => {
        this.setHorse3DSource("threejs");
        this.sound.playClick();
      });"""

content = content.replace(old_init_events, new_init_events)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Sketchfab Horse Skeleton integrated into index.html successfully!")
