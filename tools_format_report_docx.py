import copy
import os
import re
import shutil
import zipfile
import xml.etree.ElementTree as ET


INPUT = r"C:\Users\user\Downloads\rapport_pfe_pfa_helix_lab_avec_diagrammes_corrige_final.docx"
OUTPUT = r"c:\laragon\www\Projet_PFF\rapport_pfe_pfa_helix_lab_mise_en_forme_work.docx"

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
CT = "http://schemas.openxmlformats.org/package/2006/content-types"
REL = "http://schemas.openxmlformats.org/package/2006/relationships"
XML = "http://www.w3.org/XML/1998/namespace"
MC = "http://schemas.openxmlformats.org/markup-compatibility/2006"

ET.register_namespace("w", W)
ET.register_namespace("r", R)
ET.register_namespace("xml", XML)


def qn(ns, tag):
    return f"{{{ns}}}{tag}"


def wtag(tag):
    return qn(W, tag)


def rtag(tag):
    return qn(R, tag)


def text_of(p):
    return "".join(t.text or "" for t in p.findall(".//w:t", NS)).strip()


def starts(p, prefix):
    return text_of(p).startswith(prefix)


def contains(p, needle):
    return needle in text_of(p)


def find_idx(elements, predicate):
    for i, el in enumerate(elements):
        if el.tag == wtag("p") and predicate(el):
            return i
    return -1


def ensure(parent, tag, attrs=None, first=False):
    child = parent.find(f"w:{tag}", NS)
    if child is None:
        child = ET.Element(wtag(tag), attrs or {})
        if first:
            parent.insert(0, child)
        else:
            parent.append(child)
    elif attrs:
        child.attrib.update(attrs)
    return child


def remove_children(parent, local_names):
    for child in list(parent):
        if child.tag in {wtag(name) for name in local_names}:
            parent.remove(child)


def set_val(el, val):
    el.set(wtag("val"), str(val))


def get_ppr(p):
    ppr = p.find("w:pPr", NS)
    if ppr is None:
        ppr = ET.Element(wtag("pPr"))
        p.insert(0, ppr)
    return ppr


def set_pstyle(p, style_id):
    ppr = get_ppr(p)
    pstyle = ppr.find("w:pStyle", NS)
    if pstyle is None:
        pstyle = ET.Element(wtag("pStyle"))
        ppr.insert(0, pstyle)
    set_val(pstyle, style_id)


def set_outline_body(p):
    ppr = get_ppr(p)
    outline = ppr.find("w:outlineLvl", NS)
    if outline is not None:
        ppr.remove(outline)


def set_spacing(p, before=None, after=None, line=None, line_rule="auto"):
    ppr = get_ppr(p)
    spacing = ppr.find("w:spacing", NS)
    if spacing is None:
        spacing = ET.SubElement(ppr, wtag("spacing"))
    if before is not None:
        spacing.set(wtag("before"), str(before))
    if after is not None:
        spacing.set(wtag("after"), str(after))
    if line is not None:
        spacing.set(wtag("line"), str(line))
        spacing.set(wtag("lineRule"), line_rule)


def set_jc(p, val):
    ppr = get_ppr(p)
    jc = ppr.find("w:jc", NS)
    if jc is None:
        jc = ET.SubElement(ppr, wtag("jc"))
    set_val(jc, val)


def set_direct_run_format(p, size=None, bold=None, color=None, font="Times New Roman"):
    for r in p.findall(".//w:r", NS):
        rpr = r.find("w:rPr", NS)
        if rpr is None:
            rpr = ET.Element(wtag("rPr"))
            r.insert(0, rpr)
        set_run_font(rpr, font)
        if size is not None:
            set_run_size(rpr, size)
        if bold is not None:
            b = rpr.find("w:b", NS)
            if b is None:
                b = ET.SubElement(rpr, wtag("b"))
            if not bold:
                b.set(wtag("val"), "0")
        if color is not None:
            c = rpr.find("w:color", NS)
            if c is None:
                c = ET.SubElement(rpr, wtag("color"))
            c.set(wtag("val"), color)


def set_run_font(rpr, font):
    fonts = rpr.find("w:rFonts", NS)
    if fonts is None:
        fonts = ET.Element(wtag("rFonts"))
        rpr.insert(0, fonts)
    for attr in ("ascii", "hAnsi", "cs"):
        fonts.set(wtag(attr), font)


def set_run_size(rpr, half_points):
    for name in ("sz", "szCs"):
        el = rpr.find(f"w:{name}", NS)
        if el is None:
            el = ET.SubElement(rpr, wtag(name))
        set_val(el, str(half_points))


