from __future__ import annotations

import datetime as dt
import os
import posixpath
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "project_presentation.pptx"
MEDIA_SRC = {
    "lab": ROOT / "frontend" / "src" / "assets" / "lab-illustration.jpg",
    "login": ROOT / ".presentation_assets" / "screenshots" / "login.png",
    "appointment": ROOT / ".presentation_assets" / "screenshots" / "appointment.png",
    "admin": ROOT / ".presentation_assets" / "screenshots" / "admin_dashboard.png",
    "preleveur": ROOT / ".presentation_assets" / "screenshots" / "preleveur_dashboard.png",
    "biologiste": ROOT / ".presentation_assets" / "screenshots" / "biologiste_dashboard.png",
}

EMU = 914400
SLIDE_W_IN = 13.333333
SLIDE_H_IN = 7.5
SLIDE_W = int(SLIDE_W_IN * EMU)
SLIDE_H = int(SLIDE_H_IN * EMU)

P = "http://schemas.openxmlformats.org/presentationml/2006/main"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

COLORS = {
    "navy": "0F172A",
    "navy2": "111827",
    "blue": "2563EB",
    "blue2": "60A5FA",
    "green": "14532D",
    "green2": "22C55E",
    "indigo": "312E81",
    "slate": "64748B",
    "text": "0F172A",
    "muted": "475569",
    "line": "E2E8F0",
    "bg": "F8FAFC",
    "white": "FFFFFF",
    "orange": "EA580C",
    "amber": "F59E0B",
    "red": "EF4444",
    "soft_blue": "EFF6FF",
    "soft_green": "F0FDF4",
    "soft_indigo": "EEF2FF",
    "soft_orange": "FFF7ED",
}


def emu(v: float) -> int:
    return int(v * EMU)


def pct(v: float) -> str:
    return str(int(v * 1000))


def clean(text: str) -> str:
    return escape(str(text))


def solid(color: str, alpha: int | None = None) -> str:
    if alpha is None:
        return f'<a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
    return f'<a:solidFill><a:srgbClr val="{color}"><a:alpha val="{alpha}"/></a:srgbClr></a:solidFill>'


def no_fill() -> str:
    return "<a:noFill/>"


def line(color: str | None = None, width: int = 9525, alpha: int | None = None) -> str:
    if color is None:
        return "<a:ln><a:noFill/></a:ln>"
    return f'<a:ln w="{width}">{solid(color, alpha)}</a:ln>'


def shadow(alpha: int = 11000, blur: int = 90000, dist: int = 26000) -> str:
    return (
        f'<a:effectLst><a:outerShdw blurRad="{blur}" dist="{dist}" dir="5400000" '
        f'algn="ctr" rotWithShape="0"><a:srgbClr val="{COLORS["navy"]}">'
        f'<a:alpha val="{alpha}"/></a:srgbClr></a:outerShdw></a:effectLst>'
    )


def gradient(fill1: str, fill2: str, angle: int = 5400000) -> str:
    return (
        f'<a:gradFill flip="none" rotWithShape="1"><a:gsLst>'
        f'<a:gs pos="0"><a:srgbClr val="{fill1}"/></a:gs>'
        f'<a:gs pos="100000"><a:srgbClr val="{fill2}"/></a:gs>'
        f'</a:gsLst><a:lin ang="{angle}" scaled="1"/></a:gradFill>'
    )


