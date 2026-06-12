/* ============================================================
   KangTukang — ROUTER & BOOTSTRAP
   Hash-based routing untuk SPA statis (tanpa build, tanpa server).
   ============================================================ */

import { getState, resetDemo } from "./store.js";
import { mount, clearTimers, runCleanups } from "./ui.js";
import {
  StartScreen, LoginScreen, OtpScreen, HomeScreen, AllServicesScreen,
  CategoryScreen, ServiceScreen, FormScreen, LocationScreen,
  EstimateScreen, CheckoutScreen,
} from "./screens-order.js";
import {
  SearchingScreen, FoundScreen, PriceAgreementScreen, TrackingScreen, ProgressScreen,
  PaymentScreen, RatingScreen, DoneScreen,
} from "./screens-live.js";
import { PromoScreen, ActivityScreen, MessagesScreen, ProfileScreen, TopupScreen } from "./screens-extra.js";

/* Reset via query param: ?mode=expo&reset=true (untuk QR code expo) */
(function handleQuery() {
  const q = new URLSearchParams(location.search);
  if (q.get("reset") === "true") {
    resetDemo();
    history.replaceState(null, "", location.pathname + "#/start");
  }
})();

const routes = [
  { match: /^#\/start$/, render: () => StartScreen() },
  { match: /^#\/login$/, render: () => LoginScreen() },
  { match: /^#\/otp$/, render: () => OtpScreen() },
  { match: /^#\/home$/, render: () => HomeScreen(), needLogin: true },
  { match: /^#\/services$/, render: () => AllServicesScreen(), needLogin: true },
  { match: /^#\/promo$/, render: () => PromoScreen(), needLogin: true },
  { match: /^#\/activity$/, render: () => ActivityScreen(), needLogin: true },
  { match: /^#\/messages$/, render: () => MessagesScreen(), needLogin: true },
  { match: /^#\/profile$/, render: () => ProfileScreen(), needLogin: true },
  { match: /^#\/topup$/, render: () => TopupScreen(), needLogin: true },
  { match: /^#\/category\/([\w-]+)$/, render: (m) => CategoryScreen(m[1]), needLogin: true },
  { match: /^#\/service\/([\w-]+)$/, render: (m) => ServiceScreen(m[1]), needLogin: true },
  { match: /^#\/form$/, render: () => FormScreen(), needOrder: true },
  { match: /^#\/location$/, render: () => LocationScreen(), needOrder: true },
  { match: /^#\/estimate$/, render: () => EstimateScreen(), needOrder: true },
  { match: /^#\/checkout$/, render: () => CheckoutScreen(), needOrder: true },
  { match: /^#\/searching$/, render: () => SearchingScreen(), needOrder: true },
  { match: /^#\/found$/, render: () => FoundScreen(), needOrder: true },
  { match: /^#\/price-agreement$/, render: () => PriceAgreementScreen(), needOrder: true },
  { match: /^#\/tracking$/, render: () => TrackingScreen(), needOrder: true },
  { match: /^#\/progress$/, render: () => ProgressScreen(), needOrder: true },
  { match: /^#\/payment$/, render: () => PaymentScreen(), needOrder: true },
  { match: /^#\/rating$/, render: () => RatingScreen(), needOrder: true },
  { match: /^#\/done$/, render: () => DoneScreen() },
];

function route() {
  clearTimers();
  runCleanups();
  const hash = location.hash || "#/start";
  const st = getState();

  for (const r of routes) {
    const m = hash.match(r.match);
    if (!m) continue;

    if (r.needLogin && !st.loggedIn) {
      location.hash = "#/start";
      return;
    }
    if (r.needOrder && (!st.loggedIn || !st.order)) {
      location.hash = st.loggedIn ? "#/home" : "#/start";
      return;
    }
    mount(r.render(m));
    return;
  }

  location.hash = "#/start";
}

window.addEventListener("hashchange", route);
if (!location.hash) location.hash = "#/start";
route();
