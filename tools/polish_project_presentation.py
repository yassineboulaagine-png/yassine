from __future__ import annotations

import zipfile
from pathlib import Path

import generate_project_presentation as base


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "improved_project_presentation.pptx"

base.COLORS.update(
    {
        "bg": "F7FAFC",
        "panel": "FFFFFF",
        "ink": "0B1220",
        "cyan": "0EA5E9",
        "teal": "14B8A6",
        "pale_blue": "EAF3FF",
        "pale_green": "ECFDF5",
        "pale_indigo": "EEF2FF",
        "pale_orange": "FFF7ED",
        "pale_red": "FEF2F2",
    }
)
C = base.COLORS


def grad_rect(slide, x, y, w, h, c1, c2, radius=True, sid=None, stroke=None, shadow=False, angle=5400000):
    sid = sid or slide.shape_id()
    prst = "roundRect" if radius else "rect"
    effect = base.shadow(12000, 120000, 30000) if shadow else ""
    slide.add(
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="Gradient Panel"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
        f'<p:spPr>{base.xfrm(x, y, w, h)}<a:prstGeom prst="{prst}"><a:avLst/></a:prstGeom>'
        f'{base.gradient(c1, c2, angle)}{base.line(stroke) if stroke else base.line(None)}{effect}</p:spPr>'
        f'<p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>'
    )


def background(slide, dark=False):
    if dark:
        slide.add(base.rect(0, 0, base.SLIDE_W_IN, base.SLIDE_H_IN, C["navy"], None, sid=slide.shape_id()))
        grad_rect(slide, 0, 0, base.SLIDE_W_IN, base.SLIDE_H_IN, "07111F", "102A43", radius=False, sid=slide.shape_id())
        slide.add(base.rect(0, 0, base.SLIDE_W_IN, 0.08, C["blue"], None, sid=slide.shape_id()))
    else:
        slide.add(base.rect(0, 0, base.SLIDE_W_IN, base.SLIDE_H_IN, C["bg"], None, sid=slide.shape_id()))
        slide.add(base.rect(0, 0, base.SLIDE_W_IN, 0.11, C["blue"], None, sid=slide.shape_id(), alpha=92000))
        slide.add(base.rect(0, 7.16, base.SLIDE_W_IN, 0.34, "EEF5FF", None, sid=slide.shape_id(), alpha=54000))
        slide.add(base.rect(0.58, 1.38, 0.05, 5.22, C["blue"], None, radius=True, sid=slide.shape_id(), alpha=52000))


def logo(slide, x, y, dark=False, size=15):
    left = C["white"] if dark else C["ink"]
    slide.add(base.text_box(x, y, 0.64, 0.24, "Helix", size, left, True, sid=slide.shape_id(), margin=0))
    slide.add(base.text_box(x + 0.52, y, 0.42, 0.24, "Lab", size, C["blue2"] if dark else C["blue"], True, sid=slide.shape_id(), margin=0))


def footer(slide, n, dark=False):
    color = "BFD7FF" if dark else C["slate"]
    slide.add(base.text_box(0.74, 7.05, 1.3, 0.18, "Helix Lab", 7.5, color, True, sid=slide.shape_id(), margin=0))
    slide.add(base.text_box(12.25, 7.05, 0.45, 0.18, f"{n:02d}", 7.5, color, True, "r", sid=slide.shape_id(), margin=0))


def header(slide, n, title, kicker, dark=False):
    logo(slide, 0.78, 0.38, dark=dark)
    color = C["white"] if dark else C["ink"]
    muted = "BFD7FF" if dark else C["slate"]
    slide.add(base.text_box(0.78, 0.85, 5.4, 0.22, kicker.upper(), 7.8, muted, True, sid=slide.shape_id(), margin=0))
    slide.add(base.text_box(0.76, 1.08, 8.6, 0.52, title, 26.5, color, True, sid=slide.shape_id(), margin=0))
    slide.add(base.rect(0.78, 1.72, 0.66, 0.045, C["blue"], None, radius=True, sid=slide.shape_id()))
    slide.add(base.rect(1.52, 1.72, 0.34, 0.045, C["green2"], None, radius=True, sid=slide.shape_id()))
    footer(slide, n, dark=dark)