class Slide:
    def __init__(self, idx: int, bg: str = COLORS["bg"]):
        self.idx = idx
        self.bg = bg
        self.parts: list[str] = []
        self.rels: list[tuple[str, str, str]] = []
        self.next_id = 2
        self.next_rel = 2

    def shape_id(self) -> int:
        value = self.next_id
        self.next_id += 1
        return value

    def rel_id(self) -> str:
        value = f"rId{self.next_rel}"
        self.next_rel += 1
        return value

    def add(self, xml: str) -> None:
        self.parts.append(xml)

    def add_bg(self) -> None:
        self.add(rect(0, 0, SLIDE_W_IN, SLIDE_H_IN, self.bg, None, name="Background", sid=self.shape_id()))

    def add_image(self, media_key: str, x: float, y: float, w: float, h: float, name: str | None = None) -> None:
        path = MEDIA_SRC[media_key]
        if not path.exists():
            self.add(placeholder(x, y, w, h, "Insert Application Screenshot Here", self.shape_id()))
            return
        rel = self.rel_id()
        ext = path.suffix.lower().lstrip(".")
        target = f"../media/{media_key}.{ext}"
        self.rels.append((rel, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", target))
        sid = self.shape_id()
        self.add(
            f'<p:pic><p:nvPicPr><p:cNvPr id="{sid}" name="{clean(name or media_key)}"/>'
            f'<p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>'
            f'<p:blipFill><a:blip r:embed="{rel}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
            f'<p:spPr><a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>{line(None)}</p:spPr></p:pic>'
        )

    def xml(self) -> str:
        body = "\n".join(self.parts)
        return (
            f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<p:sld xmlns:a="{A}" xmlns:r="{R}" xmlns:p="{P}">'
            f'<p:cSld><p:spTree>'
            f'<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            f'<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
            f'<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            f'{body}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>'
            f'<p:transition spd="med"><p:fade/></p:transition></p:sld>'
        )

    def rels_xml(self) -> str:
        rels = [
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
        ]
        for rid, typ, target in self.rels:
            rels.append(f'<Relationship Id="{rid}" Type="{typ}" Target="{target}"/>')
        return relationships(rels)


def xfrm(x: float, y: float, w: float, h: float) -> str:
    return f'<a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>'


def rect(
    x: float,
    y: float,
    w: float,
    h: float,
    fill: str | None,
    stroke: str | None,
    radius: bool = False,
    sid: int = 2,
    name: str = "Shape",
    shadowed: bool = False,
    alpha: int | None = None,
) -> str:
    prst = "roundRect" if radius else "rect"
    fill_xml = no_fill() if fill is None else solid(fill, alpha)
    effect = shadow() if shadowed else ""
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="{clean(name)}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
        f'<p:spPr>{xfrm(x, y, w, h)}<a:prstGeom prst="{prst}"><a:avLst/></a:prstGeom>'
        f'{fill_xml}{line(stroke) if stroke else line(None)}{effect}</p:spPr>'
        f'<p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>'
    )


def ellipse(x: float, y: float, w: float, h: float, fill: str, stroke: str | None, sid: int, alpha: int | None = None) -> str:
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="Ellipse"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
        f'<p:spPr>{xfrm(x, y, w, h)}<a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>'
        f'{solid(fill, alpha)}{line(stroke) if stroke else line(None)}</p:spPr>'
        f'<p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody></p:sp>'
    )


def text_box(
    x: float,
    y: float,
    w: float,
    h: float,
    text: str,
    size: float = 18,
    color: str = COLORS["text"],
    bold: bool = False,
    align: str = "l",
    valign: str = "top",
    sid: int = 2,
    name: str = "Text",
    fill: str | None = None,
    stroke: str | None = None,
    radius: bool = False,
    margin: float = 0.08,
    alpha: int | None = None,
) -> str:
    anchor = {"top": "t", "mid": "ctr", "bottom": "b"}.get(valign, "t")
    fill_xml = no_fill() if fill is None else solid(fill, alpha)
    prst = "roundRect" if radius else "rect"
    body_props = (
        f'<a:bodyPr wrap="square" anchor="{anchor}" lIns="{emu(margin)}" rIns="{emu(margin)}" '
        f'tIns="{emu(margin)}" bIns="{emu(margin)}"><a:normAutofit fontScale="90000" lnSpcReduction="15000"/></a:bodyPr>'
    )
    paragraphs = []
    for raw in str(text).split("\n"):
        line_text = clean(raw)
        paragraphs.append(
            f'<a:p><a:pPr algn="{align}"/><a:r><a:rPr lang="fr-FR" sz="{int(size * 100)}" '
            f'{"b=\"1\"" if bold else ""}><a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
            f'<a:latin typeface="Inter"/></a:rPr><a:t>{line_text}</a:t></a:r><a:endParaRPr lang="fr-FR" sz="{int(size * 100)}"/></a:p>'
        )
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="{clean(name)}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>'
        f'<p:spPr>{xfrm(x, y, w, h)}<a:prstGeom prst="{prst}"><a:avLst/></a:prstGeom>'
        f'{fill_xml}{line(stroke) if stroke else line(None)}</p:spPr>'
        f'<p:txBody>{body_props}<a:lstStyle/>{"".join(paragraphs)}</p:txBody></p:sp>'
    )


def rich_text_logo(slide: Slide, x: float, y: float, size: float = 24) -> None:
    slide.add(text_box(x, y, 0.95, 0.35, "Helix", size=size, color=COLORS["white"], bold=True, sid=slide.shape_id(), margin=0))
    slide.add(text_box(x + 0.68, y, 0.6, 0.35, "Lab", size=size, color=COLORS["blue2"], bold=True, sid=slide.shape_id(), margin=0))


