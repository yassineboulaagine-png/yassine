import { chromium } from "@playwright/test";
import { spawn, execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(__dirname, "..");
const ROOT_DIR = path.resolve(FRONTEND_DIR, "..");
const ASSETS_DIR = path.join(ROOT_DIR, ".rapport_assets");
const DIAGRAM_DIR = path.join(ASSETS_DIR, "diagrams");
const SCREENSHOT_DIR = path.join(ASSETS_DIR, "screenshots");
const BASE_URL = "http://127.0.0.1:5173";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureDirs() {
  await fs.mkdir(DIAGRAM_DIR, { recursive: true });
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
}

function arrowMarker() {
  return `
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#1f2937" />
      </marker>
    </defs>`;
}

function text(x, y, value, size = 16, weight = 400, anchor = "middle") {
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="#111827">${value}</text>`;
}

function actor(x, y, label) {
  return `
    <g>
      <circle cx="${x}" cy="${y}" r="12" fill="#f8fafc" stroke="#475569" />
      <line x1="${x}" y1="${y + 12}" x2="${x}" y2="${y + 58}" stroke="#475569" />
      <line x1="${x - 28}" y1="${y + 28}" x2="${x + 28}" y2="${y + 28}" stroke="#475569" />
      <line x1="${x}" y1="${y + 58}" x2="${x - 25}" y2="${y + 100}" stroke="#475569" />
      <line x1="${x}" y1="${y + 58}" x2="${x + 25}" y2="${y + 100}" stroke="#475569" />
      ${text(x, y + 128, label, 16)}
    </g>`;
}

function ellipse(x, y, w, h, label) {
  return `<g><ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${h / 2}" fill="#f8fafc" stroke="#94a3b8" />${text(x, y + 5, label, 15)}</g>`;
}

function line(x1, y1, x2, y2, arrow = true, dashed = false) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1f2937" stroke-width="1.4" ${arrow ? 'marker-end="url(#arrow)"' : ""} ${dashed ? 'stroke-dasharray="6 5"' : ""}/>`;
}

function useCaseSvg() {
  const cases = [
    [420, 85, "Consulter tableau de bord"],
    [420, 170, "Gérer patients"],
    [420, 255, "Gérer analyses"],
    [420, 340, "Gérer personnel"],
    [420, 425, "Modifier profil"],
    [420, 510, "Changer mot de passe"],
    [420, 645, "Annuler examen"],
    [420, 740, "Gérer rendez-vous"],
    [420, 830, "Se connecter"],
    [420, 940, "Rechercher patient"],
    [420, 1030, "Ajouter patient"],
    [420, 1120, "Modifier patient"],
    [420, 1210, "Supprimer patient"],
    [420, 1300, "Créer examen"],
    [420, 1390, "Valider prélèvement"],
    [420, 1490, "Consulter historique"],
    [420, 1580, "Consulter analyses à traiter"],
    [420, 1670, "Saisir résultats"],
    [420, 1760, "Valider examen"],
  ];
  const patientCases = [
    [430, 1880, "Confirmer rendez-vous"],
    [430, 1970, "Consulter résultats"],
    [430, 2060, "Prendre rendez-vous"],
    [430, 2150, "Télécharger PDF"],
  ];
  const extra = [
    [710, 1760, "Envoyer notifications"],
    [720, 1970, "S'authentifier"],
    [720, 2100, "Envoyer code email"],
  ];
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="2380" viewBox="0 0 900 2380">
    <rect width="900" height="2380" fill="#ffffff"/>
    ${arrowMarker()}
    <rect x="170" y="20" width="690" height="2300" fill="none" stroke="#111827" stroke-width="1.2"/>
    ${text(515, 48, "Système Labo", 18, 700)}
    ${actor(75, 310, "Administrateur")}
    ${actor(75, 1020, "Préleveur")}
    ${actor(75, 1600, "Biologiste")}
    ${actor(75, 2020, "Patient")}
    ${actor(360, 2225, "Système Email")}
    ${cases.map(([x, y, label]) => ellipse(x, y, label.length > 22 ? 245 : 190, 42, label)).join("")}
    ${patientCases.map(([x, y, label]) => ellipse(x, y, 235, 42, label)).join("")}
    ${extra.map(([x, y, label]) => ellipse(x, y, 230, 42, label)).join("")}
    ${[85, 170, 255, 340, 425, 510, 830].map((y) => line(105, 338, 300, y)).join("")}
    ${[645, 740, 830, 940, 1030, 1120, 1210, 1300, 1390].map((y) => line(105, 1048, 300, y)).join("")}
    ${[830, 1490, 1580, 1670, 1760].map((y) => line(105, 1628, 300, y)).join("")}
    ${[1880, 1970, 2060, 2150].map((y) => line(105, 2048, 300, y)).join("")}
    ${line(535, 1300, 610, 1760)}
    ${text(595, 1535, "«include»", 14)}
    ${line(535, 1760, 610, 1760)}
    ${text(610, 1738, "«include»", 14)}
    ${line(555, 1880, 610, 1970)}
    ${line(555, 1970, 610, 1970)}
    ${line(555, 2060, 610, 2100)}
    ${text(604, 1930, "«include»", 14)}
    ${text(604, 2040, "«include»", 14)}
    ${line(390, 2225, 620, 2100)}
    ${line(390, 2225, 620, 1760)}
  </svg>`;
}

function classBox(x, y, w, title, attrs) {
  const row = 24;
  const h = 34 + attrs.length * row + 10;
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f8fafc" stroke="#64748b"/>
      <rect x="${x}" y="${y}" width="${w}" height="34" fill="#e2e8f0" stroke="#64748b"/>
      <circle cx="${x + 22}" cy="${y + 17}" r="12" fill="#bbf7d0" stroke="#475569"/>
      ${text(x + 22, y + 22, "C", 14, 700)}
      ${text(x + 45, y + 22, title, 16, 600, "start")}
      ${attrs.map((attr, i) => text(x + 12, y + 60 + i * row, `+${attr}`, 15, 400, "start")).join("")}
    </g>`;
}

function classDiagramSvg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1180" height="1180" viewBox="0 0 1180 1180">
    <rect width="1180" height="1080" fill="#ffffff"/>
    ${classBox(190, 20, 170, "Laboratoire", ["id: bigint", "nom", "adresse", "telephone", "email", "logo", "created_at"])}
    ${classBox(180, 250, 180, "User", ["id: bigint", "nom", "prenom", "email", "mot_de_passe", "role", "telephone", "photo", "statut"])}
    ${classBox(450, 250, 190, "Patient", ["id: bigint", "nom", "prenom", "cin", "date_naissance", "genre", "telephone", "adresse", "email"])}
    ${classBox(700, 280, 150, "Medecin", ["id: bigint", "nom", "prenom", "specialite", "telephone", "email"])}
    ${classBox(930, 310, 180, "TypeAnalyse", ["id: bigint", "nom", "description"])}
    ${classBox(940, 540, 180, "Analyse", ["id: bigint", "nom", "unite", "valeur_reference", "prix"])}
    ${classBox(510, 560, 180, "Examen", ["id: bigint", "reference", "date_examen", "statut", "commentaire", "montant_total"])}
    ${classBox(790, 800, 190, "LigneExamen", ["id: bigint", "valeur", "statut_validation"])}
    ${classBox(800, 1000, 190, "Resultat", ["id: bigint", "valeur_resultat", "interpretation", "date_validation"])}
    ${classBox(260, 555, 210, "RendezVous", ["id: bigint", "date_rendez_vous", "heure", "statut", "motif"])}
    ${classBox(520, 820, 180, "Notification", ["id: bigint", "type", "message", "date_envoi", "statut"])}
    ${classBox(0, 565, 170, "Historique", ["id: bigint", "action", "description", "date_action"])}
    ${line(275, 188, 275, 250, false)}
    ${text(285, 225, "possède", 14, 400, "start")}
    ${line(180, 380, 170, 650, false)}
    ${text(105, 520, "effectue", 14)}
    ${line(360, 405, 510, 620, false)}
    ${text(435, 520, "crée", 14)}
    ${line(545, 475, 545, 560, false)}
    ${text(575, 520, "possède", 14)}
    ${line(780, 455, 600, 560, false)}
    ${text(705, 520, "prescrit", 14)}
    ${line(930, 400, 650, 560, false)}
    ${text(790, 500, "concerne", 14)}
    ${line(1020, 400, 1030, 540, false)}
    ${text(1050, 500, "contient", 14)}
    ${line(610, 690, 790, 860, false)}
    ${text(700, 790, "contient", 14)}
    ${line(880, 930, 880, 1000, false)}
    ${text(900, 970, "génère", 14)}
    ${line(610, 690, 610, 820, false)}
    ${text(640, 765, "envoie", 14)}
    ${line(360, 430, 360, 555, false)}
    ${text(390, 510, "gère", 14)}
  </svg>`;
}

function sequenceSvg({ width, height, actorName, participants, messages, frames = [] }) {
  const top = 85;
  const bottom = height - 85;
  const step = (width - 240) / (participants.length - 1);
  const xs = participants.map((_, i) => 120 + i * step);
  const boxes = participants.map((p, i) => `
    <rect x="${xs[i] - 90}" y="55" width="180" height="38" rx="4" fill="#e8e8f3" stroke="#64748b"/>
    ${text(xs[i], 80, p, 15)}
    <line x1="${xs[i]}" y1="${top}" x2="${xs[i]}" y2="${bottom}" stroke="#64748b" stroke-dasharray="7 6"/>
    <rect x="${xs[i] - 90}" y="${bottom}" width="180" height="38" rx="4" fill="#e8e8f3" stroke="#64748b"/>
    ${text(xs[i], bottom + 25, p, 15)}
  `).join("");
  const msgXml = messages.map((m) => {
    const y = m.y;
    const from = xs[m.from];
    const to = xs[m.to];
    return `
      ${line(from, y, to, y, true, m.dashed)}
      ${text((from + to) / 2, y - 8, m.label, 15)}
    `;
  }).join("");
  const frameXml = frames.map((f) => `
    <rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="none" stroke="#111827" stroke-width="2"/>
    <path d="M${f.x},${f.y} h90 l-20,28 h-${70} z" fill="#ffffff" stroke="#111827" stroke-width="2"/>
    ${text(f.x + 42, f.y + 20, f.type, 15, 700)}
    ${text(f.x + 135, f.y + 23, f.guard, 15, 700, "start")}
    ${f.separator ? `<line x1="${f.x}" y1="${f.separator}" x2="${f.x + f.w}" y2="${f.separator}" stroke="#111827" stroke-dasharray="5 5"/>` : ""}
  `).join("");
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#ffffff"/>
    ${arrowMarker()}
    ${boxes}
    ${frameXml}
    ${msgXml}
  </svg>`;
}

