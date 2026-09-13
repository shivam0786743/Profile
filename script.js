/**
 * SHIVAM PORTFOLIO - CORE INTERACTION & ENGINE SCRIPT
 * Features:
 * - Particle/Constellation Physics Engine
 * - Web Audio API UI Sound FX Engine
 * - Interactive Terminal Emulator
 * - 3D Tilt Matrix Engine
 * - Dynamic Voice AI & Code Sandbox Simulators
 * - Confetti Canvas Animation
 * - Smooth Scroll & Counter Triggers
 */

// ==========================================
// 1. SOUND FX ENGINE (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.enabled = false;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  toggle() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = !this.enabled;
    const icon = document.getElementById('sound-icon');
    if (icon) {
      icon.className = this.enabled ? 'fa-solid fa-volume-high text-xs text-cyan-400' : 'fa-solid fa-volume-xmark text-xs';
    }
    showToast(this.enabled ? 'Audio FX Enabled 🔊' : 'Audio FX Muted 🔇');
    if (this.enabled) this.playTone(600, 'sine', 0.1);
  }

  playTone(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.08) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn(e);
    }
  }

  playClick() { this.playTone(850, 'triangle', 0.05, 0.05); }
  playSuccess() {
    if (!this.enabled || !this.ctx) return;
    this.playTone(523.25, 'sine', 0.1, 0.08);
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.08), 80);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.1), 160);
  }
}

const sfx = new SoundFX();
document.getElementById('sound-toggle')?.addEventListener('click', () => sfx.toggle());

// Play subtle clicks on button interactions
document.addEventListener('click', (e) => {
  if (e.target.closest('button, a, .chip-cmd, .skill-filter-btn')) {
    sfx.playClick();
  }
});

// ==========================================
// 2. INTERACTIVE PARTICLE CONSTELLATION CANVAS
// ==========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null, radius: 140 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.baseX = this.x;
    this.baseY = this.y;
    this.vx = (Math.random() - 0.5) * 0.7;
    this.vy = (Math.random() - 0.5) * 0.7;
    this.color = Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : (Math.random() > 0.5 ? 'rgba(139, 92, 246, ' : 'rgba(16, 185, 129, ');
    this.alpha = Math.random() * 0.5 + 0.2;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    // Mouse interaction
    if (mouse.x != null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * force * 3;
        this.y -= Math.sin(angle) * force * 3;
      }
    }
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 110) {
        let opacity = 1 - distance / 110;
        ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.15})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  connectParticles();
  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

resizeCanvas();
animateParticles();

// ==========================================
// 3. CUSTOM CURSOR FOLLOWER
// ==========================================
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  }
});

function renderCursor() {
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  if (cursorRing) {
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }
  requestAnimationFrame(renderCursor);
}
renderCursor();