def title(slide: Slide, text: str, kicker: str | None = None, dark: bool = False) -> None:
    color = COLORS["white"] if dark else COLORS["text"]
    muted = "BFD7FF" if dark else COLORS["slate"]
    if kicker:
        slide.add(text_box(0.75, 0.45, 4.5, 0.25, kicker.upper(), 8.5, muted, True, sid=slide.shape_id(), margin=0))
    slide.add(text_box(0.75, 0.72, 8.2, 0.55, text, 28, color, True, sid=slide.shape_id(), margin=0))
    slide.add(rect(0.75, 1.35, 0.55, 0.045, COLORS["blue"], None, radius=True, sid=slide.shape_id()))
    slide.add(rect(1.36, 1.35, 0.28, 0.045, COLORS["green2"], None, radius=True, sid=slide.shape_id()))


def card(slide: Slide, x: float, y: float, w: float, h: float, heading: str, body: str, accent: str, icon: str = "", soft: str = COLORS["white"]) -> None:
    slide.add(rect(x, y, w, h, soft, COLORS["line"], radius=True, sid=slide.shape_id(), shadowed=True))
    slide.add(rect(x, y, 0.08, h, accent, None, radius=True, sid=slide.shape_id()))
    if icon:
        slide.add(ellipse(x + 0.22, y + 0.18, 0.42, 0.42, accent, None, slide.shape_id(), alpha=16000))
        slide.add(text_box(x + 0.27, y + 0.24, 0.32, 0.18, icon, 12, COLORS["white"], True, "ctr", "mid", sid=slide.shape_id(), margin=0))
        text_x = x + 0.78
        text_w = w - 0.98
    else:
        text_x = x + 0.24
        text_w = w - 0.44
    slide.add(text_box(text_x, y + 0.2, text_w, 0.28, heading, 13.5, COLORS["text"], True, sid=slide.shape_id(), margin=0))
    slide.add(text_box(text_x, y + 0.58, text_w, h - 0.72, body, 9.7, COLORS["muted"], False, sid=slide.shape_id(), margin=0))


def pill(slide: Slide, x: float, y: float, w: float, text: str, fill: str, color: str = COLORS["white"]) -> None:
    slide.add(text_box(x, y, w, 0.34, text, 9.5, color, True, "ctr", "mid", sid=slide.shape_id(), fill=fill, stroke=None, radius=True, margin=0.04))


def screenshot_frame(slide: Slide, media: str, x: float, y: float, w: float, h: float, label: str, caption: str) -> None:
    slide.add(rect(x - 0.06, y - 0.06, w + 0.12, h + 0.12, COLORS["white"], COLORS["line"], radius=True, sid=slide.shape_id(), shadowed=True))
    slide.add(rect(x, y, w, h, "F1F5F9", None, radius=True, sid=slide.shape_id()))
    slide.add_image(media, x, y, w, h, name=label)
    slide.add(text_box(x, y + h + 0.12, w, 0.22, label, 9, COLORS["text"], True, "ctr", sid=slide.shape_id(), margin=0))
    slide.add(text_box(x, y + h + 0.36, w, 0.28, caption, 7.8, COLORS["slate"], False, "ctr", sid=slide.shape_id(), margin=0))


def placeholder(x: float, y: float, w: float, h: float, label: str, sid: int) -> str:
    return (
        rect(x, y, w, h, "F8FAFC", COLORS["line"], radius=True, sid=sid, shadowed=True)
        + text_box(x + 0.25, y + h / 2 - 0.2, w - 0.5, 0.4, label, 14, COLORS["slate"], True, "ctr", "mid", sid=sid + 5000)
    )


def metric(slide: Slide, x: float, y: float, label: str, value: str, color: str) -> None:
    slide.add(rect(x, y, 2.05, 0.88, COLORS["white"], COLORS["line"], radius=True, sid=slide.shape_id(), shadowed=True))
    slide.add(text_box(x + 0.18, y + 0.13, 1.68, 0.22, label.upper(), 7.5, COLORS["slate"], True, "ctr", sid=slide.shape_id(), margin=0))
    slide.add(text_box(x + 0.18, y + 0.38, 1.68, 0.36, value, 21, color, True, "ctr", sid=slide.shape_id(), margin=0))


def diagram_node(slide: Slide, x: float, y: float, w: float, label: str, sub: str, color: str) -> None:
    slide.add(rect(x, y, w, 0.86, COLORS["white"], COLORS["line"], radius=True, sid=slide.shape_id(), shadowed=True))
    slide.add(ellipse(x + 0.18, y + 0.2, 0.42, 0.42, color, None, slide.shape_id(), alpha=16000))
    slide.add(text_box(x + 0.72, y + 0.15, w - 0.88, 0.26, label, 12, COLORS["text"], True, sid=slide.shape_id(), margin=0))
    slide.add(text_box(x + 0.72, y + 0.46, w - 0.88, 0.25, sub, 8.2, COLORS["slate"], sid=slide.shape_id(), margin=0))


