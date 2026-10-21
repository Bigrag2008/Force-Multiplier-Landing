/* Civic Armor hub: fills in the links from config.js, runs the email list form, and the English/Spanish switch. */
(function () {
  var cfg = window.CIVIC_ARMOR || {};
  var LIST = "/#list";

  // <a data-link="guideBuyUrl" data-soon="Coming soon: get told when it's out">: a live link, or the list until then
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var url = cfg[a.getAttribute("data-link")];
    if (url) {
      a.href = url;
      if (/^https?:/.test(url) && url.indexOf(location.host) < 0) a.rel = "noopener";
    } else {
      a.href = LIST;
      var soon = a.getAttribute("data-soon");
      if (soon) a.textContent = soon;
    }
  });
  document.querySelectorAll("[data-email]").forEach(function (a) {
    a.href = "mailto:" + cfg.email;
    if (!a.textContent.trim()) a.textContent = cfg.email;
  });
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  // English / Spanish (only /next has both): ?lang=es, or the switch, remembered on this device
  var root = document.documentElement;
  if (root.hasAttribute("data-lang")) {
    var pick = /[?&]lang=es\b/.test(location.search) ? "es" : null;
    try { pick = pick || localStorage.getItem("sn-lang"); } catch (e) {}
    if (!pick) pick = (navigator.language || "").slice(0, 2) === "es" ? "es" : "en";
    var set = function (l) {
      root.setAttribute("data-lang", l);
      root.lang = l;
      document.querySelectorAll(".lang button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.value === l));
      });
      try { localStorage.setItem("sn-lang", l); } catch (e) {}
    };
    set(pick === "es" ? "es" : "en");
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.addEventListener("click", function () { set(b.value); });
    });
  }

  // the email list
  document.querySelectorAll("form[data-signup]").forEach(function (form) {
    var msg = form.querySelector(".msg");
    var es = function () { return root.getAttribute("data-lang") === "es"; };
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = form.email.value.trim();
      if (form.website && form.website.value) return; // a bot filled the hidden field
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = es() ? "Revisa tu correo electrónico." : "Check your email address.";
        return;
      }
      var interests = Array.prototype.map.call(form.querySelectorAll("input[name=interest]:checked, input[type=hidden][name=interest]"), function (x) { return x.value; });
      var body = { kind: "signup", email: email, interests: interests, page: location.pathname, lang: es() ? "es" : "en" };
      if (!cfg.signupUrl) {
        // no Sheet connected yet: hand it to the visitor's email app instead
        location.href = "mailto:" + cfg.email + "?subject=" + encodeURIComponent("Add me to the Civic Armor list") +
          "&body=" + encodeURIComponent("Please add " + email + " to the list." + (interests.length ? "\nInterested in: " + interests.join(", ") : ""));
        msg.textContent = es() ? "Se abrió tu correo: envíalo y quedas en la lista." : "Your email app opened: send it and you're on the list.";
        return;
      }
      var btn = form.querySelector("button");
      btn.disabled = true;
      // text/plain and no-cors: Google's web app takes it without a preflight (the same as the game's feedback)
      fetch(cfg.signupUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
        .then(function () {
          msg.textContent = es() ? "Listo. Estás en la lista." : "Done. You're on the list.";
          form.reset();
        })
        .catch(function () {
          msg.textContent = es() ? "No se pudo enviar. Escríbenos a " + cfg.email + "." : "That didn't go through. Email us at " + cfg.email + ".";
        })
        .then(function () { btn.disabled = false; });
    });
  });
})();
