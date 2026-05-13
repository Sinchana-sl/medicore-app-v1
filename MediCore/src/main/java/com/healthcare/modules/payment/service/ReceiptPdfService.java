package com.healthcare.modules.payment.service;

import com.healthcare.modules.payment.dto.ReceiptData;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Service
@Slf4j
public class ReceiptPdfService {

    private static final Color BRAND_BLUE    = new Color(0, 97, 165);
    private static final Color BRAND_TEAL    = new Color(8, 145, 178);
    private static final Color LIGHT_GRAY    = new Color(244, 246, 251);
    private static final Color TEXT_DARK     = new Color(15, 23, 42);
    private static final Color TEXT_MUTED    = new Color(100, 116, 139);
    private static final Color SUCCESS_GREEN = new Color(22, 163, 74);
    private static final Color DIVIDER       = new Color(226, 232, 240);

    public byte[] generate(ReceiptData data) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            addHeader(doc, writer);
            addStatusBadge(doc);
            addReceiptMeta(doc, data);
            addDivider(doc);
            addSection(doc, "Patient Details", new String[][]{
                    {"Name",  data.getPatientName()},
                    {"Email", data.getPatientEmail()},
            });
            addDivider(doc);
            addSection(doc, "Appointment Details", new String[][]{
                    {"Doctor",       data.getDoctorName()},
                    {"Speciality",   data.getSpecialty()},
                    {"Clinic",       data.getClinicName()},
                    {"Date",         data.getAppointmentDate()},
                    {"Time",         data.getAppointmentTime()},
                    {"Consultation", formatConsultType(data.getConsultationType())},
            });
            addDivider(doc);
            addPaymentSummary(doc, data);
            addDivider(doc);
            addFooter(doc);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("PDF generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Could not generate receipt PDF", e);
        }
    }

    private void addHeader(Document doc, PdfWriter writer) throws DocumentException {
        PdfContentByte cb = writer.getDirectContent();
        float w = doc.right() - doc.left();

        // Solid blue header bar
        cb.saveState();
        cb.setColorFill(BRAND_BLUE);
        cb.rectangle(doc.left(), doc.top() - 72, w, 72);
        cb.fill();
        cb.restoreState();

        // White MediCore title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, Color.WHITE);
        Paragraph title = new Paragraph("MediCore", titleFont);
        title.setAlignment(Element.ALIGN_LEFT);
        title.setSpacingBefore(16);
        doc.add(title);

        Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 11, new Color(200, 230, 255));
        Paragraph sub = new Paragraph("Healthcare at your fingertips", subFont);
        sub.setAlignment(Element.ALIGN_LEFT);
        sub.setSpacingBefore(-2);
        sub.setSpacingAfter(20);
        doc.add(sub);
    }

    private void addStatusBadge(Document doc) throws DocumentException {
        Font badgeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, SUCCESS_GREEN);
        Paragraph badge = new Paragraph("✔  Payment Confirmed", badgeFont);
        badge.setAlignment(Element.ALIGN_CENTER);
        badge.setSpacingBefore(18);
        badge.setSpacingAfter(4);
        doc.add(badge);

        Font receiptLabel = FontFactory.getFont(FontFactory.HELVETICA, 10, TEXT_MUTED);
        Paragraph label = new Paragraph("OFFICIAL PAYMENT RECEIPT", receiptLabel);
        label.setAlignment(Element.ALIGN_CENTER);
        label.setSpacingAfter(14);
        doc.add(label);
    }

    private void addReceiptMeta(Document doc, ReceiptData data) throws DocumentException {
        PdfPTable metaTable = new PdfPTable(2);
        metaTable.setWidthPercentage(100);
        metaTable.setSpacingAfter(4);
        metaTable.setWidths(new float[]{1, 1});

        metaTable.addCell(metaCell("Receipt No.", data.getReceiptNumber(), Element.ALIGN_LEFT));
        metaTable.addCell(metaCell("Date", data.getPaymentDate(), Element.ALIGN_RIGHT));
        metaTable.addCell(metaCell("Appointment ID",
                data.getAppointmentId().substring(0, 8).toUpperCase() + "…",
                Element.ALIGN_LEFT));
        metaTable.addCell(metaCell("Payment Method", data.getPaymentMethod(), Element.ALIGN_RIGHT));
        doc.add(metaTable);
    }

    private PdfPCell metaCell(String label, String value, int align) {
        Font lf = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED);
        Font vf = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, TEXT_DARK);
        Phrase content = new Phrase();
        content.add(new Chunk(label + "\n", lf));
        content.add(new Chunk(value != null ? value : "—", vf));
        PdfPCell cell = new PdfPCell(content);
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setHorizontalAlignment(align);
        cell.setPaddingBottom(6);
        cell.setBackgroundColor(Color.WHITE);
        return cell;
    }

    private void addSection(Document doc, String title, String[][] rows) throws DocumentException {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BRAND_BLUE);
        Paragraph sectionTitle = new Paragraph(title.toUpperCase(), sectionFont);
        sectionTitle.setSpacingBefore(10);
        sectionTitle.setSpacingAfter(6);
        doc.add(sectionTitle);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2.2f, 3.8f});

        for (String[] row : rows) {
            if (row[1] == null || row[1].isBlank()) continue;
            table.addCell(labelCell(row[0]));
            table.addCell(valueCell(row[1]));
        }
        doc.add(table);
    }

    private PdfPCell labelCell(String text) {
        Font f = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_MUTED);
        PdfPCell cell = new PdfPCell(new Phrase(text, f));
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setBackgroundColor(LIGHT_GRAY);
        cell.setPadding(6);
        cell.setPaddingLeft(10);
        return cell;
    }

    private PdfPCell valueCell(String text) {
        Font f = FontFactory.getFont(FontFactory.HELVETICA, 9.5f, TEXT_DARK);
        PdfPCell cell = new PdfPCell(new Phrase(text, f));
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setBackgroundColor(LIGHT_GRAY);
        cell.setPadding(6);
        return cell;
    }

    private void addPaymentSummary(Document doc, ReceiptData data) throws DocumentException {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BRAND_BLUE);
        Paragraph sectionTitle = new Paragraph("PAYMENT SUMMARY", sectionFont);
        sectionTitle.setSpacingBefore(10);
        sectionTitle.setSpacingAfter(6);
        doc.add(sectionTitle);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3f, 3f});

        // Amount row — highlighted
        Font amtLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, TEXT_DARK);
        Font amtValue = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, BRAND_BLUE);

        PdfPCell labelC = new PdfPCell(new Phrase("Consultation Fee", amtLabel));
        labelC.setBorder(PdfPCell.NO_BORDER);
        labelC.setBackgroundColor(new Color(239, 246, 255));
        labelC.setPadding(10);
        labelC.setPaddingLeft(10);

        PdfPCell valueC = new PdfPCell(new Phrase(data.getAmountFormatted(), amtValue));
        valueC.setBorder(PdfPCell.NO_BORDER);
        valueC.setBackgroundColor(new Color(239, 246, 255));
        valueC.setPadding(10);
        valueC.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(labelC);
        table.addCell(valueC);

        // Status row
        Font statusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, SUCCESS_GREEN);
        PdfPCell statusLabel = new PdfPCell(new Phrase("Status", FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_MUTED)));
        statusLabel.setBorder(PdfPCell.NO_BORDER);
        statusLabel.setBackgroundColor(new Color(239, 246, 255));
        statusLabel.setPaddingLeft(10);
        statusLabel.setPaddingBottom(8);

        PdfPCell statusValue = new PdfPCell(new Phrase("PAID ✔", statusFont));
        statusValue.setBorder(PdfPCell.NO_BORDER);
        statusValue.setBackgroundColor(new Color(239, 246, 255));
        statusValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        statusValue.setPaddingBottom(8);

        table.addCell(statusLabel);
        table.addCell(statusValue);
        doc.add(table);
    }

    private void addDivider(Document doc) throws DocumentException {
        LineSeparator line = new LineSeparator(0.5f, 100, DIVIDER, Element.ALIGN_CENTER, -4);
        Chunk divider = new Chunk(line);
        Paragraph p = new Paragraph();
        p.add(divider);
        p.setSpacingBefore(8);
        p.setSpacingAfter(2);
        doc.add(p);
    }

    private void addFooter(Document doc) throws DocumentException {
        Font f = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED);
        Paragraph footer = new Paragraph(
                "This is a computer-generated receipt and does not require a signature.\n" +
                "For queries, contact support@medicore.health | MediCore Healthcare Pvt. Ltd.", f);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(12);
        doc.add(footer);
    }

    private String formatConsultType(String type) {
        if (type == null) return "In-Person";
        return switch (type) {
            case "VIDEO"     -> "Video Consultation";
            case "AUDIO"     -> "Audio Consultation";
            case "IN_PERSON" -> "In-Person Visit";
            default          -> type;
        };
    }
}