const authSequence = () => sequenceSvg({
  width: 1050,
  height: 760,
  actorName: "Utilisateur interne",
  participants: ["Utilisateur interne", "Page Login (React)", "AuthController (Laravel)", "User (Model)", "Laravel Sanctum"],
  frames: [{ x: 220, y: 340, w: 760, h: 230, type: "alt", guard: "[mot de passe valide]", separator: 500 }],
  messages: [
    { from: 0, to: 1, y: 130, label: "saisir email + password" },
    { from: 1, to: 2, y: 170, label: "POST /api/login" },
    { from: 2, to: 2, y: 210, label: "validation des champs" },
    { from: 2, to: 3, y: 250, label: "findByEmail(email)" },
    { from: 3, to: 2, y: 290, label: "user data", dashed: true },
    { from: 2, to: 2, y: 325, label: "vérifier password (Hash)" },
    { from: 2, to: 4, y: 385, label: "générer token" },
    { from: 4, to: 2, y: 425, label: "token", dashed: true },
    { from: 2, to: 1, y: 465, label: "token + user role", dashed: true },
    { from: 1, to: 1, y: 500, label: "stocker token" },
    { from: 1, to: 1, y: 535, label: "redirection selon rôle" },
    { from: 2, to: 1, y: 545, label: "erreur authentification", dashed: true },
  ],
});

