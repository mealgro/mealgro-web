<script setup lang="ts">
// The landing page (mealgro.com). Ported from the standalone design: the
// markup is here (the nav, download section and footer are the shared ones
// in components/brand), the look in ./landing.css (all of it under .lp), and the
// motion in ./landing.ts, which starts on mount and undoes itself on unmount
// so the next page starts clean. Dish media is the site's own (/media/dish);
// the stock clips and photos are in /media/landing (Pexels and Unsplash
// licences: free to use, no attribution required).
import { onBeforeUnmount, onMounted, ref } from "vue";
import "../brand/brand.css";
import "./landing.css";
import logoImage from "../../assets/logo.svg";
import BrandNav from "../brand/BrandNav.vue";
import BrandCta from "../brand/BrandCta.vue";
import BrandFooter from "../brand/BrandFooter.vue";
import { CUSTOMER_APP } from "../../lib/site/links";
import { useStores } from "../../lib/site/stores";
import type { LandingMotion } from "./landing";
import { FAQS } from "./faqs";

const root = ref<HTMLElement | null>(null);

// Download now: straight to a phone's store, else to the buttons.
const { direct: directStore } = useStores(CUSTOMER_APP);
const faqs = FAQS;
let motion: LandingMotion | null = null;
// The menu covers the page: smooth scrolling pauses under it.
const onMenu = (open: boolean) => motion?.lockScroll(open);

onMounted(async () => {
	const { mountLanding } = await import("./landing");
	if (root.value) motion = mountLanding(root.value);
});
onBeforeUnmount(() => {
	motion?.destroy();
	motion = null;
});
</script>

