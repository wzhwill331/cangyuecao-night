/* 苍月草 · 夜息 — panel switcher + multi-layer + audio + mouse petals */

(function () {
  "use strict";

  const CHANNELS = [
    { id: "wind", name: "草风", desc: "过滤后的宽频噪声，像夜风穿草", def: 45 },
    { id: "rain", name: "远雨", desc: "粉噪，低通压过，像窗外远雨", def: 25 },
    { id: "cricket", name: "夜虫", desc: "轻颤的高音脉冲，密度很低", def: 15 },
    { id: "petal", name: "瓣落", desc: "偶发的柔和颗粒声，对应落瓣", def: 10 },
  ];

  const STORE_KEY = "cangyuecao.night.v1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wind = {
    target: 1,
    current: 1,
    gust: 0,
    mouse: 0,
  };

  function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function $(id) {
    return document.getElementById(id);
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function setWindCss() {
    document.documentElement.style.setProperty("--wind", wind.current.toFixed(3));
  }

  /* ---------- SVG plants ---------- */
  function buildGrass(container, options) {
    if (!container) return;
    const {
      count = 56,
      seed = 1,
      leaf = "#2f6b55",
      tip = "#7fb89a",
      heightMin = 0.35,
      heightMax = 0.92,
      lean = 1,
      base = true,
    } = options;

    const w = Math.max(count * 12, 360);
    const h = 160;
    const rng0 = mulberry32(seed);

    container.innerHTML = "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.display = "block";

    const gradId = "gr-" + seed + "-" + (container.id || "x");
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    grad.setAttribute("id", gradId);
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "1");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "0");
    const s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    s1.setAttribute("offset", "0%");
    s1.setAttribute("stop-color", leaf);
    const s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    s2.setAttribute("offset", "55%");
    s2.setAttribute("stop-color", leaf);
    const s3 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    s3.setAttribute("offset", "100%");
    s3.setAttribute("stop-color", tip);
    grad.appendChild(s1);
    grad.appendChild(s2);
    grad.appendChild(s3);
    defs.appendChild(grad);
    svg.appendChild(defs);

    const root = document.createElementNS("http://www.w3.org/2000/svg", "g");
    root.setAttribute("fill", "url(#" + gradId + ")");

    // solid ground so the mass always reads
    if (base) {
      const ground = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      ground.setAttribute("x", "0");
      ground.setAttribute("y", String(h - 28));
      ground.setAttribute("width", String(w));
      ground.setAttribute("height", "28");
      ground.setAttribute("fill", leaf);
      ground.setAttribute("opacity", "0.95");
      root.appendChild(ground);
    }

    const colW = w / count;
    for (let i = 0; i < count; i++) {
      const rng = mulberry32(seed * 97 + i * 17);
      const ht = (heightMin + rng() * (heightMax - heightMin)) * (h - 20);
      const bend = (rng() * 0.45 + 0.08) * lean * (rng() > 0.5 ? 1 : -1);
      const halfW = colW * (0.42 + rng() * 0.28);
      const x = i * colW + colW * 0.5;
      const tipX = x + bend * colW * 2.2;
      const tipY = h - ht;
      const midX = x + bend * colW * 0.6;
      const midY = h - ht * 0.45;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      // filled blade: base -> tip -> base
      path.setAttribute(
        "d",
        "M " + (x - halfW) + " " + h +
        " Q " + (midX - halfW * 0.55) + " " + midY + " " + tipX + " " + tipY +
        " Q " + (midX + halfW * 0.55) + " " + midY + " " + (x + halfW) + " " + h + " Z"
      );
      path.setAttribute("opacity", String(0.82 + rng0() * 0.18));
      root.appendChild(path);

      // occasional thin second blade for density
      if (rng() > 0.55) {
        const ht2 = ht * (0.55 + rng() * 0.35);
        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const tipX2 = x + halfW * 0.3 + bend * colW * 1.4;
        path2.setAttribute(
          "d",
          "M " + (x - halfW * 0.25) + " " + h +
          " Q " + midX + " " + (h - ht2 * 0.5) + " " + tipX2 + " " + (h - ht2) +
          " Q " + (midX + halfW * 0.4) + " " + (h - ht2 * 0.5) + " " + (x + halfW * 0.45) + " " + h + " Z"
        );
        path2.setAttribute("opacity", "0.75");
        root.appendChild(path2);
      }
    }

    svg.appendChild(root);
    container.appendChild(svg);
  }

  function buildFern(container, seed) {
    if (!container) return;
    const w = 120;
    const h = 200;
    const rng = mulberry32(seed);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "xMinYMax meet");
    svg.setAttribute("aria-hidden", "true");
    svg.style.width = "100%";
    svg.style.height = "100%";
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const stem = document.createElementNS("http://www.w3.org/2000/svg", "path");
    stem.setAttribute("d", "M 8 " + h + " Q 18 " + h * 0.55 + " 42 12");
    stem.setAttribute("fill", "none");
    stem.setAttribute("stroke", "#2f6b55");
    stem.setAttribute("stroke-width", "3");
    g.appendChild(stem);
    for (let i = 0; i < 9; i++) {
      const t = 0.15 + (i / 9) * 0.8;
      const bx = 8 + (42 - 8) * t * t * 0.9 + t * 12;
      const by = h - (h - 20) * t;
      const len = 18 + rng() * 28;
      const ang = -40 - rng() * 50;
      const leaflet = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const rad = (ang * Math.PI) / 180;
      const ex = bx + Math.cos(rad) * len;
      const ey = by + Math.sin(rad) * len;
      leaflet.setAttribute(
        "d",
        "M " + bx + " " + by +
          " Q " + (bx + (ex - bx) * 0.4) + " " + (by - 6) +
          " " + ex + " " + ey +
          " Q " + (bx + (ex - bx) * 0.55) + " " + (by + 8) +
          " " + bx + " " + by + " Z"
      );
      leaflet.setAttribute("fill", i % 2 ? "#245846" : "#2f6b55");
      leaflet.setAttribute("opacity", String(0.75 + rng() * 0.25));
      g.appendChild(leaflet);
    }
    svg.appendChild(g);
    container.innerHTML = "";
    container.appendChild(svg);
  }

  function initPlants() {
    buildGrass($("night-grass-far"), {
      count: 72, seed: 11, leaf: "#1a3d32", tip: "#3d6b5a",
      heightMin: 0.28, heightMax: 0.62, lean: 0.7,
    });
    buildGrass($("night-grass-mid"), {
      count: 64, seed: 22, leaf: "#245846", tip: "#7fb89a",
      heightMin: 0.4, heightMax: 0.82, lean: 1.05,
    });
    buildGrass($("night-grass-near"), {
      count: 52, seed: 33, leaf: "#1f4d3e", tip: "#8ec4a4",
      heightMin: 0.55, heightMax: 1, lean: 1.25,
    });
    buildFern($("night-fern-l"), 7);
    buildFern($("night-fern-r"), 19);
    buildGrass($("mix-grass"), {
      count: 56, seed: 44, leaf: "#1a3d32", tip: "#3d6b5a",
      heightMin: 0.35, heightMax: 0.75, lean: 0.85,
    });
    buildGrass($("breath-grass"), {
      count: 52, seed: 55, leaf: "#1a3d32", tip: "#2f6b55",
      heightMin: 0.4, heightMax: 0.8, lean: 0.9,
    });
    buildGrass($("mood-grass"), {
      count: 60, seed: 66, leaf: "#245846", tip: "#7fb89a",
      heightMin: 0.45, heightMax: 0.95, lean: 1.15,
    });

    const moodPetals = $("mood-petals");
    if (moodPetals && !reduceMotion) {
      for (let i = 0; i < 4; i++) {
        const p = document.createElement("span");
        p.className = "mood-petal";
        moodPetals.appendChild(p);
      }
    } else if (moodPetals) {
      for (let i = 0; i < 3; i++) {
        const p = document.createElement("span");
        p.className = "mood-petal";
        p.style.left = 20 + i * 25 + "%";
        p.style.top = 30 + i * 10 + "%";
        p.style.opacity = "0.5";
        moodPetals.appendChild(p);
      }
    }
  }

  /* ---------- panel switcher ---------- */
  function initPanels() {
    const tabs = Array.prototype.slice.call(document.querySelectorAll(".panel-tab"));
    const panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
    let current = "night";
    let switching = false;

    function panelEl(name) {
      return document.getElementById("panel-" + name);
    }

    function activate(name, focusTab) {
      if (name === current || switching) return;
      const next = panelEl(name);
      const prev = panelEl(current);
      if (!next) return;

      switching = true;
      tabs.forEach(function (t) {
        const on = t.getAttribute("data-panel") === name;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });

      function showNext() {
        if (prev) {
          prev.hidden = true;
          prev.classList.remove("is-exiting", "is-entering", "is-active");
        }
        next.hidden = false;
        next.classList.add("is-active", "is-entering");
        current = name;
        window.setTimeout(function () {
          next.classList.remove("is-entering");
          switching = false;
        }, reduceMotion ? 0 : 720);
        if (focusTab) {
          const tab = tabs.find(function (t) {
            return t.getAttribute("data-panel") === name;
          });
          if (tab) tab.focus();
        }
      }

      if (prev && !reduceMotion) {
        prev.classList.add("is-exiting");
        window.setTimeout(showNext, 260);
      } else {
        showNext();
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-panel"), false);
      });
    });

    document.querySelectorAll("[data-goto]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activate(btn.getAttribute("data-goto"), true);
      });
    });

    // keyboard: left/right on tablist
    const tablist = document.querySelector(".panel-tabs");
    if (tablist) {
      tablist.addEventListener("keydown", function (e) {
        const i = tabs.findIndex(function (t) {
          return t.classList.contains("is-active");
        });
        if (e.key === "ArrowRight") {
          e.preventDefault();
          const n = tabs[(i + 1) % tabs.length];
          activate(n.getAttribute("data-panel"), true);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const n = tabs[(i - 1 + tabs.length) % tabs.length];
          activate(n.getAttribute("data-panel"), true);
        }
      });
    }
  }

  function initMoodFocus() {
    const stage = $("mood-stage");
    if (!stage) return;
    document.querySelectorAll("[data-focus]").forEach(function (btn) {
      if (!btn.classList.contains("chip")) return;
      btn.addEventListener("click", function () {
        document.querySelectorAll(".mood-subtabs .chip").forEach(function (c) {
          c.classList.toggle("is-active", c === btn);
        });
        stage.setAttribute("data-focus", btn.getAttribute("data-focus"));
      });
    });
  }

  /* ---------- atmosphere: stars, fireflies, petals, mouse trail ---------- */
  function initAtmosphere() {
    const canvas = $("petal-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let petals = [];
    let fireflies = [];
    let trail = [];
    let raf = 0;
    let w = 0;
    let h = 0;
    let t0 = performance.now();
    const pointer = {
      x: -999, y: -999, px: -999, py: -999,
      vx: 0, vy: 0, active: false, lastSpawn: 0,
    };

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const petalTarget = reduceMotion ? 12 : clamp(Math.round(w / 28), 18, 56);
      while (petals.length < petalTarget) petals.push(spawnPetal(true));
      if (petals.length > petalTarget) petals.length = petalTarget;
      const flyTarget = reduceMotion ? 5 : clamp(Math.round(w / 140), 6, 18);
      fireflies = [];
      for (let i = 0; i < flyTarget; i++) fireflies.push(spawnFly(true));
    }

    function spawnPetal(anywhere) {
      const depth = 0.4 + Math.random() * 0.6;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -16,
        r: (3.5 + Math.random() * 7) * depth,
        vy: (0.22 + Math.random() * 0.5) * depth,
        vx: -0.1 + Math.random() * 0.2,
        rot: Math.random() * Math.PI * 2,
        vr: (-0.012 + Math.random() * 0.024) * (reduceMotion ? 0 : 1),
        alpha: 0.28 + depth * 0.4,
        depth: depth,
        swayPh: Math.random() * Math.PI * 2,
        swayAmp: 12 + Math.random() * 28,
        hue: Math.random() > 0.55 ? "#d4b8c4" : Math.random() > 0.4 ? "#c9b0b8" : "#b8c4b0",
        curl: Math.random() > 0.65,
      };
    }

    function spawnTrailPetal(x, y, vx, vy) {
      const depth = 0.7 + Math.random() * 0.4;
      return {
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        r: (3.2 + Math.random() * 4.5) * depth,
        vy: 0.15 + Math.random() * 0.35,
        vx: vx * 0.08 + (Math.random() - 0.5) * 0.4,
        rot: Math.random() * Math.PI * 2,
        vr: (-0.04 + Math.random() * 0.08) * (reduceMotion ? 0 : 1),
        alpha: 0.55,
        life: 1,
        decay: 0.008 + Math.random() * 0.01,
        hue: Math.random() > 0.5 ? "#d4b8c4" : "#c9b0b8",
        curl: Math.random() > 0.5,
      };
    }

    function spawnFly(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : Math.random() * h * 0.8,
        r: 1.2 + Math.random() * 2.2,
        vx: -0.15 + Math.random() * 0.3,
        vy: -0.12 + Math.random() * 0.24,
        ph: Math.random() * Math.PI * 2,
        pulse: 0.8 + Math.random() * 1.4,
        a: 0.25 + Math.random() * 0.55,
      };
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.hue;
      if (p.curl) {
        ctx.beginPath();
        ctx.moveTo(-p.r * 0.4, p.r * 0.8);
        ctx.quadraticCurveTo(-p.r * 0.9, 0, -p.r * 0.1, -p.r);
        ctx.quadraticCurveTo(p.r * 0.5, -p.r * 0.2, p.r * 0.35, p.r * 0.7);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 0.55, p.r, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawFly(f, now) {
      const pulse = 0.55 + 0.45 * Math.sin(now * 0.001 * f.pulse + f.ph);
      ctx.save();
      ctx.globalAlpha = f.a * pulse;
      const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
      grd.addColorStop(0, "rgba(201,180,138,0.9)");
      grd.addColorStop(0.35, "rgba(127,184,154,0.35)");
      grd.addColorStop(1, "rgba(127,184,154,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(233,242,234,0.95)";
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function frame(now) {
      t0 = now;
      wind.current += (wind.target - wind.current) * 0.02;
      if (!reduceMotion && Math.random() < 0.004) wind.gust = 0.8 + Math.random() * 1.4;
      wind.gust *= 0.985;
      const breeze = wind.current + wind.gust;
      setWindCss();

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i];
        if (!reduceMotion) {
          f.x += f.vx + Math.sin(now * 0.0006 + f.ph) * 0.15 + wind.mouse * 0.02;
          f.y += f.vy + Math.cos(now * 0.0005 + f.ph * 1.3) * 0.12;
          if (f.x < -20) f.x = w + 10;
          if (f.x > w + 20) f.x = -10;
          if (f.y < -20) f.y = h * 0.8;
          if (f.y > h + 20) f.y = h * 0.1;
        }
        drawFly(f, now);
      }

      if (pointer.active && !reduceMotion) {
        const speed = Math.hypot(pointer.vx, pointer.vy);
        if (speed > 0.6 && now - pointer.lastSpawn > 28) {
          const burst = speed > 12 ? 2 : 1;
          for (let i = 0; i < burst; i++) {
            trail.push(spawnTrailPetal(pointer.x, pointer.y, pointer.vx, pointer.vy));
          }
          if (trail.length > 80) trail.splice(0, trail.length - 80);
          pointer.lastSpawn = now;
        }
        pointer.vx *= 0.86;
        pointer.vy *= 0.86;
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        if (!reduceMotion) {
          if (pointer.active && p.life > 0.55) {
            p.vx += (pointer.x - p.x) * 0.0025;
            p.vy += (pointer.y - p.y) * 0.0025;
            p.vx *= 0.9;
            p.vy *= 0.9;
          } else {
            p.vy += 0.01;
          }
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          p.life -= p.decay;
          p.alpha = Math.max(0, p.life * 0.85);
        }
        if (p.life <= 0 || p.y > h + 30) {
          trail.splice(i, 1);
          continue;
        }
        drawPetal(p);
      }

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        if (!reduceMotion) {
          const flutter = Math.sin(now * 0.0012 + p.swayPh) * (p.swayAmp * 0.01);
          p.y += p.vy * (1 + breeze * 0.15);
          p.x += p.vx + flutter + breeze * 0.08 + wind.mouse * 0.04 * p.depth;
          p.rot += p.vr * (1 + breeze * 0.1);
          if (p.y > h + 24 || p.x < -40 || p.x > w + 40) petals[i] = spawnPetal(false);
        }
        drawPetal(petals[i]);
      }

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", function () {
      resize();
      if (reduceMotion) {
        ctx.clearRect(0, 0, w, h);
        fireflies.forEach(function (f) { drawFly(f, performance.now()); });
        petals.forEach(drawPetal);
      }
    });

    window.addEventListener("mousemove", function (e) {
      const nx = e.clientX;
      const ny = e.clientY;
      if (pointer.x < -100) {
        pointer.x = nx; pointer.y = ny; pointer.px = nx; pointer.py = ny;
      }
      pointer.vx = pointer.vx * 0.65 + (nx - pointer.px) * 0.35;
      pointer.vy = pointer.vy * 0.65 + (ny - pointer.py) * 0.35;
      pointer.px = nx; pointer.py = ny; pointer.x = nx; pointer.y = ny;
      pointer.active = true;
      wind.mouse = (e.clientX / window.innerWidth - 0.5) * 2;
    }, { passive: true });

    window.addEventListener("pointerdown", function (e) {
      if (reduceMotion) return;
      for (let i = 0; i < 4; i++) {
        trail.push(spawnTrailPetal(e.clientX, e.clientY, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8));
      }
    }, { passive: true });

    if (reduceMotion) {
      ctx.clearRect(0, 0, w, h);
      fireflies.forEach(function (f) { drawFly(f, performance.now()); });
      petals.forEach(drawPetal);
    } else {
      raf = requestAnimationFrame(frame);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduceMotion) {
        t0 = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
  }

  /* ---------- audio ---------- */
  const audio = {
    ctx: null,
    master: null,
    nodes: {},
    playing: false,
    timerMin: 45,
    endAt: 0,
    tickTimer: 0,
    petalTimer: 0,
    cricketTimer: 0,
  };

  function loadVolumes() {
    const base = {};
    CHANNELS.forEach(function (c) { base[c.id] = c.def; });
    base.master = 100;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        Object.keys(base).forEach(function (k) {
          if (typeof saved[k] === "number") base[k] = saved[k];
        });
      }
    } catch (e) { /* ignore */ }
    return base;
  }

  function saveVolumes() {
    const data = { master: Number($("master") ? $("master").value : 70) };
    CHANNELS.forEach(function (c) {
      const el = $("ch-" + c.id);
      data[c.id] = el ? Number(el.value) : c.def;
    });
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function makeNoiseBuffer(ctx, seconds, pink) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buffer = ctx.createBuffer(1, len, rate);
    const data = buffer.getChannelData(0);
    if (!pink) {
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } else {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const pinkOut = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = pinkOut * 0.11;
      }
    }
    return buffer;
  }

  function ensureAudio() {
    if (audio.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    audio.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    audio.master = master;

    const windSrc = ctx.createBufferSource();
    windSrc.buffer = makeNoiseBuffer(ctx, 4, false);
    windSrc.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.6;
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.07;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 180;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    const windGain = ctx.createGain();
    windGain.gain.value = 0;
    windSrc.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);
    windSrc.start();
    windLfo.start();
    audio.nodes.wind = { gain: windGain };

    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = makeNoiseBuffer(ctx, 4, true);
    rainSrc.loop = true;
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.value = 1400;
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainSrc.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(master);
    rainSrc.start();
    audio.nodes.rain = { gain: rainGain };

    audio.nodes.cricket = { gain: ctx.createGain() };
    audio.nodes.cricket.gain.gain.value = 0;
    audio.nodes.cricket.gain.connect(master);
    audio.nodes.petal = { gain: ctx.createGain() };
    audio.nodes.petal.gain.gain.value = 0;
    audio.nodes.petal.gain.connect(master);
  }

  function playCricketChirp() {
    if (!audio.ctx || !audio.playing) return;
    const ctx = audio.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 2800 + Math.random() * 1600;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.connect(g);
    g.connect(audio.nodes.cricket.gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  function playPetalTap() {
    if (!audio.ctx || !audio.playing) return;
    const ctx = audio.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(680 + Math.random() * 120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(filter);
    filter.connect(g);
    g.connect(audio.nodes.petal.gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  function scheduleEvents() {
    clearInterval(audio.cricketTimer);
    clearInterval(audio.petalTimer);
    if (!audio.playing) return;
    audio.cricketTimer = setInterval(function () {
      if (Math.random() < 0.55) playCricketChirp();
    }, 1400);
    audio.petalTimer = setInterval(function () {
      if (Math.random() < 0.4) playPetalTap();
    }, 2200);
  }

  function syncWindFromSliders() {
    const windEl = $("ch-wind");
    const masterEl = $("master");
    const wv = windEl ? Number(windEl.value) : 45;
    const mv = masterEl ? Number(masterEl.value) : 100;
    const playBoost = audio.playing ? 1.15 : 0.85;
    wind.target = clamp(0.7 + (wv / 100) * (0.55 + (mv / 100) * 0.45) * playBoost, 0.55, 2.2);
  }

  function setPlayingUI(on) {
    document.body.classList.toggle("is-playing", on);
    const mainLabel = on ? "暂停夜息" : "进入夜息";
    const sideLabel = on ? "暂停" : "继续";
    const t1 = $("toggle-btn");
    if (t1) {
      const span = t1.querySelector(".btn-label");
      if (span) span.textContent = mainLabel;
      t1.classList.toggle("is-playing", on);
    }
    const t2 = $("panel-toggle");
    if (t2) {
      const span = t2.querySelector(".btn-label");
      if (span) span.textContent = sideLabel;
      t2.classList.toggle("is-playing", on);
      t2.classList.toggle("btn-ghost", true);
    }
    const header = $("header-status");
    if (header) {
      header.textContent = on ? "播放中" : "未开始";
    }
    syncWindFromSliders();
  }

  function setStatus(msg) {
    const line = $("status-line");
    if (line) line.textContent = msg;
  }

  function fmtRemain(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  function updateTimerReadout() {
    const el = $("timer-readout");
    if (!el) return;
    function fmtClock(ms) {
      const s = Math.max(0, Math.ceil(ms / 1000));
      const m = Math.floor(s / 60);
      const r = s % 60;
      return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
    }
    if (!audio.playing) {
      el.textContent = audio.timerMin > 0 ? String(audio.timerMin).padStart(2, "0") + ":00" : "--:--";
      return;
    }
    if (!audio.endAt) {
      el.textContent = "--:--";
      return;
    }
    el.textContent = fmtClock(audio.endAt - Date.now());
  }

  function resetScape() {
    CHANNELS.forEach(function (c) {
      const el = $("ch-" + c.id);
      if (el) {
        el.value = String(c.def);
        const valEl = $("val-" + c.id);
        if (valEl) valEl.textContent = String(c.def);
      }
    });
    const master = $("master");
    if (master) {
      master.value = "100";
      const mv = $("master-val");
      if (mv) mv.textContent = "100";
    }
    audio.timerMin = 45;
    document.querySelectorAll("[data-timer]").forEach(function (chip) {
      const on = chip.getAttribute("data-timer") === "45";
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (audio.playing) {
      audio.endAt = Date.now() + 45 * 60 * 1000;
      applyChannelGains();
      applyMasterGain();
    }
    syncWindFromSliders();
    saveVolumes();
    updateTimerReadout();
    setStatus("已重置为默认声景。");
  }

  function applyChannelGains() {
    if (!audio.ctx) return;
    CHANNELS.forEach(function (c) {
      const n = audio.nodes[c.id];
      if (!n) return;
      const el = $("ch-" + c.id);
      const v = el ? Number(el.value) / 100 : c.def / 100;
      n.gain.gain.setTargetAtTime(v * 0.9, audio.ctx.currentTime, 0.05);
    });
  }

  function applyMasterGain() {
    if (!audio.ctx || !audio.master) return;
    const el = $("master");
    const v = el ? Number(el.value) / 100 : 1;
    audio.master.gain.setTargetAtTime(audio.playing ? v : 0, audio.ctx.currentTime, 0.08);
  }

  function startNight() {
    ensureAudio();
    if (!audio.ctx) {
      setStatus("当前浏览器不支持 Web Audio。");
      return;
    }
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    audio.playing = true;
    audio.endAt = audio.timerMin > 0 ? Date.now() + audio.timerMin * 60 * 1000 : 0;
    applyChannelGains();
    applyMasterGain();
    scheduleEvents();
    setPlayingUI(true);
    setStatus("夜息已开始。改滑杆会立刻生效。");
    updateTimerReadout();
    clearInterval(audio.tickTimer);
    audio.tickTimer = setInterval(function () {
      if (!audio.playing) return;
      if (audio.endAt && Date.now() >= audio.endAt) {
        stopNight(true);
        return;
      }
      if (audio.endAt && audio.master) {
        const left = audio.endAt - Date.now();
        if (left < 60000) {
          const el = $("master");
          const base = el ? Number(el.value) / 100 : 1;
          audio.master.gain.setTargetAtTime(base * Math.max(0, left / 60000), audio.ctx.currentTime, 0.2);
        }
      }
      updateTimerReadout();
    }, 1000);
  }

  function stopNight(natural) {
    audio.playing = false;
    audio.endAt = 0;
    if (audio.master && audio.ctx) {
      audio.master.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.15);
    }
    clearInterval(audio.tickTimer);
    clearInterval(audio.cricketTimer);
    clearInterval(audio.petalTimer);
    setPlayingUI(false);
    setStatus(natural ? "定时结束，声音已渐隐。晚安。" : "已暂停。随时可以继续。");
    updateTimerReadout();
  }

  function toggleNight() {
    if (audio.playing) stopNight(false);
    else startNight();
  }

  function buildChannelList(vols) {
    const list = $("channel-list");
    if (!list) return;
    list.innerHTML = "";
    CHANNELS.forEach(function (c) {
      const li = document.createElement("li");
      const val = vols[c.id];
      li.innerHTML =
        '<div class="mixer-row' + (c.id === "petal" ? " is-petal" : "") + '" data-glow="celadon">' +
        '<label class="mixer-row-name" for="ch-' + c.id + '">' + c.name + "</label>" +
        '<input type="range" class="slider" id="ch-' + c.id + '" min="0" max="100" value="' + val + '" ' +
        'aria-label="' + c.name + '音量" />' +
        '<span class="mixer-val mono" id="val-' + c.id + '">' + val + "</span>" +
        "</div>";
      list.appendChild(li);
      const input = li.querySelector("input");
      const valEl = li.querySelector("#val-" + c.id);
      const row = li.querySelector(".mixer-row");
      input.addEventListener("input", function () {
        valEl.textContent = input.value;
        if (audio.ctx) applyChannelGains();
        syncWindFromSliders();
        saveVolumes();
      });
      row.addEventListener("mouseenter", function () { row.classList.add("is-lit"); });
      row.addEventListener("mouseleave", function () { row.classList.remove("is-lit"); });
      input.addEventListener("focus", function () { row.classList.add("is-lit"); });
      input.addEventListener("blur", function () { row.classList.remove("is-lit"); });
    });
  }

  /* breath */
  const breath = { on: false, stepTimer: 0, countTimer: 0 };

  function setBreathPhase(phase, seconds) {
    const ring = $("breath-ring");
    const label = $("breath-phase");
    const countEl = $("breath-count");
    if (ring) {
      ring.classList.remove("is-inhale", "is-hold", "is-exhale");
      if (phase === "in") ring.classList.add("is-inhale");
      if (phase === "hold") ring.classList.add("is-hold");
      if (phase === "out") ring.classList.add("is-exhale");
    }
    const text = phase === "in" ? "吸气" : phase === "hold" ? "屏息" : phase === "out" ? "呼气" : "点「开始呼息」跟圈走";
    if (label) label.textContent = text;
    let left = seconds;
    if (countEl) countEl.textContent = left > 0 ? String(left) : "";
    clearInterval(breath.countTimer);
    if (seconds > 0 && breath.on) {
      breath.countTimer = setInterval(function () {
        left -= 1;
        if (left <= 0) {
          clearInterval(breath.countTimer);
          if (countEl) countEl.textContent = "";
        } else if (countEl) countEl.textContent = String(left);
      }, 1000);
    }
  }

  function breathCycle() {
    if (!breath.on) return;
    setBreathPhase("in", 4);
    clearTimeout(breath.stepTimer);
    breath.stepTimer = setTimeout(function () {
      if (!breath.on) return;
      setBreathPhase("hold", 7);
      breath.stepTimer = setTimeout(function () {
        if (!breath.on) return;
        setBreathPhase("out", 8);
        breath.stepTimer = setTimeout(breathCycle, 8000);
      }, 7000);
    }, 4000);
  }

  function toggleBreath() {
    breath.on = !breath.on;
    const btn = $("breath-btn");
    if (btn) {
      const span = btn.querySelector(".btn-label");
      const next = breath.on ? "结束呼息" : "开始呼息";
      if (span) span.textContent = next;
      else btn.textContent = next;
    }
    if (breath.on) breathCycle();
    else {
      clearTimeout(breath.stepTimer);
      clearInterval(breath.countTimer);
      setBreathPhase("idle", 0);
    }
  }

  /* ---------- cursor & field glow ---------- */
  function initCursorGlow() {
    const glow = $("cursor-glow");
    const layer = $("field-glow-layer");
    if (!glow || reduceMotion) return;

    let x = -999, y = -999, tx = -999, ty = -999, on = false, raf = 0;

    function loop() {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      glow.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!on) {
        x = tx; y = ty;
        glow.classList.add("is-on");
        on = true;
      }
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      glow.classList.remove("is-on");
      on = false;
    });

    raf = requestAnimationFrame(loop);

    if (!layer) return;
    const spots = new WeakMap();

    function ensureSpot(el) {
      let s = spots.get(el);
      if (!s) {
        s = document.createElement("div");
        s.className = "field-spot";
        layer.appendChild(s);
        spots.set(el, s);
      }
      return s;
    }

    function lightField(el) {
      const s = ensureSpot(el);
      const r = el.getBoundingClientRect();
      s.style.setProperty("--sx", r.left + r.width / 2 + "px");
      s.style.setProperty("--sy", r.top + r.height / 2 + "px");
      s.classList.add("is-on");
      el.classList.add("is-lit");
    }

    function dimField(el) {
      const s = spots.get(el);
      if (s) s.classList.remove("is-on");
      el.classList.remove("is-lit");
    }

    document.querySelectorAll(".glow-field, .channel-row, .master-block, .mix-panel .play-block").forEach(function (el) {
      el.addEventListener("mouseenter", function () { lightField(el); });
      el.addEventListener("mouseleave", function () { dimField(el); });
      el.addEventListener("focusin", function () { lightField(el); });
      el.addEventListener("focusout", function () { dimField(el); });
    });

    window.addEventListener("resize", function () {
      // reposition any lit spots
      document.querySelectorAll(".is-lit").forEach(function (el) {
        const s = spots.get(el);
        if (!s) return;
        const r = el.getBoundingClientRect();
        s.style.setProperty("--sx", r.left + r.width / 2 + "px");
        s.style.setProperty("--sy", r.top + r.height / 2 + "px");
      });
    });
  }

  function init() {
    initPlants();
    initPanels();
    initMoodFocus();
    initAtmosphere();
    initCursorGlow();

    const vols = loadVolumes();
    buildChannelList(vols);

    const master = $("master");
    if (master) {
      master.value = String(vols.master);
      master.setAttribute("aria-valuenow", String(vols.master));
      const mv = $("master-val");
      if (mv) mv.textContent = String(vols.master);
      master.addEventListener("input", function () {
        if (mv) mv.textContent = master.value;
        master.setAttribute("aria-valuenow", master.value);
        if (audio.ctx) applyMasterGain();
        syncWindFromSliders();
        saveVolumes();
      });
    }

    document.querySelectorAll("[data-timer]").forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.classList.contains("is-active") ? "true" : "false");
      chip.addEventListener("click", function () {
        document.querySelectorAll("[data-timer]").forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        audio.timerMin = Number(chip.getAttribute("data-timer")) || 0;
        if (audio.playing) {
          audio.endAt = audio.timerMin > 0 ? Date.now() + audio.timerMin * 60 * 1000 : 0;
        }
        updateTimerReadout();
      });
    });

    const t1 = $("toggle-btn");
    const t2 = $("panel-toggle");
    if (t1) t1.addEventListener("click", toggleNight);
    if (t2) t2.addEventListener("click", toggleNight);
    const bb = $("breath-btn");
    if (bb) bb.addEventListener("click", toggleBreath);

    [$("reset-btn"), $("reset-btn-2")].forEach(function (btn) {
      if (btn) btn.addEventListener("click", resetScape);
    });

    const save = $("save-scape");
    if (save) {
      save.addEventListener("click", function () {
        saveVolumes();
        setStatus("当前声景已保存到本机。");
        save.classList.add("is-saved");
        window.setTimeout(function () { save.classList.remove("is-saved"); }, 900);
      });
    }

    audio.timerMin = 45;
    syncWindFromSliders();
    updateTimerReadout();
    setPlayingUI(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