const createExamSequence = () => sequenceSvg({
  width: 1500,
  height: 720,
  actorName: "Préleveur",
  participants: ["Préleveur", "Dashboard Préleveur (React)", "ExamenController (Laravel)", "Patient (Model)", "Examen (Model)", "Analyse (Model)", "LigneExamen (Model)"],
  frames: [{ x: 570, y: 390, w: 830, h: 65, type: "loop", guard: "[pour chaque analyse]" }],
  messages: [
    { from: 0, to: 1, y: 130, label: "choisir patient + type d'analyse" },
    { from: 1, to: 2, y: 170, label: "POST /api/examens (patient_id, type_analyse_id)" },
    { from: 2, to: 2, y: 220, label: "validation des données" },
    { from: 2, to: 3, y: 260, label: "vérifier patient_id" },
    { from: 3, to: 2, y: 300, label: "patient OK", dashed: true },
    { from: 2, to: 4, y: 340, label: "créer examen" },
    { from: 4, to: 2, y: 380, label: "examen créé (id + référence)", dashed: true },
    { from: 2, to: 5, y: 420, label: "récupérer analyses liées au type" },
    { from: 5, to: 2, y: 460, label: "liste analyses", dashed: true },
    { from: 2, to: 6, y: 520, label: "créer ligne examen" },
    { from: 6, to: 2, y: 560, label: "lignes créées", dashed: true },
    { from: 2, to: 1, y: 610, label: "référence examen + succès", dashed: true },
  ],
});