def set_style(root, style_id, name=None, size=None, color=None, bold=None, italic=None,
              before=None, after=None, line=None, outline=None, align=None, keep_next=False,
              font="Times New Roman"):
    style = None
    for s in root.findall("w:style", NS):
        if s.get(wtag("styleId")) == style_id:
            style = s
            break
    if style is None:
        style = ET.SubElement(root, wtag("style"), {wtag("type"): "paragraph", wtag("styleId"): style_id})
        if name:
            ET.SubElement(style, wtag("name"), {wtag("val"): name})

    ppr = style.find("w:pPr", NS)
    if ppr is None:
        ppr = ET.SubElement(style, wtag("pPr"))
    rpr = style.find("w:rPr", NS)
    if rpr is None:
        rpr = ET.SubElement(style, wtag("rPr"))

    if before is not None or after is not None or line is not None:
        spacing = ppr.find("w:spacing", NS)
        if spacing is None:
            spacing = ET.SubElement(ppr, wtag("spacing"))
        if before is not None:
            spacing.set(wtag("before"), str(before))
        if after is not None:
            spacing.set(wtag("after"), str(after))
        if line is not None:
            spacing.set(wtag("line"), str(line))
            spacing.set(wtag("lineRule"), "auto")
    if outline is not None:
        outline_el = ppr.find("w:outlineLvl", NS)
        if outline_el is None:
            outline_el = ET.SubElement(ppr, wtag("outlineLvl"))
        set_val(outline_el, outline)
    if align is not None:
        jc = ppr.find("w:jc", NS)
        if jc is None:
            jc = ET.SubElement(ppr, wtag("jc"))
        set_val(jc, align)
    if keep_next:
        if ppr.find("w:keepNext", NS) is None:
            ET.SubElement(ppr, wtag("keepNext"))

    set_run_font(rpr, font)
    if size is not None:
        set_run_size(rpr, size)
    if color is not None:
        c = rpr.find("w:color", NS)
        if c is None:
            c = ET.SubElement(rpr, wtag("color"))
        c.set(wtag("val"), color)
    if bold is not None:
        b = rpr.find("w:b", NS)
        if b is None:
            b = ET.SubElement(rpr, wtag("b"))
        if not bold:
            b.set(wtag("val"), "0")
    if italic is not None:
        i = rpr.find("w:i", NS)
        if i is None:
            i = ET.SubElement(rpr, wtag("i"))
        if not italic:
            i.set(wtag("val"), "0")


def page_break_para():
    p = ET.Element(wtag("p"))
    r = ET.SubElement(p, wtag("r"))
    br = ET.SubElement(r, wtag("br"))
    br.set(wtag("type"), "page")
    return p


def toc_field_paragraphs():
    p_begin = ET.Element(wtag("p"))
    r1 = ET.SubElement(p_begin, wtag("r"))
    ET.SubElement(r1, wtag("fldChar"), {wtag("fldCharType"): "begin"})
    r2 = ET.SubElement(p_begin, wtag("r"))
    instr = ET.SubElement(r2, wtag("instrText"))
    instr.set(qn(XML, "space"), "preserve")
    instr.text = ' TOC \\o "1-3" \\h \\z \\u '
    r3 = ET.SubElement(p_begin, wtag("r"))
    ET.SubElement(r3, wtag("fldChar"), {wtag("fldCharType"): "separate"})

    p_placeholder = ET.Element(wtag("p"))
    ppr = ET.SubElement(p_placeholder, wtag("pPr"))
    ET.SubElement(ppr, wtag("pStyle"), {wtag("val"): "TOC1"})
    r = ET.SubElement(p_placeholder, wtag("r"))
    t = ET.SubElement(r, wtag("t"))
    t.text = "Sommaire automatique"

    p_end = ET.Element(wtag("p"))
    r4 = ET.SubElement(p_end, wtag("r"))
    ET.SubElement(r4, wtag("fldChar"), {wtag("fldCharType"): "end"})
    return [p_begin, p_placeholder, p_end]


def make_footer_xml():
    footer = ET.Element(wtag("ftr"))
    p = ET.SubElement(footer, wtag("p"))
    ppr = ET.SubElement(p, wtag("pPr"))
    ET.SubElement(ppr, wtag("jc"), {wtag("val"): "center"})
    r1 = ET.SubElement(p, wtag("r"))
    ET.SubElement(r1, wtag("fldChar"), {wtag("fldCharType"): "begin"})
    r2 = ET.SubElement(p, wtag("r"))
    instr = ET.SubElement(r2, wtag("instrText"))
    instr.set(qn(XML, "space"), "preserve")
    instr.text = " PAGE "
    r3 = ET.SubElement(p, wtag("r"))
    ET.SubElement(r3, wtag("fldChar"), {wtag("fldCharType"): "separate"})
    r4 = ET.SubElement(p, wtag("r"))
    ET.SubElement(r4, wtag("t")).text = "1"
    r5 = ET.SubElement(p, wtag("r"))
    ET.SubElement(r5, wtag("fldChar"), {wtag("fldCharType"): "end"})
    return ET.tostring(footer, encoding="utf-8", xml_declaration=True)