def small_label(slide, x, y, text, color=C["blue"], fill="EFF6FF"):
    slide.add(base.text_box(x, y, 1.28, 0.3, text, 8, color, True, "ctr", "mid", sid=slide.shape_id(), fill=fill, stroke=None, radius=True, margin=0.03))


def premium_card(slide, x, y, w, h, heading, body, accent=C["blue"], label=None, fill=C["white"]):
    slide.add(base.rect(x, y, w, h, fill, "D9E3EF", radius=True, sid=slide.shape_id(), shadowed=True))
    slide.add(base.rect(x + 0.18, y + 0.17, 0.06, h - 0.34, accent, None, radius=True, sid=slide.shape_id()))
    if label:
        slide.add(base.ellipse(x + 0.42, y + 0.22, 0.42, 0.42, accent, None, slide.shape_id(), alpha=17000))
        slide.add(base.text_box(x + 0.47, y + 0.28, 0.32, 0.16, label, 9, C["white"], True, "ctr", "mid", sid=slide.shape_id(), margin=0))
        tx = x + 0.94
        tw = w - 1.18
    else:
        tx = x + 0.42
        tw = w - 0.68
    slide.add(base.text_box(tx, y + 0.22, tw, 0.27, heading, 12.3, C["ink"], True, sid=slide.shape_id(), margin=0))
    slide.add(base.text_box(tx, y + 0.58, tw, h - 0.76, body, 8.8, C["muted"], False, sid=slide.shape_id(), margin=0))


def stat_card(slide, x, y, value, label, color, fill):
    slide.add(base.rect(x, y, 2.24, 0.92, fill, "D9E3EF", radius=True, sid=slide.shape_id(), shadowed=True))
    slide.add(base.text_box(x + 0.18, y + 0.18, 1.86, 0.22, label.upper(), 7.2, C["slate"], True, "ctr", sid=slide.shape_id(), margin=0))
    slide.add(base.text_box(x + 0.18, y + 0.42, 1.86, 0.34, value, 20.5, color, True, "ctr", sid=slide.shape_id(), margin=0))


def chrome_frame(slide, media, x, y, w, h, label, caption):
    outer_h = h + 0.38
    slide.add(base.rect(x - 0.08, y - 0.08, w + 0.16, outer_h + 0.18, C["white"], "D5E0EF", radius=True, sid=slide.shape_id(), shadowed=True))
    slide.add(base.rect(x, y, w, 0.28, "F1F5F9", None, radius=True, sid=slide.shape_id()))
    for i, c in enumerate(["EF4444", "F59E0B", "22C55E"]):
        slide.add(base.ellipse(x + 0.16 + i * 0.16, y + 0.1, 0.07, 0.07, c, None, slide.shape_id(), alpha=85000))
    slide.add(base.rect(x + 0.62, y + 0.09, w - 1.05, 0.1, "CBD5E1", None, radius=True, sid=slide.shape_id(), alpha=52000))
    slide.add(base.rect(x, y + 0.28, w, h - 0.28, "F8FAFC", None, sid=slide.shape_id()))
    avail_w = w
    avail_h = max(0.1, h - 0.28)
    target_aspect = 1.6
    img_w = min(avail_w, avail_h * target_aspect)
    img_h = img_w / target_aspect
    img_x = x + (avail_w - img_w) / 2
    img_y = y + 0.28 + (avail_h - img_h) / 2
    slide.add_image(media, img_x, img_y, img_w, img_h, name=label)
    slide.add(base.text_box(x, y + h + 0.13, w, 0.2, label, 8.4, C["ink"], True, "ctr", sid=slide.shape_id(), margin=0))
    slide.add(base.text_box(x + 0.1, y + h + 0.34, w - 0.2, 0.19, caption, 7.1, C["slate"], False, "ctr", sid=slide.shape_id(), margin=0))