const resultsSequence = () => sequenceSvg({
  width: 1200,
  height: 760,
  actorName: "Biologiste",
  participants: ["Biologiste", "Dashboard Biologiste (React)", "ExamenController (Laravel)", "LigneExamen (Model)", "Examen (Model)", "Service Email"],
  frames: [{ x: 430, y: 330, w: 470, h: 70, type: "loop", guard: "[pour chaque ligne]" }],
  messages: [
    { from: 0, to: 1, y: 130, label: "consulter examens validés" },
    { from: 1, to: 2, y: 170, label: "GET /api/examens?status=validé" },
    { from: 2, to: 1, y: 215, label: "liste des examens", dashed: true },
    { from: 0, to: 1, y: 260, label: "saisir résultats" },
    { from: 1, to: 2, y: 300, label: "POST /api/examens/{id}/resultats" },
    { from: 2, to: 2, y: 350, label: "validation des données" },
    { from: 2, to: 3, y: 390, label: "update valeur_resultat" },
    { from: 2, to: 4, y: 450, label: "update statut = en_validation" },
    { from: 4, to: 2, y: 490, label: "examen mis à jour", dashed: true },
    { from: 0, to: 1, y: 545, label: "approuver examen" },
    { from: 1, to: 2, y: 585, label: "PATCH /api/examens/{id}/approve" },
    { from: 2, to: 4, y: 625, label: "update statut = termine" },
    { from: 2, to: 5, y: 665, label: "envoyer résultat au patient" },
    { from: 2, to: 1, y: 705, label: "confirmation approbation", dashed: true },
  ],
});

