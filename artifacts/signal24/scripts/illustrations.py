#!/usr/bin/env python3
"""
Generates The Signal 24's original editorial illustrations as SVG.

Every illustration is our own artwork (no third-party images), drawn in the
site palette with a shared risograph-style treatment: paper grain, halftone
dots, offset ink shadows and rubber stamps. Run from the repo root:

    python3 artifacts/signal24/scripts/illustrations.py

Output: artifacts/signal24/public/illustrations/<name>.svg (1600x900).
"""
from pathlib import Path
from textwrap import dedent

OUT = Path(__file__).resolve().parent.parent / "public" / "illustrations"
W, H = 1600, 900

PAPER = "#f3efe8"
PAPER_DARK = "#e6ded2"
INK = "#342a23"
RED = "#a5352a"
TEAL = "#346067"
OCHRE = "#c99a3b"
CREAM = "#fbf8f2"
SANS = "'Helvetica Neue', Arial, sans-serif"
SERIF = "Georgia, 'Times New Roman', serif"
MONO = "'Courier New', Courier, monospace"


def defs(uid: str) -> str:
    return dedent(f"""
    <defs>
      <filter id="grain-{uid}" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.16  0 0 0 0 0.13  0 0 0 0.07 0"/>
      </filter>
      <pattern id="dots-{uid}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
        <circle cx="4" cy="4" r="2.4" fill="{INK}" opacity="0.18"/>
      </pattern>
      <pattern id="dots-red-{uid}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
        <circle cx="3" cy="3" r="2.2" fill="{RED}" opacity="0.35"/>
      </pattern>
      <pattern id="lines-{uid}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="{INK}" stroke-width="2" opacity="0.12"/>
      </pattern>
    </defs>""")


def frame(uid: str, body: str, bg: str = PAPER, title: str = "") -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{title}">'
        + defs(uid)
        + f'<rect width="{W}" height="{H}" fill="{bg}"/>'
        + f'<rect width="{W}" height="{H}" fill="url(#dots-{uid})" opacity="0.55"/>'
        + body
        + f'<rect width="{W}" height="{H}" filter="url(#grain-{uid})"/>'
        + "</svg>\n"
    )


def box(x, y, w, h, fill, shadow=12, stroke=INK, sw=5, rx=6, rot=0, extra=""):
    t = f' transform="rotate({rot} {x + w / 2} {y + h / 2})"' if rot else ""
    return (
        f'<g{t}>'
        f'<rect x="{x + shadow}" y="{y + shadow}" width="{w}" height="{h}" rx="{rx}" fill="{INK}"/>'
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
        f'{extra}</g>'
    )


def text(x, y, s, size=40, fill=INK, family=SANS, weight=700, anchor="start", ls=0, rot=0, opacity=1):
    t = f' transform="rotate({rot} {x} {y})"' if rot else ""
    return (
        f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" '
        f'fill="{fill}" text-anchor="{anchor}" letter-spacing="{ls}" opacity="{opacity}"{t}>{s}</text>'
    )


def stamp(cx, cy, label, rot=-12, color=RED, size=64, pad=28, sub=""):
    w = max(len(label) * size * 0.8, len(sub) * size * 0.36 * 0.66) + pad * 2
    h = size + pad * 1.4 + (size * 0.45 if sub else 0)
    x, y = cx - w / 2, cy - h / 2
    sub_svg = text(cx, y + h - pad * 0.6, sub, size * 0.36, color, MONO, 700, "middle", 3) if sub else ""
    return (
        f'<g transform="rotate({rot} {cx} {cy})" opacity="0.92">'
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="none" stroke="{color}" stroke-width="9"/>'
        f'<rect x="{x + 12}" y="{y + 12}" width="{w - 24}" height="{h - 24}" rx="6" fill="none" stroke="{color}" stroke-width="3"/>'
        + text(cx, y + pad + size * 0.82, label, size, color, SANS, 900, "middle", 4)
        + sub_svg
        + "</g>"
    )


def tape(x, y, w, rot=0, color=RED):
    return f'<rect x="{x}" y="{y}" width="{w}" height="34" fill="{color}" opacity="0.92" transform="rotate({rot} {x + w / 2} {y + 17})"/>'