def node(slide, x, y, w, title, sub, color):
    slide.add(base.rect(x, y, w, 0.78, C["white"], "D9E3EF", radius=True, sid=slide.shape_id(), shadowed=True))
    slide.add(base.ellipse(x + 0.18, y + 0.19, 0.38, 0.38, color, None, slide.shape_id(), alpha=20000))
    slide.add(base.text_box(x + 0.68, y + 0.14, w - 0.84, 0.24, title, 10.8, C["ink"], True, sid=slide.shape_id(), margin=0))
    slide.add(base.text_box(x + 0.68, y + 0.43, w - 0.84, 0.22, sub, 7.4, C["slate"], False, sid=slide.shape_id(), margin=0))


def connector(slide, x, y, w, color="CBD5E1"):
    slide.add(base.rect(x, y, w, 0.025, color, None, radius=True, sid=slide.shape_id()))
    slide.add(base.text_box(x + w - 0.04, y - 0.095, 0.18, 0.2, ">", 10, color, True, "ctr", sid=slide.shape_id(), margin=0))


def slide1():
    s = base.Slide(1, C["navy"])
    background(s, dark=True)
    grad_rect(s, 7.25, 0, 6.08, 7.5, "0F2747", "07111F", radius=False, sid=s.shape_id(), angle=0)
    s.add_image("lab", 7.05, 0, 6.28, 7.5, "Laboratory visual")
    s.add(base.rect(7.05, 0, 6.28, 7.5, C["navy"], None, sid=s.shape_id(), alpha=25000))
    logo(s, 0.82, 0.58, dark=True, size=18)
    small_label(s, 0.86, 1.45, "PFE / PFA", C["blue2"], "123B66")
    s.add(base.text_box(0.82, 1.92, 5.55, 0.86, "Helix Lab", 46, C["white"], True, sid=s.shape_id(), margin=0))
    s.add(base.text_box(0.86, 2.76, 5.8, 0.38, "Système de gestion de laboratoire médical", 17, "BFD7FF", False, sid=s.shape_id(), margin=0))
    s.add(base.text_box(0.86, 3.36, 5.7, 0.58, "Gestion moderne des patients, analyses, rendez-vous et résultats biologiques.", 12.6, "D7E8FF", False, sid=s.shape_id(), margin=0))
    for x, text, col in [(0.86, "React", C["blue"]), (2.0, "Laravel", C["green2"]), (3.28, "Sanctum", C["indigo"])]:
        s.add(base.text_box(x, 4.35, 1.05, 0.33, text, 8.8, C["white"], True, "ctr", "mid", sid=s.shape_id(), fill=col, radius=True, margin=0.02))
    grad_rect(s, 5.72, 4.58, 3.2, 1.58, "FFFFFF", "EAF3FF", radius=True, sid=s.shape_id(), shadow=True)
    s.add(base.text_box(6.02, 4.86, 2.6, 0.28, "Plateforme web complète", 12.5, C["ink"], True, "ctr", sid=s.shape_id(), margin=0))
    s.add(base.text_box(6.0, 5.25, 2.62, 0.42, "Patients, rendez-vous, analyses, validation biologique et rapports PDF.", 8.6, C["muted"], False, "ctr", sid=s.shape_id(), margin=0))
    s.add(base.text_box(0.86, 6.22, 3.5, 0.22, "Équipe projet PFE/PFA", 9.3, "D7E8FF", True, sid=s.shape_id(), margin=0))
    s.add(base.text_box(0.86, 6.52, 2.8, 0.2, "Année académique 2025-2026", 8.5, "93C5FD", False, sid=s.shape_id(), margin=0))
    footer(s, 1, dark=True)
    return s


