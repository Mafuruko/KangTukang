const hero = document.querySelector(".hero");
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const navigationLinks = [...document.querySelectorAll(".main-nav a[href^='#']")];
const form = document.querySelector(".notify-form");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (hero && window.matchMedia("(hover: hover)").matches && !reduceMotion) {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  hero.addEventListener("pointermove", (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    targetX = x * 18;
    targetY = y * 12;
  });

  hero.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  const updateParallax = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    hero.style.setProperty("--move-x", `${currentX}px`);
    hero.style.setProperty("--move-y", `${currentY}px`);
    requestAnimationFrame(updateParallax);
  };
  updateParallax();
}

menuButton?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navigation?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navigation.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

if (!reduceMotion) {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
}

const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
document.body.prepend(scrollProgress);
const updateProgress = () => {
  const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  scrollProgress.style.transform = `scaleX(${Math.min(scrolled, 1)})`;
};
updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });

const observedSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (observedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navigationLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );
  observedSections.forEach((section) => sectionObserver.observe(section));
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = form.nextElementSibling;
  message.textContent = "Terima kasih. Kami akan mengabari Anda saat KangTukang siap.";
  form.reset();
});