NS = {"w": W, "r": R}


def main():
    shutil.copy2(INPUT, OUTPUT)
    tmp = OUTPUT + ".tmp"

    with zipfile.ZipFile(INPUT, "r") as zin:
        parts = {name: zin.read(name) for name in zin.namelist()}

    document = ET.fromstring(parts["word/document.xml"])
    document.attrib.pop(qn(MC, "Ignorable"), None)
    body = document.find("w:body", NS)
    children = list(body)
    sect_pr = body.find("w:sectPr", NS)
    body_items = [el for el in children if el is not sect_pr]

    # Move existing TOC block after the cover.
    toc_start = find_idx(body_items, lambda p: starts(p, "6. Table"))
    fig_start = find_idx(body_items, lambda p: starts(p, "7. Table des figures"))
    dedicace_start = find_idx(body_items, lambda p: starts(p, "2. D"))
    if toc_start >= 0 and fig_start > toc_start and dedicace_start >= 0:
        toc_block = body_items[toc_start:fig_start]
        del body_items[toc_start:fig_start]
        if toc_start < dedicace_start:
            dedicace_start -= len(toc_block)
        for offset, item in enumerate(toc_block):
            body_items.insert(dedicace_start + offset, item)

    # Cover text should not be emitted in the automatic TOC.
    for p in body_items:
        txt = text_of(p)
        if (
            txt.startswith("1. Page de garde")
            or "application web de gestion" in txt
            or "Cas du syst" in txt
        ):
            set_pstyle(p, "Normal")
            set_outline_body(p)

    # Clean false H3 paragraphs in section 3.6.5.
    auth_start = find_idx(body_items, lambda p: contains(p, "3.6.5 Prise de d"))
    db_start = find_idx(body_items, lambda p: contains(p, "3.7 Analyse de la base"))
    if auth_start >= 0 and db_start > auth_start:
        for p in body_items[auth_start + 1:db_start]:
            set_pstyle(p, "Normal")
            set_outline_body(p)
            if text_of(p).endswith(":"):
                set_direct_run_format(p, bold=True)

    # Replace manual TOC list with automatic field while keeping the existing title text.
    toc_title = find_idx(body_items, lambda p: starts(p, "6. Table"))
    dedicace_start = find_idx(body_items, lambda p: starts(p, "2. D"))
    if toc_title >= 0 and dedicace_start > toc_title:
        title = body_items[toc_title]
        set_pstyle(title, "Normal")
        set_outline_body(title)
        set_jc(title, "center")
        set_spacing(title, before=360, after=200, line=240)
        set_direct_run_format(title, size=36, bold=True, color="1F4E79")
        del body_items[toc_title + 1:dedicace_start]
        for offset, p in enumerate(toc_field_paragraphs()):
            body_items.insert(toc_title + 1 + offset, p)

    # Page breaks before main sections.
    break_prefixes = [
        "6. Table",
        "2. D",
        "3. Rem",
        "4. R",
        "5. Abstract",
        "7. Table des figures",
        "Liste des tableaux",
        "Introduction g",
        "CHAPITRE 1",
        "CHAPITRE 2",
        "CHAPITRE 3",
        "CHAPITRE 4",
        "CHAPITRE 5",
        "Conclusion g",
        "Bibliographie",
        "Annexes",
    ]
    for prefix in reversed(break_prefixes):
        idx = find_idx(body_items, lambda p, pref=prefix: starts(p, pref))
        if idx >= 0:
            body_items.insert(idx, page_break_para())

    # Paragraph-level typography. Existing words remain untouched.
    for p in body_items:
        style = p.find("./w:pPr/w:pStyle", NS)
        style_id = style.get(wtag("val")) if style is not None else ""
        if style_id in {"Heading1", "Heading2", "Heading3"}:
            continue
        set_spacing(p, after=120, line=360)
        for rpr in p.findall(".//w:rPr", NS):
            set_run_font(rpr, "Times New Roman")
            remove_children(rpr, ["sz", "szCs"])

    # Restore body with edited items.
    for el in list(body):
        body.remove(el)
    for el in body_items:
        body.append(el)
    if sect_pr is not None:
        body.append(sect_pr)

    # Section page setup and footer reference.
    if sect_pr is None:
        sect_pr = ET.SubElement(body, wtag("sectPr"))
    pg_mar = sect_pr.find("w:pgMar", NS)
    if pg_mar is None:
        pg_mar = ET.SubElement(sect_pr, wtag("pgMar"))
    for attr, val in {
        "top": "1417",
        "right": "1417",
        "bottom": "1417",
        "left": "1417",
        "header": "708",
        "footer": "708",
        "gutter": "0",
    }.items():
        pg_mar.set(wtag(attr), val)

    # Update styles and defaults.
    styles = ET.fromstring(parts["word/styles.xml"])
    styles.attrib.pop(qn(MC, "Ignorable"), None)
    doc_defaults = styles.find("w:docDefaults", NS)
    if doc_defaults is None:
        doc_defaults = ET.Element(wtag("docDefaults"))
        styles.insert(0, doc_defaults)
    rpr_default = ensure(doc_defaults, "rPrDefault", first=True)
    rpr = ensure(rpr_default, "rPr", first=True)
    set_run_font(rpr, "Times New Roman")
    set_run_size(rpr, 24)

    set_style(styles, "Normal", size=24, before=0, after=120, line=360, align="both")
    set_style(styles, "Heading1", size=36, color="1F4E79", bold=True, before=360, after=200, line=240, outline=0, align="left", keep_next=True)
    set_style(styles, "Heading2", size=30, color="2F75B5", bold=True, before=280, after=160, line=240, outline=1, align="left", keep_next=True)
    set_style(styles, "Heading3", size=26, color="595959", bold=True, italic=False, before=200, after=120, line=240, outline=2, align="left", keep_next=True)
    set_style(styles, "ListParagraph", size=24, before=0, after=120, line=360)
    set_style(styles, "Caption", size=21, color="666666", italic=True, before=80, after=160, line=300, align="center")
    set_style(styles, "Code", size=22, before=80, after=80, line=300)
    set_style(styles, "Quote", size=24, color="666666", italic=True, before=80, after=120, line=360)

    # Add footer part and relationship.
    rels = ET.fromstring(parts["word/_rels/document.xml.rels"])
    used_ids = []
    for rel in rels.findall(f"{{{REL}}}Relationship"):
        rid = rel.get("Id", "")
        m = re.match(r"rId(\d+)$", rid)
        if m:
            used_ids.append(int(m.group(1)))
    footer_rid = f"rId{(max(used_ids) if used_ids else 0) + 1}"
    ET.SubElement(rels, qn(REL, "Relationship"), {
        "Id": footer_rid,
        "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer",
        "Target": "footer1.xml",
    })
    for old in list(sect_pr.findall("w:footerReference", NS)):
        sect_pr.remove(old)
    sect_pr.insert(0, ET.Element(wtag("footerReference"), {wtag("type"): "default", rtag("id"): footer_rid}))

    # Ensure content type for footer.
    content_types = ET.fromstring(parts["[Content_Types].xml"])
    has_footer_ct = any(
        el.tag == qn(CT, "Override") and el.get("PartName") == "/word/footer1.xml"
        for el in content_types
    )
    if not has_footer_ct:
        ET.SubElement(content_types, qn(CT, "Override"), {
            "PartName": "/word/footer1.xml",
            "ContentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml",
        })

    # Ask Word to refresh fields when opened, in case the COM pass is unavailable.
    settings = ET.fromstring(parts["word/settings.xml"])
    settings.attrib.pop(qn(MC, "Ignorable"), None)
    update_fields = settings.find("w:updateFields", NS)
    if update_fields is None:
        update_fields = ET.SubElement(settings, wtag("updateFields"))
    update_fields.set(wtag("val"), "true")

    parts["word/document.xml"] = ET.tostring(document, encoding="utf-8", xml_declaration=True)
    parts["word/styles.xml"] = ET.tostring(styles, encoding="utf-8", xml_declaration=True)
    parts["word/_rels/document.xml.rels"] = ET.tostring(rels, encoding="utf-8", xml_declaration=True)
    parts["[Content_Types].xml"] = ET.tostring(content_types, encoding="utf-8", xml_declaration=True)
    parts["word/settings.xml"] = ET.tostring(settings, encoding="utf-8", xml_declaration=True)
    parts["word/footer1.xml"] = make_footer_xml()

    with zipfile.ZipFile(tmp, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        for name, data in parts.items():
            zout.writestr(name, data)
    os.replace(tmp, OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    main()
