<script setup lang="ts">
// The landing page (mealgro.com). Ported from the standalone design: the
// markup is here, the look in ./landing.css (all of it under .lp), and the
// motion in ./landing.ts, which starts on mount and undoes itself on unmount
// so the next page starts clean. Dish media is the site's own (/media/dish);
// the stock clips and photos are in /media/landing (Pexels and Unsplash
// licences: free to use, no attribution required).
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import "./landing.css";
import logoImage from "../../assets/logo.svg";
import { CUSTOMER_APP } from "../../lib/site/links";
import { FAQS } from "./faqs";

const root = ref<HTMLElement | null>(null);

// The visitor's device, for the download buttons. Unknown until mounted (the
// page is prerendered), so the server HTML shows every store.
type Platform = "ios" | "android" | "mac" | "other";
const platform = ref<Platform>("other");
function detectPlatform(): Platform {
	const ua = navigator.userAgent;
	if (/android/i.test(ua)) return "android";
	// iPadOS asks for the desktop site and says "Macintosh"; touch gives it away.
	if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
	if (/Macintosh|Mac OS X/.test(ua)) return "mac";
	return "other";
}

type Store = { key: "ios" | "android"; href: string };
const allStores = (): Store[] => [
	...(CUSTOMER_APP.ios ? [{ key: "ios" as const, href: CUSTOMER_APP.ios }] : []),
	...(CUSTOMER_APP.android ? [{ key: "android" as const, href: CUSTOMER_APP.android }] : []),
];
/** On a phone, its own store when there is one; on a computer, every store, the Mac's first on a Mac. */
const stores = computed<Store[]>(() => {
	const list = allStores();
	const p = platform.value;
	if (p === "ios" || p === "android") {
		const own = list.filter((s) => s.key === p);
		if (own.length) return own;
	}
	const first = p === "ios" || p === "mac" ? "ios" : "android";
	return [...list].sort((a, b) => Number(b.key === first) - Number(a.key === first));
});
/** A phone's "Download now" goes straight to its store; elsewhere it scrolls to the buttons. */
const directStore = computed(() => {
	const p = platform.value;
	if (p !== "ios" && p !== "android") return null;
	return allStores().find((s) => s.key === p)?.href ?? null;
});
const faqs = FAQS;
const year = new Date().getFullYear();
let stop: (() => void) | null = null;

onMounted(async () => {
	platform.value = detectPlatform();
	const { mountLanding } = await import("./landing");
	if (root.value) stop = mountLanding(root.value);
});
onBeforeUnmount(() => {
	stop?.();
	stop = null;
});
</script>