def arrow(slide: Slide, x: float, y: float, w: float, color: str = COLORS["line"]) -> None:
    slide.add(rect(x, y, w, 0.035, color, None, radius=True, sid=slide.shape_id()))
    slide.add(text_box(x + w - 0.08, y - 0.12, 0.22, 0.25, ">", 12, color, True, "ctr", sid=slide.shape_id(), margin=0))


def slide1() -> Slide:
    s = Slide(1, COLORS["navy"])
    s.add_bg()
    s.add(rect(0, 0, SLIDE_W_IN, SLIDE_H_IN, COLORS["navy"], None, sid=s.shape_id()))
    s.add(rect(0, 0, SLIDE_W_IN, SLIDE_H_IN, None, None, sid=s.shape_id(), alpha=None))
    s.add(rect(7.25, 0, 6.08, 7.5, COLORS["blue"], None, sid=s.shape_id(), alpha=15000))
    s.add_image("lab", 7.1, 0, 6.25, 7.5, "Laboratory visual")
    s.add(rect(7.1, 0, 6.25, 7.5, COLORS["navy"], None, sid=s.shape_id(), alpha=28000))
    rich_text_logo(s, 0.78, 0.55, 23)
    s.add(text_box(0.78, 1.55, 6.2, 0.9, "Helix Lab", 44, COLORS["white"], True, sid=s.shape_id(), margin=0))
    s.add(text_box(0.8, 2.45, 5.9, 0.5, "Laboratory Information Management System", 18, "BFD7FF", False, sid=s.shape_id(), margin=0))
    s.add(text_box(0.8, 3.08, 5.5, 0.72, "Gestion moderne des patients, analyses, rendez-vous et resultats biologiques.", 14, "D7E8FF", False, sid=s.shape_id(), margin=0))
    pill(s, 0.8, 4.15, 1.35, "React", COLORS["blue"])
    pill(s, 2.28, 4.15, 1.35, "Laravel", COLORS["green2"])
    pill(s, 3.76, 4.15, 1.45, "Sanctum", COLORS["indigo"])
    s.add(text_box(0.8, 6.15, 3.9, 0.26, "Equipe projet PFE/PFA", 10.5, "D7E8FF", True, sid=s.shape_id(), margin=0))
    s.add(text_box(0.8, 6.48, 2.7, 0.26, "Annee academique 2025-2026", 9.5, "93C5FD", False, sid=s.shape_id(), margin=0))
    screenshot_frame(s, "login", 5.58, 4.55, 3.1, 1.94, "Application Screenshot", "Interface d'authentification Helix Lab")
    return s


def slide2() -> Slide:
    s = Slide(2)
    s.add_bg()
    title(s, "Project Context", "Why the system exists")
    s.add(text_box(0.75, 1.65, 5.4, 0.8, "Medical laboratories manage sensitive, time-critical data across reception, sampling, biological validation and patient communication.", 15, COLORS["muted"], sid=s.shape_id(), margin=0))
    card(s, 0.8, 2.85, 3.75, 1.3, "Operational pressure", "Manual follow-up makes it harder to track patient files, appointment status and result readiness.", COLORS["blue"], "1", COLORS["white"])
    card(s, 4.8, 2.85, 3.75, 1.3, "Traceability needs", "Each exam requires a clear reference, status, responsible user and validation history.", COLORS["green2"], "2", COLORS["white"])
    card(s, 8.8, 2.85, 3.75, 1.3, "Patient experience", "Patients need easier access to appointments and final results without calling the lab repeatedly.", COLORS["indigo"], "3", COLORS["white"])
    s.add(rect(0.75, 4.9, 11.85, 1.15, COLORS["navy"], None, radius=True, sid=s.shape_id(), shadowed=True))
    s.add(text_box(1.05, 5.08, 2.2, 0.34, "Motivation", 18, COLORS["white"], True, sid=s.shape_id(), margin=0))
    s.add(text_box(3.0, 5.02, 9.1, 0.46, "Build a centralized LIMS-style web platform that connects staff roles, biological workflows, secure access and reporting in one coherent interface.", 14, "D7E8FF", sid=s.shape_id(), margin=0))
    return s


