from __future__ import annotations

import html
import re
import struct
import sys
import zipfile
from pathlib import Path


W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
WP_NS = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
PIC_NS = "http://schemas.openxmlformats.org/drawingml/2006/picture"
EMU_PER_INCH = 914400
EMU_PER_PIXEL = 9525


def esc(text: str) -> str:
    return html.escape(text, quote=True)


def clean_inline(text: str) -> str:
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"\[(.*?)\]\((.*?)\)", r"\1", text)
    text = text.replace("\\_", "_")
    return text


def run(text: str, *, bold: bool = False, italic: bool = False, font: str | None = None) -> str:
    props = []
    if bold:
        props.append("<w:b/>")
    if italic:
        props.append("<w:i/>")
    if font:
        props.append(f'<w:rFonts w:ascii="{font}" w:hAnsi="{font}" w:cs="{font}"/>')
    rpr = f"<w:rPr>{''.join(props)}</w:rPr>" if props else ""
    return f"<w:r>{rpr}<w:t xml:space=\"preserve\">{esc(text)}</w:t></w:r>"


def parse_inline(text: str) -> str:
    parts: list[str] = []
    pattern = re.compile(r"(\*\*.*?\*\*|`[^`]*`)")
    pos = 0
    for match in pattern.finditer(text):
        if match.start() > pos:
            parts.append(run(text[pos : match.start()]))
        token = match.group(0)
        if token.startswith("**"):
            parts.append(run(token[2:-2], bold=True))
        elif token.startswith("`"):
            parts.append(run(token[1:-1], font="Consolas"))
        pos = match.end()
    if pos < len(text):
        parts.append(run(text[pos:]))
    return "".join(parts)


def para(text: str = "", style: str | None = None, align: str | None = None) -> str:
    ppr = []
    if style:
        ppr.append(f'<w:pStyle w:val="{style}"/>')
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    ppr_xml = f"<w:pPr>{''.join(ppr)}</w:pPr>" if ppr else ""
    return f"<w:p>{ppr_xml}{parse_inline(text)}</w:p>"


def png_size(path: Path) -> tuple[int, int]:
    with path.open("rb") as handle:
        signature = handle.read(24)
    if signature[:8] != b"\x89PNG\r\n\x1a\n":
        return (900, 600)
    return struct.unpack(">II", signature[16:24])


def image_para(rid: str, name: str, width_px: int, height_px: int, doc_pr_id: int) -> str:
    max_width = int(6.35 * EMU_PER_INCH)
    max_height = int(8.4 * EMU_PER_INCH)
    width = width_px * EMU_PER_PIXEL
    height = height_px * EMU_PER_PIXEL
    scale = min(max_width / width, max_height / height, 1)
    cx = int(width * scale)
    cy = int(height * scale)
    return f"""
<w:p>
  <w:pPr><w:jc w:val="center"/></w:pPr>
  <w:r>
    <w:drawing>
      <wp:inline xmlns:wp="{WP_NS}" distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="{cx}" cy="{cy}"/>
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="{doc_pr_id}" name="{esc(name)}"/>
        <wp:cNvGraphicFramePr/>
        <a:graphic xmlns:a="{A_NS}">
          <a:graphicData uri="{PIC_NS}">
            <pic:pic xmlns:pic="{PIC_NS}">
              <pic:nvPicPr>
                <pic:cNvPr id="{doc_pr_id}" name="{esc(name)}"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip xmlns:r="{R_NS}" r:embed="{rid}"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>"""


def table(rows: list[list[str]]) -> str:
    if not rows:
        return ""
    grid_cols = "".join('<w:gridCol w:w="2400"/>' for _ in rows[0])
    trs = []
    for row_index, row in enumerate(rows):
        cells = []
        for cell in row:
            shade = '<w:shd w:fill="D9EAF7"/>' if row_index == 0 else ""
            cell_text = clean_inline(cell)
            cell_para = f"<w:p>{run(cell_text, bold=(row_index == 0))}</w:p>"
            cell_xml = (
                "<w:tc>"
                f"<w:tcPr><w:tcW w:w=\"2400\" w:type=\"dxa\"/>{shade}</w:tcPr>"
                f"{cell_para}"
                "</w:tc>"
            )
            cells.append(cell_xml)
        trs.append(f"<w:tr>{''.join(cells)}</w:tr>")
    return (
        "<w:tbl>"
        '<w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/>'
        '<w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="808080"/>'
        '<w:left w:val="single" w:sz="4" w:space="0" w:color="808080"/>'
        '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="808080"/>'
        '<w:right w:val="single" w:sz="4" w:space="0" w:color="808080"/>'
        '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="808080"/>'
        '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="808080"/></w:tblBorders></w:tblPr>'
        f"<w:tblGrid>{grid_cols}</w:tblGrid>{''.join(trs)}</w:tbl>"
    )
def list_para(text: str, ordered: bool = False) -> str:
    prefix = "1. " if ordered else "• "
    return para(prefix + clean_inline(text), "ListParagraph")