def slide2():
    s = base.Slide(2)
    background(s)
    header(s, 2, "Contexte du projet", "Pourquoi le système existe")
    s.add(base.text_box(0.9, 2.08, 5.75, 0.55, "Les laboratoires médicaux gèrent des données sensibles et urgentes entre accueil, prélèvement, validation biologique et communication patient.", 13.4, C["muted"], sid=s.shape_id(), margin=0))
    premium_card(s, 0.92, 3.0, 3.62, 1.18, "Pression opérationnelle", "Le suivi manuel rend difficile le contrôle des dossiers patients, des rendez-vous et des résultats prêts.", C["blue"], "01")
    premium_card(s, 4.83, 3.0, 3.62, 1.18, "Besoin de traçabilité", "Chaque examen doit posséder une référence claire, un statut, un responsable et un historique.", C["green2"], "02")
    premium_card(s, 8.74, 3.0, 3.62, 1.18, "Expérience patient", "Les patients ont besoin d’un accès simple aux rendez-vous et résultats sans appels répétitifs.", C["indigo"], "03")
    grad_rect(s, 0.92, 5.0, 11.44, 1.12, "0F172A", "143D66", radius=True, sid=s.shape_id(), shadow=True)
    s.add(base.text_box(1.28, 5.23, 2.0, 0.32, "Motivation", 17, C["white"], True, sid=s.shape_id(), margin=0))
    s.add(base.text_box(3.1, 5.18, 8.75, 0.48, "Construire une plateforme web centralisée qui relie les rôles du personnel, les flux biologiques, l’accès sécurisé et les rapports.", 12.3, "D7E8FF", False, sid=s.shape_id(), margin=0))
    stat_card(s, 7.15, 2.03, "4", "Rôles clés", C["blue"], C["pale_blue"])
    stat_card(s, 9.72, 2.03, "Complet", "Flux labo", C["green"], C["pale_green"])
    return s


def slide3():
    s = base.Slide(3)
    background(s)
    header(s, 3, "Objectifs et bénéfices", "Proposition de valeur")
    chrome_frame(s, "appointment", 8.18, 1.72, 4.1, 2.56, "Capture rendez-vous", "Demande publique avec vérification par e-mail")
    goals = [
        ("Digitaliser le flux laboratoire", "Créer, suivre et valider les examens avec une chaîne de statuts structurée.", C["blue"]),
        ("Adapter chaque rôle", "Admin, préleveur, biologiste et patient disposent d’accès séparés selon leurs besoins.", C["green2"]),
        ("Améliorer la fiabilité", "Les références, validations et relations de données réduisent les erreurs opérationnelles.", C["indigo"]),
        ("Accélérer la restitution", "Les e-mails et rapports PDF automatisés réduisent le délai de communication des résultats.", C["orange"]),
    ]
    y = 2.02
    for i, (h, b, c) in enumerate(goals, 1):
        premium_card(s, 0.92, y, 6.55, 0.78, h, b, c, f"{i:02d}")
        y += 0.95
    grad_rect(s, 8.18, 5.05, 4.1, 0.9, "0F172A", "1E3A8A", radius=True, sid=s.shape_id(), shadow=True)
    s.add(base.text_box(8.5, 5.24, 3.45, 0.22, "Bénéfices clés", 11.5, C["white"], True, "ctr", sid=s.shape_id(), margin=0))
    s.add(base.text_box(8.5, 5.55, 3.45, 0.24, "Opérations rapides  |  Traçabilité  |  Meilleur service patient", 7.6, "D7E8FF", False, "ctr", sid=s.shape_id(), margin=0))
    return s


def slide4():
    s = base.Slide(4)
    background(s)
    header(s, 4, "Vue d’ensemble du système", "Architecture et flux métier")
    grad_rect(s, 0.92, 1.98, 11.45, 1.34, "FFFFFF", "F1F7FF", radius=True, sid=s.shape_id(), stroke="D9E3EF", shadow=True)
    node(s, 1.18, 2.28, 2.18, "Frontend React", "Tableaux, routes, UI", C["blue"])
    connector(s, 3.52, 2.67, 0.62)
    node(s, 4.32, 2.28, 2.18, "API Laravel", "Contrôleurs, Sanctum", C["green2"])
    connector(s, 6.66, 2.67, 0.62)
    node(s, 7.46, 2.28, 2.18, "Base de données", "Modèles Eloquent", C["indigo"])
    connector(s, 9.8, 2.67, 0.54)
    node(s, 10.52, 2.28, 1.55, "Services", "E-mail, PDF", C["orange"])
    premium_card(s, 0.92, 4.02, 5.75, 1.66, "Flux applicatif", "1. Le patient demande un rendez-vous ou le personnel crée un dossier\n2. Le préleveur enregistre l’examen et valide le prélèvement\n3. Le biologiste saisit, vérifie et approuve les résultats\n4. Le patient consulte ses résultats et le PDF par référence", C["blue"], None)
    chrome_frame(s, "admin", 7.12, 3.88, 4.82, 3.01, "Capture tableau de bord", "Vue administrateur avec cartes et graphiques")
    return s


