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
        <h4>Datenschutzerklärung</h4>

        <p><strong>1. Verantwortlicher</strong><br>
        Jonas Kieser<br>
        Landschafts- & Gartenpflege<br>
        71263 Hausen an der Würm<br>
        Deutschland<br>
        Telefon: +49 152 8817669</p>

        <p><strong>2. Allgemeine Hinweise</strong><br>
        Der Schutz Ihrer persönlichen Daten ist uns wichtig.
        Personenbezogene Daten werden vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften (DSGVO, BDSG) behandelt.</p>

        <p><strong>3. Hosting</strong><br>
        Diese Website wird bei einem externen Hosting-Dienstleister betrieben.
        Beim Aufruf der Website werden automatisch folgende Daten erfasst:</p>

        <ul>
            <li>IP-Adresse</li>
            <li>Datum und Uhrzeit des Zugriffs</li>
            <li>Browsertyp und Version</li>
            <li>Betriebssystem</li>
            <li>Referrer-URL</li>
        </ul>

        <p>Diese Daten dienen ausschließlich der technischen Bereitstellung und Sicherheit der Website.</p>

        <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO.</p>

        <p><strong>4. Kontaktaufnahme</strong><br>
        Bei Kontaktaufnahme per Telefon oder WhatsApp werden Ihre Angaben zur Bearbeitung Ihrer Anfrage verwendet.</p>

        <p><strong>5. Kontaktformular</strong><br>
        Das Formular auf dieser Website speichert keine Daten automatisch.
        Beim Absenden wird lediglich ein Nachrichtentext erzeugt.</p>

        <p><strong>6. Ihre Rechte</strong><br>
        Sie haben jederzeit das Recht auf Auskunft, Berichtigung oder Löschung Ihrer personenbezogenen Daten.</p>

        <p><strong>7. Beschwerderecht</strong><br>
        Landesbeauftragter für Datenschutz Baden-Württemberg.</p>

        <p>Stand: ${new Date().getFullYear()}</p>
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