def convert_markdown(markdown: str, base_dir: Path, media: list[dict[str, object]]) -> str:
    body: list[str] = []
    lines = markdown.splitlines()
    i = 0
    in_code = False
    code_lines: list[str] = []

    while i < len(lines):
        raw = lines[i].rstrip()
        stripped = raw.strip()

        if stripped.startswith("```"):
            if in_code:
                for code_line in code_lines:
                    body.append(para(code_line, "Code"))
                code_lines = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue

        if in_code:
            code_lines.append(raw)
            i += 1
            continue

        if not stripped:
            body.append(para(""))
            i += 1
            continue

        image = re.match(r"^!\[(.*?)\]\((.*?)\)$", stripped)
        if image:
            caption = clean_inline(image.group(1).strip())
            image_path = (base_dir / image.group(2).strip()).resolve()
            if image_path.exists():
                rid = f"rId{len(media) + 2}"
                target_name = f"image{len(media) + 1}{image_path.suffix.lower()}"
                width_px, height_px = png_size(image_path)
                media.append(
                    {
                        "rid": rid,
                        "target": target_name,
                        "source": image_path,
                    }
                )
                body.append(image_para(rid, target_name, width_px, height_px, len(media)))
                if caption:
                    body.append(para(caption, "Caption", "center"))
            i += 1
            continue

        if stripped == "---":
            body.append('<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="BFBFBF"/></w:pBdr></w:pPr></w:p>')
            i += 1
            continue

        if stripped.startswith("|") and "|" in stripped[1:]:
            rows: list[list[str]] = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                row_line = lines[i].strip()
                cells = [clean_inline(c.strip()) for c in row_line.strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", c.replace(" ", "")) for c in cells):
                    rows.append(cells)
                i += 1
            body.append(table(rows))
            continue

        heading = re.match(r"^(#{1,6})\s+(.+)$", stripped)
        if heading:
            level = min(len(heading.group(1)), 4)
            text = clean_inline(heading.group(2))
            style = "Title" if level == 1 and text.lower().startswith("rapport") else f"Heading{level}"
            body.append(para(text, style, "center" if style == "Title" else None))
            i += 1
            continue

        bullet = re.match(r"^[-*]\s+(.+)$", stripped)
        if bullet:
            body.append(list_para(bullet.group(1)))
            i += 1
            continue

        numbered = re.match(r"^\d+\.\s+(.+)$", stripped)
        if numbered:
            body.append(list_para(numbered.group(1), ordered=True))
            i += 1
            continue

        if stripped.startswith(">"):
            body.append(para(clean_inline(stripped.lstrip("> ")), "Quote"))
            i += 1
            continue

        body.append(para(stripped))
        i += 1

    return "\n".join(body)


def content_types() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""


def rels() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""


def document_rels(media: list[dict[str, object]]) -> str:
    image_rels = "\n".join(
        f'  <Relationship Id="{item["rid"]}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{item["target"]}"/>'
        for item in media
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
{image_rels}
</Relationships>"""


def styles() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="{W_NS}">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="240"/></w:pPr>
    <w:rPr><w:b/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:before="360" w:after="180"/><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="1F4E79"/><w:sz w:val="32"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:before="280" w:after="140"/><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="2F75B5"/><w:sz w:val="28"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:before="220" w:after="100"/><w:outlineLvl w:val="2"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="26"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading4">
    <w:name w:val="heading 4"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:before="180" w:after="80"/><w:outlineLvl w:val="3"/></w:pPr>
    <w:rPr><w:b/><w:i/><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Quote">
    <w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:ind w:left="720" w:right="720"/></w:pPr>
    <w:rPr><w:i/><w:color w:val="666666"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Code">
    <w:name w:val="Code"/><w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="20"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Caption">
    <w:name w:val="Caption"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="200"/></w:pPr>
    <w:rPr><w:i/><w:color w:val="666666"/><w:sz w:val="20"/></w:rPr>
  </w:style>
  <w:style w:type="character" w:styleId="Strong">
    <w:name w:val="Strong"/><w:rPr><w:b/></w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/><w:qFormat/>
  </w:style>
</w:styles>"""


def document(body: str) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="{W_NS}" xmlns:r="{R_NS}">
  <w:body>
    {body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>"""


def create_docx(md_path: Path, docx_path: Path) -> None:
    markdown = md_path.read_text(encoding="utf-8")
    media: list[dict[str, object]] = []
    body = convert_markdown(markdown, md_path.parent, media)
    with zipfile.ZipFile(docx_path, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types())
        archive.writestr("_rels/.rels", rels())
        archive.writestr("word/_rels/document.xml.rels", document_rels(media))
        archive.writestr("word/styles.xml", styles())
        archive.writestr("word/document.xml", document(body))
        for item in media:
            archive.write(Path(item["source"]), f"word/media/{item['target']}")


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python tools/md_to_docx.py input.md output.docx", file=sys.stderr)
        return 2
    create_docx(Path(sys.argv[1]), Path(sys.argv[2]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