<template>
  <div ref="root" class="lp brand">
    <div id="loader" aria-hidden="true"><div class="word chunk" data-chars>mealgro</div></div>

    <BrandNav @menu="onMenu" />

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
              <!-- The app's own buttons and dish info (mealgro-app feed), at its
                   proportions: 1em is 10 of the app's 390 px -->
              <div class="appui">
                <div class="ac-top">
                  <div class="ac-loc">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21.5s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                    <div><small>Delivery To</small><strong>12 Herbert Macaulay Way, Yaba</strong></div>
                  </div>
                  <div class="ac-tools">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7.5" /><path d="m20.5 20.5-4-4" /></svg>
                    <img src="/media/app-icons/filter_icon.svg" alt="">
                  </div>
                </div>
                <div class="ac-rail">
                  <span class="ac-r"><svg viewBox="0 0 28 28" fill="currentColor"><path d="M25.67 9.92a7.58 7.58 0 0 0-13.57-4.66c5.92.23 10.65 5.1 10.65 11.07l-.01.39.39.1c1.13.3 2.16-.73 1.86-1.85l-.15-.56c-.12-.45-.05-.92.15-1.35.43-.95.68-2.02.68-3.14Z" /><path fill-rule="evenodd" d="M21 16.33a9.33 9.33 0 0 1-13.36 8.42c-.42-.2-.9-.27-1.34-.15l-1.43.38a1.52 1.52 0 0 1-1.86-1.86l.38-1.43c.12-.45.05-.92-.15-1.34A9.33 9.33 0 1 1 21 16.33ZM7.58 17.5a1.17 1.17 0 1 0 0-2.33 1.17 1.17 0 0 0 0 2.33Zm4.09 0a1.17 1.17 0 1 0 0-2.33 1.17 1.17 0 0 0 0 2.33Zm4.08 0a1.17 1.17 0 1 0 0-2.33 1.17 1.17 0 0 0 0 2.33Z" /></svg><span id="reviews">96</span></span>
                  <span class="ac-r"><svg viewBox="0 0 28 28" fill="currentColor"><path fill-rule="evenodd" d="M24.5 12.95v5.82c0 3.62 0 5.42-.86 6.21-.4.38-.92.61-1.47.68-1.15.13-2.5-1.06-5.19-3.44-1.19-1.05-1.78-1.58-2.47-1.71a2.6 2.6 0 0 0-1.02 0c-.69.13-1.28.66-2.47 1.71-2.69 2.38-4.04 3.57-5.19 3.44-.55-.07-1.07-.3-1.47-.68-.86-.79-.86-2.59-.86-6.21v-5.82c0-5 0-7.5 1.54-9.06C6.58 2.33 9.05 2.33 14 2.33s7.42 0 8.96 1.56c1.54 1.55 1.54 4.06 1.54 9.06ZM9.63 7c0-.48.39-.88.87-.88h7c.48 0 .88.4.88.88s-.4.88-.88.88h-7A.88.88 0 0 1 9.62 7Z" /></svg><span id="saves">211</span></span>
                  <span class="ac-r"><svg viewBox="0 0 28 28" fill="currentColor"><path d="m16.28 6.05 5.81 5.16c1.08.96 1.63 1.45 1.83 2.02.17.5.17 1.04 0 1.54-.2.57-.75 1.06-1.83 2.02l-5.81 5.16c-.5.44-.74.66-.95.67a.58.58 0 0 1-.47-.21c-.13-.16-.13-.5-.13-1.15V18c-2.83 0-5.83.91-8.01 2.52-1.14.84-1.71 1.27-1.92 1.25a.63.63 0 0 1-.46-.28c-.11-.19-.01-.77.18-1.93C5.82 12.02 11 10 14.73 10V6.75c0-.66 0-.99.13-1.15.12-.14.29-.22.47-.21.21 0 .46.22.95.66Z" /></svg><span>Share</span></span>
                  <span class="ac-r"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9.2v5.6c0 .9.7 1.6 1.6 1.6h2.3l4.4 3.6c.8.6 1.9.1 1.9-.9V4.9c0-1-1.1-1.5-1.9-.9L6.9 7.6H4.6C3.7 7.6 3 8.3 3 9.2Z" /><path d="m16.5 9 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg></span>
                </div>
                <div id="info" class="ac-info"></div>
                <div class="ac-actions">
                  <span class="ac-menu"><img src="/media/app-icons/menu_fork_knife.svg" alt="">Menu</span>
                  <span class="ac-cart"><span class="ac-cart-l"><img src="/media/app-icons/cart_icon.svg" alt="">Add to cart</span><span id="price" class="ac-cart-r">₦3,500</span></span>
                </div>
                <nav class="ac-tabs" aria-hidden="true">
                  <span><img src="/media/app-icons/media_icon.svg" alt="">Feed</span>
                  <span><img class="ac-white" src="/media/app-icons/community_icon.svg" alt="">Community</span>
                  <span><img class="ac-white" src="/media/app-icons/explore_icon.svg" alt="">Explore</span>
                  <span><img class="ac-white" src="/media/app-icons/outlined_bell.svg" alt="">Activity</span>
                  <span><img class="ac-white" src="/media/app-icons/user_icons.svg" alt="">Profile</span>
                </nav>
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
                    <div class="appui">
                      <div class="ac-top">
                        <div class="ac-loc">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21.5s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                          <div><small>Delivery To</small><strong>12 Herbert Macaulay Way, Yaba</strong></div>
                        </div>
                        <div class="ac-tools">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7.5" /><path d="m20.5 20.5-4-4" /></svg>
                          <img src="/media/app-icons/filter_icon.svg" alt="">
                        </div>
                      </div>
                      <div class="ac-rail">
                        <span class="ac-r"><svg viewBox="0 0 28 28" fill="currentColor"><path d="M25.67 9.92a7.58 7.58 0 0 0-13.57-4.66c5.92.23 10.65 5.1 10.65 11.07l-.01.39.39.1c1.13.3 2.16-.73 1.86-1.85l-.15-.56c-.12-.45-.05-.92.15-1.35.43-.95.68-2.02.68-3.14Z" /><path fill-rule="evenodd" d="M21 16.33a9.33 9.33 0 0 1-13.36 8.42c-.42-.2-.9-.27-1.34-.15l-1.43.38a1.52 1.52 0 0 1-1.86-1.86l.38-1.43c.12-.45.05-.92-.15-1.34A9.33 9.33 0 1 1 21 16.33ZM7.58 17.5a1.17 1.17 0 1 0 0-2.33 1.17 1.17 0 0 0 0 2.33Zm4.09 0a1.17 1.17 0 1 0 0-2.33 1.17 1.17 0 0 0 0 2.33Zm4.08 0a1.17 1.17 0 1 0 0-2.33 1.17 1.17 0 0 0 0 2.33Z" /></svg><span id="liveLikes">0</span></span>
                        <span class="ac-r"><svg viewBox="0 0 28 28" fill="currentColor"><path fill-rule="evenodd" d="M24.5 12.95v5.82c0 3.62 0 5.42-.86 6.21-.4.38-.92.61-1.47.68-1.15.13-2.5-1.06-5.19-3.44-1.19-1.05-1.78-1.58-2.47-1.71a2.6 2.6 0 0 0-1.02 0c-.69.13-1.28.66-2.47 1.71-2.69 2.38-4.04 3.57-5.19 3.44-.55-.07-1.07-.3-1.47-.68-.86-.79-.86-2.59-.86-6.21v-5.82c0-5 0-7.5 1.54-9.06C6.58 2.33 9.05 2.33 14 2.33s7.42 0 8.96 1.56c1.54 1.55 1.54 4.06 1.54 9.06ZM9.63 7c0-.48.39-.88.87-.88h7c.48 0 .88.4.88.88s-.4.88-.88.88h-7A.88.88 0 0 1 9.62 7Z" /></svg><span id="liveSaves">0</span></span>
                        <span class="ac-r"><svg viewBox="0 0 28 28" fill="currentColor"><path d="m16.28 6.05 5.81 5.16c1.08.96 1.63 1.45 1.83 2.02.17.5.17 1.04 0 1.54-.2.57-.75 1.06-1.83 2.02l-5.81 5.16c-.5.44-.74.66-.95.67a.58.58 0 0 1-.47-.21c-.13-.16-.13-.5-.13-1.15V18c-2.83 0-5.83.91-8.01 2.52-1.14.84-1.71 1.27-1.92 1.25a.63.63 0 0 1-.46-.28c-.11-.19-.01-.77.18-1.93C5.82 12.02 11 10 14.73 10V6.75c0-.66 0-.99.13-1.15.12-.14.29-.22.47-.21.21 0 .46.22.95.66Z" /></svg><span>Share</span></span>
                        <span class="ac-r"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9.2v5.6c0 .9.7 1.6 1.6 1.6h2.3l4.4 3.6c.8.6 1.9.1 1.9-.9V4.9c0-1-1.1-1.5-1.9-.9L6.9 7.6H4.6C3.7 7.6 3 8.3 3 9.2Z" /><path d="m16.5 9 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg></span>
                      </div>
                      <div class="ac-info">
                        <p class="ac-title">Jollof Rice And Chicken</p>
                        <p class="ac-desc">Smoky party jollof with peppered chicken and fried plantain.</p>
                        <div class="ac-store"><img src="/media/app-icons/shop_icon.svg" alt=""><b>Mama Ronke's Kitchen</b><span class="ac-time"><img src="/media/app-icons/scooter_icon.svg" alt="">25–35 mins</span></div>
                        <div class="ac-city"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" /></svg>Yaba</div>
                        <div class="ac-badges"><span class="ac-badge">🔥 NEW</span></div>
                      </div>
                      <div class="ac-actions">
                        <span class="ac-menu"><img src="/media/app-icons/menu_fork_knife.svg" alt="">Menu</span>
                        <span class="ac-cart"><span class="ac-cart-l"><img src="/media/app-icons/cart_icon.svg" alt="">Add to cart</span><span class="ac-cart-r">₦4,300</span></span>
                      </div>
                      <nav class="ac-tabs" aria-hidden="true">
                        <span><img src="/media/app-icons/media_icon.svg" alt="">Feed</span>
                        <span><img class="ac-white" src="/media/app-icons/community_icon.svg" alt="">Community</span>
                        <span><img class="ac-white" src="/media/app-icons/explore_icon.svg" alt="">Explore</span>
                        <span><img class="ac-white" src="/media/app-icons/outlined_bell.svg" alt="">Activity</span>
                        <span><img class="ac-white" src="/media/app-icons/user_icons.svg" alt="">Profile</span>
                      </nav>
                    </div>
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
    <BrandCta />

    <BrandFooter />
  </div>
</template>