def slide3() -> Slide:
    s = Slide(3)
    s.add_bg()
    title(s, "Objectives & Benefits", "Value proposition")
    screenshot_frame(s, "appointment", 8.1, 1.2, 4.25, 2.66, "Appointment Screenshot", "Public appointment request with email verification")
    goals = [
        ("Digitize lab workflow", "Create, track and validate exams through a structured status pipeline.", COLORS["blue"]),
        ("Serve each user role", "Admin, preleveur, biologiste and patient access are separated by purpose.", COLORS["green2"]),
        ("Improve reliability", "References, validation rules and relational models reduce operational errors.", COLORS["indigo"]),
        ("Accelerate delivery", "Automated email and PDF report flows shorten result communication time.", COLORS["orange"]),
    ]
    y = 1.6
    for i, (h, b, c) in enumerate(goals, start=1):
        card(s, 0.8, y, 6.6, 0.86, h, b, c, str(i), COLORS["white"])
        y += 1.08
    s.add(rect(8.1, 4.55, 4.25, 1.35, COLORS["white"], COLORS["line"], radius=True, sid=s.shape_id(), shadowed=True))
    s.add(text_box(8.42, 4.74, 3.65, 0.28, "Key benefits", 13.5, COLORS["text"], True, "ctr", sid=s.shape_id(), margin=0))
    s.add(text_box(8.45, 5.12, 3.6, 0.46, "Faster operations  |  Better traceability\nCleaner patient service  |  Decision-ready data", 10.2, COLORS["muted"], False, "ctr", sid=s.shape_id(), margin=0))
    return s


def slide4() -> Slide:
    s = Slide(4)
    s.add_bg()
    title(s, "System Overview", "Architecture and workflow")
    diagram_node(s, 0.75, 1.65, 2.45, "React Frontend", "Dashboards, routing, UI", COLORS["blue"])
    arrow(s, 3.35, 2.06, 0.8)
    diagram_node(s, 4.35, 1.65, 2.45, "Laravel API", "Controllers, Sanctum", COLORS["green2"])
    arrow(s, 6.95, 2.06, 0.8)
    diagram_node(s, 7.95, 1.65, 2.45, "Database", "Eloquent models", COLORS["indigo"])
    arrow(s, 10.55, 2.06, 0.55)
    diagram_node(s, 11.1, 1.65, 1.9, "Services", "Mail, PDF", COLORS["orange"])
    s.add(rect(0.75, 3.0, 6.0, 2.75, COLORS["white"], COLORS["line"], radius=True, sid=s.shape_id(), shadowed=True))
    s.add(text_box(1.08, 3.25, 5.2, 0.28, "Application workflow", 15, COLORS["text"], True, sid=s.shape_id(), margin=0))
    workflow = "1. Patient requests appointment or staff creates patient\n2. Preleveur registers exam and validates sampling\n3. Biologiste enters, reviews and approves results\n4. Patient accesses results and PDF report by reference"
    s.add(text_box(1.08, 3.75, 5.25, 1.42, workflow, 11.4, COLORS["muted"], sid=s.shape_id(), margin=0))
    screenshot_frame(s, "admin", 7.35, 3.05, 4.85, 3.03, "Dashboard Screenshot", "Admin overview with cards and charts")
    return s


def slide5() -> Slide:
    s = Slide(5)
    s.add_bg()
    title(s, "Technologies Used", "Automatically detected stack")
    groups = [
        ("Frontend", "React 18, Vite, TypeScript-ready structure, React Router, React Query, axios, i18next", COLORS["blue"], 0.8, 1.65),
        ("UI & UX", "Tailwind CSS, shadcn/Radix UI, lucide-react, sonner/toasts, Recharts, responsive CSS", COLORS["indigo"], 6.9, 1.65),
        ("Backend", "Laravel 12, PHP 8.2, Sanctum tokens, Eloquent ORM, validation, Mailables, DomPDF", COLORS["green2"], 0.8, 3.55),
        ("Data & Tools", "SQLite default config with MySQL/MariaDB support, migrations, seeders, Composer, npm, Vitest, PHPUnit, Playwright", COLORS["orange"], 6.9, 3.55),
    ]
    for h, b, c, x, y in groups:
        card(s, x, y, 5.65, 1.35, h, b, c, h[0], COLORS["white"])
    s.add(rect(0.8, 5.92, 11.75, 0.6, COLORS["navy"], None, radius=True, sid=s.shape_id(), shadowed=True))
    s.add(text_box(1.05, 6.08, 11.25, 0.24, "Detected visual system: Inter typography, light surfaces, slate text, #2563EB blue, role-based green/indigo sidebars, rounded cards and subtle shadows.", 10.5, "D7E8FF", False, "ctr", sid=s.shape_id(), margin=0))
    return s


