import React, { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

function safeFilename(value) {
  return (value || "admin-data").toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "admin-data";
}

function cellValue(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function rowValues(row, columns) {
  return columns.map((column) => cellValue(typeof column.value === "function" ? column.value(row) : row?.[column.key]));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadCsv(title, columns, rows) {
  const header = columns.map((column) => column.label);
  const lines = [header, ...rows.map((row) => rowValues(row, columns))].map((values) => values.map((value) => `"${value.replaceAll('"', '""')}"`).join(","));
  downloadBlob(new Blob([`\ufeff${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" }), `${safeFilename(title)}.csv`);
}

function downloadExcel(title, columns, rows) {
  const data = rows.map((row) => Object.fromEntries(columns.map((column, index) => [column.label, rowValues(row, columns)[index]])));
  const worksheet = XLSX.utils.json_to_sheet(data.length ? data : [Object.fromEntries(columns.map((column) => [column.label, ""]))]);
  worksheet["!cols"] = columns.map((column) => ({ wch: Math.min(Math.max(column.label.length + 3, 14), 34) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, `${safeFilename(title)}.xlsx`);
}

function drawPdfHeader(pdf, title, columns, widths, y, left) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  columns.forEach((column, index) => {
    pdf.text(column.label, left + widths.slice(0, index).reduce((sum, width) => sum + width, 0), y);
  });
  pdf.setDrawColor(203, 213, 225);
  pdf.line(left, y + 6, left + widths.reduce((sum, width) => sum + width, 0), y + 6);
}

function downloadPdf(title, columns, rows) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const usableWidth = pageWidth - margin * 2;
  const widths = columns.map(() => usableWidth / columns.length);
  const lineHeight = 10;
  let y = margin;

  const drawPageTitle = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(15, 23, 42);
    pdf.text(title, margin, y);
    y += 16;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Exported ${new Date().toLocaleString("en-IN")} • ${rows.length} records`, margin, y);
    y += 18;
    drawPdfHeader(pdf, title, columns, widths, y, margin);
    y += 18;
  };

  drawPageTitle();
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(51, 65, 85);

  rows.forEach((row) => {
    const values = rowValues(row, columns);
    const wrapped = values.map((value, index) => pdf.splitTextToSize(value, Math.max(widths[index] - 8, 30)));
    const rowHeight = Math.max(...wrapped.map((lines) => lines.length), 1) * lineHeight + 8;
    if (y + rowHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      drawPageTitle();
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(51, 65, 85);
    }
    wrapped.forEach((lines, index) => {
      const x = margin + widths.slice(0, index).reduce((sum, width) => sum + width, 0) + 3;
      pdf.text(lines, x, y);
    });
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, y + rowHeight - 3, margin + usableWidth, y + rowHeight - 3);
    y += rowHeight;
  });

  pdf.save(`${safeFilename(title)}.pdf`);
}

export default function AdminExportButtons({ title = "Admin data", columns = [], rows = [] }) {
  const [busy, setBusy] = useState("");
  const exportRows = useMemo(() => Array.isArray(rows) ? rows : [], [rows]);
  const run = (format, callback) => {
    setBusy(format);
    try {
      callback(title, columns, exportRows);
    } finally {
      window.setTimeout(() => setBusy(""), 350);
    }
  };

  const buttonClass = "inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60";
  return <div className="flex flex-wrap items-center gap-2" aria-label={`Export ${title}`}>
    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mr-1">Export</span>
    <button type="button" className={buttonClass} disabled={!!busy} onClick={() => run("pdf", downloadPdf)}><FileText size={14} /> PDF</button>
    <button type="button" className={buttonClass} disabled={!!busy} onClick={() => run("csv", downloadCsv)}><FileDown size={14} /> CSV</button>
    <button type="button" className={buttonClass} disabled={!!busy} onClick={() => run("excel", downloadExcel)}><FileSpreadsheet size={14} /> Excel</button>
  </div>;
}
