import pdfplumber
import json

# Open the PDF
pdf_path = "SBSS-Joe-Soap-Sheets-2016.pdf"

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}\n")

    # Extract text from all pages
    full_text = ""
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        full_text += f"\n\n--- PAGE {i+1} ---\n{text}"
        print(f"Page {i+1} extracted")

    # Write the full text to a file for inspection
    with open("pdf_full_content.txt", "w", encoding="utf-8") as f:
        f.write(full_text)

    print("\nFull content saved to pdf_full_content.txt")
    print("\nFirst 2000 characters:\n")
    print(full_text[:2000])