def file_stack(x, y, w, n, labels=(), colors=(OCHRE, CREAM, TEAL, CREAM, RED)):
    out = []
    for i in range(n):
        yy = y - i * 58
        off = (i % 2) * 18 - 9
        fill = colors[i % len(colors)]
        out.append(box(x + off, yy, w, 52, fill, shadow=8, rx=4))
        if i < len(labels) and labels[i]:
            tc = CREAM if fill in (TEAL, RED) else INK
            out.append(text(x + off + 26, yy + 36, labels[i], 26, tc, MONO, 700, ls=2))
    return "".join(out)


# ---------------------------------------------------------------- scenes

def sealed_report():
    u = "sr"
    cab = box(250, 170, 620, 640, PAPER_DARK, shadow=18)
    drawers = "".join(
        box(290, 210 + i * 200, 540, 160, CREAM, shadow=0, sw=4, rx=4, extra=
            f'<rect x="{510}" y="{270 + i * 200}" width="100" height="22" rx="11" fill="{INK}"/>'
            f'<rect x="{480}" y="{232 + i * 200}" width="160" height="30" fill="{CREAM}" stroke="{INK}" stroke-width="3"/>')
        for i in range(3)
    )
    labels = text(560, 254, "2017", 22, INK, MONO, 700, "middle") + text(560, 454, "2020", 22, INK, MONO, 700, "middle")
    # top drawer pulled out with the report inside
    pulled = box(640, 300, 640, 190, CREAM, shadow=14, extra="")
    report = box(700, 210, 520, 150, RED, shadow=10, rx=4, extra=
                 text(960, 270, "ROHINI COMMISSION", 34, CREAM, SANS, 900, "middle", 3)
                 + text(960, 315, "REPORT · VOL. I", 24, CREAM, MONO, 700, "middle", 4))
    ribbon = (tape(700, 330, 520, 0, INK) + f'<rect x="1150" y="200" width="36" height="170" fill="{INK}"/>')
    lock = (f'<rect x="915" y="395" width="90" height="80" rx="10" fill="{OCHRE}" stroke="{INK}" stroke-width="6"/>'
            f'<path d="M930 400 v-30 a30 30 0 0 1 60 0 v30" fill="none" stroke="{INK}" stroke-width="10"/>'
            f'<circle cx="960" cy="430" r="10" fill="{INK}"/><rect x="956" y="432" width="8" height="24" fill="{INK}"/>')
    tag = (f'<g transform="rotate(8 1330 560)"><path d="M1240 520 h170 l40 40 l-40 40 h-170 z" fill="{CREAM}" stroke="{INK}" stroke-width="5"/>'
           f'<circle cx="1420" cy="560" r="9" fill="{INK}"/>'
           + text(1320, 553, "SUBMITTED", 22, INK, MONO, 700, "middle", 2)
           + text(1320, 584, "31.07.2023", 24, RED, MONO, 700, "middle", 2) + "</g>")
    string = f'<path d="M1005 440 C 1100 470, 1180 540, 1245 560" fill="none" stroke="{INK}" stroke-width="4" stroke-dasharray="2 0"/>'
    st = stamp(1170, 760, "WITHHELD", rot=-9, size=64, sub="14 EXTENSIONS LATER")
    frost = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#ffffff" opacity="0.55"/>' for x, y, r in
                    [(300, 150, 6), (420, 130, 4), (860, 160, 5), (1250, 200, 7), (1350, 300, 4), (220, 420, 5), (1450, 180, 5)])
    return frame(u, cab + drawers + labels + pulled + report + ribbon + string + lock + tag + st + frost,
                 title="A filing cabinet drawer holding the Rohini Commission report, locked, tagged submitted 31 July 2023, stamped withheld")