const appointmentSequence = () => sequenceSvg({
  width: 1040,
  height: 700,
  actorName: "Patient",
  participants: ["Patient", "Page Rendez-vous (React)", "API Rendez-vous Controller (Laravel)", "Cache Laravel", "Mail Laravel"],
  frames: [{ x: 120, y: 420, w: 630, h: 150, type: "alt", guard: "[code valide]", separator: 520 }],
  messages: [
    { from: 0, to: 1, y: 130, label: "saisir informations RDV" },
    { from: 1, to: 2, y: 170, label: "POST /api/rendezvous/send-code" },
    { from: 2, to: 2, y: 220, label: "générer code de vérification" },
    { from: 2, to: 3, y: 260, label: "stocker code temporaire" },
    { from: 2, to: 4, y: 300, label: "envoyer code par email" },
    { from: 4, to: 0, y: 345, label: "réception du code", dashed: true },
    { from: 0, to: 1, y: 390, label: "saisir code reçu" },
    { from: 1, to: 2, y: 430, label: "POST /api/rendezvous/store" },
    { from: 2, to: 3, y: 470, label: "récupérer code stocké" },
    { from: 2, to: 2, y: 515, label: "créer rendez-vous" },
    { from: 2, to: 1, y: 555, label: "RDV enregistré avec succès", dashed: true },
    { from: 2, to: 1, y: 600, label: "erreur code invalide", dashed: true },
  ],
});

async function renderSvg(browser, svg, outputPath, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(`<html><body style="margin:0;background:white">${svg}</body></html>`);
  await page.screenshot({ path: outputPath, fullPage: true });
  await page.close();
}

async function launchBrowser() {
  const attempts = [{}, { channel: "msedge" }, { channel: "chrome" }];
  let lastError;
  for (const options of attempts) {
    try {
      return await chromium.launch({ headless: true, ...options });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function startServer() {
  const cmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(cmd, ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"], {
    cwd: FRONTEND_DIR,
    stdio: "pipe",
    shell: process.platform === "win32",
  });
  child.stdout.on("data", () => {});
  child.stderr.on("data", () => {});
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return child;
    } catch {
      await delay(500);
    }
  }
  throw new Error("Vite dev server did not start on port 5173.");
}

function stopServer(child) {
  if (!child?.pid) return;
  if (process.platform === "win32") {
    try {
      execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: "ignore" });
    } catch {
      child.kill();
    }
  } else {
    child.kill("SIGTERM");
  }
}

const patients = [
  { id: 1, nom: "Alaoui", prenom: "Yassine", cin: "AB12345", telephone: "0611223344", sexe: "M", date_naissance: "1998-04-12" },
  { id: 2, nom: "El Amrani", prenom: "Sara", cin: "BK44556", telephone: "0677889900", sexe: "F", date_naissance: "2001-09-23" },
  { id: 3, nom: "Bennani", prenom: "Nora", cin: "CD77889", telephone: "0655443322", sexe: "F", date_naissance: "1989-02-18" },
];

const examLines = [
  { id: 1, valeur_resultat: "0.92", commentaire: "Normal", analyse: { designation: "Glycémie", unite_mesure: "g/L", norme_min: 0.7, norme_max: 1.1 } },
  { id: 2, valeur_resultat: "13.8", commentaire: "Normal", analyse: { designation: "Hémoglobine", unite_mesure: "g/dL", norme_min: 12, norme_max: 17 } },
  { id: 3, valeur_resultat: "245", commentaire: "Normal", analyse: { designation: "Plaquettes", unite_mesure: "G/L", norme_min: 150, norme_max: 400 } },
];

const exams = [
  { id: 1, reference: "EX-2026-0001", statut: "valide", patient: patients[0], type_analyse: { libelle: "Bilan sanguin" }, lignes: examLines },
  { id: 2, reference: "EX-2026-0002", statut: "en_cours", patient: patients[1], type_analyse: { libelle: "Glycémie" }, lignes: [examLines[0]] },
  { id: 3, reference: "EX-2026-0003", statut: "en_validation", patient: patients[2], type_analyse: { libelle: "NFS" }, lignes: examLines },
];

const resultExam = {
  ...exams[0],
  statut: "termine",
  date_examen: "2026-05-19",
  patient: { ...patients[0], email: "yassine.alaoui@example.com" },
};