def slide6() -> Slide:
    s = Slide(6)
    s.add_bg()
    title(s, "Authentication & Security", "Access control")
    s.add(rect(0.75, 1.55, 12.0, 4.7, COLORS["white"], COLORS["line"], radius=True, sid=s.shape_id(), shadowed=True))
    diagram_node(s, 1.15, 2.0, 2.2, "Login", "Email + password", COLORS["blue"])
    arrow(s, 3.55, 2.42, 0.65)
    diagram_node(s, 4.35, 2.0, 2.3, "Sanctum", "Bearer token", COLORS["green2"])
    arrow(s, 6.85, 2.42, 0.65)
    diagram_node(s, 7.65, 2.0, 2.35, "Role Guards", "Admin / Bio / Prev", COLORS["indigo"])
    arrow(s, 10.2, 2.42, 0.55)
    diagram_node(s, 10.9, 2.0, 1.55, "API", "Protected routes", COLORS["orange"])
    items = [
        ("Password security", "Laravel hashing and credential validation before token creation."),
        ("Role separation", "React guards redirect unauthorized users away from protected dashboards."),
        ("API protection", "Sensitive operations are grouped behind auth:sanctum middleware."),
        ("Patient access", "Reference + phone lookup provides limited result access without staff login."),
        ("Verification", "Appointment requests use an emailed 4-digit code cached for 10 minutes."),
    ]
    x_positions = [1.15, 3.55, 5.95, 8.35, 10.75]
    for (h, b), x in zip(items, x_positions):
        s.add(rect(x, 3.65, 1.85, 1.55, COLORS["soft_blue"], COLORS["line"], radius=True, sid=s.shape_id()))
        s.add(text_box(x + 0.16, 3.83, 1.53, 0.34, h, 9.8, COLORS["text"], True, "ctr", sid=s.shape_id(), margin=0))
        s.add(text_box(x + 0.16, 4.28, 1.53, 0.62, b, 7.4, COLORS["slate"], False, "ctr", sid=s.shape_id(), margin=0))
    s.add(text_box(1.05, 5.72, 10.9, 0.28, "Security is implemented across both layers: guarded React routes for user experience and protected Laravel API routes for server-side enforcement.", 9.3, COLORS["slate"], False, "ctr", sid=s.shape_id(), margin=0))
    return s


def slide7() -> Slide:
    s = Slide(7)
    s.add_bg()
    title(s, "User Interface Showcase", "UI/UX identity")
    screenshot_frame(s, "login", 0.85, 1.55, 5.2, 3.25, "Login & Patient Access", "Clean split layout with laboratory visual identity")
    screenshot_frame(s, "admin", 6.7, 1.55, 5.65, 3.53, "Admin Dashboard", "Cards, charts and role-based navigation")
    s.add(rect(0.85, 5.75, 11.5, 0.82, COLORS["white"], COLORS["line"], radius=True, sid=s.shape_id(), shadowed=True))
    s.add(text_box(1.18, 5.93, 10.9, 0.32, "Design language", 13, COLORS["text"], True, "ctr", sid=s.shape_id(), margin=0))
    s.add(text_box(1.18, 6.27, 10.9, 0.24, "Light workspace, high-contrast slate text, blue action color, role-colored sidebars, compact tables, rounded 8-12px controls and responsive behavior.", 9.5, COLORS["muted"], False, "ctr", sid=s.shape_id(), margin=0))
    return s


def slide8() -> Slide:
    s = Slide(8)
    s.add_bg()
    title(s, "Main Features", "Functional coverage")
    screenshot_frame(s, "preleveur", 0.85, 1.45, 5.55, 3.47, "Preleveur Workspace", "Patient list, exam creation and sampling status")
    screenshot_frame(s, "biologiste", 6.95, 1.45, 5.45, 3.41, "Biologiste Workspace", "Result entry, validation and history")
    features = [
        ("Patients", COLORS["blue"]),
        ("Rendez-vous", COLORS["green2"]),
        ("Analyses", COLORS["indigo"]),
        ("Validation", COLORS["orange"]),
        ("PDF / Email", COLORS["red"]),
    ]
    x = 0.95
    for label, color in features:
        s.add(text_box(x, 5.88, 2.05, 0.42, label, 10.5, COLORS["white"], True, "ctr", "mid", sid=s.shape_id(), fill=color, radius=True, margin=0.03))
        x += 2.35
    s.add(text_box(1.05, 6.52, 11.2, 0.28, "The project covers the full path from patient intake to biological approval and patient-facing result delivery.", 10, COLORS["muted"], False, "ctr", sid=s.shape_id(), margin=0))
    return s