def census_clipboard():
    u = "cc"
    board = box(420, 90, 760, 760, OCHRE, shadow=18, rx=18)
    clip = (f'<rect x="680" y="60" width="240" height="80" rx="14" fill="{INK}"/>'
            f'<rect x="740" y="40" width="120" height="50" rx="25" fill="none" stroke="{INK}" stroke-width="14"/>')
    paper = f'<rect x="470" y="150" width="660" height="660" fill="{CREAM}" stroke="{INK}" stroke-width="4"/>'
    head = text(500, 210, "CENSUS SCHEDULE · 2027", 30, INK, MONO, 700, ls=3) + f'<line x1="500" y1="228" x2="1100" y2="228" stroke="{INK}" stroke-width="4"/>'
    cols = ["NAME", "AGE", "SEX", "WORK", "CASTE"]
    xs = [500, 700, 800, 900, 1010]
    colhead = "".join(text(x, 275, c, 22, RED if c == "CASTE" else INK, MONO, 700, ls=2) for x, c in zip(xs, cols))
    rows = ""
    for r in range(7):
        y = 315 + r * 66
        rows += f'<line x1="500" y1="{y + 22}" x2="1100" y2="{y + 22}" stroke="{INK}" stroke-width="2" opacity="0.35"/>'
        rows += f'<path d="M505 {y + 6} q40 -18 80 -2 t70 -4" stroke="{TEAL}" stroke-width="4" fill="none"/>'
        rows += f'<path d="M705 {y + 6} q20 -10 40 0" stroke="{TEAL}" stroke-width="4" fill="none"/>'
        rows += f'<path d="M805 {y + 6} l20 -8" stroke="{TEAL}" stroke-width="4" fill="none"/>'
        rows += f'<path d="M905 {y + 6} q30 -14 60 -2" stroke="{TEAL}" stroke-width="4" fill="none"/>'
    caste_col = (f'<rect x="1000" y="292" width="110" height="470" fill="url(#lines-{u})" stroke="{RED}" stroke-width="5" stroke-dasharray="14 10"/>'
                 + text(1055, 560, "?", 150, RED, SERIF, 700, "middle"))
    pencil = (f'<g transform="rotate(-32 1300 520)"><rect x="1190" y="500" width="300" height="40" fill="{OCHRE}" stroke="{INK}" stroke-width="5"/>'
              f'<path d="M1190 500 l-50 20 l50 20 z" fill="{CREAM}" stroke="{INK}" stroke-width="5"/><path d="M1150 516 l-10 4 l10 4 z" fill="{INK}"/>'
              f'<rect x="1470" y="500" width="40" height="40" fill="{RED}" stroke="{INK}" stroke-width="5"/></g>')
    note = (f'<g transform="rotate(-6 260 300)">' + box(130, 200, 260, 200, "#f7e08a", shadow=8, rx=2, extra=
            text(260, 265, "SECC 2011:", 26, INK, MONO, 700, "middle") + text(260, 305, "“unusable”", 34, RED, SERIF, 700, "middle")
            + text(260, 350, "(in 2021)", 22, INK, MONO, 400, "middle")) + "</g>")
    st = stamp(1290, 790, "PENDING", rot=8, size=64, sub="SINCE 1931")
    return frame(u, board + clip + paper + head + colhead + rows + caste_col + pencil + note + st,
                 title="A census form on a clipboard with every column filled except caste, marked with a question mark; a note says SECC 2011 was called unusable in 2021")


