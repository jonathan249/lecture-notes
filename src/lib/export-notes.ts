"use client";

import { jsPDF } from "jspdf";

interface ExportNotesOptions {
  notes: Record<number, string>;
  lectureName: string;
  className?: string;
  numPages: number;
}

/**
 * Strips HTML tags and converts to plain text while preserving structure
 */
function htmlToPlainText(html: string): string {
  // Create a temporary element to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Convert specific elements to formatted text
  const processNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    const children = Array.from(node.childNodes).map(processNode).join("");

    switch (tagName) {
      case "h1":
        return `\n${children}\n${"=".repeat(children.length)}\n`;
      case "h2":
        return `\n${children}\n${"-".repeat(children.length)}\n`;
      case "h3":
        return `\n### ${children}\n`;
      case "p":
        return `${children}\n\n`;
      case "br":
        return "\n";
      case "ul":
        return `${children}\n`;
      case "ol":
        return `${children}\n`;
      case "li":
        const parent = element.parentElement;
        if (parent?.tagName.toLowerCase() === "ol") {
          const index =
            Array.from(parent.children).indexOf(element as Element) + 1;
          return `  ${index}. ${children}\n`;
        }
        // Check if it's a task item
        const checkbox = element.querySelector('input[type="checkbox"]');
        if (checkbox) {
          const checked = (checkbox as HTMLInputElement).checked;
          return `  [${checked ? "x" : " "}] ${children.replace(/^\s*/, "")}\n`;
        }
        return `  • ${children}\n`;
      case "blockquote":
        return children
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n");
      case "code":
        if (element.parentElement?.tagName.toLowerCase() === "pre") {
          return children;
        }
        return `\`${children}\``;
      case "pre":
        return `\n\`\`\`\n${children}\n\`\`\`\n`;
      case "strong":
      case "b":
        return `**${children}**`;
      case "em":
      case "i":
        return `_${children}_`;
      case "u":
        return children; // Underline not supported in plain text
      case "mark":
        return `==${children}==`;
      case "a":
        const href = element.getAttribute("href");
        return href ? `[${children}](${href})` : children;
      case "hr":
        return "\n---\n";
      case "div":
        return `${children}\n`;
      default:
        return children;
    }
  };

  return processNode(temp).trim();
}

/**
 * Exports all notes to a PDF file with slide numbers
 */
export async function exportNotesToPDF({
  notes,
  lectureName,
  className,
  numPages,
}: ExportNotesOptions): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Title page
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  const title = lectureName || "Lecture Notes";
  pdf.text(title, pageWidth / 2, 60, { align: "center" });

  if (className) {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "normal");
    pdf.text(className, pageWidth / 2, 75, { align: "center" });
  }

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "italic");
  pdf.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    90,
    { align: "center" }
  );

  // Get sorted slide numbers that have notes
  const slideNumbers = Object.keys(notes)
    .map(Number)
    .filter((num) => notes[num] && notes[num].trim() !== "" && notes[num] !== "<p></p>")
    .sort((a, b) => a - b);

  if (slideNumbers.length === 0) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text("No notes to export.", pageWidth / 2, 120, { align: "center" });
    pdf.save(`${lectureName || "notes"}.pdf`);
    return;
  }

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `${slideNumbers.length} slides with notes out of ${numPages} total slides`,
    pageWidth / 2,
    105,
    { align: "center" }
  );

  // Add notes for each slide
  for (const slideNum of slideNumbers) {
    // Start new page for each slide's notes
    pdf.addPage();
    yPosition = margin;

    // Slide header
    pdf.setFillColor(245, 245, 244); // stone-100
    pdf.rect(margin, yPosition - 5, contentWidth, 12, "F");
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(68, 64, 60); // stone-700
    pdf.text(`Slide ${slideNum}`, margin + 5, yPosition + 3);
    yPosition += 15;

    // Reset text color
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    // Convert HTML to plain text
    const plainText = htmlToPlainText(notes[slideNum]);
    const lines = pdf.splitTextToSize(plainText, contentWidth);

    for (const line of lines) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;

        // Add continuation header
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(120, 113, 108); // stone-500
        pdf.text(`Slide ${slideNum} (continued)`, margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        yPosition += 10;
      }

      // Handle different line types for styling
      if (line.startsWith("### ")) {
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text(line.substring(4), margin, yPosition);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        yPosition += 8;
      } else if (line.match(/^=+$/) || line.match(/^-+$/)) {
        // Skip underlines for headings (already handled)
        continue;
      } else if (line.startsWith("> ")) {
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(100, 100, 100);
        pdf.text(line.substring(2), margin + 5, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        yPosition += 6;
      } else if (line.startsWith("```")) {
        pdf.setFont("courier", "normal");
        yPosition += 2;
      } else if (line.trim() === "---") {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;
      } else {
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      }
    }
  }

  // Add page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  // Save the PDF
  const filename = `${(lectureName || "notes").replace(/[^a-z0-9]/gi, "_")}.pdf`;
  pdf.save(filename);
}