def slide9() -> Slide:
    s = Slide(9)
    s.add_bg()
    title(s, "Database & Implementation", "Technical model")
    entities = [
        ("laboratoires", "1 -> N utilisateurs", COLORS["blue"]),
        ("utilisateurs", "roles + tokens", COLORS["green2"]),
        ("patients", "identity + contact", COLORS["indigo"]),
        ("examens", "reference + statut", COLORS["orange"]),
        ("ligne_examens", "analysis values", COLORS["blue"]),
        ("resultats", "validation output", COLORS["green2"]),
        ("rendez_vous", "booking workflow", COLORS["indigo"]),
        ("factures / notifications", "support tables", COLORS["orange"]),
    ]
    coords = [(0.85, 1.6), (3.75, 1.6), (6.65, 1.6), (9.55, 1.6), (0.85, 3.05), (3.75, 3.05), (6.65, 3.05), (9.55, 3.05)]
    for (name, sub, color), (x, y) in zip(entities, coords):
        diagram_node(s, x, y, 2.25, name, sub, color)
    s.add(rect(0.95, 4.78, 5.75, 1.32, COLORS["white"], COLORS["line"], radius=True, sid=s.shape_id(), shadowed=True))
    s.add(text_box(1.25, 4.98, 5.15, 0.28, "Implementation highlights", 13, COLORS["text"], True, sid=s.shape_id(), margin=0))
    s.add(text_box(1.25, 5.35, 5.2, 0.44, "Eloquent relationships, automatic exam references, generated exam lines by analysis type, status pipeline and eager-loaded API responses.", 9.3, COLORS["muted"], sid=s.shape_id(), margin=0))
    screenshot_frame(s, "biologiste", 7.25, 4.65, 4.6, 1.98, "Implementation Screenshot", "Validated exam data visible in role workspace")
    return s


def slide10() -> Slide:
    s = Slide(10, COLORS["navy"])
    s.add_bg()
    s.add(rect(0, 0, SLIDE_W_IN, SLIDE_H_IN, COLORS["navy"], None, sid=s.shape_id()))
    s.add(rect(9.25, 0, 4.08, 7.5, COLORS["blue"], None, sid=s.shape_id(), alpha=17000))
    rich_text_logo(s, 0.85, 0.62, 23)
    s.add(text_box(0.85, 1.5, 6.8, 0.68, "Conclusion & Future Improvements", 34, COLORS["white"], True, sid=s.shape_id(), margin=0))
    s.add(text_box(0.88, 2.35, 7.2, 0.55, "Helix Lab delivers a complete digital workflow for laboratory operations, from appointments and patient registration to validation and result communication.", 14, "D7E8FF", sid=s.shape_id(), margin=0))
    card(s, 0.9, 3.35, 3.55, 1.28, "What was achieved", "A connected React/Laravel platform with role dashboards, secure API flow, analytics, PDF and email support.", COLORS["blue"], "A", COLORS["white"])
    card(s, 4.75, 3.35, 3.55, 1.28, "Project impact", "Improved traceability, faster work execution and a more professional experience for staff and patients.", COLORS["green2"], "B", COLORS["white"])
    s.add(rect(8.82, 2.05, 3.55, 3.25, COLORS["white"], None, radius=True, sid=s.shape_id(), shadowed=True))
    s.add(text_box(9.15, 2.35, 2.9, 0.35, "Next steps", 17, COLORS["text"], True, "ctr", sid=s.shape_id(), margin=0))
    next_steps = "Advanced analytics\nSMS / WhatsApp notifications\nHL7/FHIR interoperability\nAudit logs and monitoring\nCloud deployment + CI"
    s.add(text_box(9.16, 2.95, 2.9, 1.55, next_steps, 10.5, COLORS["muted"], False, "ctr", sid=s.shape_id(), margin=0))
    s.add(text_box(0.9, 6.28, 4.2, 0.42, "Thank you", 26, COLORS["white"], True, sid=s.shape_id(), margin=0))
    s.add(text_box(0.92, 6.78, 4.6, 0.24, "Questions & discussion", 11, "93C5FD", sid=s.shape_id(), margin=0))
    return s


def relationships(rel_xml: list[str]) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + "".join(rel_xml)
        + "</Relationships>"
    )


def content_types() -> str:
    overrides = [
        '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
        '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
        '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
        '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
    ]
    for i in range(1, 11):
        overrides.append(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Default Extension="png" ContentType="image/png"/>'
        '<Default Extension="jpg" ContentType="image/jpeg"/>'
        + "".join(overrides)
        + "</Types>"
    )


