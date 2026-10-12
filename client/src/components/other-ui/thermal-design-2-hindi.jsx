import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";
Font.register({
  family: "NotoSansDevanagari",
  fonts: [
    { src: "/fonts/NotoSansDevanagari-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSansDevanagari-Bold.ttf", fontWeight: "bold" },
  ],
});
Font.register({
  family: "NotoSansBengali",
  fonts: [
    { src: "/fonts/NotoSansBengali-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSansBengali-Bold.ttf", fontWeight: "bold" },
  ],
});
const parseChildrenToString = (child) => {
  if (Array.isArray(child)) return child.map(parseChildrenToString).join("");
  if (child == null || typeof child === "boolean") return "";
  return String(child);
};
const UnicodeText = ({ children, style }) => {
  const text = parseChildrenToString(children);
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const hasBengali = /[\u0980-\u09FF]/.test(text);
  let fontFamily = style?.fontFamily || "Helvetica";
  if (hasBengali) {
    fontFamily = "NotoSansBengali";
  } else if (hasDevanagari) {
    fontFamily = "NotoSansDevanagari";
  }
  return <Text style={[style, { fontFamily }]}>{text}</Text>;
};
const styles = StyleSheet.create({
  page: { width: 226, paddingTop: 14, paddingHorizontal: 11, paddingBottom: 14, backgroundColor: "#ffffff", color: "#111827", fontFamily: "NotoSansDevanagari", fontSize: 8 },
  header: { alignItems: "center", paddingBottom: 9 },
  logo: { width: 42, height: 42, objectFit: "contain", marginBottom: 5 },
  companyName: { fontSize: 15, fontWeight: "bold", textAlign: "center", textTransform: "uppercase", letterSpacing: 0.3 },
  companyText: { fontSize: 6.8, color: "#4b5563", textAlign: "center", marginTop: 2, lineHeight: 1.2 },
  invoiceBadge: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "#111827", borderRadius: 2 },
  invoiceBadgeText: { fontSize: 7.5, fontWeight: "bold", letterSpacing: 1, textAlign: "center" },
  invoiceNumber: { fontSize: 8, fontWeight: "bold", marginTop: 4, textAlign: "center" },
  dottedDivider: { borderBottomWidth: 0.7, borderBottomColor: "#9ca3af", borderStyle: "dashed" },
  metaBox: { marginTop: 7, paddingVertical: 6, borderTopWidth: 0.7, borderBottomWidth: 0.7, borderTopColor: "#d1d5db", borderBottomColor: "#d1d5db" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 1.5 },
  metaLeft: { fontSize: 6.8, color: "#6b7280" },
  metaRight: { fontSize: 7.2, fontWeight: "bold", textAlign: "right" },
  statusPaid: { fontSize: 7, fontWeight: "bold", color: "#15803d" },
  statusPartial: { fontSize: 7, fontWeight: "bold", color: "#b45309" },
  statusUnpaid: { fontSize: 7, fontWeight: "bold", color: "#dc2626" },
  customerBox: { marginTop: 8, padding: 7, backgroundColor: "#f3f4f6", borderRadius: 3 },
  customerLabel: { fontSize: 6, fontWeight: "bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 3 },
  customerName: { fontSize: 9, fontWeight: "bold" },
  customerText: { fontSize: 6.8, color: "#4b5563", marginTop: 2, lineHeight: 1.25 },
  itemsSection: { marginTop: 10 },
  itemsTitle: { fontSize: 7, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", paddingBottom: 4, marginBottom: 3, borderBottomWidth: 0.8, borderBottomColor: "#6b7280" },
  itemHeaderText: { fontSize: 6.2, fontWeight: "bold", color: "#111827", textTransform: "uppercase", letterSpacing: 0.5 },
  itemRow: { paddingTop: 5, paddingBottom: 6, paddingHorizontal: 2, marginBottom: 2, borderBottomWidth: 0.6, borderBottomColor: "#d1d5db" },
  itemTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemName: { flex: 1, paddingRight: 5, fontSize: 7.4, fontWeight: "bold", lineHeight: 1.2, color: "#111827" },
  itemAmount: { width: 66, fontSize: 8, fontWeight: "bold", textAlign: "right", color: "#111827" },
  itemDetails: { flexDirection: "row", justifyContent: "space-between", marginTop: 3 },
  itemDetail: { flex: 1 },
  itemDetailLabel: { fontSize: 5.5, color: "#6b7280", textTransform: "uppercase", marginBottom: 1 },
  itemDetailValue: { fontSize: 6.2, color: "#374151", fontWeight: "bold" },
  qtyText: { fontSize: 6.1, color: "#6b7280", marginTop: 2 },
  itemDiscount: { fontSize: 6.2, color: "#15803d", fontWeight: "bold", marginTop: 2 },
  itemDescription: { fontSize: 6.2, color: "#6b7280", marginTop: 2, lineHeight: 1.2 },
  summary: { marginTop: 7, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#111827" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5 },
  summaryLabel: { fontSize: 7, color: "#4b5563" },
  summaryValue: { fontSize: 7, fontWeight: "bold", textAlign: "right" },
  discountLabel: { fontSize: 7, fontWeight: "bold", color: "#15803d" },
  discountValue: { fontSize: 7, fontWeight: "bold", color: "#15803d", textAlign: "right" },
  totalBox: { marginTop: 6, paddingVertical: 8, paddingHorizontal: 8, backgroundColor: "#111827", borderRadius: 3, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 8, fontWeight: "bold", color: "#ffffff", letterSpacing: 0.6 },
  totalValue: { fontSize: 13, fontWeight: "bold", color: "#ffffff" },
  paymentSection: { marginTop: 9 },
  paymentTitle: { fontSize: 7, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 },
  paymentBox: { paddingVertical: 6, paddingHorizontal: 7, borderWidth: 0.7, borderColor: "#d1d5db", borderRadius: 3 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  paymentLabel: { fontSize: 6.8, color: "#6b7280" },
  paymentValue: { fontSize: 7.2, fontWeight: "bold" },
  balanceDue: { fontSize: 11, fontWeight: "bold", color: "#dc2626" },
  balancePaid: { fontSize: 11, fontWeight: "bold", color: "#15803d" },
  historySection: { marginTop: 6, paddingTop: 5, borderTopWidth: 0.5, borderTopColor: "#d1d5db" },
  historyTitle: { fontSize: 6.3, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 1.8 },
  historyText: { flex: 1, paddingRight: 5, fontSize: 6, color: "#6b7280" },
  historyAmount: { fontSize: 6.5, fontWeight: "bold", color: "#15803d" },
  noteSection: { marginTop: 8, paddingTop: 6, borderTopWidth: 0.7, borderTopColor: "#d1d5db" },
  noteTitle: { fontSize: 6.5, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  noteText: { fontSize: 6.3, color: "#4b5563", lineHeight: 1.3 },
  signatureSection: { alignItems: "center", marginTop: 12 },
  signatureImage: { width: 75, height: 28, objectFit: "contain", marginBottom: 2 },
  signatureLine: { width: 105, borderTopWidth: 0.8, borderTopColor: "#111827" },
  signatureName: { fontSize: 6.5, fontWeight: "bold", marginTop: 3, textAlign: "center" },
  signatureSub: { fontSize: 5.8, color: "#6b7280", marginTop: 1, textAlign: "center" },
  thankYou: { alignItems: "center", marginTop: 13 },
  thankYouText: { fontSize: 7.5, fontWeight: "bold", textAlign: "center" },
  thankYouSub: { fontSize: 6, color: "#6b7280", marginTop: 2, textAlign: "center" },
  footer: { alignItems: "center", marginTop: 8, paddingTop: 5, borderTopWidth: 0.6, borderTopColor: "#d1d5db" },
  footerText: { fontSize: 5.6, color: "#6b7280", textAlign: "center" },
  footerBrand: { fontSize: 5.6, color: "#9ca3af", marginTop: 2, textAlign: "center" },
  watermark: { position: "absolute", top: 300, left: 0, right: 0, alignItems: "center" },
  watermarkText: { fontSize: 30, fontWeight: "bold", color: "#111827", opacity: 0.035, transform: "rotate(-35deg)" },
});
const estimateLines = (text, charsPerLine) => {
  if (!text) return 0;
  return String(text).split("\n").reduce((total, line) => total + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
};
export default function ThermalInvoice2({
  companyInfo,
  companyLogo,
  companySignature,
  invoiceNumberSequence,
  selectedCustomer,
  itemData = [],
  subtotal = 0,
  totalDiscount = 0,
  taxRate = 0,
  taxedAmount = 0,
  grandTotal = 0,
  notes,
  terms,
  issueDate,
  dueDate,
  paymentStatus,
  paidAmount = 0,
  balanceAmount,
  payments = [],
  isPreview = false,
}) {
  const items = Array.isArray(itemData) ? itemData : [];
  const paymentList = Array.isArray(payments) ? payments.filter((payment) => Number(payment?.amount) > 0) : [];
  const total = Number(grandTotal) || 0;
  const paid = Math.max(Number(paidAmount) || 0, 0);
  const balance = balanceAmount !== undefined ? Math.max(Number(balanceAmount) || 0, 0) : Math.max(total - paid, 0);
  const status = paymentStatus || (total <= 0 ? "Unpaid" : balance <= 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid");
  const displayStatus = status === "Paid" ? "भुगतान हो गया" : status === "Partially Paid" ? "आंशिक भुगतान" : "भुगतान बाकी";
  const money = (value) => `Rs. ${(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (value) => {
    if (!value) return "N/A";
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  const address = selectedCustomer?.billingAddress || {};
  const customerAddress = [address.street1, address.street2, [address.city, address.state, address.pincode].filter(Boolean).join(", "), address.country].filter(Boolean).join(", ");
  const companyName = companyInfo?.companyName || "YOUR COMPANY NAME";
  const companyHeaderHeight = 77 + (companyLogo ? 50 : 0) + (companyInfo?.address ? 11 : 0) + (companyInfo?.phone ? 9 : 0) + (companyInfo?.email ? 9 : 0) + (companyInfo?.gstin ? 9 : 0);
  const customerHeight = 35 + (selectedCustomer?.companyName ? 9 : 0) + (selectedCustomer?.workingPhone || selectedCustomer?.phone ? 9 : 0) + (selectedCustomer?.email ? 9 : 0) + Math.max(1, estimateLines(customerAddress, 43)) * 7.5;
  const itemHeight = items.reduce((height, item) => {
    if (!item) return height;
    const name = item.itemName || item.name || "Unnamed Item";
    const description = item.itemDescription || item.description || "";
    const discount = Number(item.itemDiscountAmount ?? item.discountAmount ?? 0) || 0;
    return height + 32 + estimateLines(name, 28) * 9 + (description ? estimateLines(description, 38) * 7 : 0) + (discount > 0 ? 8 : 0);
  }, 0);
  const paymentHeight = 57 + (paymentList.length > 0 ? 17 + paymentList.length * 11 : 0);
  const notesHeight = notes ? 22 + estimateLines(notes, 49) * 7 : 0;
  const termsHeight = terms ? 22 + estimateLines(terms, 49) * 7 : 0;
  const signatureHeight = companySignature ? 56 : 0;
  const thankYouHeight = 31;
  const footerHeight = 23;
  const safetySpace = 100;
  const receiptHeight = companyHeaderHeight + 7 + 90 + 8 + customerHeight + 8 + 25 + itemHeight + 63 + paymentHeight + notesHeight + termsHeight + signatureHeight + thankYouHeight + footerHeight + safetySpace;
  return (
    <Document title={`Thermal-Invoice-${invoiceNumberSequence || "Invoice"}`}>
      <Page size={[226, receiptHeight]} style={styles.page}>
        {isPreview && (
          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>PREVIEW</Text>
          </View>
        )}
        <View style={styles.header}>
          {companyLogo && <Image src={companyLogo} style={styles.logo} />}
          <UnicodeText style={styles.companyName}>{companyName}</UnicodeText>
          {companyInfo?.address && <UnicodeText style={styles.companyText}>{companyInfo.address}</UnicodeText>}
          {companyInfo?.phone && <UnicodeText style={styles.companyText}>Ph: {companyInfo.phone}</UnicodeText>}
          {companyInfo?.email && <UnicodeText style={styles.companyText}>{companyInfo.email}</UnicodeText>}
          {companyInfo?.gstin && <UnicodeText style={styles.companyText}>GSTIN: {companyInfo.gstin}</UnicodeText>}
          <View style={styles.invoiceBadge}>
            <Text style={styles.invoiceBadgeText}>कर चालान</Text>
          </View>
          <Text style={styles.invoiceNumber}>#{invoiceNumberSequence}</Text>
        </View>
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLeft}>चालान की तारीख</Text>
            <Text style={styles.metaRight}>{formatDate(issueDate)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLeft}>भुगतान की अंतिम तिथि</Text>
            <Text style={styles.metaRight}>{formatDate(dueDate)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLeft}>भुगतान की स्थिति</Text>
            <Text style={status === "Paid" ? styles.statusPaid : status === "Partially Paid" ? styles.statusPartial : styles.statusUnpaid}>{displayStatus}</Text>
          </View>
        </View>
        <View style={styles.customerBox}>
          <Text style={styles.customerLabel}>बिल प्राप्तकर्ता</Text>
          <UnicodeText style={styles.customerName}>{selectedCustomer?.displayName || "Walk-in Customer"}</UnicodeText>
          {selectedCustomer?.companyName && <UnicodeText style={styles.customerText}>{selectedCustomer.companyName}</UnicodeText>}
          {(selectedCustomer?.workingPhone || selectedCustomer?.phone) && <UnicodeText style={styles.customerText}>Ph: {selectedCustomer.workingPhone || selectedCustomer.phone}</UnicodeText>}
          {selectedCustomer?.email && <UnicodeText style={styles.customerText}>{selectedCustomer.email}</UnicodeText>}
          {customerAddress && <UnicodeText style={styles.customerText}>{customerAddress}</UnicodeText>}
        </View>
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>वस्तुएँ</Text>
          <View style={styles.itemHeader}>
            <Text style={styles.itemHeaderText}>उत्पाद विवरण</Text>
            <Text style={styles.itemHeaderText}>अंतिम राशि</Text>
          </View>
          {items.map((item, index) => {
            if (!item) return null;
            const quantity = Number(item.quantity) || 0;
            const rate = Number(item.itemSellingPrice ?? item.sellingPrice ?? item.rate) || 0;
            const mrp = Number(item.itemMRP ?? item.mrp ?? item.MRP ?? item.itemMrp) || 0;
            const discount = Number(item.itemDiscountAmount ?? item.discountAmount ?? 0) || 0;
            const hasDiscount = discount > 0;
            const amount = Math.max(quantity * rate - discount, 0);
            const name = item.itemName || item.name || "Unnamed Item";
            const description = item.itemDescription || item.description;
            const unit = item.itemUnit || item.unit || "pcs";
            return (
              <View key={item._id || index} style={styles.itemRow} wrap={false}>
                <View style={styles.itemTop}>
                  <UnicodeText style={styles.itemName}>{name}{hasDiscount ? " *" : ""}</UnicodeText>
                  <Text style={styles.itemAmount}>{money(amount)}</Text>
                </View>
                <View style={styles.itemDetails}>
                  <View style={styles.itemDetail}>
                    <Text style={styles.itemDetailLabel}>एमआरपी</Text>
                    <Text style={styles.itemDetailValue}>{mrp > 0 ? money(mrp) : "—"}</Text>
                  </View>
                  <View style={styles.itemDetail}>
                    <Text style={styles.itemDetailLabel}>दर</Text>
                    <Text style={styles.itemDetailValue}>{money(rate)}</Text>
                  </View>
                  <View style={[styles.itemDetail, { alignItems: "flex-end" }]}>
                    <Text style={styles.itemDetailLabel}>मात्रा</Text>
                    <Text style={styles.itemDetailValue}>{quantity} {unit}</Text>
                  </View>
                </View>
                {hasDiscount && <Text style={styles.itemDiscount}>* छूट: {money(discount)} off</Text>}
                {description && <UnicodeText style={styles.itemDescription}>{description}</UnicodeText>}
              </View>
            );
          })}
        </View>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>उप-योग</Text>
            <Text style={styles.summaryValue}>{money(subtotal)}</Text>
          </View>
          {Number(totalDiscount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.discountLabel}>छूट</Text>
              <Text style={styles.discountValue}>- {money(totalDiscount)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>कर ({taxRate || 0}%)</Text>
            <Text style={styles.summaryValue}>{money(taxedAmount)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>कुल योग</Text>
            <Text style={styles.totalValue}>{money(total)}</Text>
          </View>
        </View>
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>भुगतान</Text>
          <View style={styles.paymentBox}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>जमा राशि</Text>
              <Text style={styles.paymentValue}>{money(paid)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>बकाया राशि</Text>
              <Text style={balance > 0 ? styles.balanceDue : styles.balancePaid}>{money(balance)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>स्थिति</Text>
              <Text style={styles.paymentValue}>{displayStatus}</Text>
            </View>
            {paymentList.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>भुगतान इतिहास</Text>
                {paymentList.map((payment, index) => (
                  <View key={payment?._id || index} style={styles.historyRow}>
                    <UnicodeText style={styles.historyText}>#{index + 1} {formatDate(payment?.paymentDate)}{payment?.paymentMethod ? ` • ${payment.paymentMethod}` : ""}</UnicodeText>
                    <Text style={styles.historyAmount}>{money(payment?.amount)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        {notes && (
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>टिप्पणियाँ</Text>
            <UnicodeText style={styles.noteText}>{notes}</UnicodeText>
          </View>
        )}
        {terms && (
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>नियम और शर्तें</Text>
            <UnicodeText style={styles.noteText}>{terms}</UnicodeText>
          </View>
        )}
        {companySignature && (
          <View style={styles.signatureSection}>
            <Image src={companySignature} style={styles.signatureImage} />
            <View style={styles.signatureLine} />
            <UnicodeText style={styles.signatureName}>{companyName}</UnicodeText>
            <Text style={styles.signatureSub}>अधिकृत हस्ताक्षरकर्ता</Text>
          </View>
        )}
        <View style={styles.thankYou}>
          <Text style={styles.thankYouText}>आपके व्यापार के लिए धन्यवाद!</Text>
          <Text style={styles.thankYouSub}>कृपया इस रसीद को अपने रिकॉर्ड के लिए सुरक्षित रखें।</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>त्रुटि और चूक छोड़कर • कंप्यूटर द्वारा निर्मित बिल</Text>
          <Text style={styles.footerBrand}>SaleSync</Text>
        </View>
      </Page>
    </Document>
  );
}