def frozen_meter():
    u = "fm"
    import math
    cx, cy, r = 800, 560, 360
    arc = f'<path d="M{cx - r} {cy} A{r} {r} 0 0 1 {cx + r} {cy}" fill="{CREAM}" stroke="{INK}" stroke-width="10"/>'
    shadow = f'<path d="M{cx - r + 16} {cy + 16} A{r} {r} 0 0 1 {cx + r + 16} {cy + 16} Z" fill="{INK}"/>'
    base = f'<rect x="{cx - r - 40}" y="{cy}" width="{2 * r + 80}" height="120" rx="10" fill="{TEAL}" stroke="{INK}" stroke-width="8"/>'
    ticks = ""
    for i in range(11):
        a = math.pi - i * math.pi / 10
        x1, y1 = cx + (r - 20) * math.cos(a), cy - (r - 20) * math.sin(a)
        x2, y2 = cx + (r - 70) * math.cos(a), cy - (r - 70) * math.sin(a)
        ticks += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{INK}" stroke-width="{8 if i % 2 == 0 else 4}"/>'
        if i % 2 == 0 and 0 < i < 10:
            lx, ly = cx + (r - 115) * math.cos(a), cy - (r - 115) * math.sin(a) + 12
            ticks += text(lx, ly, f"₹{i * 2}L", 30, INK, MONO, 700, "middle")
    a = math.pi - 4 * math.pi / 10
    nx, ny = cx + (r - 60) * math.cos(a), cy - (r - 60) * math.sin(a)
    needle = (f'<line x1="{cx}" y1="{cy}" x2="{nx:.1f}" y2="{ny:.1f}" stroke="{RED}" stroke-width="16" stroke-linecap="round"/>'
              f'<circle cx="{cx}" cy="{cy}" r="34" fill="{INK}"/>')
    ice = (f'<path d="M{nx - 70:.0f} {ny - 10:.0f} l40 -50 l30 40 l35 -60 l25 70 l40 -30 l-10 80 l-150 10 z" fill="#d7ecef" stroke="{TEAL}" stroke-width="5" opacity="0.92"/>'
           f'<path d="M{nx - 40:.0f} {ny + 20:.0f} l10 30 M{nx + 20:.0f} {ny + 10:.0f} l6 34 M{nx + 70:.0f} {ny + 25:.0f} l4 26" stroke="{TEAL}" stroke-width="5"/>')
    lbl = text(cx, cy + 80, "INCOME CEILING · SET 13.09.2017", 34, CREAM, MONO, 700, "middle", 3)
    pages = ""
    for i, yr in enumerate(["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"]):
        x = 40 + (i % 3) * 105 + (i // 3) * 10
        y = 60 + (i // 3) * 140 + (i % 3) * 16
        rot = -18 + i * 5
        pages += f'<g transform="rotate({rot} {x + 60} {y + 60})">' + box(x, y, 110, 120, CREAM, shadow=6, sw=4, rx=3, extra=
                                                                     f'<rect x="{x}" y="{y}" width="110" height="30" fill="{RED}"/>'
                                                                     + text(x + 55, y + 88, yr, 30, INK, MONO, 700, "middle")) + "</g>"
    flakes = "".join(f'<g stroke="{TEAL}" stroke-width="4" opacity="0.7"><line x1="{x - 14}" y1="{y}" x2="{x + 14}" y2="{y}"/><line x1="{x}" y1="{y - 14}" x2="{x}" y2="{y + 14}"/><line x1="{x - 10}" y1="{y - 10}" x2="{x + 10}" y2="{y + 10}"/><line x1="{x - 10}" y1="{y + 10}" x2="{x + 10}" y2="{y - 10}"/></g>'
                     for x, y in [(1260, 160), (1380, 260), (1180, 300), (1460, 140), (1320, 380)])
    st = stamp(1250, 790, "NO PROPOSAL", rot=-7, size=50, sub="UNDER CONSIDERATION")
    return frame(u, pages + shadow + arc + ticks + needle + ice + base + lbl + flakes + st,
                 title="An income meter whose needle is frozen in ice at 8 lakh rupees while calendar pages from 2018 to 2026 blow past")


def ceiling_gauge():
    u = "cg"
    floor_y = 800
    ceiling_y = 380
    room = f'<rect x="120" y="{ceiling_y}" width="1360" height="{floor_y - ceiling_y}" fill="url(#lines-{u})"/>'
    ceiling = (f'<rect x="100" y="{ceiling_y - 40}" width="1400" height="40" fill="{INK}"/>'
               + text(800, 70, "THE 50% CEILING · INDRA SAWHNEY, 1992", 30, INK, MONO, 700, "middle", 3))
    bars = ""
    data = [("TN", 69, TEAL, False), ("MH 2018", 68, OCHRE, True), ("BIHAR 2023", 65, RED, True), ("50%", 50, CREAM, False)]
    for i, (lbl, pct, col, struck) in enumerate(data):
        x = 220 + i * 320
        h = (floor_y - ceiling_y) * pct / 50
        top = floor_y - h
        bars += box(x, top, 200, h, col, shadow=14, rx=4)
        bars += text(x + 100, floor_y + 60, lbl, 30, INK, MONO, 700, "middle", 2)
        bars += text(x + 100, floor_y - 40, f"{pct}%", 52, CREAM if col in (TEAL, RED) else INK, SANS, 900, "middle")
        if pct > 50:
            # crack in the ceiling where the bar breaks through
            bars += f'<path d="M{x - 30} {ceiling_y - 40} l40 -50 l30 40 l40 -60 l30 55 l40 -45 l30 60" fill="none" stroke="{CREAM}" stroke-width="8"/>'
        if struck:
            bars += stamp(x + 100, floor_y - 180, "STRUCK", rot=-14, size=40, pad=18, color=CREAM if col == RED else INK)
    floor = f'<rect x="100" y="{floor_y}" width="1400" height="14" fill="{INK}"/>'
    pending = stamp(1320, 200, "MH 2024: IN COURT", rot=6, size=34, color=TEAL, pad=18)
    return frame(u, room + bars + ceiling + floor + pending,
                 title="Reservation bars breaking through a ceiling marked 50 percent; Maharashtra 2018 and Bihar 2023 stamped struck down")


def constitution_amend():
    u = "ca"
    book = (box(260, 170, 1080, 620, CREAM, shadow=20, rx=10)
            + f'<line x1="800" y1="170" x2="800" y2="790" stroke="{INK}" stroke-width="8"/>'
            + f'<rect x="260" y="170" width="1080" height="40" fill="{TEAL}" stroke="{INK}" stroke-width="5"/>'
            + text(530, 290, "THE CONSTITUTION", 30, INK, SERIF, 700, "middle", 4)
            + text(530, 330, "OF INDIA · 1950", 22, INK, MONO, 700, "middle", 4))
    lines = "".join(f'<line x1="{310 if x < 800 else 850}" y1="{y}" x2="{750 if x < 800 else 1290}" y2="{y}" stroke="{INK}" stroke-width="3" opacity="0.3"/>'
                    for x in (400, 1000) for y in range(380, 760, 34))
    patches = ""
    notes = [("1ST · 1951", 330, 420, -6, "#f7e08a"), ("77TH · 1995", 560, 540, 5, OCHRE), ("93RD · 2005", 880, 300, -4, "#f7e08a"),
             ("103RD · 2019", 1060, 470, 7, RED), ("105TH · 2021", 900, 620, -8, TEAL), ("102ND · 2018", 1100, 650, 4, "#f7e08a")]
    for label, x, y, rot, col in notes:
        tc = CREAM if col in (RED, TEAL) else INK
        patches += f'<g transform="rotate({rot} {x + 110} {y + 50})">' + box(x, y, 220, 100, col, shadow=8, rx=2, extra=
                                                                            text(x + 110, y + 62, label, 26, tc, MONO, 700, "middle", 1)) + "</g>"
    pen = (f'<g transform="rotate(28 1350 200)"><rect x="1200" y="180" width="320" height="44" rx="22" fill="{INK}"/>'
           f'<path d="M1200 180 l-60 22 l60 22 z" fill="{OCHRE}" stroke="{INK}" stroke-width="5"/>'
           f'<rect x="1440" y="176" width="16" height="52" fill="{OCHRE}"/></g>')
    st = stamp(1150, 830, "AMENDED AGAIN", rot=-5, size=46, pad=20)
    return frame(u, book + lines + patches + pen + st,
                 title="An open copy of the Constitution covered in sticky notes for the 1st, 77th, 93rd, 102nd, 103rd and 105th amendments")


def court_stamp():
    u = "cs"
    gazette = (box(180, 160, 820, 640, CREAM, shadow=18, rx=4, rot=-4, extra=
                   text(590, 250, "THE GAZETTE", 44, INK, SERIF, 700, "middle", 6)
                   + text(590, 292, "EXTRAORDINARY · ACT No. —", 22, INK, MONO, 700, "middle", 3)
                   + "".join(f'<line x1="230" y1="{y}" x2="950" y2="{y}" stroke="{INK}" stroke-width="3" opacity="0.3"/>' for y in range(340, 760, 30))))
    st = stamp(590, 520, "STRUCK DOWN", rot=-14, size=88, sub="SEE: 50% CEILING")
    # gavel
    gavel = (f'<g transform="rotate(-30 1220 420)">'
             f'<rect x="1100" y="340" width="260" height="130" rx="22" fill="{INK}"/>'
             f'<rect x="1088" y="330" width="34" height="150" rx="10" fill="{OCHRE}" stroke="{INK}" stroke-width="6"/>'
             f'<rect x="1338" y="330" width="34" height="150" rx="10" fill="{OCHRE}" stroke="{INK}" stroke-width="6"/>'
             f'<rect x="1210" y="470" width="40" height="330" rx="16" fill="{TEAL}" stroke="{INK}" stroke-width="6"/></g>')
    block = box(1080, 700, 340, 90, OCHRE, shadow=12, rx=10)
    bang = "".join(f'<line x1="{1250 + 120 * __import__("math").cos(a / 10):.0f}" y1="{600 + 120 * __import__("math").sin(a / 10):.0f}" x2="{1250 + 170 * __import__("math").cos(a / 10):.0f}" y2="{600 + 170 * __import__("math").sin(a / 10):.0f}" stroke="{RED}" stroke-width="8" stroke-linecap="round"/>' for a in (35, 40, 45, 52, 58))
    return frame(u, gazette + st + block + gavel + bang,
                 title="A gazette notification of a state quota law stamped struck down, next to a judge's gavel")


def promotion_ladder():
    u = "pl"
    rails = (f'<rect x="560" y="120" width="34" height="700" fill="{OCHRE}" stroke="{INK}" stroke-width="6"/>'
             f'<rect x="900" y="120" width="34" height="700" fill="{OCHRE}" stroke="{INK}" stroke-width="6"/>')
    rungs = ""
    for i in range(7):
        y = 760 - i * 100
        rungs += f'<rect x="594" y="{y}" width="306" height="22" fill="{CREAM}" stroke="{INK}" stroke-width="5"/>'
        rungs += text(1000, y + 18, f"GRADE {chr(65 + i)}", 26, INK, MONO, 700, ls=2)
    tape_measure = (f'<g transform="rotate(-6 330 470)">' + box(170, 330, 300, 240, TEAL, shadow=12, rx=40, extra=
                    f'<circle cx="320" cy="450" r="70" fill="{CREAM}" stroke="{INK}" stroke-width="6"/>'
                    + text(320, 462, "COUNT", 34, INK, SANS, 900, "middle", 2)) + "</g>"
                    + f'<path d="M460 470 L 590 520" stroke="{OCHRE}" stroke-width="26"/>'
                    + "".join(f'<line x1="{470 + i * 14}" y1="{474 + i * 5}" x2="{466 + i * 14}" y2="{486 + i * 5}" stroke="{INK}" stroke-width="3"/>' for i in range(9)))
    clip = (f'<g transform="rotate(7 1270 560)">' + box(1140, 400, 260, 320, CREAM, shadow=12, rx=8, extra=
            text(1270, 460, "CADRE DATA", 26, INK, MONO, 700, "middle", 2)
            + "".join(f'<rect x="1170" y="{490 + i * 44}" width="200" height="22" fill="none" stroke="{INK}" stroke-width="3" stroke-dasharray="8 6"/>' for i in range(5)))
            + "</g>")
    years = (stamp(330, 790, "2006", rot=-6, size=46, color=TEAL, pad=18) + stamp(510, 160, "2018", rot=5, size=46, color=TEAL, pad=18)
             + stamp(1300, 170, "2022 · AGAIN", rot=-4, size=46, pad=18))
    return frame(u, rails + rungs + tape_measure + clip + years,
                 title="A promotion ladder with grades A to G beside an empty cadre data sheet and a tape measure labelled count, with years 2006, 2018 and 2022")


def archive_history():
    u = "ah"
    sheets = ""
    items = [(170, 150, -8, "26 JULY 1902", "KOLHAPUR", "50% of vacancies"), (600, 110, 4, "1921", "MADRAS", "Communal G.O."),
             (1030, 170, -3, "24 SEPT 1932", "POONA", "148 reserved seats")]
    for x, y, rot, date, place, line in items:
        sheets += f'<g transform="rotate({rot} {x + 190} {y + 260})">' + box(x, y, 380, 520, "#efe3c8", shadow=14, rx=3, extra=
                  text(x + 190, y + 110, place, 44, INK, SERIF, 700, "middle", 4)
                  + f'<line x1="{x + 40}" y1="{y + 135}" x2="{x + 340}" y2="{y + 135}" stroke="{INK}" stroke-width="3"/>'
                  + "".join(f'<line x1="{x + 40}" y1="{y + 175 + i * 30}" x2="{x + 340 - (i % 3) * 40}" y2="{y + 175 + i * 30}" stroke="{INK}" stroke-width="3" opacity="0.28"/>' for i in range(9))
                  + text(x + 190, y + 470, line, 26, RED, SERIF, 700, "middle")) + "</g>"
        sheets += stamp(x + 190, y + 560, date, rot=rot - 6, size=30, color=TEAL, pad=14)
    pin = "".join(f'<circle cx="{x}" cy="{y}" r="16" fill="{RED}" stroke="{INK}" stroke-width="5"/>' for x, y in [(360, 145), (790, 100), (1220, 160)])
    thread = f'<path d="M360 145 C 520 70, 640 80, 790 100 S 1080 170, 1220 160" fill="none" stroke="{RED}" stroke-width="5"/>'
    return frame(u, sheets + thread + pin,
                 title="Three archival sheets pinned and linked by red thread: Kolhapur 1902, Madras 1921 and the Poona Pact 1932")


def chair_on_files():
    u = "cf"
    stack = file_stack(560, 800, 480, 7, labels=["SECC 2011", "ROHINI REPORT", "CREAMY LAYER 2017", "CADRE DATA", "EWS ESTIMATE", "", ""])
    top = 800 - 6 * 58
    chair = (f'<g transform="translate(0,0)">'
             f'<rect x="690" y="{top - 330}" width="230" height="250" rx="26" fill="{INK}"/>'
             f'<rect x="712" y="{top - 312}" width="186" height="120" rx="12" fill="#ffffff"/>'  # the white towel
             f'<path d="M712 {top - 200} l20 12 l20 -10 l20 12 l20 -10 l20 12 l20 -10 l20 12 l20 -10 l26 8" fill="none" stroke="{PAPER_DARK}" stroke-width="5"/>'
             f'<rect x="660" y="{top - 90}" width="290" height="50" rx="14" fill="{INK}"/>'
             f'<rect x="630" y="{top - 160}" width="34" height="100" rx="10" fill="{INK}"/><rect x="946" y="{top - 160}" width="34" height="100" rx="10" fill="{INK}"/>'
             f'<rect x="790" y="{top - 40}" width="30" height="40" fill="{INK}"/>'
             f'</g>')
    ref = text(800, top - 350, "RESERVED FOR: THE STATE", 24, INK, MONO, 700, "middle", 3)
    st = stamp(1250, 330, "NO DATA", rot=10, size=72, sub="AVAILABLE, APPARENTLY")
    st2 = stamp(330, 640, "CONFIDENTIAL", rot=-12, size=40, color=TEAL, pad=18)
    return frame(u, stack + chair + ref + st + st2,
                 title="An empty government office chair with a white towel on its backrest, sitting on a tall stack of files labelled SECC 2011, Rohini report, creamy layer 2017 and cadre data, stamped no data")


def bill_crash():
    u = "bc"
    wall = (f'<rect x="1080" y="80" width="280" height="760" fill="{PAPER_DARK}" stroke="{INK}" stroke-width="8"/>'
            + "".join(f'<line x1="1080" y1="{y}" x2="1360" y2="{y}" stroke="{INK}" stroke-width="4"/>' for y in range(160, 840, 80))
            + "".join(f'<line x1="{1150 + (i % 2) * 70}" y1="{80 + i * 80}" x2="{1150 + (i % 2) * 70}" y2="{160 + i * 80}" stroke="{INK}" stroke-width="4"/>' for i in range(9))
            + f'<rect x="1120" y="400" width="200" height="110" fill="{CREAM}" stroke="{INK}" stroke-width="6"/>'
            + text(1220, 476, "50%", 64, RED, SANS, 900, "middle"))
    trail = f'<path d="M140 720 C 400 640, 600 300, 1040 420" fill="none" stroke="{INK}" stroke-width="5" stroke-dasharray="18 14"/>'
    plane = (f'<g transform="translate(-980 -430) scale(2) rotate(14 980 430)">'
             f'<path d="M900 380 L1070 430 L900 470 L930 430 Z" fill="{CREAM}" stroke="{INK}" stroke-width="6"/>'
             f'<path d="M930 430 L1070 430" stroke="{INK}" stroke-width="4"/>'
             + text(965, 418, "QUOTA BILL", 18, RED, MONO, 700, "middle") + "</g>")
    crumple = "".join(f'<path d="M{1040 + dx} {430 + dy} l{lx} {ly}" stroke="{RED}" stroke-width="8" stroke-linecap="round"/>'
                      for dx, dy, lx, ly in [(0, -60, -30, -40), (-10, 60, -40, 30), (-40, 0, -50, 0), (10, -100, 0, -40)])
    ballots = "".join(f'<g transform="rotate({r} {x} {y})">' + box(x, y, 90, 110, CREAM, shadow=6, sw=4, rx=3, extra=
                      f'<path d="M{x + 25} {y + 55} l15 18 l28 -36" stroke="{TEAL}" stroke-width="8" fill="none"/>') + "</g>"
                      for x, y, r in [(150, 180, -12), (300, 110, 9), (450, 210, -5)])
    applause = text(320, 380, "APPLAUSE IN ELECTION SEASON", 26, INK, MONO, 700, "middle", 2, rot=-4)
    st = stamp(1220, 760, "SEE YOU IN COURT", rot=-8, size=34, pad=16)
    return frame(u, ballots + applause + trail + wall + crumple + plane + st,
                 title="A paper plane folded from a quota bill crashing into a brick wall marked 50 percent, launched from a pile of ballots")


def magnifier_hero():
    u = "mh"
    stack = (file_stack(170, 760, 420, 7, labels=["NOTIFICATION", "AFFIDAVIT", "GAZETTE", "COMMISSION", "JUDGMENT", "", ""])
             + file_stack(1010, 780, 420, 6, labels=["PRESS RELEASE", "PRESS RELEASE", "PRESS RELEASE", "", "", ""],
                          colors=(CREAM, "#f7e08a", CREAM, "#f7e08a", CREAM, "#f7e08a")))
    lens = (f'<circle cx="760" cy="380" r="230" fill="#ffffff" opacity="0.35"/>'
            f'<circle cx="760" cy="380" r="230" fill="url(#dots-red-{u})" opacity="0.5"/>'
            f'<circle cx="760" cy="380" r="230" fill="none" stroke="{INK}" stroke-width="30"/>'
            f'<circle cx="760" cy="380" r="200" fill="none" stroke="{OCHRE}" stroke-width="6"/>'
            f'<g transform="rotate(45 1000 620)"><rect x="940" y="590" width="300" height="64" rx="20" fill="{INK}"/></g>'
            + text(760, 360, "WHAT THEY", 46, INK, SANS, 900, "middle", 3)
            + text(760, 420, "FILED", 70, RED, SERIF, 700, "middle", 2))
    vs = text(1220, 300, "vs. WHAT THEY SAID", 30, INK, MONO, 700, "middle", 3, rot=-6)
    st = stamp(340, 170, "SOURCED", rot=-10, size=52, color=TEAL)
    return frame(u, stack + lens + vs + st,
                 title="A magnifying glass held over a stack of notifications, affidavits and judgments, next to a pile of press releases")


SCENES = {
    "sealed-report": sealed_report,
    "census-clipboard": census_clipboard,
    "frozen-meter": frozen_meter,
    "ceiling-gauge": ceiling_gauge,
    "constitution-amend": constitution_amend,
    "court-stamp": court_stamp,
    "promotion-ladder": promotion_ladder,
    "archive-history": archive_history,
    "chair-on-files": chair_on_files,
    "bill-crash": bill_crash,
    "magnifier-hero": magnifier_hero,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in SCENES.items():
        (OUT / f"{name}.svg").write_text(fn(), encoding="utf-8")
        print("wrote", name)
