import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { width: 226, paddingTop: 18, paddingHorizontal: 12, paddingBottom: 18, backgroundColor: "#ffffff", color: "#111827", fontFamily: "Helvetica", fontSize: 8 },
  header: { alignItems: "center", paddingBottom: 9, borderBottomWidth: 1, borderBottomColor: "#111827" },
  logo: { width: 44, height: 44, objectFit: "contain", marginBottom: 5 },
  companyName: { fontSize: 13, fontWeight: "bold", textAlign: "center", textTransform: "uppercase" },
  companyText: { fontSize: 7, color: "#4b5563", textAlign: "center", marginTop: 2, lineHeight: 1.25 },
  invoiceTitle: { fontSize: 10, fontWeight: "bold", marginTop: 7, letterSpacing: 1 },
  invoiceNumber: { fontSize: 7.5, fontWeight: "bold", marginTop: 3 },
  metaSection: { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#9ca3af" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  metaLabel: { fontSize: 7, color: "#6b7280" },
  metaValue: { fontSize: 7.5, fontWeight: "bold" },
  customerSection: { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#9ca3af" },
  sectionTitle: { fontSize: 6.8, fontWeight: "bold", textTransform: "uppercase", marginBottom: 3, letterSpacing: 0.4 },
  customerName: { fontSize: 8.5, fontWeight: "bold" },
  customerText: { fontSize: 7, color: "#4b5563", marginTop: 2, lineHeight: 1.25 },
  itemsHeader: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#111827" },
  itemRow: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#d1d5db", alignItems: "flex-start" },
  itemColumn: { flex: 1, paddingRight: 4 },
  qtyColumn: { width: 25, textAlign: "center" },
  rateColumn: { width: 48, textAlign: "right" },
  amountColumn: { width: 54, textAlign: "right" },
  headerText: { fontSize: 6.6, fontWeight: "bold", textTransform: "uppercase" },
  itemName: { fontSize: 7.5, fontWeight: "bold", lineHeight: 1.2 },
  itemDescription: { fontSize: 6.3, color: "#6b7280", marginTop: 1, lineHeight: 1.2 },
  itemText: { fontSize: 7 },
  totals: { marginTop: 2, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#111827" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5 },
  totalLabel: { fontSize: 7, color: "#4b5563" },
  totalValue: { fontSize: 7, fontWeight: "bold" },
  discountLabel: { fontSize: 7, color: "#15803d" },
  discountValue: { fontSize: 7, color: "#15803d", fontWeight: "bold" },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, marginTop: 4, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderTopColor: "#111827", borderBottomColor: "#111827" },
  grandTotalLabel: { fontSize: 9.5, fontWeight: "bold" },
  grandTotalValue: { fontSize: 11, fontWeight: "bold" },
  paymentSection: { marginTop: 7, paddingTop: 6 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5 },
  paymentLabel: { fontSize: 7, color: "#4b5563" },
  paymentValue: { fontSize: 7.3, fontWeight: "bold" },
  balanceValue: { fontSize: 8, fontWeight: "bold", color: "#dc2626" },
  historySection: { marginTop: 5, paddingTop: 5, borderTopWidth: 0.5, borderTopColor: "#d1d5db" },
  historyRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  historyText: { fontSize: 6.2, color: "#6b7280", flex: 1, paddingRight: 5 },
  historyAmount: { fontSize: 6.7, color: "#15803d", fontWeight: "bold" },
  noteSection: { marginTop: 7, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#9ca3af" },
  noteTitle: { fontSize: 6.8, fontWeight: "bold", textTransform: "uppercase", marginBottom: 3 },
  noteText: { fontSize: 6.5, color: "#4b5563", lineHeight: 1.3 },
  signatureSection: { alignItems: "center", marginTop: 12 },
  signatureImage: { width: 80, height: 30, objectFit: "contain", marginBottom: 2 },
  signatureSpace: { height: 30 },
  signatureLine: { width: 110, borderTopWidth: 1, borderTopColor: "#111827" },
  signatureName: { fontSize: 6.8, fontWeight: "bold", marginTop: 3, textAlign: "center" },
  signatureSub: { fontSize: 6, color: "#6b7280", marginTop: 1, textAlign: "center" },
  thankYou: { alignItems: "center", marginTop: 15, paddingTop: 7},
  thankYouText: { fontSize: 7.5, fontWeight: "bold", textAlign: "center" },
  thankYouSub: { fontSize: 6.3, color: "#6b7280", marginTop: 2, textAlign: "center" },
  footer: { alignItems: "center", marginTop: 9, paddingTop: 6, borderTopWidth: 0.7, borderTopColor: "#9ca3af" },
  footerText: { fontSize: 5.8, color: "#6b7280", textAlign: "center" },
  footerBrand: { fontSize: 5.8, color: "#9ca3af", marginTop: 2, textAlign: "center" },
  watermark: { position: "absolute", top: 300, left: 0, right: 0, alignItems: "center" },
  watermarkText: { fontSize: 32, fontWeight: "bold", color: "#111827", opacity: 0.035, transform: "rotate(-35deg)" },
});

const estimateLines = (text, charsPerLine) => {
  if (!text) return 0;
  return String(text).split("\n").reduce((total, line) => total + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
};

export default function ThermalInvoice({ companyInfo, companyLogo, companySignature, invoiceNumberSequence, isPaid, selectedCustomer, itemData = [], subtotal = 0, totalDiscount = 0, taxRate = 0, taxedAmount = 0, grandTotal = 0, notes, terms, issueDate, dueDate, paymentStatus, paidAmount = 0, balanceAmount, payments = [], isPreview = false }) {
  const items = Array.isArray(itemData) ? itemData : [];
  const paymentList = Array.isArray(payments) ? payments.filter((payment) => Number(payment?.amount) > 0) : [];
  const total = Number(grandTotal) || 0;
  const paid = Math.max(Number(paidAmount) || 0, 0);
  const balance = balanceAmount !== undefined ? Math.max(Number(balanceAmount) || 0, 0) : Math.max(total - paid, 0);
  const status = paymentStatus || (total <= 0 ? "Unpaid" : balance <= 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid");

  const money = (value) => `₹${(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (value) => {
    if (!value) return "N/A";
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const address = selectedCustomer?.billingAddress || {};
  const customerAddress = [address.street1, address.street2, [address.city, address.state, address.pincode].filter(Boolean).join(", "), address.country].filter(Boolean).join(", ");
  const companyName = companyInfo?.companyName || "YOUR COMPANY NAME";

  const companyHeaderHeight = 82 + (companyLogo ? 52 : 0) + (companyInfo?.address ? 12 : 0) + (companyInfo?.phone ? 10 : 0) + (companyInfo?.email ? 10 : 0) + (companyInfo?.gstin ? 10 : 0);
  const customerHeight = 34 + (selectedCustomer?.companyName ? 10 : 0) + (selectedCustomer?.workingPhone || selectedCustomer?.phone ? 10 : 0) + (selectedCustomer?.email ? 10 : 0) + Math.max(1, estimateLines(customerAddress, 42)) * 8;
  const itemHeight = items.reduce((height, item) => {
    if (!item) return height;
    const name = item.itemName || item.name || "Unnamed Item";
    const description = item.itemDescription || item.description || "";
    return height + 11 + Math.max(1, estimateLines(name, 27) + estimateLines(description, 31)) * 9 + 8;
  }, 0);
  
  const paymentHeight = 58 + (paymentList.length > 0 ? 19 + paymentList.length * 12 : 0);
  const notesHeight = notes ? 24 + estimateLines(notes, 48) * 8 : 0;
  const termsHeight = terms ? 24 + estimateLines(terms, 48) * 8 : 0;
  const signatureHeight = 58;
  const thankYouHeight = 35;
  const footerHeight = 25;
  const safetySpace = 45;

  const receiptHeight = companyHeaderHeight + 18 + customerHeight + itemHeight + 65 + paymentHeight + notesHeight + termsHeight + signatureHeight + thankYouHeight + footerHeight + safetySpace;

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
          <Text style={styles.companyName}>{companyName}</Text>
          {companyInfo?.address && <Text style={styles.companyText}>{companyInfo.address}</Text>}
          {companyInfo?.phone && <Text style={styles.companyText}>Ph: {companyInfo.phone}</Text>}
          {companyInfo?.email && <Text style={styles.companyText}>{companyInfo.email}</Text>}
          {companyInfo?.gstin && <Text style={styles.companyText}>GSTIN: {companyInfo.gstin}</Text>}
          <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{invoiceNumberSequence}</Text>
        </View>

        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{formatDate(issueDate)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{formatDate(dueDate)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={[styles.metaValue, { color: status === "Paid" ? "#15803d" : status === "Partially Paid" ? "#b45309" : "#dc2626" }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.customerName}>{selectedCustomer?.displayName || "Walk-in Customer"}</Text>
          {selectedCustomer?.companyName && <Text style={styles.customerText}>{selectedCustomer.companyName}</Text>}
          {(selectedCustomer?.workingPhone || selectedCustomer?.phone) && <Text style={styles.customerText}>Ph: {selectedCustomer.workingPhone || selectedCustomer.phone}</Text>}
          {selectedCustomer?.email && <Text style={styles.customerText}>{selectedCustomer.email}</Text>}
          {customerAddress && <Text style={styles.customerText}>{customerAddress}</Text>}
        </View>

        <View style={styles.itemsHeader}>
          <Text style={[styles.headerText, styles.itemColumn]}>Item</Text>
          <Text style={[styles.headerText, styles.qtyColumn]}>Qty</Text>
          <Text style={[styles.headerText, styles.rateColumn]}>Rate</Text>
          <Text style={[styles.headerText, styles.amountColumn]}>Amount</Text>
        </View>

        {items.map((item, index) => {
          if (!item) return null;
          const quantity = Number(item.quantity) || 0;
          const rate = Number(item.itemSellingPrice ?? item.sellingPrice) || 0;
          const discount = Number(item.itemDiscountAmount ?? item.discountAmount ?? 0) || 0;
          const amount = Math.max(quantity * rate - discount, 0);
          const name = item.itemName || item.name || "Unnamed Item";
          const description = item.itemDescription || item.description;

          return (
            <View key={item._id || index} style={styles.itemRow} wrap={false}>
              <View style={styles.itemColumn}>
                <Text style={styles.itemName}>{name}</Text>
                {description && <Text style={styles.itemDescription}>{description}</Text>}
              </View>
              <Text style={[styles.qtyColumn, styles.itemText]}>{quantity}</Text>
              <Text style={[styles.rateColumn, styles.itemText]}>{money(rate)}</Text>
              <Text style={[styles.amountColumn, styles.itemText, { fontWeight: "bold" }]}>{money(amount)}</Text>
            </View>
          );
        })}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{money(subtotal)}</Text>
          </View>
          {Number(totalDiscount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.discountLabel}>Discount</Text>
              <Text style={styles.discountValue}>-{money(totalDiscount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GST ({taxRate || 0}%)</Text>
            <Text style={styles.totalValue}>{money(taxedAmount)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>{money(total)}</Text>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Paid</Text>
            <Text style={styles.paymentValue}>{money(paid)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Balance Due</Text>
            <Text style={styles.balanceValue}>{money(balance)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Status</Text>
            <Text style={styles.paymentValue}>{status}</Text>
          </View>
          {paymentList.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Payment History</Text>
              {paymentList.map((payment, index) => (
                <View key={payment?._id || index} style={styles.historyRow}>
                  <Text style={styles.historyText}>#{index + 1} {formatDate(payment?.paymentDate)} {payment?.paymentMethod ? `• ${payment.paymentMethod}` : ""}</Text>
                  <Text style={styles.historyAmount}>{money(payment?.amount)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {notes && (
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>Notes</Text>
            <Text style={styles.noteText}>{notes}</Text>
          </View>
        )}

        {terms && (
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>Terms & Conditions</Text>
            <Text style={styles.noteText}>{terms}</Text>
          </View>
        )}

        {companySignature && <View style={styles.signatureSection}>
          {companySignature ? (
            <Image src={companySignature} style={styles.signatureImage} />
          ) : (
            <View style={styles.signatureSpace} />
          )}
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>{companyName}</Text>
          <Text style={styles.signatureSub}>Authorized Signatory</Text>
        </View>}

        <View style={styles.thankYou}>
          <Text style={styles.thankYouText}>Thank you for your business!</Text>
          <Text style={styles.thankYouSub}>Please retain this receipt for your records.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>E.&O.E. • Computer generated invoice</Text>
          <Text style={styles.footerBrand}>SaleSync</Text>
        </View>
      </Page>
    </Document>
  );
}