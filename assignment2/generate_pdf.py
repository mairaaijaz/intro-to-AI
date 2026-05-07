"""
Generate the manual calculation PDF for Assignment 2 Part B (both questions).
Now includes XOR geometry diagram in Q2 Part B.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                 Table, TableStyle, HRFlowable, Image)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import os

OUTPUT  = r"d:\maira\intro to AI\assignment2\manual_calculations.pdf"
XOR_IMG = r"d:\maira\intro to AI\assignment2\xor_diagram.png"

doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
                         rightMargin=2*cm, leftMargin=2*cm,
                         topMargin=2*cm, bottomMargin=2*cm)

styles = getSampleStyleSheet()
heading1 = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=14,
                           textColor=colors.HexColor('#1a237e'), spaceAfter=6)
heading2 = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=12,
                           textColor=colors.HexColor('#283593'), spaceAfter=4)
body     = ParagraphStyle('body', parent=styles['Normal'], fontSize=10, leading=16,
                           spaceAfter=6, alignment=TA_JUSTIFY)
mono     = ParagraphStyle('mono', parent=styles['Normal'], fontSize=9, leading=14,
                           fontName='Courier', spaceAfter=4,
                           backColor=colors.HexColor('#f5f5f5'))
caption  = ParagraphStyle('cap', parent=styles['Normal'], fontSize=9,
                           alignment=TA_CENTER, textColor=colors.HexColor('#555555'),
                           spaceAfter=8)

story = []

# ══════════════════════════════════════════════════════════════
# HEADER
# ══════════════════════════════════════════════════════════════
story.append(Paragraph("Assignment 2 — Manual Calculations (Part B)", heading1))
story.append(Paragraph("Introduction to Artificial Intelligence", body))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1a237e')))
story.append(Spacer(1, 0.3*cm))

# ══════════════════════════════════════════════════════════════
# QUESTION 1 PART B
# ══════════════════════════════════════════════════════════════
story.append(Paragraph("Question 1 Part B — Decision Tree: Manual Information Gain Calculation", heading1))
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Dataset (Play Tennis — 5 examples)", heading2))
tbl_data = [
    ['#', 'Outlook', 'Humidity', 'Play'],
    ['1', 'Sunny',   'High',     'No'],
    ['2', 'Sunny',   'Normal',   'Yes'],
    ['3', 'Overcast','High',     'Yes'],
    ['4', 'Rain',    'High',     'No'],
    ['5', 'Rain',    'Normal',   'Yes'],
]
t = Table(tbl_data, colWidths=[1*cm, 4*cm, 4*cm, 3*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1a237e')),
    ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
    ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
    ('ALIGN',      (0,0), (-1,-1), 'CENTER'),
    ('GRID',       (0,0), (-1,-1), 0.5, colors.grey),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#e8eaf6')]),
    ('FONTSIZE',   (0,0), (-1,-1), 9),
]))
story.append(t)
story.append(Spacer(1, 0.4*cm))

story.append(Paragraph("Step 1 — Entropy of the Parent Node (entire dataset)", heading2))
story.append(Paragraph("The parent set S has 5 examples: 3 Yes, 2 No.", body))
story.append(Paragraph("Formula: H(S) = −p(Yes)·log₂p(Yes) − p(No)·log₂p(No)", mono))
story.append(Paragraph("p(Yes) = 3/5 = 0.6,    p(No) = 2/5 = 0.4", mono))
story.append(Paragraph("H(S) = −0.6·log₂(0.6) − 0.4·log₂(0.4)", mono))
story.append(Paragraph("      = −0.6·(−0.7370) − 0.4·(−1.3219)", mono))
story.append(Paragraph("      = 0.4422 + 0.5288", mono))
story.append(Paragraph("H(S) = 0.9710 bits", mono))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph("Step 2 — Information Gain for Outlook", heading2))
story.append(Paragraph("Outlook has 3 values: Sunny (2 rows), Overcast (1 row), Rain (2 rows).", body))
story.append(Paragraph("  Sunny subset   → rows 1,2 → [No, Yes] → 1 Yes, 1 No", mono))
story.append(Paragraph("  H(Sunny) = −0.5·log₂(0.5) − 0.5·log₂(0.5) = 1.0000", mono))
story.append(Paragraph("  Overcast subset → row 3 → [Yes] → pure → H(Overcast) = 0.0000", mono))
story.append(Paragraph("  Rain subset    → rows 4,5 → [No, Yes] → 1 Yes, 1 No", mono))
story.append(Paragraph("  H(Rain) = −0.5·log₂(0.5) − 0.5·log₂(0.5) = 1.0000", mono))
story.append(Paragraph("  Weighted Entropy = (2/5)·1.0 + (1/5)·0.0 + (2/5)·1.0 = 0.8000", mono))
story.append(Paragraph("  Gain(Outlook) = 0.9710 − 0.8000 = 0.1710", mono))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph("Step 3 — Information Gain for Humidity", heading2))
story.append(Paragraph("Humidity has 2 values: High (3 rows), Normal (2 rows).", body))
story.append(Paragraph("  High subset   → rows 1,3,4 → [No, Yes, No] → 1 Yes, 2 No", mono))
story.append(Paragraph("  H(High) = −(1/3)·log₂(1/3) − (2/3)·log₂(2/3)", mono))
story.append(Paragraph("           = 0.5283 + 0.3900 = 0.9183", mono))
story.append(Paragraph("  Normal subset → rows 2,5 → [Yes, Yes] → pure → H(Normal) = 0.0000", mono))
story.append(Paragraph("  Weighted Entropy = (3/5)·0.9183 + (2/5)·0.0000 = 0.5510", mono))
story.append(Paragraph("  Gain(Humidity) = 0.9710 − 0.5510 = 0.4200", mono))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph("Step 4 — Choose Root and State Prediction Rules", heading2))
story.append(Paragraph("Gain(Humidity) = 0.4200  >  Gain(Outlook) = 0.1710", body))
story.append(Paragraph("→ Humidity is chosen as the root of the decision stump.", body))
story.append(Paragraph("Rules:", body))
story.append(Paragraph("  • Humidity = High   → majority label: No  (2 No, 1 Yes)", mono))
story.append(Paragraph("  • Humidity = Normal → majority label: Yes (2 Yes, 0 No)", mono))
story.append(Paragraph("✓ These rules exactly match the Python program output.", body))

story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#283593')))
story.append(Spacer(1, 0.4*cm))

# ══════════════════════════════════════════════════════════════
# QUESTION 2 PART B
# ══════════════════════════════════════════════════════════════
story.append(Paragraph("Question 2 Part B — Perceptron: Written Analysis", heading1))
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Did the network learn AND correctly?", heading2))
story.append(Paragraph(
    "Yes. The perceptron learned AND correctly. By epoch 20 all four inputs were already "
    "predicted correctly, and the output for [1,1] converged to ~0.896 by epoch 100. "
    "This works because AND is linearly separable — a single straight decision boundary "
    "in the 2D input plane can cleanly divide the one positive point (1,1) from the three "
    "negative points (0,0), (0,1), (1,0).",
    body))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph("Did the network learn XOR correctly?", heading2))
story.append(Paragraph(
    "No. The perceptron completely failed to learn XOR. Even after 100 epochs, "
    "all four predictions were wrong. XOR is NOT linearly separable: the two "
    "positive class points (0,1) and (1,0) sit at opposite corners of the unit square, "
    "and so do the two negative points (0,0) and (1,1). In a 2D input plane, no single "
    "straight line (the only boundary a single perceptron can draw) can separate these "
    "diagonal pairs — any line that separates one pair ends up grouping the wrong points "
    "on either side.",
    body))
story.append(Spacer(1, 0.3*cm))

# ── XOR Geometry Diagram ──
if os.path.exists(XOR_IMG):
    story.append(Paragraph("Geometric Illustration — Why XOR Cannot Be Separated by a Line", heading2))
    img = Image(XOR_IMG, width=12*cm, height=9*cm)
    img.hAlign = 'CENTER'
    story.append(img)
    story.append(Paragraph(
        "Figure: The four XOR inputs plotted in 2D. Red points (XOR=0) sit at diagonal "
        "corners (0,0) and (1,1); Blue points (XOR=1) sit at the other diagonal corners "
        "(0,1) and (1,0). The dashed line illustrates that any straight decision boundary "
        "misclassifies at least one point — no linear separator exists.",
        caption))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph("How to fix XOR (in one line):", heading2))
story.append(Paragraph(
    "Add a hidden layer with at least 2 neurons and a non-linear activation (sigmoid or ReLU) "
    "to form a Multi-Layer Perceptron (MLP) that can learn the non-linear XOR boundary.",
    body))

doc.build(story)
print("PDF created:", OUTPUT)
