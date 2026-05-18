const fs = require("fs");
const path = require("path");
const { chromium } = require(path.resolve(__dirname, "..", "frontend", "node_modules", "@playwright", "test"));

const baseUrl = process.env.PRESENTATION_BASE_URL || "http://127.0.0.1:5173";
const outDir = path.resolve(__dirname, "..", ".presentation_assets", "screenshots");

const json = (data) => ({
  status: 200,
  contentType: "application/json",
  headers: { "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(data),
});

const mockExamens = [
  {
    id: 1,
    reference: "EX-2026-0001",
    statut: "valide",
    patient: { nom: "El Amrani", prenom: "Nora", telephone: "0612345678", sexe: "F", date_naissance: "1998-04-12" },
    type_analyse: { libelle: "Biochimie" },
    lignes: [
      { id: 11, valeur_resultat: "0.92", commentaire: "Normal", analyse: { designation: "Glycemie", norme_min: 0.7, norme_max: 1.1, unite_mesure: "g/L", typeAnalyse: { libelle: "Biochimie" } } },
      { id: 12, valeur_resultat: "14.1", commentaire: "", analyse: { designation: "Hemoglobine", norme_min: 12, norme_max: 17, unite_mesure: "g/dL", typeAnalyse: { libelle: "Hematologie" } } },
    ],
  },
  {
    id: 2,
    reference: "EX-2026-0002",
    statut: "en_cours",
    patient: { nom: "Bennani", prenom: "Youssef", telephone: "0698765432", sexe: "M", date_naissance: "1987-09-21" },
    type_analyse: { libelle: "Hematologie" },
    lignes: [
      { id: 21, valeur_resultat: null, commentaire: "", analyse: { designation: "Plaquettes", norme_min: 150, norme_max: 400, unite_mesure: "G/L", typeAnalyse: { libelle: "Hematologie" } } },
    ],
  },
];

const routeApi = async (page) => {
  await page.route("**/api/**", async (route) => {
    const url = route.request().url().toLowerCase();

    if (url.includes("/admin/stats")) {
      return route.fulfill(json({
        cards: { total_patients: 128, analyses_validees: 84, en_cours: 17 },
        graph: [
          { name: "Jan", analyses: 18 },
          { name: "Fev", analyses: 22 },
          { name: "Mar", analyses: 30 },
          { name: "Avr", analyses: 26 },
          { name: "Mai", analyses: 34 },
        ],
      }));
    }

    if (url.includes("/me")) {
      return route.fulfill(json({ id: 2, name: "Dr. Anas", nom_complet: "Dr. Anas", role: "biologiste" }));
    }

    if (url.includes("/patients")) {
      return route.fulfill(json([
        { id: 1, nom: "El Amrani", prenom: "Nora", cin: "AB12345", telephone: "0612345678", sexe: "F", date_naissance: "1998-04-12" },
        { id: 2, nom: "Bennani", prenom: "Youssef", cin: "CD67890", telephone: "0698765432", sexe: "M", date_naissance: "1987-09-21" },
        { id: 3, nom: "Alaoui", prenom: "Salma", cin: "EF44556", telephone: "0600112233", sexe: "F", date_naissance: "2001-01-19" },
      ]));
    }

    if (url.includes("/examens-today")) {
      return route.fulfill(json(mockExamens));
    }

    if (url.includes("/examens-biologiste")) {
      return route.fulfill(json(mockExamens.filter((examen) => examen.statut === "valide")));
    }

    if (url.includes("/examens-validation")) {
      return route.fulfill(json([{ ...mockExamens[0], statut: "en_validation" }]));
    }

    if (url.includes("/examens-historique")) {
      return route.fulfill(json([{ ...mockExamens[0], statut: "termine" }]));
    }

    if (url.includes("/rendezvous")) {
      return route.fulfill(json([
        { id: 1, nom: "Mansouri", prenom: "Adam", telephone: "0600998877", email: "adam@example.com", date_rendez_vous: "2026-05-20", statut: "en_cours" },
        { id: 2, nom: "Rachidi", prenom: "Imane", telephone: "0611223344", email: "imane@example.com", date_rendez_vous: "2026-05-21", statut: "valide" },
      ]));
    }

    if (url.includes("/analyses")) {
      return route.fulfill(json([
        { id: 1, designation: "Glycemie", libelle: "Biochimie", unite_mesure: "g/L" },
        { id: 2, designation: "Hemoglobine", libelle: "Hematologie", unite_mesure: "g/dL" },
      ]));
    }

    return route.fulfill(json({ success: true }));
  });
};

const capture = async (browser, name, routePath, user) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  if (user) {
    await context.addInitScript((u) => {
      window.localStorage.setItem("token", "presentation-demo-token");
      window.localStorage.setItem("user", JSON.stringify(u));
    }, user);
  }

  const page = await context.newPage();
  await routeApi(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: false });
  await context.close();
};

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const launchOptions = fs.existsSync(edgePath) ? { executablePath: edgePath } : {};
  const browser = await chromium.launch(launchOptions);
  try {
    await capture(browser, "login", "/login");
    await capture(browser, "appointment", "/prendre-rendez-vous");
    await capture(browser, "admin_dashboard", "/dashboard/admin", { id: 1, name: "Yassine Admin", role: "admin" });
    await capture(browser, "preleveur_dashboard", "/dashboard/preleveur", { id: 3, name: "Ibrahim Preleveur", role: "preleveur" });
    await capture(browser, "biologiste_dashboard", "/dashboard/biologiste", { id: 2, name: "Dr. Anas", role: "biologiste" });
  } finally {
    await browser.close();
  }
})();