async function mockApi(context) {
  await context.route(/projet_pff\.test\/api/i, async (route) => {
    const url = route.request().url().toLowerCase();
    const method = route.request().method();
    let body = { success: true };
    if (url.includes("/admin/stats")) {
      body = {
        cards: { total_patients: 128, analyses_validees: 86, en_cours: 14 },
        graph: [
          { name: "Jan", analyses: 22 },
          { name: "Fév", analyses: 34 },
          { name: "Mar", analyses: 48 },
          { name: "Avr", analyses: 41 },
          { name: "Mai", analyses: 57 },
        ],
      };
    } else if (url.includes("/patients")) {
      body = patients;
    } else if (url.includes("/examens-today")) {
      body = exams;
    } else if (url.includes("/examens-biologiste")) {
      body = [exams[0], exams[1]];
    } else if (url.includes("/examens-validation")) {
      body = [exams[2]];
    } else if (url.includes("/examens-historique")) {
      body = [{ ...exams[0], statut: "termine" }];
    } else if (url.includes("/examens/results/")) {
      body = { success: true, examen: resultExam };
    } else if (url.includes("/api/me")) {
      body = { id: 2, name: "Dr. Salma Biologiste", role: "biologiste" };
    } else if (url.includes("/analyses")) {
      body = [
        { id: 1, libelle: "Bilan sanguin" },
        { id: 2, libelle: "Glycémie" },
        { id: 3, libelle: "NFS" },
      ];
    } else if (method === "POST" && url.includes("/rendezvous/send-code")) {
      body = { status: "success", message: "Code envoyé avec succès" };
    } else if (method === "POST" && url.includes("/rendezvous/store")) {
      body = { status: "success", message: "Rendez-vous enregistré" };
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

async function screenshot(browser, routePath, outputName, user = null, extraStorage = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await mockApi(context);
  await context.addInitScript(({ currentUser, storage }) => {
    localStorage.setItem("i18nextLng", "fr");
    if (currentUser) {
      localStorage.setItem("token", "demo-token");
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
    Object.entries(storage).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
  }, { currentUser: user, storage: extraStorage });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}${routePath}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, outputName), fullPage: false });
  await context.close();
}

async function main() {
  await ensureDirs();
  const diagramsOnly = process.argv.includes("--diagrams-only");
  const browser = await launchBrowser();
  await renderSvg(browser, useCaseSvg(), path.join(DIAGRAM_DIR, "use_case_systeme_labo.png"), 900, 2380);
  await renderSvg(browser, classDiagramSvg(), path.join(DIAGRAM_DIR, "class_diagram.png"), 1180, 1180);
  await renderSvg(browser, authSequence(), path.join(DIAGRAM_DIR, "auth_sequence.png"), 1050, 760);
  await renderSvg(browser, createExamSequence(), path.join(DIAGRAM_DIR, "create_exam_sequence.png"), 1500, 720);
  await renderSvg(browser, resultsSequence(), path.join(DIAGRAM_DIR, "results_validation_sequence.png"), 1200, 760);
  await renderSvg(browser, appointmentSequence(), path.join(DIAGRAM_DIR, "appointment_sequence.png"), 1040, 700);
  if (diagramsOnly) {
    await browser.close();
    return;
  }

  let server;
  try {
    server = await startServer();
    await screenshot(browser, "/login", "login.png");
    await screenshot(browser, "/prendre-rendez-vous", "appointment.png");
    await screenshot(browser, "/dashboard/admin", "admin_dashboard.png", { id: 1, name: "Admin Helix", role: "admin" });
    await screenshot(browser, "/dashboard/preleveur", "preleveur_dashboard.png", { id: 3, name: "Ibrahim Preleveur", role: "preleveur" });
    await screenshot(browser, "/dashboard/biologiste", "biologiste_dashboard.png", { id: 2, name: "Dr. Salma", role: "biologiste" });
    await screenshot(
      browser,
      "/mes-resultats",
      "patient_results.png",
      { role: "patient" },
      { currentExamen: { id: 1, reference: "EX-2026-0001" } },
    );
  } finally {
    stopServer(server);
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