<template>
  <div ref="root" class="lp">
    <div id="loader" aria-hidden="true"><div class="word chunk" data-chars>mealgro</div></div>

    <nav id="nav" class="nav">
      <a class="logo" href="/" aria-label="Mealgro home"><img :src="logoImage" alt="Mealgro"></a>
      <ul>
        <li><a href="/">Order food</a></li>
        <li><a href="/vendors">Vendors</a></li>
        <li><a href="/riders">Riders</a></li>
        <li><a href="/affiliate">Affiliates</a></li>
        <li><a href="/about">About</a></li>
      </ul>
      <a class="btn" :href="directStore ?? '#get-app'" :target="directStore ? '_blank' : undefined" :rel="directStore ? 'noopener' : undefined">Get the app</a>
      <button id="menuBtn" class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><i></i><i></i></button>
    </nav>

    <div id="mnav" class="mnav" aria-hidden="true">
      <ul>
        <li><a href="/">Order food <small>01</small></a></li>
        <li><a href="/vendors">Vendors <small>02</small></a></li>
        <li><a href="/riders">Riders <small>03</small></a></li>
        <li><a href="/affiliate">Affiliates <small>04</small></a></li>
        <li><a href="/about">About <small>05</small></a></li>
      </ul>
      <div class="burst spin" data-burst="16">HUNGRY?</div>
      <div class="mnav-foot">
        <a class="btn yellow" :href="directStore ?? '#get-app'" :target="directStore ? '_blank' : undefined" :rel="directStore ? 'noopener' : undefined" data-close>Get the app →</a>
        <div class="mnav-social"><a href="https://www.instagram.com/trymealgro">Instagram</a><a href="https://x.com/mealgro">X</a><a href="https://www.facebook.com/share/14VPaxDJVbY/">Facebook</a><a href="https://www.linkedin.com/company/mealgro/">LinkedIn</a></div>
      </div>
    </div>

    <!-- ================= 1. HERO: phone zooms into the food ================= -->
    <section id="hero" class="hero">
      <h1 class="hero-title chunk" aria-label="Order what you just watched.">
        <span class="lw" data-chars>Order what</span>
        <span class="lw" data-chars>you just</span>
        <span class="lw" data-chars>watched.</span>
      </h1>

      <div class="hero-ctas">
        <div>
          <p>Short videos from kitchens near you. Swipe, tap, and it's on its way.</p>
          <a class="btn yellow" :href="directStore ?? '#get-app'" :target="directStore ? '_blank' : undefined" :rel="directStore ? 'noopener' : undefined">Download now</a>
        </div>
        <div class="scroll-cue"><i></i>Scroll to watch it happen</div>
      </div>

      <div id="heroPhone" class="hero-phone">
        <div class="sticker burst spin st-burst" data-burst="16">TAP TO<br>ORDER</div>
        <div class="sticker st-pill">Swipe for the next kitchen 👆</div>
        <div class="phone">
          <div id="heroScreen" class="screen">
            <div class="island"></div>
            <div id="feed" class="feed"></div>
            <div class="chrome">
              <div class="status"><span>9:41</span><span class="ic"><svg width="16" height="10" viewBox="0 0 17 11" fill="#fff"><rect y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" width="3" height="11" rx="1" /></svg><span class="bat"></span></span></div>
              <div id="segs" class="segs"></div>
              <div class="topbar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                <span class="chip hot">🔥 POPULAR</span><span class="chip near">NEAR YOU</span>
                <span class="r"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg></span>
              </div>
              <div class="rail">
                <div><svg viewBox="0 0 24 24" fill="#fff"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.1 4.4 2.5.8-1.4 2.3-2.5 4.4-2.5 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21Z" /></svg><span id="likes">954</span></div>
                <div><svg viewBox="0 0 24 24" fill="#fff"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z" /></svg><span id="saves">211</span></div>
                <div><svg viewBox="0 0 24 24" fill="#fff"><path d="M3 11.5 21 3l-6.5 18-3.2-7.3L3 11.5Z" /></svg><span>Share</span></div>
              </div>
              <div id="info" class="info"></div>
              <div class="cartbar"><span>＋ Add to cart</span><span id="price" class="price">₦3,500</span></div>
              <div class="tabs">
                <div class="on"><svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>Feed</div>
                <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /></svg>Community</div>
                <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>Explore</div>
                <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4" /></svg>Activity</div>
                <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>Profile</div>
              </div>
              <div class="home-ind"></div>
            </div>
          </div>
        </div>
      </div>

      <div id="zoom" class="zoom">
        <video muted loop playsinline></video>
        <div class="shade2"></div>
        <div class="zoom-cap">
          <span id="zTag" class="tag">🔥 Popular in Wuse</span>
          <h2 class="chunk"><span id="zTitle" class="lw">Beef Suya.</span></h2>
          <p id="zSub">You watched it. Now it's cooking. At your door in 15–25 mins.</p>
        </div>
      </div>
    </section>

    <!-- ================= 2. KITCHEN: vendor films, prices, posts ================= -->
    <section id="vendors-story" class="kitchen">
      <div class="k-bg"><video src="/media/dish/jollof-chicken.mp4" poster="/media/dish/jollof-chicken.webp" muted loop playsinline autoplay></video></div>
      <div class="k-grid">
        <div class="k-copy">
          <div class="k-kicker">Meanwhile, in a kitchen in Yaba <span id="kStep">01 / 04</span></div>
          <div class="roller chunk">
            <div id="roller" class="roller-in">
              <div>Film it<span class="dot">.</span></div>
              <div>Price it<span class="dot">.</span></div>
              <div>Post it<span class="dot">.</span></div>
              <div>Sell it<span class="dot">.</span></div>
            </div>
          </div>
          <div id="kDesc" class="k-desc">
            <p>Mama Ronke points her phone at the pot. Fifteen seconds of smoky party jollof is the whole menu photo.</p>
            <p>She adds a caption and a price. No designer, no photographer, no printed menu.</p>
            <p>One tap and it's live on Mealgro, in the feed of everyone nearby.</p>
            <p>People watch, get hungry and order straight from the video. Mealgro sends the rider.</p>
          </div>
        </div>

        <div class="k-cam">
          <div class="toast t1"><i>🛎️</i><span>New order<small>Jollof Rice And Chicken ×2</small></span></div>
          <div class="toast t2"><i>🛎️</i><span>New order<small>Jollof Rice And Chicken ×1</small></span></div>
          <div class="toast t3"><i>🔖</i><span>Saved by a customer<small>Jollof Rice And Chicken</small></span></div>
          <div class="handheld">
            <div class="phone">
              <div class="screen">
                <div class="island"></div>
                <div class="status"><span>9:41</span><span class="ic"><span class="bat"></span></span></div>
                <!-- camera -->
                <div class="scr scr-cam">
                  <video id="camVid" class="cover" src="/media/dish/jollof-chicken.mp4" poster="/media/dish/jollof-chicken.webp" muted loop playsinline autoplay></video>
                  <div class="grid3"></div>
                  <div id="focus" class="focus"></div>
                  <div class="cam-top"><span>⚡</span><span id="rec" class="rec"><i></i><span id="recT">00:00</span></span><span>⚙︎</span></div>
                  <div class="cam-bottom"><div class="zoom1x">1×</div><div class="modes"><span>PHOTO</span><b>VIDEO</b><span>SLO-MO</span></div><div class="shutter"><div id="shIn" class="sh-in"></div></div></div>
                  <div id="flash" class="flash"></div>
                </div>
                <!-- editor -->
                <div id="scrEdit" class="scr scr-edit">
                  <div class="ed-head"><span>Cancel</span><b>New post</b><span style="color:var(--yellow)">Draft</span></div>
                  <div class="ed-thumb"><video class="cover" src="/media/dish/jollof-chicken.mp4" poster="/media/dish/jollof-chicken.webp" muted loop playsinline autoplay></video><span>0:15</span></div>
                  <div class="ed-field"><small>CAPTION</small><span id="cap"></span><i class="caret"></i></div>
                  <div class="ed-row"><div class="ed-field ed-price"><small>PRICE</small><b id="edPrice">₦0</b></div><div class="ed-field"><small>READY IN</small>25–35 mins</div></div>
                  <div id="chips" class="ed-chips"><span>Rice</span><span>Chicken</span><span>Party jollof</span><span>Yaba</span></div>
                  <div id="edPost" class="ed-post">Post to Mealgro</div>
                </div>
                <!-- uploading -->
                <div id="scrUp" class="scr scr-up">
                  <div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="8" /><circle id="ringFg" cx="50" cy="50" r="44" fill="none" stroke="#FFD23F" stroke-width="8" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="276.5" /></svg><b id="upPct">0%</b></div>
                  <div id="upLabel" class="up-label">Posting to Mealgro…</div>
                </div>
                <!-- live in feed -->
                <div id="scrLive" class="scr scr-live">
                  <video class="cover" src="/media/dish/jollof-chicken.mp4" poster="/media/dish/jollof-chicken.webp" muted loop playsinline autoplay></video>
                  <div class="shade"></div>
                  <div class="chrome">
                    <div class="topbar" style="top:48px"><span class="chip hot">🔥 NEW</span><span class="chip near">NEAR YOU</span></div>
                    <div class="rail"><div><svg viewBox="0 0 24 24" fill="#FF5A36"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.1 4.4 2.5.8-1.4 2.3-2.5 4.4-2.5 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21Z" /></svg><span id="liveLikes">0</span></div><div><svg viewBox="0 0 24 24" fill="#fff"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z" /></svg><span id="liveSaves">0</span></div></div>
                    <div class="info" style="bottom:58px"><h3>Jollof Rice And Chicken</h3><p>Smoky party jollof with peppered chicken and fried plantain.</p><div class="vend"><span class="av">M</span>Mama Ronke's Kitchen · Yaba</div></div>
                    <div class="cartbar" style="bottom:12px"><span>＋ Add to cart</span><span class="price">₦4,300</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 3. RIDE: rider crosses the city as you scroll ================= -->
    <section id="ride" class="ride">
      <div class="sky-day"></div>
      <div id="dusk" class="sky-dusk"><div id="stars" class="stars"></div></div>
      <div id="sun" class="sun"></div>
      <div id="far" class="layer far"></div>
      <div id="mid" class="layer mid"></div>
      <div class="sidewalk"></div>
      <div class="road"><div id="dash" class="dash"></div></div>
      <div id="front" class="layer front"></div>

      <div class="ride-kick">Then a Mealgro rider takes it from here ↓</div>
      <div class="ride-say" aria-live="polite">
        <div class="s chunk on">Hot off the pot.</div>
        <div class="s chunk">Weaving through Yaba.</div>
        <div class="s chunk">Two streets away.</div>
        <div class="s chunk">Knock knock.</div>
      </div>

      <div id="rider" class="rider">
        <svg viewBox="0 0 320 230" aria-label="Mealgro rider on a motorbike">
          <defs><linearGradient id="beamG" x1="0" x2="1"><stop offset="0" stop-color="#FFE7A0" stop-opacity=".8" /><stop offset="1" stop-color="#FFE7A0" stop-opacity="0" /></linearGradient></defs>
          <g id="speed" class="speed" stroke="#16121B" stroke-opacity=".35" stroke-width="4" stroke-linecap="round">
            <line x1="-90" y1="70" x2="-10" y2="70" /><line x1="-140" y1="100" x2="-30" y2="100" /><line x1="-70" y1="135" x2="10" y2="135" /><line x1="-120" y1="160" x2="-40" y2="160" />
          </g>
          <g id="puffs" fill="#9a8f96">
            <circle class="puff" cx="82" cy="172" r="8" /><circle class="puff" cx="82" cy="172" r="7" style="animation-delay:.33s" /><circle class="puff" cx="82" cy="172" r="9" style="animation-delay:.66s" />
          </g>
          <path id="beam" class="beam" d="M240 112 L420 80 L420 190 Z" fill="url(#beamG)" />
          <g id="lean" style="transform-origin:160px 200px">
            <g class="rider-body">
              <!-- delivery box -->
              <rect x="26" y="40" width="96" height="84" rx="12" fill="#D62300" />
              <rect x="26" y="40" width="96" height="18" rx="9" fill="#A81B00" />
              <text x="74" y="98" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="25" fill="#FFF8F1">mealgro</text>
              <rect x="30" y="122" width="90" height="7" rx="3" fill="#16121B" />
              <!-- bike -->
              <path d="M42 170 A36 36 0 0 1 110 158" stroke="#16121B" stroke-width="8" fill="none" stroke-linecap="round" />
              <rect x="84" y="164" width="60" height="10" rx="5" fill="#9a8f96" />
              <rect x="126" y="146" width="60" height="32" rx="9" fill="#3a3440" />
              <path d="M98 128 L196 116 Q214 113 222 128 L232 150 Q200 160 160 160 L112 160 Q96 150 98 128 Z" fill="#16121B" />
              <path d="M118 138 L204 128" stroke="#FFD23F" stroke-width="5" stroke-linecap="round" />
              <path d="M94 124 Q98 110 116 110 L172 105 Q182 105 180 116 L102 130 Z" fill="#2b2630" />
              <line x1="222" y1="104" x2="250" y2="182" stroke="#9a8f96" stroke-width="9" stroke-linecap="round" />
              <path d="M218 166 A36 36 0 0 1 284 162" stroke="#16121B" stroke-width="8" fill="none" stroke-linecap="round" />
              <circle cx="236" cy="118" r="10" fill="#FFD23F" /><circle cx="238" cy="117" r="4" fill="#FFF8F1" />
              <line x1="206" y1="96" x2="230" y2="100" stroke="#16121B" stroke-width="7" stroke-linecap="round" />
              <!-- rider -->
              <path d="M140 104 L188 127 L172 160" stroke="#2a2640" stroke-width="17" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              <ellipse cx="177" cy="163" rx="14" ry="7" fill="#16121B" />
              <line x1="143" y1="102" x2="171" y2="60" stroke="#D62300" stroke-width="36" stroke-linecap="round" />
              <line x1="140" y1="84" x2="164" y2="98" stroke="#FFD23F" stroke-width="5" stroke-linecap="round" />
              <path d="M175 62 L200 82 L213 96" stroke="#A81B00" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="214" cy="97" r="7.5" fill="#16121B" />
              <circle cx="178" cy="34" r="22" fill="#FFD23F" />
              <path d="M183 24 Q203 25 201 41 L184 44 Z" fill="#16121B" opacity=".88" />
              <path d="M158 30 Q174 10 196 19" stroke="#D62300" stroke-width="4" fill="none" stroke-linecap="round" />
            </g>
          </g>
          <g transform="translate(78 182)"><circle r="36" fill="none" stroke="#16121B" stroke-width="12" /><circle r="27" fill="none" stroke="#3a3440" stroke-width="2" /><g class="spokes" stroke="#9a8f96" stroke-width="3" stroke-linecap="round"><line y2="-26" /><line y2="-26" transform="rotate(60)" /><line y2="-26" transform="rotate(120)" /><line y2="-26" transform="rotate(180)" /><line y2="-26" transform="rotate(240)" /><line y2="-26" transform="rotate(300)" /></g><circle r="7" fill="#cfc8c0" /></g>
          <g transform="translate(250 182)"><circle r="36" fill="none" stroke="#16121B" stroke-width="12" /><circle r="27" fill="none" stroke="#3a3440" stroke-width="2" /><g class="spokes" stroke="#9a8f96" stroke-width="3" stroke-linecap="round"><line y2="-26" /><line y2="-26" transform="rotate(60)" /><line y2="-26" transform="rotate(120)" /><line y2="-26" transform="rotate(180)" /><line y2="-26" transform="rotate(240)" /><line y2="-26" transform="rotate(300)" /></g><circle r="7" fill="#cfc8c0" /></g>
        </svg>
      </div>

      <div id="hud" class="hud">
        <div class="hud-top"><img :src="logoImage" alt=""><span>Live tracking</span></div>
        <div><div class="hud-eta"><b id="eta">30</b><span id="etaUnit">min away</span></div><div id="hudStatus" class="hud-status">Rider picked up your order</div></div>
        <svg class="hud-map" viewBox="0 0 260 120">
          <g stroke="#E6DBCF" stroke-width="8" fill="none"><path d="M0 60H260M60 0V120M150 0V120M210 0V120M0 20H260M0 100H260" /></g>
          <path id="route" d="M24 100 C 70 100, 62 44, 120 48 S 196 96, 234 26" stroke="#D9CBBE" stroke-width="6" fill="none" stroke-linecap="round" />
          <path id="routeDone" d="M24 100 C 70 100, 62 44, 120 48 S 196 96, 234 26" stroke="#D62300" stroke-width="6" fill="none" stroke-linecap="round" />
          <circle cx="24" cy="100" r="6" fill="#16121B" />
          <path d="M234 8a10 10 0 0 1 10 10c0 8-10 16-10 16s-10-8-10-16a10 10 0 0 1 10-10Z" fill="#16121B" /><circle cx="234" cy="18" r="3.5" fill="#fff" />
          <circle id="mapDot" cx="24" cy="100" r="8" fill="#D62300" stroke="#fff" stroke-width="3" />
        </svg>
        <div class="hud-order"><img src="/media/dish/jollof-chicken.webp" alt=""><div>Jollof Rice And Chicken<small>Mama Ronke's Kitchen · ₦4,300</small></div></div>
      </div>

      <div id="delivered" class="delivered burst" data-burst="18">DELIVERED!</div>
      <div id="confetti" class="confetti"></div>
    </section>

    <!-- ================= 4. GEN Z: scroll → tap → bite ================= -->
    <section id="genz" class="genz">
      <div id="gzBg" class="gz-bg chunk" aria-hidden="true">Scroll · Tap · Bite · Scroll · Tap · Bite ·</div>
      <div class="gz-grid">
        <div class="gz-copy">
          <span class="kick">Meanwhile, on the couch</span>
          <div class="roller gz-roller chunk">
            <div id="gzRoller" class="roller-in">
              <div>Scroll<span class="dot">.</span></div>
              <div>Tap<span class="dot">.</span></div>
              <div>Bite<span class="dot">.</span></div>
            </div>
          </div>
          <div id="gzDesc" class="k-desc gz-desc">
            <p>Thumbing through kitchens nearby like it's your For You page. Every video is a dish you can actually get tonight.</p>
            <p>One tap on Add to cart. Show your friend, add one more. Checkout happens right there in the app.</p>
            <p>The rider knocks. The burger is exactly what the video promised. No menu-photo surprises.</p>
          </div>
        </div>
        <div class="gz-stage">
          <div class="gz-card c1">
            <img src="/media/landing/unsplash/photo-1739271933163-8dcc7c8e8a3e.jpg" alt="A young woman smiling while scrolling on her phone">
            <span class="lbl">9:41 pm · scrolling</span>
            <div class="gz-hearts"><span>❤️</span><span>😋</span><span>🔥</span></div>
            <div class="gz-mini">
              <div class="phone">
                <div class="screen">
                  <video src="/media/dish/shrimp-boil.mp4" poster="/media/dish/shrimp-boil.webp" muted loop playsinline autoplay></video>
                  <div class="mini-tag"><span>Add to cart</span><span>₦14,500</span></div>
                </div>
              </div>
            </div>
          </div>
          <div class="gz-card c2">
            <img src="/media/landing/unsplash/photo-1739289696453-2b98ba584f59.jpg" alt="Two friends laughing at a phone screen together">
            <span class="lbl">“Wait, add one for me”</span>
            <div id="gzToast" class="gz-toast"><i>🍔</i><div>Burger ×2<small>✓ Added to cart</small></div><b>Checkout</b></div>
          </div>
          <div class="gz-card c3">
            <img src="/media/landing/pexels/photos/8202798.jpg" alt="A young African woman savouring a burger with her eyes closed" style="object-position:50% 30%">
            <span class="lbl">Delivered · first bite</span>
            <div id="gzBurst" class="gz-burst burst spin" data-burst="16">WORTH<br>IT!</div>
            <div class="gz-emo"><span>😋</span><span>🍔</span><span>❤️</span><span>🙌</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 5. TIKTOK FOR FOOD (video wall) ================= -->
    <section id="tiktok" class="tt">
      <div id="ttWrap" class="tt-wrap"><div id="ttWall" class="tt-wall"></div></div>
      <div class="tt-shade"></div>
      <div class="tt-copy">
        <span class="tt-kick">Think</span>
        <h2 class="tt-title chunk"><span class="glitch" data-text="TikTok">TikTok</span><br><span class="lw tt-for" data-chars>for food.</span></h2>
        <p>Short videos from real kitchens near you. Swipe up for the next kitchen, sideways for more of its dishes, and order from the one that got you.</p>
        <a class="btn yellow" href="#get-app">Start scrolling →</a>
      </div>
    </section>

    <!-- ================= 5b. CREATORS ================= -->
    <section id="creators" class="creators">
      <div id="crBg" class="cr-bgtext chunk" aria-hidden="true">#MealgroMade #MealgroMade #MealgroMade #MealgroMade</div>
      <div class="cr-head">
        <span class="kick" style="background:var(--yellow);color:var(--ink)">Made for creators</span>
        <h2 class="chunk cr-title"><span class="lw" data-chars>Africa's best food</span><span class="lw" data-chars>delivery app?</span></h2>
        <p class="cr-sub">Let your FYP decide. Film your Mealgro order, tag <b>@trymealgro</b> and get featured on our page.</p>
      </div>
      <div id="crFan" class="cr-fan"></div>
      <div class="cr-cta"><a class="btn yellow" href="https://www.instagram.com/trymealgro" target="_blank" rel="noopener"><span class="rec-dot"></span> Film yours &amp; tag us</a></div>
    </section>

    <!-- ================= 6. RATINGS ================= -->
    <section id="ratings" class="sec">
      <div class="wrap">
        <div class="head-row">
          <div><span class="kick">Top rated on the feed</span><h2 class="h2 chunk"><span class="lw" data-chars>Real bites.</span><span class="lw" data-chars>Real stars.</span></h2></div>
          <p class="lead">Every order can be rated in the app. These are the dishes people keep coming back for.</p>
        </div>
        <div id="rateGrid" class="rate-grid"></div>
        <div id="stats" class="stats"></div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true"><div id="m1" class="track"></div></div>

    <!-- ================= 4. CRAVINGS (stacking cards) ================= -->
    <section class="sec" style="padding-bottom:60px">
      <div class="wrap">
        <div class="head-row">
          <div><span class="kick">Satisfy your cravings</span><h2 class="h2 chunk"><span class="lw" data-chars>Whatever</span><span class="lw" data-chars>you're feeling.</span></h2></div>
          <p class="lead">Mealgro has all the food you can eat, sorted by how hungry you are.</p>
        </div>
        <div id="stack" class="stack">
          <a class="scard" href="#get-app" style="--i:0;background:var(--yellow)">
            <span class="num">01</span>
            <div><h3 class="chunk">Quick<br>Takeouts</h3><p>Burgers, shawarma, small chops. Fast food from the spots you already love.</p><span class="btn ink">Explore Quick Takeouts →</span></div>
            <img class="food" src="/media/home/crave-burger.webp" alt="Burger" loading="lazy">
          </a>
          <a class="scard" href="#get-app" style="--i:1;background:var(--purple);color:var(--cream)">
            <span class="num">02</span>
            <div><h3 class="chunk">Easy<br>Meals</h3><p>Noodles, rice bowls, pasta. Something good on a weeknight without the washing up.</p><span class="btn yellow">Explore Easy Meals →</span></div>
            <img class="food" src="/media/home/crave-noodles.webp" alt="Noodles" loading="lazy">
          </a>
          <a class="scard" href="#get-app" style="--i:2;background:var(--red);color:var(--cream)">
            <span class="num">03</span>
            <div><h3 class="chunk">Heavy<br>Loaders</h3><p>Swallow and soup, full plates, the meals that end the day properly.</p><span class="btn light">Explore Heavy Loaders →</span></div>
            <img class="food" src="/media/home/crave-swallow.webp" alt="Swallow and soup" loading="lazy">
          </a>
        </div>
      </div>
    </section>

    <!-- ================= 5. JOIN ================= -->
    <section class="sec" style="padding-top:60px">
      <div class="wrap">
        <div class="head-row">
          <div><span class="kick">There's room for you</span><h2 class="h2 chunk"><span class="lw" data-chars>Join the</span><span class="lw" data-chars>crew.</span></h2></div>
          <p class="lead">Every order is cooked by a vendor and carried by a rider. Pick a side, or get paid for bringing kitchens in.</p>
        </div>
        <div class="join-grid">
          <div class="join chef-card">
            <div id="chefSlider" class="chef-slider" aria-roledescription="carousel" aria-label="Chefs cooking">
              <div id="csTrack" class="cs-track"></div>
            </div>
            <div class="cs-ui">
              <span id="csTag" class="cs-tag">Pastry · 1/5</span>
              <div class="cs-nav"><button id="csPrev" class="cs-btn" aria-label="Previous chef">←</button><button id="csNext" class="cs-btn" aria-label="Next chef">→</button></div>
            </div>
            <div class="tagb burst spin" data-burst="14" style="background:var(--yellow)">FOR<br>KITCHENS</div>
            <h3 class="chunk">Sell on Mealgro</h3>
            <p>Post videos of what you cook and take orders from people nearby. We bring the riders.</p>
            <div class="cs-foot"><a class="btn" href="/vendors">Become a vendor →</a><div id="csDots" class="cs-dots"></div></div>
          </div>
          <a class="join" href="/riders">
            <div class="bgimg" data-par><img src="/media/landing/unsplash/photo-1727890193720-c1f19c60e966.jpg" alt="A delivery rider with an insulated food box on a scooter" loading="lazy"></div>
            <div class="tagb burst spin" data-burst="14" style="background:var(--pink)">FOR<br>RIDERS</div>
            <h3 class="chunk">Ride with Mealgro</h3>
            <p>Deliver on your own hours by motorcycle, bicycle or car, and see every naira you earn in the app.</p>
            <span class="btn light">Become a rider →</span>
          </a>
          <a class="join" href="/affiliate">
            <div class="bgimg"><video src="/media/landing/pexels/video-files/4994159/4994159-sd_540_960_25fps.mp4" poster="/media/landing/pexels/videos/4994159/pexels-photo-4994159.jpeg" muted loop playsinline autoplay preload="metadata" style="width:100%;height:100%;object-fit:cover"></video></div>
            <div class="tagb burst spin" data-burst="14" style="background:var(--yellow)">EARN<br>₦₦₦</div>
            <h3 class="chunk">Bring kitchens, get paid</h3>
            <p>Know restaurants and food sellers? Earn a cash reward for every vendor we approve with your code.</p>
            <span class="btn yellow">Become an affiliate →</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ================= 6. FAQ ================= -->
    <section class="sec" style="padding-top:20px">
      <div class="wrap faq-wrap">
        <div class="faq-side">
          <span class="kick">Questions</span>
          <h2 class="h2 chunk"><span class="lw" data-chars>Good to</span><span class="lw" data-chars>know.</span></h2>
          <p class="lead" style="margin-top:24px">Still curious? <a href="/contact" style="color:var(--red);text-decoration:underline;text-underline-offset:4px">Get in touch</a>.</p>
        </div>
        <div id="faq" class="faq-list">
          <div v-for="(f, i) in faqs" :key="f.q" class="qa" :class="{ open: i === 0 }">
            <button :aria-expanded="i === 0" :aria-controls="`ans${i}`">{{ f.q }}<span class="pm" aria-hidden="true">+</span></button>
            <div :id="`ans${i}`" class="ans"><div><p>{{ f.a }}</p></div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 7. CTA (kept) ================= -->
    <section id="get-app" class="cta">
      <div class="burst spin" data-burst="16">FREE<br>TO GET</div>
      <div class="wrap" style="position:relative;z-index:2">
        <h2 class="huge chunk"><span class="lw" data-chars>Swipe.</span><span class="lw" data-chars>Tap. Eat.</span></h2>
        <p>Get Mealgro and see what the kitchens near you are cooking right now.</p>
        <div class="stores">
          <a v-for="(s, i) in stores" :key="s.key" class="btn" :class="i === 0 ? 'light' : 'ink'" :href="s.href" target="_blank" rel="noopener">
            <template v-if="s.key === 'android'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2.5v19l10-9.5L4 2.5Zm11.4 8.2L6.7 2.2l10.6 6.1-1.9 2.4Zm0 2.6 1.9 2.4-10.6 6.1 8.7-8.5Zm2.9-4.3 2.9 1.7c.7.4.7 1.4 0 1.8l-2.9 1.7-2.1-2.6 2.1-2.6Z" /></svg>
              Get it on Google Play
            </template>
            <template v-else>
              <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1ZM15 4.9c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5Z" /></svg>
              Download on the App Store
            </template>
          </a>
        </div>
      </div>
    </section>

    <footer>
      <div class="wrap">
        <div class="foot">
          <div><img :src="logoImage" alt="Mealgro" style="height:36px;margin-bottom:16px"><p style="max-width:260px;color:var(--muted)">Order what you just watched.</p></div>
          <div><h4>Company</h4><a href="/about">About us</a><a href="/contact">Contact</a><a href="/status">Service status</a></div>
          <div><h4>Join</h4><a href="/vendors">Sell on Mealgro</a><a href="/riders">Ride with Mealgro</a><a href="/affiliate">Affiliate program</a><a href="/account">Vendor portal</a></div>
          <div><h4>Follow</h4><a href="https://www.instagram.com/trymealgro">Instagram</a><a href="https://x.com/mealgro">X</a><a href="https://www.facebook.com/share/14VPaxDJVbY/">Facebook</a><a href="https://www.linkedin.com/company/mealgro/">LinkedIn</a></div>
        </div>
        <div class="wordmark chunk"><span class="lw" data-chars>mealgro</span></div>
        <div class="legal"><span>© {{ year }} Mealgro</span><span><a href="/terms">Terms of service</a> · <a href="/privacy">Privacy policy</a></span></div>
      </div>
    </footer>
  </div>
</template>
