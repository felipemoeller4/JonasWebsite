// Helper: query
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const YEAR = new Date().getFullYear();
$("#year").textContent = String(YEAR);

// Mobile nav
const navBtn = $(".navbtn");
const nav = $("#nav");

function setNav(open){
  nav.classList.toggle("is-open", open);
  navBtn.setAttribute("aria-expanded", open ? "true" : "false");
}
navBtn.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
$$('#nav a').forEach(a => a.addEventListener('click', () => setNav(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setNav(false);
});

// WhatsApp link builder (replace placeholder number!)
const WHATSAPP_NUMBER = "4915208817669"; // TODO: replace with your real number (international format, no +)
const defaultText =
  "Hallo Jonas, ich habe eine Anfrage zur Gartenpflege in (Ort).%0A%0ALeistung: ...%0ABeschreibung: ...%0AZeitraum: ...%0AFotos: (optional)";

function waUrl(text){
  const t = text ?? defaultText;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${t}`;
}

function hookWA(id){
  const el = document.getElementById(id);
  if (!el) return;
  el.setAttribute("href", waUrl());
  el.setAttribute("target", "_blank");
  el.setAttribute("rel", "noopener");
}

["waTop","waServices","waContact"].forEach(hookWA);

// Contact form: prepare message (no backend needed)
const form = $("#contactForm");
const toast = $("#toast");

function showToast(msg){
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.style.display = "none"), 4200);
}

function buildMessage(data){
  const service = data.service ? `Leistung: ${data.service}\n` : "";
  const timeframe = data.timeframe ? `Wunschzeitraum: ${data.timeframe}\n` : "";
  return [
    "Hallo Jonas,",
    "",
    "ich möchte eine Anfrage zur Garten-/Landschaftspflege stellen:",
    "",
    `Name: ${data.name}`,
    `Kontakt: ${data.contact}`,
    `Ort: ${data.location}`,
    service ? service.trimEnd() : null,
    timeframe ? timeframe.trimEnd() : null,
    "",
    "Beschreibung:",
    data.message,
    "",
    "Viele Grüße"
  ].filter(Boolean).join("\n");
}

function validateRequired(formEl){
  const required = $$("[required]", formEl);
  const invalid = required.filter(i => !String(i.value || "").trim());
  required.forEach(i => i.style.borderColor = "rgba(255,255,255,.12)");
  invalid.forEach(i => i.style.borderColor = "rgba(255,59,92,.7)");
  return invalid.length === 0;
}

let lastBuilt = "";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateRequired(form)) {
    showToast("Bitte fülle die Pflichtfelder (*) aus.");
    return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  lastBuilt = buildMessage(data);

  // Update WhatsApp with the prepared message
  const wa = $("#waContact");
  const encoded = encodeURIComponent(lastBuilt);
  wa.setAttribute("href", waUrl(encoded));

  showToast("Fertige Nachricht erstellt. Du kannst sie kopieren oder direkt per WhatsApp öffnen.");
});

$("#copyMessage").addEventListener("click", async () => {
  if (!lastBuilt) {
    showToast("Erst auf „Anfrage vorbereiten“ klicken, dann kopieren.");
    return;
  }
  try {
    await navigator.clipboard.writeText(lastBuilt);
    showToast("Text kopiert ✅");
  } catch {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = lastBuilt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast("Text kopiert ✅");
  }
});

// Modal (Impressum / Datenschutz placeholders)
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");

function openModal(title, html){
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
$$("[data-close]", modal).forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.getAttribute("aria-hidden")==="false") closeModal();
});

$("#openImpressum").addEventListener("click", (e) => {
  e.preventDefault();
  openModal("Impressum (Platzhalter)", `
    <p><strong>Angaben gemäß § 5 TMG</strong></p>
    <p>
      Jonas Kieser<br/>
      Landschafts- &amp; Gartenpflege<br/>
      71263 Hausen an der Würm<br/>
      Deutschland
    </p>
    <p><strong>Kontakt</strong><br/>
      Telefon: +49 1520 8817669 (Platzhalter)<br/>
      E-Mail: mail@beispiel.de (Platzhalter)
    </p>
    <p class="muted small">Hinweis: Bitte vor Veröffentlichung mit korrekten Daten ersetzen.</p>
  `);
});

$("#openDatenschutz").addEventListener("click", (e) => {
  e.preventDefault();
  openModal("Datenschutz", `
    <p>🔐 Datenschutzerklärung (für Jonas Kieser – Landschafts- & Gartenpflege)</p>
    <p>1. Verantwortlicher</p>
    <p>Jonas Kieser</p>
    <p>Landschafts- & Gartenpflege</p>
    <p>71263 Hausen an der Würm</p>
    <p>Deutschland</p>
    <p>Telefon: +49 1520 8817669</p>
    <p>E-Mail: [E-Mail-Adresse einfügen]</p>
    <p>2. Allgemeine Hinweise</p>
    <p>Der Schutz Ihrer persönlichen Daten ist uns wichtig.</p>
    <p>Personenbezogene Daten werden vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften (DSGVO, BDSG) behandelt.</p>
    <p>3. Hosting</p>
    <p>Diese Website wird über einen externen Hosting-Dienstleister betrieben.</p>
    <p>Beim Aufruf der Website werden automatisch folgende Daten erfasst:</p>
    <p>-IP-Adresse</p>
    <p>-Datum und Uhrzeit des Zugriffs</p>
    <p>-Browsertyp und Version</p>
    <p>-Betriebssystem</p>
    <p>-Referrer-URL</p>
    <p>Diese Daten dienen ausschließlich der technischen Bereitstellung und Sicherheit der Website und werden nicht zur Identifizierung von Personen verwendet.</p>
    <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem Betrieb der Website)</p>
  `);
});

// Accordion: keep only one open (optional)
$$("[data-accordion] details").forEach((d) => {
  d.addEventListener("toggle", () => {
    if (d.open) {
      $$("[data-accordion] details").forEach((x) => {
        if (x !== d) x.removeAttribute("open");
      });
    }
  });
});
