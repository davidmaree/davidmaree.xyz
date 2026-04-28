document.addEventListener('DOMContentLoaded', () => {

    // ══════════════════════════════════════════════
    // 1. GLOBAL STAR CANVAS (runs throughout site)
    // ══════════════════════════════════════════════
    const starCanvas = document.getElementById('stars-canvas');
    const sc = starCanvas.getContext('2d');
    let stars = [];
    const NUM_STARS = 160;

    function buildStars() {
        starCanvas.width  = window.innerWidth;
        starCanvas.height = window.innerHeight;
        stars = Array.from({ length: NUM_STARS }, () => ({
            x: Math.random() * starCanvas.width,
            y: Math.random() * starCanvas.height,
            r: Math.random() * 1.4 + 0.2,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            alpha: Math.random() * 0.6 + 0.2
        }));
    }

    function drawStars() {
        sc.clearRect(0, 0, starCanvas.width, starCanvas.height);
        stars.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0) s.x = starCanvas.width;
            if (s.x > starCanvas.width)  s.x = 0;
            if (s.y < 0) s.y = starCanvas.height;
            if (s.y > starCanvas.height) s.y = 0;

            sc.beginPath();
            sc.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            sc.fillStyle = `rgba(255,255,255,${s.alpha})`;
            sc.fill();
        });
        requestAnimationFrame(drawStars); // always running
    }

    buildStars();
    drawStars();
    window.addEventListener('resize', buildStars);

    // ══════════════════════════════════════════════
    // 2. CUSTOM CURSOR (desktop only)
    // ══════════════════════════════════════════════
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    // Only activate on pointer:fine devices (mouse/trackpad)
    if (window.matchMedia('(pointer: fine)').matches) {
        let mx = -100, my = -100; // mouse position
        let rx = -100, ry = -100; // ring position (lerped)

        // Move dot instantly on every mouse move
        document.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
        });

        // Ring follows with smooth lerp via rAF
        (function lerpRing() {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
            requestAnimationFrame(lerpRing);
        })();

        // Hover effect on interactive elements
        const hoverTargets = 'a, button, .card, .game-tab, .nav-cta, input, textarea, [role="button"]';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
        });

        // Click pulse
        document.addEventListener('mousedown', () => {
            document.body.classList.add('cursor-click');
        });
        document.addEventListener('mouseup', () => {
            document.body.classList.remove('cursor-click');
        });

        // Hide ring when mouse leaves window
        document.addEventListener('mouseleave', () => {
            dot.style.opacity  = '0';
            ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            dot.style.opacity  = '1';
            ring.style.opacity = '1';
        });
    } else {
        // On touch devices, hide the cursor elements entirely
        dot.style.display  = 'none';
        ring.style.display = 'none';
    }

    // ══════════════════════════════════════════════
    // 2. ENTRY → TERMINAL → MAIN FLOW
    // ══════════════════════════════════════════════
    const splash   = document.getElementById('splash-screen');
    const terminal = document.getElementById('terminal-screen');
    const main     = document.getElementById('main-content');
    const termBody = document.getElementById('terminal-body');

    document.body.classList.add('no-scroll');

    const BOOT = [
        { t: "Last login: Mon Apr 28 22:05:56 on ttys002",              c: ""          },
        { t: "",                                                          c: ""          },
        { t: "david@MacBook-Pro ~ % whoami",                             c: "term-ok"   },
        { t: "david-maree",                                               c: ""          },
        { t: "",                                                          c: ""          },
        { t: "david@MacBook-Pro ~ % npm run launch --project=davidmaree.xyz", c: "term-ok" },
        { t: "",                                                          c: ""          },
        { t: "> davidmaree.xyz@3.0.0 launch",                            c: "term-warn" },
        { t: "> node server/boot.js --env=production",                   c: "term-warn" },
        { t: "",                                                          c: ""          },
        { t: "  [1/5] Loading portfolio modules...        ✓",            c: "term-ok"   },
        { t: "  [2/5] Compiling AI integration engine...  ✓",            c: "term-ok"   },
        { t: "  [3/5] Initialising e-commerce pipeline... ✓",            c: "term-ok"   },
        { t: "  [4/5] Resolving domain davidmaree.xyz...  ✓",            c: "term-path" },
        { t: "  [5/5] Deploying to production...          ✓",            c: "term-ok"   },
        { t: "",                                                          c: ""          },
        { t: "  All systems operational.",                                c: "term-ok"   },
        { t: "",                                                          c: ""          },
        { t: "  ╔══════════════════════════════════════╗",               c: ""          },
        { t: "  ║   Welcome to davidmaree.xyz  v3.0   ║",               c: "term-ok"   },
        { t: "  ╚══════════════════════════════════════╝",               c: ""          },
        { t: "",                                                          c: ""          },
        { t: "  Full-Stack Developer · AI Specialist · E-Commerce Expert", c: "term-path" },
    ];

    document.getElementById('enter-btn').addEventListener('click', () => {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.classList.remove('active');
            terminal.style.display = 'flex';
            runTerminal();
        }, 500);
    });

    function runTerminal() {
        termBody.innerHTML = '';
        let i = 0;

        function nextLine() {
            // remove old cursor
            const old = termBody.querySelector('.term-cursor');
            if (old) old.remove();

            if (i < BOOT.length) {
                const { t, c } = BOOT[i++];
                const div = document.createElement('div');
                if (c) div.classList.add(c);
                div.innerHTML = t + ' <span class="term-cursor"></span>';
                termBody.appendChild(div);
                termBody.scrollTop = termBody.scrollHeight;
                setTimeout(nextLine, t === '' ? 260 : Math.random() * 90 + 40);
            } else {
                // done — fade out terminal, show site
                setTimeout(() => {
                    terminal.style.transition = 'opacity .8s ease';
                    terminal.style.opacity    = '0';
                    setTimeout(() => {
                        terminal.style.display = 'none';
                        main.style.display = 'block';
                        document.body.classList.remove('no-scroll');
                        initSite();
                    }, 820);
                }, 1100);
            }
        }
        setTimeout(nextLine, 400);
    }

    // ══════════════════════════════════════════════
    // 3. POST-ENTRY SITE INIT
    // ══════════════════════════════════════════════
    function initSite() {
        initNav();
        initReviews();
        initScrollReveal();
        initCounters();
        initGames();
        initWA();
        initScheduleBtns();
    }

    // Navbar scroll style
    function initNav() {
        const nav = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        });
    }

    // Schedule Meeting buttons (placeholder)
    function initScheduleBtns() {
        ['schedule-hero-btn', 'schedule-contact-btn'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', e => {
                e.preventDefault();
                alert('Booking coming soon! For now, reach out via WhatsApp or Email.');
            });
        });
    }

    // ── Reviews ─────────────────────────────────
    function initReviews() {
        const reviews = [
            { name: "Thabo N.",    role: "E-Commerce Store Owner",    text: "David rebuilt our Shopify store from the ground up. Conversion rates went from 1.2% to 3.8% within the first month. Absolutely world-class work." },
            { name: "Melissa vdB.", role: "Online Boutique Founder",  text: "He took our brand from a Canva logo to a fully live store in two weeks. Sales started coming in on day one. Can't recommend enough." },
            { name: "Keanu P.",    role: "Mentorship Student",         text: "His 1-on-1 sessions are the real deal. He doesn't just teach theory — he shows you exactly how to build and sell. I launched my store in 3 weeks." },
            { name: "Zanele M.",   role: "Fashion Store Owner",        text: "The AI chatbot David integrated on our site handles 80% of customer queries automatically. It's like having a full-time support agent for free." },
            { name: "Ryan P.",     role: "Tech Startup Founder",       text: "We needed a complex web app built fast. David delivered clean, scalable code ahead of schedule. He's now our go-to developer for everything." },
        ];

        function buildTrack(id, list) {
            const track = document.getElementById(id);
            if (!track) return;
            [...list, ...list].forEach(r => {
                const c = document.createElement('div');
                c.className = 'review-card';
                c.innerHTML = `
                    <div class="review-stars">${'★'.repeat(5)}</div>
                    <p class="review-text">"${r.text}"</p>
                    <div class="review-author">${r.name}</div>
                    <div class="review-role">${r.role}</div>`;
                track.appendChild(c);
            });
        }

        buildTrack('reviews-track',   reviews);
        buildTrack('reviews-track-2', [...reviews].reverse());
    }

    // ── Scroll Reveal + Animated Title ──────────
    function initScrollReveal() {
        const els = document.querySelectorAll('.reveal, .reveal-up, .reveal-slide, .animated-title');
        const io  = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
        }, { threshold: 0.15 });
        els.forEach(el => io.observe(el));
    }

    // ── Counters ─────────────────────────────────
    function initCounters() {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                entry.target.querySelectorAll('.counter').forEach(c => {
                    const target = +c.dataset.target;
                    const step   = target / 80;
                    let val = 0;
                    const tick = () => {
                        val += step;
                        if (val < target) { c.textContent = Math.ceil(val); requestAnimationFrame(tick); }
                        else c.textContent = target;
                    };
                    tick();
                });
            });
        }, { threshold: 0.3 });
        const numbersEl = document.getElementById('numbers');
        if (numbersEl) io.observe(numbersEl);
    }

    // ── Floating WA ──────────────────────────────
    function initWA() {
        const wa = document.getElementById('floating-wa');
        window.addEventListener('scroll', () => {
            wa.classList.toggle('visible', window.scrollY > 600);
        });
    }

    // ══════════════════════════════════════════════
    // 4. PLAYGROUND — 3 GAMES
    // ══════════════════════════════════════════════
    function initGames() {
        const canvas  = document.getElementById('gameCanvas');
        const ctx     = canvas.getContext('2d');
        const overlay = document.getElementById('game-overlay');
        const startBtn = document.getElementById('start-game-btn');
        const scoreEl = document.getElementById('score-val');
        const tabs    = document.querySelectorAll('.game-tab');
        const titleEl = document.getElementById('game-title');
        const descEl  = document.getElementById('game-desc');

        let current = 'snake';
        let loopId  = null;
        let running = false;

        const W = canvas.width;
        const H = canvas.height;

        // ── SNAKE ────────────────────
        const G = 20;
        let sn, sf, sdx, sdy, ss;
        function snakeReset() {
            sn  = [{x:160,y:200},{x:140,y:200},{x:120,y:200}];
            sf  = randFood();
            sdx = G; sdy = 0; ss = 0;
            scoreEl.textContent = 0;
        }
        function randFood() {
            return { x: Math.floor(Math.random()*(W/G))*G, y: Math.floor(Math.random()*(H/G))*G };
        }
        function snakeTick() {
            const head = { x: sn[0].x + sdx, y: sn[0].y + sdy };
            if (head.x < 0) head.x = W-G; else if (head.x >= W) head.x = 0;
            if (head.y < 0) head.y = H-G; else if (head.y >= H) head.y = 0;
            if (sn.some(s => s.x === head.x && s.y === head.y)) return endGame();
            sn.unshift(head);
            if (head.x === sf.x && head.y === sf.y) {
                ss += 10; scoreEl.textContent = ss; sf = randFood();
            } else sn.pop();
            ctx.fillStyle = 'rgba(3,3,3,0.85)'; ctx.fillRect(0,0,W,H);
            ctx.shadowBlur = 12; ctx.shadowColor = '#ff0055';
            ctx.fillStyle = '#ff0055'; ctx.fillRect(sf.x, sf.y, G-2, G-2);
            ctx.shadowColor = '#00ffcc'; ctx.fillStyle = '#00ffcc';
            sn.forEach((s,i) => { ctx.shadowBlur = i===0?18:6; ctx.fillRect(s.x, s.y, G-2, G-2); });
            ctx.shadowBlur = 0;
        }

        // ── PONG ─────────────────────
        let py, ay, bx, by, bdx, bdy, ps;
        function pongReset() {
            py=H/2-40; ay=H/2-40;
            bx=W/2; by=H/2; bdx=4; bdy=3; ps=0;
            scoreEl.textContent=0;
        }
        const PW=10, PH=80, BS=10;
        function pongTick() {
            bx+=bdx; by+=bdy;
            if (by<=0 || by>=H-BS) bdy*=-1;
            // AI
            if (ay+PH/2 < by) ay = Math.min(ay+4, H-PH);
            else ay = Math.max(ay-4, 0);
            // Player paddle collision
            if (bx<=PW && by>=py && by<=py+PH) { bdx=Math.abs(bdx); ps++; scoreEl.textContent=ps; }
            // AI paddle collision
            if (bx>=W-PW-BS && by>=ay && by<=ay+PH) bdx=-Math.abs(bdx);
            if (bx<0) return endGame();
            if (bx>W) { bx=W-PW-BS; bdx=-Math.abs(bdx); }

            ctx.fillStyle='#030303'; ctx.fillRect(0,0,W,H);
            // centre line
            ctx.setLineDash([6,10]); ctx.strokeStyle='rgba(255,255,255,.1)';
            ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);

            ctx.shadowBlur=14; ctx.shadowColor='#fff'; ctx.fillStyle='#fff';
            ctx.fillRect(0, py, PW, PH);
            ctx.fillRect(W-PW, ay, PW, PH);
            ctx.fillRect(bx, by, BS, BS);
            ctx.shadowBlur=0;
        }

        // ── PARTICLES ────────────────
        let parts=[], mx=W/2, my=H/2;
        function particleReset() {
            parts = Array.from({length:120}, () => ({
                x:Math.random()*W, y:Math.random()*H,
                vx:(Math.random()-.5)*1.5, vy:(Math.random()-.5)*1.5,
                r: Math.random()*2.5+1,
                hue: Math.random()*80+170  // cyan/blue range
            }));
            scoreEl.textContent='Interact!';
        }
        function particleTick() {
            ctx.fillStyle='rgba(3,3,3,0.18)'; ctx.fillRect(0,0,W,H);
            parts.forEach(p => {
                const dx=mx-p.x, dy=my-p.y, d=Math.hypot(dx,dy);
                if(d<120) { p.vx+=dx*0.0012; p.vy+=dy*0.0012; }
                p.vx*=0.988; p.vy*=0.988;
                p.x+=p.vx; p.y+=p.vy;
                if(p.x<0||p.x>W) p.vx*=-1;
                if(p.y<0||p.y>H) p.vy*=-1;
                ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
                ctx.fillStyle=`hsl(${p.hue},100%,60%)`;
                ctx.shadowBlur=18; ctx.shadowColor=`hsl(${p.hue},100%,60%)`;
                ctx.fill();
            });
            ctx.shadowBlur=0;
        }

        canvas.addEventListener('mousemove', e => {
            if(current==='particles'&&running) {
                const r=canvas.getBoundingClientRect();
                mx=(e.clientX-r.left)*(W/r.width);
                my=(e.clientY-r.top)*(H/r.height);
            }
        });

        // ── shared controls ──────────
        function endGame() {
            running=false; cancelAnimationFrame(loopId); clearInterval(loopId);
            overlay.classList.remove('hidden');
            titleEl.textContent='Module Crashed'; startBtn.textContent='Reboot';
        }

        function startGame() {
            overlay.classList.add('hidden');
            running=true;
            if(current==='snake') {
                snakeReset();
                loopId=setInterval(snakeTick, 110);
            } else if(current==='pong') {
                pongReset();
                loopId=setInterval(pongTick, 1000/60);
            } else {
                particleReset();
                const frame=()=>{ if(running){particleTick();loopId=requestAnimationFrame(frame);}};
                frame();
            }
        }

        startBtn.addEventListener('click', startGame);

        tabs.forEach(tab => tab.addEventListener('click', e => {
            tabs.forEach(t=>t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            current=e.currentTarget.dataset.game;
            running=false; clearInterval(loopId); cancelAnimationFrame(loopId);
            ctx.fillStyle='#030303'; ctx.fillRect(0,0,W,H);
            overlay.classList.remove('hidden');
            const meta = {
                snake:     { title:'Neon Snake',      desc:'Arrow keys to move. Don\'t bite yourself!', btn:'Start Game'  },
                pong:      { title:'Neon Pong',        desc:'↑ ↓ arrow keys. Beat the AI!',              btn:'Start Game'  },
                particles: { title:'Particle Physics', desc:'Move mouse over canvas to attract particles', btn:'Start Demo' }
            };
            const m=meta[current];
            titleEl.textContent=m.title; descEl.textContent=m.desc; startBtn.textContent=m.btn;
            scoreEl.textContent='0';
        }));

        document.addEventListener('keydown', e => {
            if(!running) return;
            if([37,38,39,40].includes(e.keyCode)) e.preventDefault();
            if(current==='snake') {
                if(e.key==='ArrowLeft'  && sdx===0) { sdx=-G; sdy=0; }
                if(e.key==='ArrowRight' && sdx===0) { sdx= G; sdy=0; }
                if(e.key==='ArrowUp'    && sdy===0) { sdx=0; sdy=-G; }
                if(e.key==='ArrowDown'  && sdy===0) { sdx=0; sdy= G; }
            }
            if(current==='pong') {
                if(e.key==='ArrowUp')   py=Math.max(0,py-22);
                if(e.key==='ArrowDown') py=Math.min(H-PH,py+22);
            }
        });

        // Initial canvas clear
        ctx.fillStyle='#030303'; ctx.fillRect(0,0,W,H);
    }

});