def slide5():
    s = base.Slide(5)
    background(s)
    header(s, 5, "Technologies utilisées", "Stack détectée automatiquement")
    groups = [
        ("Interface web", "React 18, Vite, structure compatible TypeScript, React Router, React Query, axios, i18next", C["blue"], "WEB", 0.92, 2.02),
        ("Interface & UX", "Tailwind CSS, shadcn/Radix UI, lucide-react, toasts, Recharts, CSS responsive", C["indigo"], "UX", 6.83, 2.02),
        ("Serveur API", "Laravel 12, PHP 8.2, tokens Sanctum, Eloquent ORM, validation, Mailables, DomPDF", C["green2"], "API", 0.92, 3.72),
        ("Données & outils", "SQLite par défaut avec support MySQL/MariaDB, migrations, seeders, Composer, npm, Vitest, PHPUnit, Playwright", C["orange"], "BDD", 6.83, 3.72),
    ]
    for h, body, col, lab, x, y in groups:
        premium_card(s, x, y, 5.48, 1.22, h, body, col, lab)
    grad_rect(s, 0.92, 5.77, 11.39, 0.72, "0F172A", "133E63", radius=True, sid=s.shape_id(), shadow=True)
    s.add(base.text_box(1.25, 5.94, 10.7, 0.24, "Système visuel détecté : police Inter, surfaces claires, texte slate, bleu #2563EB, sidebars par rôle, cartes arrondies et ombres subtiles.", 9.4, "D7E8FF", False, "ctr", sid=s.shape_id(), margin=0))
    palette = [(1.18, C["blue"], "#2563EB"), (2.2, C["green2"], "#22C55E"), (3.22, C["indigo"], "#312E81"), (4.24, C["slate"], "Slate")]
    for x, col, label in palette:
        s.add(base.rect(x, 6.67, 0.22, 0.12, col, None, radius=True, sid=s.shape_id()))
        s.add(base.text_box(x + 0.28, 6.61, 0.8, 0.18, label, 6.8, C["slate"], False, sid=s.shape_id(), margin=0))
    return s


def slide6():
    s = base.Slide(6)
    background(s)
    header(s, 6, "Authentification et sécurité", "Contrôle d’accès")
    grad_rect(s, 0.92, 1.98, 11.42, 1.25, "0F172A", "123E62", radius=True, sid=s.shape_id(), shadow=True)
    node(s, 1.25, 2.22, 2.0, "Connexion", "E-mail + mot de passe", C["blue"])
    connector(s, 3.42, 2.6, 0.58, "8DB5D9")
    node(s, 4.18, 2.22, 2.12, "Sanctum", "Token Bearer", C["green2"])
    connector(s, 6.48, 2.6, 0.58, "8DB5D9")
    node(s, 7.24, 2.22, 2.14, "Routes protégées", "Admin / Bio / Prév.", C["indigo"])
    connector(s, 9.56, 2.6, 0.5, "8DB5D9")
    node(s, 10.24, 2.22, 1.78, "API", "Routes sécurisées", C["orange"])
    items = [
        ("Sécurité mot de passe", "Laravel vérifie et hache les identifiants avant la création du token.", C["blue"], C["pale_blue"]),
        ("Séparation des rôles", "Les guards React redirigent les utilisateurs non autorisés.", C["indigo"], C["pale_indigo"]),
        ("Protection API", "Les opérations sensibles passent par le middleware auth:sanctum.", C["green2"], C["pale_green"]),
        ("Accès patient", "Référence + téléphone limitent l’accès au dossier concerné.", C["orange"], C["pale_orange"]),
        ("Vérification", "Le rendez-vous utilise un code e-mail à 4 chiffres valable 10 minutes.", C["red"], C["pale_red"]),
    ]
    x = 0.92
    for title, body, col, fill in items:
        premium_card(s, x, 4.02, 2.08, 1.38, title, body, col, None, fill)
        x += 2.32
    s.add(base.text_box(1.05, 5.92, 10.95, 0.28, "La sécurité est appliquée sur les deux couches : routes React protégées côté interface et routes Laravel sécurisées côté serveur.", 9.1, C["slate"], False, "ctr", sid=s.shape_id(), margin=0))
    return s