// ==========================================
// 4. DYNAMIC TYPEWRITER ROLE ROTATOR
// ==========================================
const roles = [
  "Backend Developer (Node.js & TypeScript)",
  "Cloud & DevOps Engineer (AWS & CI/CD Pipelines)",
  "MERN Stack Specialist",
  "Voice AI Pipeline Architect (Gemini + Deepgram)",
  "REST API Designer (150+ Endpoints Shipped)",
  "Distributed Caching & Redis Specialist"
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterEl = document.getElementById('typewriter-text');

function typeRole() {
  const currentRole = roles[roleIndex];
  if (isDeleting) {
    typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
  }

  let delay = isDeleting ? 30 : 65;

  if (!isDeleting && charIndex === currentRole.length) {
    delay = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 400;
  }

  setTimeout(typeRole, delay);
}
if (typewriterEl) typeRole();

// ==========================================
// 5. 3D TILT EFFECT ON HERO CARD
// ==========================================
const tiltCard = document.getElementById('hero-tilt-card');
if (tiltCard) {
  tiltCard.addEventListener('mousemove', (e) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 14;
    const rotateY = (x / (rect.width / 2)) * 14;
    tiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  tiltCard.addEventListener('mouseleave', () => {
    tiltCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

// ==========================================
// 6. LIVE IST CLOCK (India Time)
// ==========================================
function updateISTClock() {
  const clockEl = document.getElementById('live-ist-clock');
  if (!clockEl) return;
  const now = new Date();
  const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  clockEl.textContent = now.toLocaleTimeString('en-US', options) + ' IST';
}
setInterval(updateISTClock, 1000);
updateISTClock();

// ==========================================
// 7. INTERACTIVE CLI TERMINAL (shivam-cli)
// ==========================================
const terminalBody = document.getElementById('terminal-body');
const terminalInput = document.getElementById('terminal-input');
const terminalSubmit = document.getElementById('terminal-submit-btn');

const terminalCommands = {
  help: () => `
<span class="text-cyan-400 font-bold">AVAILABLE COMMANDS:</span>
  <span class="text-emerald-300">whoami</span>       : Display developer profile summary
  <span class="text-emerald-300">skills</span>       : List core backend, database, AWS & AI capabilities
  <span class="text-emerald-300">fluent-ai</span>    : Deep dive into the Voice-to-Voice AI pipeline
  <span class="text-emerald-300">projects</span>     : Show featured production systems
  <span class="text-emerald-300">experience</span>   : View professional roles & internships
  <span class="text-emerald-300">achievements</span> : View TCS CodeVita & HackerRank certifications
  <span class="text-emerald-300">contact</span>      : Print email, phone, and social handles
  <span class="text-amber-300">sudo hire</span>    : Instant recruiter dispatch & hire protocol
  <span class="text-emerald-300">matrix</span>       : Trigger matrix digital rain animation
  <span class="text-emerald-300">clear</span>        : Clear the terminal screen
`,

  whoami: () => `
<span class="text-cyan-300 font-bold">NAME:</span> Shivam
<span class="text-cyan-300 font-bold">ROLE:</span> Backend Developer | MERN Stack & Cloud DevOps Engineer
<span class="text-cyan-300 font-bold">FOCUS:</span> High-Throughput REST APIs, Voice AI Pipelines, AWS & CI/CD Automation
<span class="text-cyan-300 font-bold">CURRENT:</span> Backend Developer @ Awwaltech (Noida)
<span class="text-cyan-300 font-bold">BIO:</span> Experienced in building resilient Node.js/TypeScript architectures, Redis caching layers, Docker containerization, AWS deployments, and real-time AI systems.
`,

  skills: () => `
<span class="text-violet-400 font-bold">[BACKEND & RUNTIMES]</span> Node.js, Express.js, TypeScript, JavaScript (ES6+)
<span class="text-emerald-400 font-bold">[DATABASES & CACHING]</span> MongoDB, Redis (Pub/Sub & Blacklisting), SQL, Mongoose
<span class="text-amber-400 font-bold">[CLOUD & DEVOPS]</span> AWS (EC2, S3, IAM, CloudWatch), CI/CD (GitHub Actions), Docker
<span class="text-cyan-400 font-bold">[VOICE AI & LLMs]</span> Gemini Flash API, Deepgram STT, Murf AI TTS, LangChain
<span class="text-rose-400 font-bold">[TOOLS & TESTING]</span> Postman, Git, JWT, Socket.io, RESTful APIs
<span class="text-blue-400 font-bold">[CORE CS]</span> Data Structures & Algorithms (C++), OOPS, System Design, Caching
`,

  'fluent-ai': () => `
<span class="text-cyan-300 font-bold">PROJECT: FLUENT-AI SPOKEN LANGUAGE LEARNING PLATFORM</span>
• <span class="text-white">Pipeline:</span> Deepgram (Speech-to-Text) ➔ Gemini Flash (LLM Reasoning) ➔ Murf AI (Text-to-Speech)
• <span class="text-white">Cloud & CI/CD:</span> Automated GitHub Actions CI/CD testing pipeline + Docker Compose deployment
• <span class="text-white">Auth:</span> JWT authentication with Redis token blacklisting for immediate revocation
• <span class="text-white">Analytics:</span> Fluency, grammar, vocabulary tracking with daily streak engine
• <span class="text-white">Reliability:</span> Redis rate limiting + 99.8% test coverage + AWS ready
`,

  projects: () => `
1. <span class="text-cyan-300 font-bold">Fluent-AI Platform</span> - Real-time voice-to-voice AI pipeline (Deepgram + Gemini + Murf AI)
2. <span class="text-emerald-300 font-bold">SMART HOTEL System</span> - Scalable NoSQL hotel engine with 50% reduced DB latency
3. <span class="text-violet-300 font-bold">Distributed Rate Limiter</span> - Sliding window Redis rate limiter for microservices
`,

  experience: () => `
• <span class="text-cyan-300 font-bold">Awwaltech (Noida)</span> [Nov 2025 – Present] : Backend Developer
  - Designed & shipped 150+ RESTful API endpoints with 99% reliability.
  - Reduced latency by 25% and improved backend stability by 30%.
• <span class="text-violet-300 font-bold">Webotech Solution</span> [Jul 2024 – Dec 2024] : MERN Stack Developer Intern
  - Optimized MongoDB schemas (40% query boost) & implemented JWT/RBAC across 100+ routes.
`,

  achievements: () => `
🏆 <span class="text-amber-300 font-bold">TCS CodeVita Season 12:</span> Global Rank #8,570 among 100,000+ competitors.
🎖️ <span class="text-emerald-300 font-bold">HackerRank Certified Software Engineer:</span> Role assessment passed (ID: 75F0291E956B).
🎓 <span class="text-cyan-300 font-bold">B.Tech CSE:</span> Kurukshetra University (JMIT) [2021-2025] - CGPA: 7.1
`,

  contact: () => `
<span class="text-cyan-300">Email:</span> <a href="mailto:shivamdhiman336@gmail.com" class="underline text-white">shivamdhiman336@gmail.com</a>
<span class="text-cyan-300">Phone:</span> +91-9992911619
<span class="text-cyan-300">LinkedIn:</span> <a href="https://linkedin.com" target="_blank" class="underline text-blue-400">linkedin.com/in/shivam</a>
<span class="text-cyan-300">GitHub:</span> <a href="https://github.com" target="_blank" class="underline text-slate-200">github.com/shivam</a>
<span class="text-cyan-300">LeetCode:</span> <a href="https://leetcode.com" target="_blank" class="underline text-amber-400">leetcode.com/shivam</a>
`,

  hire: () => triggerHireProtocol(),
  'sudo hire': () => triggerHireProtocol(),

  matrix: () => {
    triggerConfetti();
    return `<span class="text-emerald-400 font-bold animate-pulse">⚡ INITIATING MATRIX PROTOCOL... Wake up, Neo. Shivam is ready to build exceptional software.</span>`;
  }
};

function triggerHireProtocol() {
  triggerConfetti();
  sfx.playSuccess();
  return `
<span class="text-emerald-400 font-bold">🎉 HIRE PROTOCOL ACTIVATED!</span>
<span class="text-white">Target Candidate:</span> Shivam (Backend & MERN Engineer)
<span class="text-cyan-300">Status:</span> Immediate Availability / High Impact Ready
<span class="text-amber-300">Direct Line:</span> +91-9992911619 | <a href="mailto:shivamdhiman336@gmail.com" class="underline text-cyan-300">shivamdhiman336@gmail.com</a>
<span class="text-slate-400">Redirecting to contact section in 2 seconds...</span>
  `;
}

function executeCommand(input) {
  const cleanCmd = input.trim().toLowerCase();
  if (!cleanCmd) return;

  // Append user command
  const cmdLine = document.createElement('div');
  cmdLine.innerHTML = `<span class="text-emerald-400 font-bold">shivam@dev:~$</span> <span class="text-white">${escapeHTML(input)}</span>`;
  terminalBody.appendChild(cmdLine);

  if (cleanCmd === 'clear') {
    terminalBody.innerHTML = '';
    return;
  }

  // Handle Response
  const respLine = document.createElement('div');
  respLine.className = 'text-slate-300 leading-relaxed';

  if (terminalCommands[cleanCmd]) {
    const output = terminalCommands[cleanCmd]();
    respLine.innerHTML = output;
    if (cleanCmd === 'hire' || cleanCmd === 'sudo hire') {
      setTimeout(() => {
        const contactSec = document.getElementById('contact');
        if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
      }, 2000);
    }
  } else {
    respLine.innerHTML = `<span class="text-rose-400">Command not recognized: "${escapeHTML(input)}". Type <span class="text-cyan-300 font-bold">help</span> to view valid commands.</span>`;
  }

  terminalBody.appendChild(respLine);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function clearTerminal() {
  terminalBody.innerHTML = '<div class="text-slate-500 font-mono text-xs">Terminal cleared. Type "help" for options.</div>';
}

function runCommandFromChip(cmd) {
  if (terminalInput) {
    terminalInput.value = cmd;
    executeCommand(cmd);
    terminalInput.value = '';
    terminalInput.focus();
  }
}

if (terminalInput) {
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = terminalInput.value;
      terminalInput.value = '';
      executeCommand(val);
    }
  });
}

if (terminalSubmit) {
  terminalSubmit.addEventListener('click', () => {
    if (terminalInput) {
      const val = terminalInput.value;
      terminalInput.value = '';
      executeCommand(val);
    }
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// ==========================================
// 8. BENTO GRID SIMULATORS
// ==========================================

// Pipeline Simulator
const simBtn = document.getElementById('sim-pipeline-btn');
const pipeStt = document.getElementById('pipe-stt');
const pipeLlm = document.getElementById('pipe-llm');
const pipeTts = document.getElementById('pipe-tts');
const pipeStatus = document.getElementById('pipeline-status-text');

if (simBtn) {
  simBtn.addEventListener('click', () => {
    sfx.playClick();
    simBtn.disabled = true;
    pipeStatus.textContent = "🎙️ Step 1: Deepgram streaming audio & transcribing Speech to Text...";
    pipeStt.classList.add('border-cyan-400', 'bg-cyan-500/20', 'scale-105');

    setTimeout(() => {
      pipeStt.classList.remove('border-cyan-400', 'bg-cyan-500/20', 'scale-105');
      pipeLlm.classList.add('border-violet-400', 'bg-violet-500/20', 'scale-105');
      pipeStatus.textContent = "🧠 Step 2: Gemini Flash reasoning, grammar checks & fluent response generation...";
      sfx.playTone(620, 'sine', 0.1);
    }, 1200);

    setTimeout(() => {
      pipeLlm.classList.remove('border-violet-400', 'bg-violet-500/20', 'scale-105');
      pipeTts.classList.add('border-emerald-400', 'bg-emerald-500/20', 'scale-105');
      pipeStatus.textContent = "🔊 Step 3: Murf AI generating ultra-natural human voice audio stream...";
      sfx.playTone(780, 'sine', 0.15);
    }, 2400);

    setTimeout(() => {
      pipeTts.classList.remove('border-emerald-400', 'bg-emerald-500/20', 'scale-105');
      pipeStatus.textContent = "✓ Pipeline roundtrip complete: 280ms total latency! Ready for next voice turn.";
      simBtn.disabled = false;
      sfx.playSuccess();
    }, 3600);
  });
}

// Code Simulator
const runCodeBtn = document.getElementById('run-code-btn');
const codeLog = document.getElementById('code-output-log');
let requestCount = 0;

if (runCodeBtn && codeLog) {
  runCodeBtn.addEventListener('click', () => {
    sfx.playClick();
    requestCount++;
    if (requestCount <= 3) {
      codeLog.className = "mt-3 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20";
      codeLog.textContent = `[HTTP 200 OK] Client IP ip:127.0.0.1 (Request #${requestCount}/100) - Token Validated.`;
    } else {
      codeLog.className = "mt-3 text-[11px] font-mono text-cyan-300 bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30";
      codeLog.textContent = `[HTTP 200 OK] Redis TTL active: 56s remaining. Request count: ${requestCount}`;
    }
  });
}

// Vibe Tone Player
const vibeBtn = document.getElementById('vibe-audio-btn');
const vibeIcon = document.getElementById('vibe-play-icon');
const vibeText = document.getElementById('vibe-btn-text');
let vibePlaying = false;
let vibeOsc = null;
let vibeGain = null;

if (vibeBtn) {
  vibeBtn.addEventListener('click', () => {
    sfx.init();
    if (!vibePlaying) {
      try {
        const ctx = sfx.ctx;
        vibeOsc = ctx.createOscillator();
        vibeGain = ctx.createGain();
        vibeOsc.type = 'sine';
        vibeOsc.frequency.setValueAtTime(432, ctx.currentTime); // 432 Hz healing focus tone
        vibeGain.gain.setValueAtTime(0.04, ctx.currentTime);
        vibeOsc.connect(vibeGain);
        vibeGain.connect(ctx.destination);
        vibeOsc.start();
        vibePlaying = true;
        vibeIcon.className = "fa-solid fa-pause";
        vibeText.textContent = "Pause 432Hz Tone";
        showToast("Playing 432Hz Focus Ambient Tone 🎧");
      } catch (e) {
        console.warn(e);
      }
    } else {
      if (vibeOsc) {
        vibeOsc.stop();
        vibeOsc.disconnect();
      }
      vibePlaying = false;
      vibeIcon.className = "fa-solid fa-play";
      vibeText.textContent = "Play Focus Tone";
      showToast("Tone Paused");
    }
  });
}

// ==========================================
// 9. SKILLS MATRIX FILTERING
// ==========================================
const filterButtons = document.querySelectorAll('.skill-filter-btn');
const skillCards = document.querySelectorAll('.skill-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');

    skillCards.forEach(card => {
      const cat = card.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.3s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ==========================================
// 10. ANIMATED STATS COUNTER ON SCROLL
// ==========================================
let counted = false;
const statsSection = document.querySelector('.stat-card');

function runCounters() {
  const counters = document.querySelectorAll('.counter-val');
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-target'));
    const decimals = parseInt(counter.getAttribute('data-decimals') || 0);
    const duration = 1500;
    const startTime = performance.now();

    function updateCount(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * easeProgress;
      counter.textContent = currentVal.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        counter.textContent = target.toFixed(decimals);
      }
    }
    requestAnimationFrame(updateCount);
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !counted) {
      counted = true;
      runCounters();
    }
  });
}, { threshold: 0.3 });

if (statsSection) observer.observe(statsSection);

// ==========================================
// 11. PROJECT DETAIL MODALS
// ==========================================
const projectModal = document.getElementById('project-modal');
const modalContent = document.getElementById('modal-content');

const projectDetails = {
  'fluent-ai': `
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <span class="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">Architecture Case Study</span>
      </div>
      <h3 class="text-2xl sm:text-3xl font-bold font-outfit text-white">Fluent-AI: Voice-to-Voice AI Language Learning Platform</h3>
      
      <p class="text-slate-300 text-sm leading-relaxed">
        Fluent-AI is a high-concurrency conversational engine designed to simulate real-time human language tutors. The system handles full duplex streaming audio, lexical translation, grammar diagnostics, and spaced repetition analytics.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="p-3 bg-white/5 rounded-xl border border-white/10">
          <span class="text-xs font-mono text-cyan-400 block mb-1">STT Module</span>
          <p class="text-xs text-slate-300">Deepgram Nova-2 WebSockets for sub-150ms speech transcriptions.</p>
        </div>
        <div class="p-3 bg-white/5 rounded-xl border border-white/10">
          <span class="text-xs font-mono text-violet-400 block mb-1">LLM Core</span>
          <p class="text-xs text-slate-300">Gemini 1.5 Flash fine-tuned via prompt engineering for CEFR language levels.</p>
        </div>
        <div class="p-3 bg-white/5 rounded-xl border border-white/10">
          <span class="text-xs font-mono text-emerald-400 block mb-1">TTS Synthesizer</span>
          <p class="text-xs text-slate-300">Murf AI high-fidelity neural voice stream generation.</p>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-slate-300 space-y-2">
        <span class="text-cyan-300 font-bold block">Backend &amp; Security Highlights:</span>
        <div>• <strong>Session Blacklisting:</strong> Redis in-memory storage used to invalidate JWT tokens upon logout or anomaly detection.</div>
        <div>• <strong>Difficulty Tiering:</strong> Clean modular architecture supporting Easy, Medium, and Hard conversational topics with 99.8% unit/integration test coverage.</div>
        <div>• <strong>Containerization:</strong> Multi-stage Dockerfile + Docker Compose orchestrating Node.js app, MongoDB, and Redis instances.</div>
      </div>
    </div>
  `,
  'smart-hotel': `
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <span class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">System Architecture</span>
      </div>
      <h3 class="text-2xl sm:text-3xl font-bold font-outfit text-white">SMART HOTEL: Enterprise Operations Engine</h3>
      
      <p class="text-slate-300 text-sm leading-relaxed">
        Engineered for high-frequency room bookings, multi-room guest ledgers, and inventory allocation. Focused heavily on NoSQL optimization and transactional integrity.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="p-4 bg-white/5 rounded-xl border border-white/10">
          <span class="text-sm font-bold text-emerald-400 block mb-1">50% Latency Reduction</span>
          <p class="text-xs text-slate-300">Rebuilt MongoDB compound indexes and converted nested lookups into lean cursor streams, cutting response times in half.</p>
        </div>
        <div class="p-4 bg-white/5 rounded-xl border border-white/10">
          <span class="text-sm font-bold text-cyan-400 block mb-1">99.9% Uptime Guarantee</span>
          <p class="text-xs text-slate-300">Resilient error handling and atomic ledger updates ensuring zero double-booking conflicts during peak hours.</p>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-slate-300 space-y-2">
        <span class="text-emerald-300 font-bold block">API Endpoints &amp; Postman Validation:</span>
        <div>• Auth, RBAC, Guest Check-In/Check-Out, Dynamic Billing, Invoice Generation.</div>
        <div>• Comprehensive Postman collection covering 100+ positive and edge-case payload scenarios.</div>
      </div>
    </div>
  `
};

function openProjectModal(projectId) {
  if (projectDetails[projectId]) {
    modalContent.innerHTML = projectDetails[projectId];
    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    sfx.playClick();
  }
}

function closeProjectModal() {
  projectModal.classList.remove('active');
  document.body.style.overflow = 'auto';
  sfx.playClick();
}

projectModal.addEventListener('click', (e) => {
  if (e.target === projectModal) closeProjectModal();
});

// ==========================================
// 12. TOAST NOTIFICATION HELPER
// ==========================================
function showToast(message) {
  const toastContainer = document.getElementById('toast');
  if (!toastContainer) return;

  const toastItem = document.createElement('div');
  toastItem.className = 'toast-item';
  toastItem.innerHTML = `<i class="fa-solid fa-circle-check text-cyan-400"></i> <span>${message}</span>`;
  toastContainer.appendChild(toastItem);

  setTimeout(() => {
    toastItem.style.opacity = '0';
    toastItem.style.transform = 'translateY(10px)';
    toastItem.style.transition = 'all 0.3s ease';
    setTimeout(() => toastItem.remove(), 300);
  }, 2500);
}

function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  navigator.clipboard.writeText(text).then(() => {
    sfx.playSuccess();
    showToast(successMsg);
  }).catch(() => {
    showToast('Failed to copy');
  });
}

// ==========================================
// 13. CELEBRATION CONFETTI CANNON
// ==========================================
const confettiCanvas = document.getElementById('confetti-canvas');
const confCtx = confettiCanvas.getContext('2d');
let confettiPieces = [];

function triggerConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiPieces = [];
  const colors = ['#00f0ff', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ffffff'];

  for (let i = 0; i < 150; i++) {
    confettiPieces.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 + 100,
      w: Math.random() * 8 + 4,
      h: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 20,
      gravity: 0.35,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  function renderConfetti() {
    confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.007;

      if (p.opacity > 0) {
        alive = true;
        confCtx.save();
        confCtx.translate(p.x, p.y);
        confCtx.rotate((p.rotation * Math.PI) / 180);
        confCtx.fillStyle = p.color;
        confCtx.globalAlpha = Math.max(p.opacity, 0);
        confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confCtx.restore();
      }
    });

    if (alive) {
      requestAnimationFrame(renderConfetti);
    } else {
      confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  renderConfetti();
}

// ==========================================
// 14. INTERACTIVE FORM SUBMISSION
// ==========================================
function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('form-name').value;
  const email = document.getElementById('form-email').value;
  const submitBtn = document.getElementById('form-submit-btn');

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Encrypting &amp; Transmitting...</span>`;

  setTimeout(() => {
    sfx.playSuccess();
    triggerConfetti();
    showToast(`Thank you, ${name}! Message received. Shivam will contact you shortly.`);
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> <span>Message Transmitted Successfully!</span>`;
    document.getElementById('contact-form').reset();
    setTimeout(() => {
      submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>Transmit Message</span>`;
    }, 4000);
  }, 1000);
}

// Mobile Menu Toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
    sfx.playClick();
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('flex');
    });
  });
}
