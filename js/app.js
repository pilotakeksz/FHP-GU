(function () {
  "use strict";

  /* GitHub Pages / global asset base: works when site is at origin/repo-name/ */
  window.SITE_BASE = (function () {
    var p = window.location.pathname || "";
    if (p === "" || p === "/") return "";
    var segs = p.split("/").filter(Boolean);
    return segs.length ? "/" + segs[0] + "/" : "";
  })();
  window.getAssetUrl = function (path) {
    var p = path && path.charAt(0) === "/" ? path.slice(1) : path || "";
    return (window.SITE_BASE || "") + p;
  };

  /* Footer year */
  var y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  /* Sliding nav selector */
  function initNavSelector() {
    var nav = document.querySelector("nav");
    if (!nav) return;

    function updateSelector() {
      var activeLink = nav.querySelector("a.active");
      if (!activeLink) return;

      var navRect = nav.getBoundingClientRect();
      var linkRect = activeLink.getBoundingClientRect();
      var relativeLeft = linkRect.left - navRect.left;

      var selector = nav;
      selector.style.setProperty("--selector-left", relativeLeft + "px");
      selector.style.setProperty("--selector-width", linkRect.width + "px");
      nav.classList.add("has-active");
    }

    updateSelector();
    window.addEventListener("resize", updateSelector);

    /* Update on hover for preview */
    var links = nav.querySelectorAll("a");
    links.forEach(function (link) {
      link.addEventListener("mouseenter", function () {
        var navRect = nav.getBoundingClientRect();
        var linkRect = link.getBoundingClientRect();
        var relativeLeft = linkRect.left - navRect.left;

        nav.style.setProperty("--selector-left", relativeLeft + "px");
        nav.style.setProperty("--selector-width", linkRect.width + "px");
      });
    });

    nav.addEventListener("mouseleave", updateSelector);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavSelector);
  } else {
    initNavSelector();
  }

  /* Particles.js background — init after lib loaded */
  function initParticles() {
    if (typeof window.particlesJS !== "function") return;
    var el = document.getElementById("particles-js");
    if (!el) return;
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: "#e8a838" },
        shape: { type: "circle" },
        opacity: { value: 0.35, random: true },
        size: { value: 2.5, random: true },
        line_linked: {
          enable: true,
          distance: 140,
          color: "#c49a6c",
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: "none",
          random: true,
          out_mode: "out"
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" }
        },
        modes: {
          grab: { distance: 120, line_linked: { opacity: 0.4 } },
          push: { particles_nb: 3 }
        }
      },
      retina_detect: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initParticles);
  } else {
    initParticles();
  }
})();