def slide7():
    s = base.Slide(7)
    background(s)
    header(s, 7, "Présentation de l’interface", "Identité UI/UX")
    chrome_frame(s, "login", 0.92, 1.95, 5.25, 3.28, "Connexion & accès patient", "Interface claire avec identité visuelle médicale")
    chrome_frame(s, "admin", 6.68, 1.95, 5.4, 3.38, "Tableau de bord admin", "Cartes, graphiques et navigation par rôle")
    grad_rect(s, 0.92, 6.02, 11.16, 0.58, "FFFFFF", "EEF6FF", radius=True, sid=s.shape_id(), stroke="D9E3EF", shadow=True)
    s.add(base.text_box(1.25, 6.16, 1.55, 0.2, "Langage visuel", 9.7, C["ink"], True, sid=s.shape_id(), margin=0))
    s.add(base.text_box(2.85, 6.16, 8.85, 0.2, "Espace clair, texte contrasté, bleu d’action, sidebars par rôle, tableaux compacts, contrôles arrondis et rendu responsive.", 8.2, C["muted"], False, sid=s.shape_id(), margin=0))
    return s


def slide8():
    s = base.Slide(8)
    background(s)
    header(s, 8, "Fonctionnalités principales", "Couverture fonctionnelle")
    chrome_frame(s, "preleveur", 0.92, 1.86, 5.34, 3.34, "Espace préleveur", "Liste patients, création d’examen et statut du prélèvement")
    chrome_frame(s, "biologiste", 6.84, 1.86, 5.34, 3.34, "Espace biologiste", "Saisie des résultats, validation et historique")
    features = [("Patients", C["blue"]), ("Rendez-vous", C["green2"]), ("Analyses", C["indigo"]), ("Validation", C["orange"]), ("PDF / E-mail", C["red"])]
    x = 1.0
    for label, color in features:
        s.add(base.text_box(x, 6.12, 2.0, 0.34, label, 8.9, C["white"], True, "ctr", "mid", sid=s.shape_id(), fill=color, radius=True, margin=0.03))
        x += 2.24
    s.add(base.text_box(1.05, 6.68, 11.0, 0.21, "Le projet couvre tout le parcours : accueil patient, prélèvement, validation biologique et restitution des résultats.", 8.5, C["slate"], False, "ctr", sid=s.shape_id(), margin=0))
    return s


def slide9():
    s = base.Slide(9)
    background(s)
    header(s, 9, "Base de données et implémentation", "Modèle technique")
    entities = [
        ("laboratoires", "1 -> N utilisateurs", C["blue"]),
        ("utilisateurs", "rôles + tokens", C["green2"]),
        ("patients", "identité + contact", C["indigo"]),
        ("examens", "référence + statut", C["orange"]),
        ("ligne_examens", "valeurs d’analyse", C["blue"]),
        ("resultats", "validation finale", C["green2"]),
        ("rendez_vous", "flux rendez-vous", C["indigo"]),
        ("factures / notifications", "tables support", C["orange"]),
    ]
    coords = [(0.92, 2.02), (3.75, 2.02), (6.58, 2.02), (9.41, 2.02), (0.92, 3.16), (3.75, 3.16), (6.58, 3.16), (9.41, 3.16)]
    for (name, sub, color), (x, y) in zip(entities, coords):
        node(s, x, y, 2.24, name, sub, color)
    premium_card(s, 0.92, 4.72, 5.72, 1.25, "Points techniques clés", "Relations Eloquent, références d’examen automatiques, lignes générées par type d’analyse, statuts métier et réponses API avec relations chargées.", C["blue"], None)
    chrome_frame(s, "biologiste", 7.5, 4.0, 3.55, 2.5, "Capture implémentation", "Données d’examen visibles dans l’espace par rôle")
    return s


