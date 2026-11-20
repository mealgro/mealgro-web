// The landing page's motion: the loader, the hero zoom into the feed, the
// kitchen story, the rider's ride across the city, the Gen Z cards, the video
// wall, the creators fan, the chef slider, ratings, cravings and the FAQ.
// The nav, its menu and the download section are components/brand's.
//
// Ported from the standalone design's inline script. `mountLanding` builds
// everything inside `root` and returns a function that undoes all of it
// (tweens, scroll triggers and pins, smooth scrolling, timers, listeners), so
// moving to another page leaves nothing running.
//
// Content still to replace with real numbers or clips is marked TODO.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const DISH = "/media/dish/";
const PEXELS = "/media/landing/pexels/";

/** What the page holds on to: the menu pauses smooth scrolling, unmount undoes it all. */
export type LandingMotion = { lockScroll: (locked: boolean) => void; destroy: () => void };

export function mountLanding(root: HTMLElement): LandingMotion {
	gsap.registerPlugin(ScrollTrigger);

	const html = document.documentElement;
	const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
	const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));
	const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const mobile = () => innerWidth <= 760;

	// Everything to undo on unmount.
	const undo: Array<() => void> = [];
	const timers = new Set<number>();
	const after = (fn: () => void, ms: number) => {
		const id = window.setTimeout(() => {
			timers.delete(id);
			fn();
		}, ms);
		timers.add(id);
		return id;
	};
	const cancel = (id: number | undefined) => {
		if (id === undefined) return;
		clearTimeout(id);
		timers.delete(id);
	};
	const on = (target: Window | Element, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions) => {
		target.addEventListener(type, fn as EventListener, opts);
		undo.push(() => target.removeEventListener(type, fn as EventListener, opts));
	};
	const tick = (fn: () => void) => {
		gsap.ticker.add(fn);
		undo.push(() => gsap.ticker.remove(fn));
	};

	let lenis: Lenis | null = null;
	let stopped = false;

	const ctx = gsap.context(() => {
		/* ---------- smooth scroll ---------- */
		if (!reduce) {
			lenis = new Lenis({ lerp: 0.09 });
			lenis.on("scroll", ScrollTrigger.update);
			const raf = (t: number) => lenis?.raf(t * 1000);
			gsap.ticker.add(raf);
			gsap.ticker.lagSmoothing(0);
			undo.push(() => {
				gsap.ticker.remove(raf);
				gsap.ticker.lagSmoothing(500, 33);
				lenis?.destroy();
				lenis = null;
			});
		}
		$$<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
			on(a, "click", (e) => {
				// A phone's download links point at its store by now.
				const href = a.getAttribute("href") ?? "";
				if (!href.startsWith("#")) return;
				const t = root.querySelector<HTMLElement>(href);
				if (!t) return;
				e.preventDefault();
				if (lenis) lenis.scrollTo(t, { duration: 1.6, force: true });
				else t.scrollIntoView({ behavior: "smooth" });
			}),
		);

		/* ---------- helpers ---------- */
		$$("[data-burst]").forEach((el) => {
			const n = +el.dataset.burst!;
			const pts: string[] = [];
			for (let i = 0; i < n * 2; i++) {
				const a = (Math.PI * i) / n;
				const r = i % 2 ? 40 : 50;
				pts.push(`${50 + r * Math.cos(a)}% ${50 + r * Math.sin(a)}%`);
			}
			el.style.clipPath = `polygon(${pts.join(",")})`;
		});
		const splitChars = (el: HTMLElement) => {
			const text = el.textContent ?? "";
			el.textContent = "";
			[...text].forEach((c) => {
				const s = document.createElement("span");
				s.className = "ch";
				s.textContent = c === " " ? " " : c;
				el.append(s);
			});
		};
		$$("[data-chars]").forEach(splitChars);

		// Headings outside the hero bounce in when they appear.
		$$(".sec [data-chars], .cta [data-chars], footer [data-chars]").forEach((line) => {
			gsap.from(line.querySelectorAll(".ch"), {
				yPercent: 115,
				rotate: 10,
				duration: 0.9,
				ease: "back.out(1.7)",
				stagger: 0.03,
				scrollTrigger: { trigger: line, start: "top 88%" },
			});
		});

		/* ---------- hero feed ---------- */
		const dishes = [
			{ v: "beef-suya", name: "Beef Suya", desc: "Grilled beef in yaji spice, with fresh tomato and onion.", k: "Mallam Sule Suya", area: "Wuse", t: "15–25 mins", r: "4.7", n: "400+", p: "₦3,500", likes: 954, saves: 211, reviews: 96 },
			{ v: "jollof-chicken", name: "Jollof Rice And Chicken", desc: "Smoky party jollof with peppered chicken and fried plantain.", k: "Mama Ronke's Kitchen", area: "Yaba", t: "25–35 mins", r: "4.6", n: "300+", p: "₦4,300", likes: 412, saves: 128, reviews: 128 },
			{ v: "shrimp-boil", name: "Shrimp Boil Tray", desc: "Prawns, sweetcorn and lemon in spicy garlic butter.", k: "Bayside Boil", area: "Lekki", t: "35–50 mins", r: "4.8", n: "200+", p: "₦14,500", likes: 688, saves: 96, reviews: 74 },
		];
		const feed = $("#feed");
		const segs = $("#segs");
		const info = $("#info");
		feed.innerHTML = dishes
			.map((d) => `<div class="slide"><video muted loop playsinline preload="auto" poster="${DISH}${d.v}.webp" src="${DISH}${d.v}.mp4"></video><div class="shade"></div></div>`)
			.join("");
		segs.innerHTML = dishes.map(() => '<div class="seg"><i></i></div>').join("");
		const vids = Array.from(feed.querySelectorAll("video"));
		const segEls = Array.from(segs.querySelectorAll<HTMLElement>(".seg"));
		let idx = -1;
		let timer: number | undefined;
		let first = true;
		let feedPaused = false;
		const show = (i: number) => {
			idx = (i + dishes.length) % dishes.length;
			const d = dishes[idx];
			feed.style.transform = `translateY(-${idx * 100}%)`;
			vids.forEach((v, j) => {
				if (j === idx) {
					v.currentTime = 0;
					v.play().catch(() => {});
				} else v.pause();
			});
			segEls.forEach((s, j) => {
				s.classList.remove("active");
				s.classList.toggle("done", j < idx);
				void s.offsetWidth;
				if (j === idx) s.classList.add("active");
			});
			const apply = () => {
				// The app's info block: dish, description, store and delivery time,
				// area, then the badge and rating chips.
				info.innerHTML =
					`<p class="ac-title">${d.name}</p><p class="ac-desc">${d.desc}</p>` +
					`<div class="ac-store"><img src="/media/app-icons/shop_icon.svg" alt=""><b>${d.k}</b><span class="ac-time"><img src="/media/app-icons/scooter_icon.svg" alt="">${d.t}</span></div>` +
					`<div class="ac-city"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>${d.area}</div>` +
					`<div class="ac-badges"><span class="ac-badge">🔥 POPULAR</span><span class="ac-rating"><img src="/media/app-icons/mealgro_icon.svg" alt="">${d.r}<svg viewBox="0 0 24 24" fill="#FEA000"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9Z"/></svg>(${d.n})</span></div>`;
				$("#price").textContent = d.p;
				$("#reviews").textContent = String(d.reviews);
				$("#saves").textContent = String(d.saves);
				info.classList.remove("swap");
			};
			if (first) {
				apply();
				first = false;
			} else {
				info.classList.add("swap");
				after(apply, 380);
			}
			cancel(timer);
			if (!feedPaused) timer = after(() => show(idx + 1), 5200);
		};
		show(0);
		const heroScreen = $("#heroScreen");
		on(heroScreen, "click", (ev) => {
			const e = ev as MouseEvent;
			show(idx + 1);
			const rect = heroScreen.getBoundingClientRect();
			["❤️", "😋", "🔥", "🧡"].forEach((em, k) => {
				const h = document.createElement("span");
				h.className = "heart";
				h.textContent = em;
				h.style.left = `${e.clientX - rect.left - 13 + (Math.random() * 50 - 25)}px`;
				h.style.top = `${e.clientY - rect.top - 13}px`;
				h.style.setProperty("--r", `${Math.random() * 50 - 25}deg`);
				h.style.animationDelay = `${k * 80}ms`;
				heroScreen.appendChild(h);
				after(() => h.remove(), 1800);
			});
		});

		/* ---------- loader → hero intro ---------- */
		const loader = $("#loader");
		const heroChars = $$(".hero-title .ch");
		const intro = () => {
			html.classList.remove("lp-loading");
			lenis?.start();
			gsap.from(heroChars, { yPercent: 120, rotate: 14, duration: 1, ease: "back.out(1.8)", stagger: 0.025 });
			gsap.from("#heroPhone", { y: 300, rotate: 10, duration: 1.4, ease: "expo.out", delay: 0.25 });
			gsap.from(".hero-ctas > *", { y: 40, opacity: 0, duration: 1, ease: "expo.out", delay: 0.6, stagger: 0.1 });
		};
		if (reduce) {
			loader.style.display = "none";
		} else {
			html.classList.add("lp-loading");
			lenis?.stop();
			gsap
				.timeline({ onComplete: () => { loader.style.display = "none"; } })
				.from("#loader .ch", { yPercent: 120, duration: 0.7, ease: "back.out(2)", stagger: 0.05 })
				.to("#loader .ch", { yPercent: -120, duration: 0.5, ease: "power3.in", stagger: 0.035 }, "+=.35")
				.to("#loader", { yPercent: -100, duration: 0.9, ease: "expo.inOut", onStart: intro }, "-=.15");
		}

		/* ---------- 1. hero zoom into the video ---------- */
		const heroPhone = $("#heroPhone");
		const zoom = $("#zoom");
		const zVid = zoom.querySelector("video")!;
		const g = () => {
			const pw = heroPhone.offsetWidth;
			const ph = heroPhone.querySelector<HTMLElement>(".phone")!.offsetHeight;
			const vw = innerWidth;
			const vh = innerHeight;
			const top = (vh - ph) / 2;
			const left = (vw - pw) / 2;
			return { dy: top - heroPhone.offsetTop, sx: left + 11, sy: top + 11, sw: pw - 22, sh: ph - 22 };
		};
		let synced = false;
		const heroTL = gsap.timeline({
			scrollTrigger: {
				trigger: "#hero",
				start: "top top",
				end: "+=230%",
				pin: true,
				scrub: 1,
				invalidateOnRefresh: true,
				onUpdate: (self) => {
					if (self.progress > 0.12 && !synced) {
						synced = true;
						feedPaused = true;
						cancel(timer);
						const d = dishes[idx];
						const v = vids[idx];
						zVid.src = v.currentSrc || v.src;
						zVid.currentTime = v.currentTime || 0;
						zVid.play().catch(() => {});
						$("#zTitle").textContent = `${d.name.split(" And ")[0]}.`;
						$("#zTag").textContent = `🔥 Popular in ${d.area}`;
						$("#zSub").textContent = `You watched it. Now it's cooking at ${d.k}. At your door in ${d.t}.`;
					} else if (self.progress < 0.08 && synced) {
						synced = false;
						feedPaused = false;
						zVid.pause();
						cancel(timer);
						timer = after(() => show(idx + 1), 3000);
					}
				},
			},
		});
		heroTL
			.to(".hero-title", { y: () => -innerHeight * 0.5, scale: 0.7, opacity: 0, ease: "power2.in", duration: 0.3 }, 0)
			.to(".hero-ctas", { y: 80, opacity: 0, duration: 0.15 }, 0)
			.to(".hero .sticker", { scale: 0, duration: 0.12, stagger: 0.03 }, 0)
			.to(heroPhone, { y: () => g().dy, duration: 0.3, ease: "power2.inOut" }, 0)
			.set(zoom, { visibility: "visible" }, 0.3)
			.fromTo(
				zoom,
				{ left: () => g().sx, top: () => g().sy, width: () => g().sw, height: () => g().sh, borderRadius: 40 },
				{ left: 0, top: 0, width: () => innerWidth, height: () => innerHeight, borderRadius: 0, duration: 0.35, ease: "power3.inOut", immediateRender: false },
				0.3,
			)
			.to(heroPhone, { opacity: 0, scale: 1.4, duration: 0.2 }, 0.32)
			.fromTo(".zoom-cap .tag", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.1 }, 0.66)
			.fromTo("#zTitle", { yPercent: 110 }, { yPercent: 0, duration: 0.14, ease: "back.out(1.6)" }, 0.7)
			.fromTo("#zSub", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.12 }, 0.78)
			.to({}, { duration: 0.1 }, 0.9);

		/* ---------- 2. kitchen: film → price → post → sell ---------- */
		const st = { rec: 0, cap: 0, price: 0, up: 0, likes: 0, saves: 0 };
		const capText = [..."Smoky party jollof 🔥 with peppered chicken & dodo. Fresh from the pot, Yaba!"];
		const descs = $$("#kDesc p");
		gsap.set("#scrEdit", { yPercent: 100 });
		const ktl = gsap.timeline({
			defaults: { ease: "none" },
			scrollTrigger: {
				trigger: ".kitchen",
				start: "top top",
				end: "+=420%",
				pin: true,
				scrub: 0.8,
				onUpdate: (self) => {
					const p = self.progress;
					$("#kStep").textContent = `0${p < 0.31 ? 1 : p < 0.55 ? 2 : p < 0.76 ? 3 : 4} / 04`;
				},
			},
		});
		const stepTo = (i: number, at: number) => {
			ktl
				.to("#roller", { yPercent: -25 * i, duration: 0.04, ease: "power3.inOut" }, at)
				.to(descs, { opacity: 0, duration: 0.02 }, at)
				.to(descs[i], { opacity: 1, duration: 0.03 }, at + 0.02);
		};
		ktl
			.to("#focus", { opacity: 1, scale: 1, duration: 0.04, ease: "back.out(2)" }, 0.03)
			.to("#focus", { opacity: 0, duration: 0.03 }, 0.11)
			.to("#shIn", { width: 24, height: 24, borderRadius: 6, duration: 0.03 }, 0.12)
			.to("#rec", { opacity: 1, duration: 0.02 }, 0.12)
			.to("#camVid", { scale: 1.45, duration: 0.17 }, 0.12)
			.to(st, { rec: 15, duration: 0.17, onUpdate: () => { $("#recT").textContent = `00:${String(Math.floor(st.rec)).padStart(2, "0")}`; } }, 0.12)
			.to("#shIn", { width: 50, height: 50, borderRadius: 25, duration: 0.03 }, 0.29)
			.to("#rec", { opacity: 0, duration: 0.02 }, 0.29)
			.to("#flash", { opacity: 0.9, duration: 0.01 }, 0.3)
			.to("#flash", { opacity: 0, duration: 0.02 }, 0.31);
		stepTo(1, 0.31);
		ktl
			.to("#scrEdit", { yPercent: 0, duration: 0.05, ease: "power3.out" }, 0.32)
			.to(st, { cap: capText.length, duration: 0.13, onUpdate: () => { $("#cap").textContent = capText.slice(0, Math.round(st.cap)).join(""); } }, 0.37)
			.to(st, { price: 4300, duration: 0.04, onUpdate: () => { $("#edPrice").textContent = `₦${Math.round(st.price).toLocaleString()}`; } }, 0.47)
			.fromTo("#chips span", { scale: 0 }, { scale: 1, duration: 0.03, stagger: 0.01, ease: "back.out(2)" }, 0.49);
		stepTo(2, 0.55);
		ktl
			.to("#edPost", { scale: 0.92, backgroundColor: "#A81B00", duration: 0.015 }, 0.57)
			.to("#edPost", { scale: 1, duration: 0.015 }, 0.585)
			.to("#scrUp", { opacity: 1, duration: 0.03 }, 0.59)
			.to(
				st,
				{
					up: 100,
					duration: 0.12,
					onUpdate: () => {
						$<SVGCircleElement>("#ringFg").style.strokeDashoffset = String(276.5 * (1 - st.up / 100));
						$("#upPct").textContent = st.up >= 100 ? "✓" : `${Math.round(st.up)}%`;
						$("#upLabel").textContent = st.up >= 100 ? "Live on Mealgro!" : "Posting to Mealgro…";
					},
				},
				0.61,
			);
		stepTo(3, 0.76);
		ktl
			.to("#scrLive", { opacity: 1, duration: 0.04 }, 0.77)
			.to("#scrUp", { opacity: 0, duration: 0.03 }, 0.79)
			.to(
				st,
				{
					likes: 412,
					saves: 128,
					duration: 0.18,
					onUpdate: () => {
						$("#liveLikes").textContent = String(Math.round(st.likes));
						$("#liveSaves").textContent = String(Math.round(st.saves));
					},
				},
				0.79,
			)
			.to(".toast", { opacity: 1, scale: 1, duration: 0.04, stagger: 0.05, ease: "back.out(2)" }, 0.82)
			.to({}, { duration: 0.04 }, 0.96);

		/* ---------- 3. ride: build the street ---------- */
		let seed = 7;
		const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
		const far = $("#far");
		const mid = $("#mid");
		const front = $("#front");
		far.style.width = "220vw";
		mid.style.width = "420vw";
		front.style.width = "640vw";
		let farHtml = "";
		let fx = 0;
		while (fx < 220) {
			const w = 5 + rnd() * 8;
			const h = 30 + rnd() * 34;
			farHtml += `<div style="left:${fx}vw;width:${w}vw;height:${h}vh"></div>`;
			fx += w + rnd() * 2;
		}
		farHtml += `<div style="left:60vw;width:.6vw;height:62vh"></div><div style="left:58.6vw;width:3.4vw;height:.5vh;bottom:86vh"></div>`;
		far.innerHTML = farHtml;
		const pal = ["#F4A259", "#E76F51", "#2A9D8F", "#F6C28B", "#8E7DBE", "#E9C46A", "#5B8E7D", "#F28482", "#4D96FF", "#FFB4A2"];
		const signs = ["SUYA SPOT", "BAYSIDE BOIL", "PHONE REPAIRS", "FRESH BREAD", "MAMA PUT", "BARBING SALON", "PHARMACY", "CHOPS & GRILLS", "POS HERE"];
		let si = 0;
		const bld = (x: number, w: number, h: number, c: string, extra = "", cls = "") =>
			`<div class="bld ${cls}" style="left:${x}vw;width:${w}vw;height:${h}vh;background:${c};--c:${c}"><div class="wins"></div><div class="lit"></div>${extra}</div>`;
		let street = bld(4, 28, 44, "#FFF1DC", `<div class="sign">MAMA RONKE'S KITCHEN</div><div class="awning"></div><div class="shop"></div>`, "store-big w3");
		let mx = 34;
		while (mx < 346) {
			const w = 8 + rnd() * 9;
			const h = 24 + rnd() * 30;
			const c = pal[Math.floor(rnd() * pal.length)];
			let extra = "";
			if (rnd() < 0.55) extra += `<div class="awning" style="--aw:${["#D62300", "#2A9D8F", "#16121B", "#7C5CFA"][Math.floor(rnd() * 4)]}"></div><div class="shop"></div>`;
			if (rnd() < 0.4) extra += `<div class="sign">${signs[si++ % signs.length]}</div>`;
			else if (rnd() < 0.5) extra += `<div class="tank"></div>`;
			street += bld(mx, w, h, c, extra, w > 13 ? "w3" : "");
			mx += w + 0.8 + rnd() * 2.5;
		}
		street += bld(352, 30, 50, "#2A9D8F", `<div class="sign" style="background:var(--yellow)">YOUR PLACE 🏠</div><div class="shop" style="left:36%;right:36%;height:24%;background:#FFE7A0"></div>`, "w3");
		mid.innerHTML = street;
		let fhtml = "";
		for (let x = 14; x < 640; x += 52) fhtml += `<div class="lamp" style="left:${x}vw"><b></b><div class="glow"></div></div>`;
		const palm = `<svg viewBox="0 0 120 300"><path d="M62 300 Q56 200 64 70" stroke="#7a5236" stroke-width="11" fill="none" stroke-linecap="round"/><g fill="#2f8f4e"><path d="M64 70 Q20 40 0 76 Q30 56 64 74Z"/><path d="M64 70 Q108 40 120 82 Q92 58 64 74Z"/><path d="M64 70 Q40 10 8 18 Q44 26 62 72Z"/><path d="M64 70 Q92 6 118 26 Q86 26 66 72Z"/><path d="M64 70 Q66 20 58 0 Q74 30 68 70Z"/></g></svg>`;
		for (let x = 40; x < 640; x += 78) fhtml += `<div class="palm" style="left:${x}vw">${palm}</div>`;
		const danfo = `<svg viewBox="0 0 260 120"><rect x="4" y="8" width="246" height="84" rx="16" fill="#FFC300"/><path d="M196 8 L236 8 Q250 8 250 24 L250 52 L196 52 Z" fill="#2a2433"/><g fill="#2a2433"><rect x="20" y="20" width="40" height="30" rx="4"/><rect x="70" y="20" width="40" height="30" rx="4"/><rect x="120" y="20" width="40" height="30" rx="4"/></g><rect x="4" y="60" width="246" height="8" fill="#16121B"/><rect x="4" y="74" width="246" height="4" fill="#16121B"/><circle cx="60" cy="96" r="18" fill="#16121B"/><circle cx="60" cy="96" r="7" fill="#9a8f96"/><circle cx="200" cy="96" r="18" fill="#16121B"/><circle cx="200" cy="96" r="7" fill="#9a8f96"/><rect x="238" y="64" width="12" height="10" rx="3" fill="#FFE7A0"/></svg>`;
		fhtml += `<div class="danfo" style="left:150vw">${danfo}</div><div class="danfo" style="left:400vw">${danfo}</div>`;
		front.innerHTML = fhtml;
		const glows = $$(".glow");
		const lits = $$(".lit");

		/* ---------- 3. ride: scroll drives the journey ---------- */
		const route = $<SVGPathElement>("#route");
		const routeDone = $<SVGPathElement>("#routeDone");
		const dot = $<SVGCircleElement>("#mapDot");
		const rLen = route.getTotalLength();
		routeDone.style.strokeDasharray = String(rLen);
		const says = $$(".ride-say .s");
		const spokes = $$<SVGGElement>(".spokes");
		const lean = $<SVGGElement>("#lean");
		const speed = $<SVGGElement>("#speed");
		const puffs = $<SVGGElement>("#puffs");
		const beam = $<SVGPathElement>("#beam");
		const rider = $("#rider");
		const statuses = ["Rider picked up your order", "On the way to you", "Almost there", "Delivered. Enjoy!"];
		let rideVel = 0;
		let lastStage = 0;
		let confettiDone = false;
		const confetti = $("#confetti");
		const popConfetti = () => {
			confetti.innerHTML = "";
			const cols = ["#FFD23F", "#D62300", "#2FB344", "#7C5CFA", "#FF9DCB", "#FFF8F1"];
			for (let i = 0; i < 60; i++) {
				const c = document.createElement("i");
				c.style.background = cols[i % cols.length];
				c.style.left = `${mobile() ? 70 : 66}vw`;
				c.style.bottom = "48vh";
				confetti.appendChild(c);
				gsap.fromTo(
					c,
					{ opacity: 1, x: 0, y: 0, rotate: 0 },
					{ x: (Math.random() - 0.5) * 700, y: -Math.random() * 400 + 380, rotate: Math.random() * 720, opacity: 0, duration: 1.8 + Math.random(), ease: "power2.out" },
				);
			}
		};
		const setRide = (p: number) => {
			const vw = innerWidth;
			far.style.transform = `translate3d(${-p * 0.8 * vw}px,0,0)`;
			mid.style.transform = `translate3d(${-p * 3.02 * vw}px,0,0)`;
			const fdist = p * 5.2 * vw;
			front.style.transform = `translate3d(${-fdist}px,0,0)`;
			$("#dash").style.backgroundPosition = `${-fdist}px 0`;
			const wheelR = (rider.offsetWidth * 36) / 320;
			const deg = (fdist / (2 * Math.PI * wheelR)) * 360;
			spokes.forEach((s) => s.setAttribute("transform", `rotate(${deg})`));
			const dusk = clamp((p - 0.2) / 0.65);
			$("#dusk").style.opacity = String(dusk);
			$("#stars").style.opacity = String(clamp((p - 0.55) / 0.3));
			$("#sun").style.transform = `translateY(${p * 55}vh) scale(${1 - p * 0.2})`;
			lits.forEach((l, i) => (l.style.opacity = String(clamp(dusk * 1.4 - (i % 3) * 0.25))));
			glows.forEach((gl) => (gl.style.opacity = String(clamp((p - 0.45) / 0.3))));
			beam.style.opacity = String(clamp((p - 0.5) / 0.3) * 0.9);
			// map + eta
			const pt = route.getPointAtLength(p * rLen);
			dot.setAttribute("cx", String(pt.x));
			dot.setAttribute("cy", String(pt.y));
			routeDone.style.strokeDashoffset = String(rLen * (1 - p));
			const mins = Math.max(0, Math.ceil(30 * (1 - p / 0.95)));
			$("#eta").textContent = p > 0.95 ? "Here!" : String(mins);
			$("#etaUnit").textContent = p > 0.95 ? "" : "min away";
			const stage = p < 0.25 ? 0 : p < 0.55 ? 1 : p < 0.86 ? 2 : 3;
			if (stage !== lastStage) {
				says.forEach((s, i) => s.classList.toggle("on", i === stage));
				lastStage = stage;
			}
			$("#hudStatus").textContent = p > 0.95 ? statuses[3] : statuses[Math.min(stage, 2)];
			const del = p > 0.95;
			$("#delivered").classList.toggle("on", del);
			if (del && !confettiDone) {
				confettiDone = true;
				popConfetti();
			} else if (!del) confettiDone = false;
		};
		ScrollTrigger.create({
			trigger: "#ride",
			start: "top top",
			end: "+=520%",
			pin: true,
			scrub: true,
			onUpdate: (self) => {
				setRide(self.progress);
				rideVel = clamp(Math.abs(self.getVelocity()) / 2500);
			},
		});
		setRide(0);

		/* ---------- continuous: rider lean/speed lines, marquee ---------- */
		const m1 = $("#m1");
		m1.innerHTML = ["Jollof", "Suya", "Shrimp boil", "Swallow & soup", "Small chops", "Ewa agoyin", "Seafood platter"]
			.map((w) => `<span>${w}</span>`)
			.join("")
			.repeat(2);
		let mxp = 0;
		let globalVel = 0;
		let smoothVel = 0;
		ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => (globalVel = self.getVelocity()) });
		tick(() => {
			smoothVel += (rideVel - smoothVel) * 0.12;
			rideVel *= 0.92;
			lean.style.transform = `rotate(${-smoothVel * 5}deg)`;
			speed.style.opacity = String(smoothVel);
			puffs.style.opacity = String(0.4 + smoothVel * 0.6);
			globalVel *= 0.94;
			mxp -= 1 + Math.min(Math.abs(globalVel) / 150, 18);
			const half = m1.scrollWidth / 2;
			if (half && -mxp > half) mxp += half;
			m1.style.transform = `translate3d(${mxp}px,0,0)`;
		});

		/* ---------- Gen Z: scroll → tap → bite ---------- */
		gsap.set([".gz-card.c2", ".gz-card.c3"], { yPercent: 175, rotate: 12 });
		gsap.set(["#gzToast", "#gzBurst"], { scale: 0 });
		const gzDesc = $$("#gzDesc p");
		const gtl = gsap.timeline({
			defaults: { ease: "none" },
			scrollTrigger: { trigger: "#genz", start: "top top", end: "+=320%", pin: true, scrub: 0.8 },
		});
		gtl.to("#gzBg", { xPercent: -30, duration: 1 }, 0).fromTo(".gz-card.c1", { rotate: -4, scale: 0.92 }, { rotate: 2, scale: 1, duration: 0.25, ease: "power2.out" }, 0);
		const gzStep = (i: number, at: number, inCard: string, outCard: string) => {
			gtl
				.to("#gzRoller", { yPercent: (-100 / 3) * i, duration: 0.05, ease: "power3.inOut" }, at)
				.to(gzDesc, { opacity: 0, duration: 0.03 }, at)
				.to(gzDesc[i], { opacity: 1, duration: 0.04 }, at + 0.03)
				.to(inCard, { yPercent: 0, rotate: i === 1 ? -3 : 3, duration: 0.12, ease: "power3.out" }, at)
				.to(outCard, { scale: 0.88, rotate: i === 1 ? -9 : 8, filter: "brightness(.7)", duration: 0.12 }, at);
		};
		gzStep(1, 0.3, ".gz-card.c2", ".gz-card.c1");
		gtl.to("#gzToast", { scale: 1, duration: 0.06, ease: "back.out(2.2)" }, 0.42);
		gzStep(2, 0.62, ".gz-card.c3", ".gz-card.c2");
		gtl.to("#gzBurst", { scale: 1, duration: 0.07, ease: "back.out(2.2)" }, 0.74).to({}, { duration: 0.1 }, 0.9);

		/* ---------- TikTok-for-food video wall ---------- */
		type TtItem = [string, string, string, string, boolean];
		const ttItems: TtItem[] = [
			["beef-suya", "Beef Suya", "Mallam Sule Suya", "954", true],
			["potato-salad", "Potato Salad", "On the feed", "318", true],
			["jollof-chicken", "Jollof Rice And Chicken", "Mama Ronke's Kitchen", "412", true],
			["ewa-agoyin", "Ewa Agoyin", "On the feed", "275", true],
			["shrimp-boil", "Shrimp Boil Tray", "Bayside Boil", "688", true],
			["seafood-platter", "Seafood Platter", "On the feed", "530", true],
			["seafood-spaghetti", "Seafood Spaghetti", "On the feed", "201", false],
		];
		const ttCard = ([v, name, k, , isVid]: TtItem, useVideo: boolean) =>
			`<div class="tt-card">${
				useVideo && isVid
					? `<video src="${DISH}${v}.mp4" poster="${DISH}${v}.webp" muted loop playsinline autoplay preload="metadata"></video>`
					: `<img src="${DISH}${v}.webp" alt="" loading="lazy">`
			}<div class="tt-heart"><b>♥</b></div><div class="tt-meta">${name}<small>${k}</small></div></div>`;
		const cols = mobile() ? 4 : 6;
		let wall = "";
		for (let c = 0; c < cols; c++) {
			const list = [0, 1, 2, 3].map((r) => ttItems[(c * 2 + r * 3) % ttItems.length]);
			const center = c === Math.floor(cols / 2) - 1 || c === Math.floor(cols / 2);
			const once = list.map((it, r) => ttCard(it, center && r < 2)).join("");
			wall += `<div class="tt-col">${once}${list.map((it) => ttCard(it, false)).join("")}</div>`;
		}
		$("#ttWall").innerHTML = wall;
		gsap.fromTo("#ttWrap", { y: 120 }, { y: -120, ease: "none", scrollTrigger: { trigger: "#tiktok", start: "top bottom", end: "bottom top", scrub: true } });
		gsap.from(".tt-title .glitch", { scale: 0.5, opacity: 0, duration: 1, ease: "back.out(1.6)", scrollTrigger: { trigger: "#tiktok", start: "top 60%" } });
		gsap.from(".tt-for .ch", { yPercent: 115, rotate: 10, duration: 0.9, ease: "back.out(1.7)", stagger: 0.03, scrollTrigger: { trigger: "#tiktok", start: "top 55%" } });
		gsap.from(".tt-kick, .tt-copy p, .tt-copy .btn", { y: 40, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: "#tiktok", start: "top 50%" } });

		/* ---------- Creators fan ---------- */
		// TODO: stock footage from Pexels showing the format, captioned "@you".
		// Swap in real creator clips (with their permission) when there are some.
		const CREATORS = [
			{ v: "8370536/8370536-sd_540_960_30fps", p: "8370536/administration-adult-airplane-binary-options-8370536", cap: "POV: the food looks exactly like the video 😭🔥", tag: "#MealgroMade #Lagos" },
			{ v: "6944152/6944152-sd_540_960_24fps", p: "6944152/pexels-photo-6944152", cap: "Ordering only from videos for 24 hours 📱🍗", tag: "#MealgroMade #FoodTok" },
			{ v: "8135595/8135595-sd_540_960_25fps", p: "8135595/pexels-photo-8135595", cap: "Rating suya spots near me, part 1 🍢⭐", tag: "#MealgroMade #Suya" },
			{ v: "6763107/6763107-sd_540_960_25fps", p: "6763107/pexels-photo-6763107", cap: "Unboxing my first Mealgro order 📦😋", tag: "#MealgroMade #Abuja" },
		];
		$("#crFan").innerHTML =
			CREATORS.map(
				(c, i) => `
    <div class="cr-card">
      <video src="${PEXELS}video-files/${c.v}.mp4" poster="${PEXELS}videos/${c.p}.jpeg" muted loop playsinline autoplay preload="metadata"></video>
      <div class="shade"></div>
      <div class="cr-top"><span class="cr-live"><i></i>REC</span><span>0:${15 + i * 7}</span></div>
      <div class="cr-rail"><span>❤️</span><span>💬</span><span>🔖</span><span>↗️</span></div>
      <div class="cr-cap"><b>@you</b>${c.cap}<span class="snd"><span>♪ original sound · ${c.tag} &nbsp;&nbsp;&nbsp; ♪ original sound · ${c.tag} &nbsp;&nbsp;&nbsp;</span></span></div>
      <span class="cr-float" style="left:18%;animation-delay:${i * 0.5}s">😍</span><span class="cr-float" style="left:55%;animation-delay:${i * 0.5 + 1.2}s">🔥</span>
    </div>`,
			).join("") +
			`<span class="cr-pop" style="left:6%;top:12%;rotate:-8deg">😋 Order delivered</span>
     <span class="cr-pop" style="right:6%;top:30%;rotate:6deg">🍗 Added to cart</span>
     <span class="cr-pop" style="left:10%;bottom:14%;rotate:5deg">📍 Lagos · Abuja</span>`;
		if (!mobile()) {
			const crCards = $$(".cr-card");
			const n = crCards.length;
			const spread = () => Math.min(innerWidth * 0.2, 300);
			gsap.set(crCards, { y: 260, rotate: 0, scale: 0.82 });
			gsap
				.timeline({ scrollTrigger: { trigger: "#creators", start: "top 85%", end: "center 55%", scrub: 1, invalidateOnRefresh: true } })
				.to(crCards, {
					x: (i: number) => (i - (n - 1) / 2) * spread(),
					y: (i: number) => Math.abs(i - (n - 1) / 2) * 40,
					rotate: (i: number) => (i - (n - 1) / 2) * 7,
					scale: 1,
					ease: "power2.out",
					stagger: 0.04,
				})
				.fromTo(".cr-pop", { scale: 0 }, { scale: 1, ease: "back.out(2)", stagger: 0.1 }, 0.4);
			crCards.forEach((c, i) => {
				on(c, "mouseenter", () => gsap.to(c, { y: "-=30", scale: 1.06, zIndex: 5, duration: 0.5, ease: "power3.out" }));
				on(c, "mouseleave", () => gsap.to(c, { y: Math.abs(i - (n - 1) / 2) * 40, scale: 1, zIndex: 1, duration: 0.5, ease: "power3.out" }));
			});
		}
		gsap.fromTo("#crBg", { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: { trigger: "#creators", start: "top bottom", end: "bottom top", scrub: true } });
		gsap.from(".cr-title .ch", { yPercent: 115, rotate: 10, duration: 0.9, ease: "back.out(1.7)", stagger: 0.025, scrollTrigger: { trigger: "#creators", start: "top 70%" } });

		/* ---------- Chef slider (vendor card) ---------- */
		// TODO: Pexels stock clips of chefs cooking. Swap in real Mealgro vendor
		// videos when there are some.
		const CHEFS = [
			{ v: "7423917/7423917-sd_540_960_30fps", p: "7423917/pexels-photo-7423917", t: "Pastry" },
			{ v: "8627105/8627105-sd_960_540_25fps", p: "8627105/pexels-photo-8627105", t: "Fine dining" },
			{ v: "17958067/17958067-sd_960_540_25fps", p: "17958067/africa-african-cuisine-african-culture-cameroon-17958067", t: "Grill" },
			{ v: "8627117/8627117-sd_960_540_25fps", p: "8627117/pexels-photo-8627117", t: "Chef’s table" },
			{ v: "7423919/7423919-sd_540_960_30fps", p: "7423919/pexels-photo-7423919", t: "Bakery" },
		];
		const csTrack = $("#csTrack");
		const csDots = $("#csDots");
		const csTag = $("#csTag");
		csTrack.innerHTML = CHEFS.map(
			(c, i) =>
				`<div class="cs-slide" role="group" aria-label="${i + 1} of ${CHEFS.length}"><video muted loop playsinline preload="${i ? "none" : "metadata"}" poster="${PEXELS}videos/${c.p}.jpeg" src="${PEXELS}video-files/${c.v}.mp4"></video></div>`,
		).join("");
		csDots.innerHTML = CHEFS.map((_c, i) => `<button aria-label="Show chef ${i + 1}"></button>`).join("");
		const csSlides = Array.from(csTrack.querySelectorAll<HTMLElement>(".cs-slide"));
		const csVids = Array.from(csTrack.querySelectorAll("video"));
		const csDotEls = Array.from(csDots.querySelectorAll("button"));
		let cs = 0;
		let csTimer: number | undefined;
		let csVisible = false;
		const csGo = (i: number) => {
			cs = (i + CHEFS.length) % CHEFS.length;
			csTrack.style.transform = `translateX(-${cs * 100}%)`;
			csSlides.forEach((s, j) => s.classList.toggle("on", j === cs));
			csDotEls.forEach((d, j) => d.classList.toggle("on", j === cs));
			csVids.forEach((v, j) => {
				if (j === cs && csVisible) {
					v.preload = "auto";
					v.play().catch(() => {});
				} else v.pause();
			});
			csTag.textContent = `${CHEFS[cs].t} · ${cs + 1}/${CHEFS.length}`;
			cancel(csTimer);
			csTimer = after(() => csGo(cs + 1), 4500);
		};
		on($("#csPrev"), "click", (e) => {
			e.stopPropagation();
			csGo(cs - 1);
		});
		on($("#csNext"), "click", (e) => {
			e.stopPropagation();
			csGo(cs + 1);
		});
		csDotEls.forEach((d, j) => on(d, "click", () => csGo(j)));
		const chefCard = $(".chef-card");
		let sx: number | null = null;
		on(chefCard, "pointerdown", (ev) => {
			const e = ev as PointerEvent;
			if (!(e.target as Element).closest("a,button")) sx = e.clientX;
		});
		on(window, "pointerup", (ev) => {
			if (sx === null) return;
			const dx = (ev as PointerEvent).clientX - sx;
			sx = null;
			if (Math.abs(dx) > 40) csGo(cs + (dx < 0 ? 1 : -1));
		});
		const csSeen = new IntersectionObserver(
			([e]) => {
				csVisible = e.isIntersecting;
				csGo(cs);
			},
			{ threshold: 0.3 },
		);
		csSeen.observe(chefCard);
		undo.push(() => csSeen.disconnect());

		/* ---------- Ratings ---------- */
		// TODO: the dish ratings mealgro.com showed before. Swap in live numbers
		// from the app.
		const RATED = [
			{ v: "shrimp-boil", name: "Shrimp Boil Tray", k: "Bayside Boil · Lekki", r: 4.8, n: "200+" },
			{ v: "beef-suya", name: "Beef Suya", k: "Mallam Sule Suya · Wuse", r: 4.7, n: "400+" },
			{ v: "jollof-chicken", name: "Jollof Rice And Chicken", k: "Mama Ronke's Kitchen · Yaba", r: 4.6, n: "300+" },
		];
		// TODO: app-wide stats, e.g. { value: 4.9, decimals: 1, suffix: "★",
		// label: "App Store" }. The row stays hidden while this is empty.
		const STATS: Array<{ value: number; decimals?: number; suffix?: string; label: string }> = [];
		const STAR = '<svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
		const STAR5 = STAR.repeat(5);
		$("#rateGrid").innerHTML = RATED.map(
			(d) => `
    <div class="rate-card">
      <img src="${DISH}${d.v}.webp" alt="${d.name}" loading="lazy">
      <div class="rate-score"><b data-to="${d.r}">0.0</b><div><span class="rstars">${STAR5}<i data-pct="${(d.r / 5) * 100}">${STAR5}</i></span><small>${d.n} ratings</small></div></div>
      <h3>${d.name}</h3><p>${d.k}</p>
    </div>`,
		).join("");
		$("#stats").innerHTML = STATS.map(
			(s) => `<div><b data-to="${s.value}" data-dec="${s.decimals || 0}" data-suf="${s.suffix || ""}">0</b><span>${s.label}</span></div>`,
		).join("");
		const countUp = (el: HTMLElement) => {
			const to = +el.dataset.to!;
			const dec = el.dataset.dec !== undefined ? +el.dataset.dec : 1;
			const suf = el.dataset.suf || "";
			const o = { v: 0 };
			gsap.to(o, { v: to, duration: 1.8, ease: "power3.out", onUpdate: () => { el.textContent = o.v.toFixed(dec) + suf; } });
		};
		gsap.from(".rate-card", {
			y: 140,
			opacity: 0,
			rotate: 6,
			duration: 1.1,
			ease: "expo.out",
			stagger: 0.12,
			clearProps: "transform,opacity",
			scrollTrigger: {
				trigger: "#rateGrid",
				start: "top 85%",
				onEnter: () => {
					$$("#rateGrid b[data-to], #stats b[data-to]").forEach(countUp);
					$$("#rateGrid .rstars i").forEach((s, i) => gsap.to(s, { width: `${s.dataset.pct}%`, duration: 1.6, delay: 0.3 + i * 0.12, ease: "power2.out" }));
				},
			},
		});

		/* ---------- 4. stacking craving cards ---------- */
		const cards = $$(".scard");
		cards.forEach((c, i) => {
			gsap.fromTo(c.querySelector(".food"), { rotate: -25, scale: 0.85 }, { rotate: 20, scale: 1.05, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
			if (i < cards.length - 1)
				gsap.to(c, { scale: 0.92, filter: "brightness(.75)", ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true } });
		});

		/* ---------- 5. join parallax ---------- */
		$$("[data-par]").forEach((el) =>
			gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }),
		);
		gsap.from(".join", { y: 120, rotate: 3, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".join-grid", start: "top 85%" } });

		/* ---------- 6. FAQ (rendered by the page; this opens and closes it) ---------- */
		const faq = $("#faq");
		on(faq, "click", (e) => {
			const b = (e.target as Element).closest("button");
			if (!b) return;
			const qa = b.parentElement!;
			const open = !qa.classList.contains("open");
			faq.querySelectorAll(".qa").forEach((x) => {
				x.classList.remove("open");
				x.querySelector("button")!.setAttribute("aria-expanded", "false");
			});
			if (open) {
				qa.classList.add("open");
				b.setAttribute("aria-expanded", "true");
			}
		});
		gsap.from(".qa", { y: 60, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: "#faq", start: "top 85%" } });
	}, root);

	// Pins measure the page: again once fonts and images have settled.
	const refresh = () => {
		ScrollTrigger.sort();
		ScrollTrigger.refresh();
	};
	refresh();
	document.fonts?.ready.then(() => stopped || refresh());
	if (document.readyState !== "complete") on(window, "load", refresh);
	after(refresh, 1200);

	return {
		// The nav (components/brand/BrandNav) owns the menu; it says when it opens.
		lockScroll: (locked) => {
			if (locked) lenis?.stop();
			else lenis?.start();
		},
		destroy: () => {
			stopped = true;
			timers.forEach((id) => clearTimeout(id));
			timers.clear();
			undo.splice(0).reverse().forEach((fn) => fn());
			ctx.revert();
			html.classList.remove("lp-loading");
		},
	};
}