def presentation_xml() -> str:
    slide_ids = []
    for i in range(1, 11):
        slide_ids.append(f'<p:sldId id="{255 + i}" r:id="rId{i + 1}"/>')
    return (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<p:presentation xmlns:a="{A}" xmlns:r="{R}" xmlns:p="{P}" saveSubsetFonts="1">'
        f'<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
        f'<p:sldIdLst>{"".join(slide_ids)}</p:sldIdLst>'
        f'<p:sldSz cx="{SLIDE_W}" cy="{SLIDE_H}" type="wide"/>'
        f'<p:notesSz cx="6858000" cy="9144000"/>'
        f'<p:defaultTextStyle><a:defPPr><a:defRPr lang="fr-FR"/></a:defPPr></p:defaultTextStyle>'
        f'</p:presentation>'
    )


def presentation_rels() -> str:
    rels = ['<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>']
    for i in range(1, 11):
        rels.append(f'<Relationship Id="rId{i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>')
    return relationships(rels)


def master_xml() -> str:
    return (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<p:sldMaster xmlns:a="{A}" xmlns:r="{R}" xmlns:p="{P}"><p:cSld><p:spTree>'
        f'<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
        f'<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
        f'</p:spTree></p:cSld>'
        f'<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
        f'<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>'
        f'<p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>'
    )


def layout_xml() -> str:
    return (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<p:sldLayout xmlns:a="{A}" xmlns:r="{R}" xmlns:p="{P}" type="blank" preserve="1">'
        f'<p:cSld name="Blank"><p:spTree>'
        f'<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
        f'<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
        f'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>'
    )


def theme_xml() -> str:
    return (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<a:theme xmlns:a="{A}" name="Helix Lab Theme"><a:themeElements>'
        f'<a:clrScheme name="Helix Lab"><a:dk1><a:srgbClr val="{COLORS["navy"]}"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>'
        f'<a:dk2><a:srgbClr val="{COLORS["slate"]}"/></a:dk2><a:lt2><a:srgbClr val="{COLORS["bg"]}"/></a:lt2>'
        f'<a:accent1><a:srgbClr val="{COLORS["blue"]}"/></a:accent1><a:accent2><a:srgbClr val="{COLORS["green2"]}"/></a:accent2>'
        f'<a:accent3><a:srgbClr val="{COLORS["indigo"]}"/></a:accent3><a:accent4><a:srgbClr val="{COLORS["orange"]}"/></a:accent4>'
        f'<a:accent5><a:srgbClr val="{COLORS["red"]}"/></a:accent5><a:accent6><a:srgbClr val="{COLORS["blue2"]}"/></a:accent6>'
        f'<a:hlink><a:srgbClr val="{COLORS["blue"]}"/></a:hlink><a:folHlink><a:srgbClr val="{COLORS["indigo"]}"/></a:folHlink></a:clrScheme>'
        f'<a:fontScheme name="Inter"><a:majorFont><a:latin typeface="Inter"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>'
        f'<a:minorFont><a:latin typeface="Inter"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>'
        f'<a:fmtScheme name="Helix"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>'
        f'<a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>'
        f'<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>'
        f'</a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>'
    )


def core_xml() -> str:
    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
        'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
        'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        '<dc:title>Helix Lab Project Presentation</dc:title><dc:creator>Codex</dc:creator>'
        '<cp:lastModifiedBy>Codex</cp:lastModifiedBy>'
        f'<dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>'
        f'<dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>'
        '</cp:coreProperties>'
    )


def app_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '
        'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
        '<Application>Codex</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat>'
        '<Slides>10</Slides><Notes>0</Notes><HiddenSlides>0</HiddenSlides><MMClips>0</MMClips>'
        '<ScaleCrop>false</ScaleCrop><Company>Helix Lab</Company><LinksUpToDate>false</LinksUpToDate>'
        '<SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0000</AppVersion>'
        '</Properties>'
    )


def write_pptx() -> None:
    slides = [slide1(), slide2(), slide3(), slide4(), slide5(), slide6(), slide7(), slide8(), slide9(), slide10()]
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types())
        z.writestr("_rels/.rels", relationships([
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>',
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>',
            '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>',
        ]))
        z.writestr("docProps/core.xml", core_xml())
        z.writestr("docProps/app.xml", app_xml())
        z.writestr("ppt/presentation.xml", presentation_xml())
        z.writestr("ppt/_rels/presentation.xml.rels", presentation_rels())
        z.writestr("ppt/slideMasters/slideMaster1.xml", master_xml())
        z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", relationships([
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>',
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>',
        ]))
        z.writestr("ppt/slideLayouts/slideLayout1.xml", layout_xml())
        z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", relationships([
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>'
        ]))
        z.writestr("ppt/theme/theme1.xml", theme_xml())

        copied: set[str] = set()
        for key, path in MEDIA_SRC.items():
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