def slide10():
    s = base.Slide(10, C["navy"])
    background(s, dark=True)
    grad_rect(s, 8.72, 0.76, 3.78, 5.92, "FFFFFF", "EEF6FF", radius=True, sid=s.shape_id(), shadow=True)
    logo(s, 0.86, 0.62, dark=True, size=18)
    small_label(s, 0.9, 1.48, "Conclusion", C["blue2"], "123B66")
    s.add(base.text_box(0.86, 1.98, 6.75, 0.72, "Conclusion et perspectives", 34, C["white"], True, sid=s.shape_id(), margin=0))
    s.add(base.text_box(0.9, 2.98, 6.85, 0.55, "Helix Lab propose un flux numérique complet pour les opérations du laboratoire, du rendez-vous à la communication des résultats.", 12.2, "D7E8FF", False, sid=s.shape_id(), margin=0))
    premium_card(s, 0.9, 4.02, 3.35, 1.12, "Réalisations", "Une plateforme React/Laravel connectée avec tableaux de bord, API sécurisée, statistiques, PDF et e-mails.", C["blue"], "A")
    premium_card(s, 4.52, 4.02, 3.35, 1.12, "Impact du projet", "Une meilleure traçabilité, un travail plus rapide et une expérience plus professionnelle pour le personnel et les patients.", C["green2"], "B")
    s.add(base.text_box(9.05, 1.15, 2.92, 0.35, "Perspectives", 17, C["ink"], True, "ctr", sid=s.shape_id(), margin=0))
    next_steps = ["Statistiques avancées", "Notifications SMS / WhatsApp", "Interopérabilité HL7/FHIR", "Journal d’audit et suivi", "Déploiement cloud + CI"]
    y = 1.82
    for i, item in enumerate(next_steps, 1):
        s.add(base.ellipse(9.08, y + 0.03, 0.18, 0.18, C["blue"] if i % 2 else C["green2"], None, s.shape_id(), alpha=90000))
        s.add(base.text_box(9.4, y, 2.48, 0.22, item, 9.2, C["muted"], False, sid=s.shape_id(), margin=0))
        y += 0.58
    s.add(base.text_box(0.9, 6.28, 4.2, 0.42, "Merci", 26, C["white"], True, sid=s.shape_id(), margin=0))
    s.add(base.text_box(0.92, 6.78, 4.6, 0.24, "Questions et échange", 10.5, "93C5FD", sid=s.shape_id(), margin=0))
    footer(s, 10, dark=True)
    return s


def write_pptx():
    slides = [slide1(), slide2(), slide3(), slide4(), slide5(), slide6(), slide7(), slide8(), slide9(), slide10()]
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", base.content_types())
        z.writestr("_rels/.rels", base.relationships([
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>',
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>',
            '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>',
        ]))
        z.writestr("docProps/core.xml", base.core_xml())
        z.writestr("docProps/app.xml", base.app_xml().replace("<Slides>10</Slides>", "<Slides>10</Slides>"))
        z.writestr("ppt/presentation.xml", base.presentation_xml())
        z.writestr("ppt/_rels/presentation.xml.rels", base.presentation_rels())
        z.writestr("ppt/slideMasters/slideMaster1.xml", base.master_xml())
        z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", base.relationships([
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>',
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>',
        ]))
        z.writestr("ppt/slideLayouts/slideLayout1.xml", base.layout_xml())
        z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", base.relationships([
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>'
        ]))
        z.writestr("ppt/theme/theme1.xml", base.theme_xml())

        copied = set()
        for key, path in base.MEDIA_SRC.items():
            if path.exists():
                ext = path.suffix.lower().lstrip(".")
                arc = f"ppt/media/{key}.{ext}"
                if arc not in copied:
                    z.write(path, arc)
                    copied.add(arc)

        for slide in slides:
            z.writestr(f"ppt/slides/slide{slide.idx}.xml", slide.xml())
            z.writestr(f"ppt/slides/_rels/slide{slide.idx}.xml.rels", slide.rels_xml())


if __name__ == "__main__":
    write_pptx()
    print(OUT)
