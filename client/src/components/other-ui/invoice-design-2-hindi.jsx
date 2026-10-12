import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
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
  page: { paddingTop: 40, paddingHorizontal: 40, paddingBottom: 72, fontSize: 9.5, color: "#334155", fontFamily: "NotoSansDevanagari", backgroundColor: "#ffffff" },
  watermarkContainer: { position: "absolute", top: 380, left: 0, right: 0, alignItems: "center", justifyContent: "center", transform: "rotate(-45deg)" },
  watermark: { fontSize: 60, color: "#1e1b4b", opacity: 0.05, fontWeight: "bold", textAlign: "center" },
  watermarkSub: { marginTop: 10, fontSize: 18, color: "#1e1b4b", opacity: 0.05, fontWeight: "bold", textAlign: "center" },
  brandHeaderContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 35 },
  companyBrandGroup: { flexDirection: "column", maxWidth: "55%" },
  logoContainer: { marginBottom: 12 },
  logoImage: { width: 40, height: "auto", maxHeight: 40, objectFit: "contain" },
  companyNameText: { fontSize: 20, fontWeight: "bold", color: "#1e1b4b", letterSpacing: -0.5 },
  companyMetaText: { fontSize: 8.5, color: "#64748b", marginTop: 3, lineHeight: 1.4 },
  invoiceMetaGroup: { alignItems: "flex-end" },
  invoiceLabel: { fontSize: 26, fontWeight: "bold", color: "#0f172a", letterSpacing: -1 },
  invoiceSequenceId: { fontSize: 11, fontWeight: "bold", color: "#0d9488", marginTop: 2, marginBottom: 8 },
  dateGrid: { alignItems: "flex-end", marginBottom: 6 },
  dateRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 3 },
  dateLabel: { fontSize: 8.5, color: "#94a3b8", width: 60, textAlign: "right", marginRight: 6 },
  dateValue: { fontSize: 8.5, color: "#1e1b4b", fontWeight: "bold", width: 65, textAlign: "right" },
  statusBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2, fontSize: 7.5, fontWeight: "bold", textTransform: "uppercase" },
  paid: { backgroundColor: "#f0fdf4", color: "#166534" },
  unpaid: { backgroundColor: "#fff1f2", color: "#9f1239" },
  overdue: { backgroundColor: "#ffedd5", color: "#9a3412", borderWidth: 1, borderColor: "#fed7aa" },
  partiallyPaid: { backgroundColor: "#fef3c7", color: "#92400e" },
  billingGrid: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16, marginBottom: 35 },
  billingColumn: { flex: 1 },
  billingSectionLabel: { fontSize: 8, fontWeight: "bold", color: "#94a3b8", marginBottom: 6 },
  profilePrimaryText: { fontSize: 11, fontWeight: "bold", color: "#1e1b4b" },
  profileSecondaryText: { fontSize: 8.5, color: "#475569", lineHeight: 1.3 },
  tableContainer: { marginTop: 5 },
  tableHeaderRow: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#1e1b4b", paddingBottom: 6, paddingHorizontal: 4 },
  tableHeaderLabel: { fontSize: 8, fontWeight: "bold", color: "#1e1b4b", textTransform: "uppercase", letterSpacing: 0.5 },
  tableDataRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 10, paddingHorizontal: 4, alignItems: "center" },
  colDesc: { flex: 2.2, paddingRight: 12 },
  colQty: { flex: 0.4, textAlign: "center" },
  colMrp: { flex: 0.8, textAlign: "right" },
  colPrice: { flex: 0.75, textAlign: "right" },
  colTotal: { flex: 0.75, textAlign: "right" },
  itemName: { fontSize: 9.5, fontWeight: "bold", color: "#0f172a" },
  itemDiscountText: { fontSize: 7.5, color: "#0d9488", fontWeight: "bold", marginTop: 2 },
  itemDesc: { fontSize: 8.5, color: "#64748b", marginTop: 2, lineHeight: 1.2 },
  numericValueText: { fontSize: 9.5, color: "#334155" },
  bottomExecutionSegment: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 30 },
  annotationsWrapper: { flex: 1.3, flexDirection: "column", gap: 16, paddingRight: 40 },
  annotationUnit: { flexDirection: "column" },
  annotationContent: { fontSize: 8.5, color: "#64748b", lineHeight: 1.4, marginTop: 4 },
  financialSummaryCard: { flex: 0.9 },
  financialRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  financialRowLabel: { fontSize: 9, color: "#64748b" },
  financialRowValue: { fontSize: 9, color: "#334155" },
  discountHighlightRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  discountLabel: { fontSize: 9, color: "#0d9488", fontWeight: "bold" },
  discountValue: { fontSize: 9, color: "#0d9488", fontWeight: "bold" },
  grandTotalDivider: { borderTopWidth: 1, borderTopColor: "#e2e8f0", marginTop: 8, paddingTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  grandTotalLabel: { fontSize: 11, fontWeight: "bold", color: "#1e1b4b" },
  grandTotalAmount: { fontSize: 15, fontWeight: "bold", color: "#1e1b4b" },
  paymentSummary: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  paymentSummaryTitle: { fontSize: 8, fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  paymentSummaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  paymentSummaryLabel: { fontSize: 8.5, color: "#64748b" },
  paymentSummaryValue: { fontSize: 8.5, color: "#334155", fontWeight: "bold" },
  paymentDueValue: { fontSize: 13, color: "#9f1239", fontWeight: "bold" },
  paymentHistory: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  paymentHistoryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  paymentHistoryMeta: { fontSize: 7.5, color: "#64748b" },
  paymentHistoryAmount: { fontSize: 8, fontWeight: "bold", color: "#166534" },
  balanceDueRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopStyle: "dashed", borderTopColor: "#cbd5e1" },
  balanceDueLabel: { fontSize: 9, color: "#64748b", fontWeight: "bold" },
  balanceDueAmount: { fontSize: 10, color: "#9f1239", fontWeight: "bold" },
  signatureBlockContainer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 40 },
  signatureWrapper: { width: 160, alignItems: "flex-start" },
  signatureImage: { height: 35, width: 100, objectFit: "contain", marginBottom: 4 },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#cbd5e1", width: "100%", marginBottom: 4 },
  signatureTitleLabel: { fontSize: 8.5, fontWeight: "bold", color: "#1e1b4b" },
  signatureSubLabel: { fontSize: 7.5, color: "#94a3b8", textTransform: "uppercase" },
  globalPageFooter: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12, flexDirection: "row", justifyContent: "space-between" },
  footerDisclaimerText: { fontSize: 8, color: "#94a3b8", maxWidth: "70%" },
  footerPlatformToken: { fontSize: 7.5, color: "#cbd5e1", textAlign: "right" },
});
export default function InvoiceDesign2({
  companyInfo,
  companyLogo,
  companySignature,
  invoiceNumberSequence,
  isPaid,
  issueDate,
  dueDate,
  selectedCustomer,
  itemData = [],
  subtotal = 0,
  totalDiscount = 0,
  taxRate = 0,
  taxedAmount = 0,
  grandTotal = 0,
  notes,
  terms,
  paymentStatus,
  paidAmount = 0,
  balanceAmount,
  payments = [],
  isPreview = true,
}) {
  const safeGrandTotal = Number(grandTotal) || 0;
  const safePaidAmount = Math.min(Math.max(Number(paidAmount) || 0, 0), Math.max(safeGrandTotal, 0));
  const safeBalanceAmount = Math.max(0, Number(balanceAmount !== undefined ? balanceAmount : safeGrandTotal - safePaidAmount) || 0);
  const normalizedPaymentStatus = (() => {
    const currentStatus = String(paymentStatus || "").trim().toLowerCase();
    // Preserve explicitly voided invoices.
    if (currentStatus === "void") return "Void";
    // Paid invoices take priority over the due date.
    if (safeGrandTotal > 0 && safeBalanceAmount <= 0) return "Paid";
    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const hasValidDueDate = parsedDueDate && !Number.isNaN(parsedDueDate.getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDueDate) parsedDueDate.setHours(0, 0, 0, 0);
    if (safeBalanceAmount > 0 && hasValidDueDate && parsedDueDate < today) {
      return "Overdue";
    }
    if (safePaidAmount > 0 && safeBalanceAmount > 0) return "Partially Paid";
    return "Unpaid";
  })();
  const displayPaymentStatus = normalizedPaymentStatus === "Paid"
    ? "भुगतान हो गया"
    : normalizedPaymentStatus === "Partially Paid"
      ? "आंशिक भुगतान"
      : normalizedPaymentStatus === "Overdue"
        ? "अतिदेय"
        : normalizedPaymentStatus === "Void"
          ? "रद्द"
          : "बकाया";
  const statusStyle = normalizedPaymentStatus === "Paid"
    ? styles.paid
    : normalizedPaymentStatus === "Partially Paid"
      ? styles.partiallyPaid
      : normalizedPaymentStatus === "Overdue"
        ? styles.overdue
        : styles.unpaid;
  const statusColor = normalizedPaymentStatus === "Paid"
    ? "#166534"
    : normalizedPaymentStatus === "Partially Paid"
      ? "#92400e"
      : normalizedPaymentStatus === "Overdue"
        ? "#c2410c"
        : normalizedPaymentStatus === "Void"
          ? "#64748b"
          : "#991b1b";
  const paymentHistory = Array.isArray(payments) ? payments.filter((payment) => Number(payment?.amount) > 0) : [];
  const formatDate = (date) => (!date ? "N/A" : date instanceof Date ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : date);
  const money = (value) => `Rs. ${(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (
    <Document title={isPreview ? `Preview-${invoiceNumberSequence}` : `Invoice-${invoiceNumberSequence}`}>
      <Page size="A4" style={styles.page}>
        {isPreview && (
          <View fixed style={styles.watermarkContainer}>
            <Text style={styles.watermark}>पूर्वावलोकन</Text>
            <Text style={styles.watermarkSub}>अनौपचारिक प्रति</Text>
          </View>
        )}
        <View style={styles.brandHeaderContainer}>
          <View style={styles.companyBrandGroup}>
            {companyLogo && (
              <View style={styles.logoContainer}>
                <Image src={companyLogo} style={styles.logoImage} />
              </View>
            )}
            <UnicodeText style={styles.companyNameText}>{companyInfo?.companyName || "आपकी कंपनी का नाम"}</UnicodeText>
            {companyInfo?.gstin && <Text style={styles.companyMetaText}>जीएसटीआईएन: {companyInfo?.gstin}</Text>}
            <UnicodeText style={styles.companyMetaText}>{companyInfo?.address || "N/A"}</UnicodeText>
            <UnicodeText style={styles.companyMetaText}>संपर्क नंबर: {companyInfo?.phone || "N/A"}</UnicodeText>
            <UnicodeText style={styles.companyMetaText}>ईमेल: {companyInfo?.email || "N/A"}</UnicodeText>
          </View>
          <View style={styles.invoiceMetaGroup}>
            <Text style={styles.invoiceLabel}>चालान</Text>
            <Text style={styles.invoiceSequenceId}>#{invoiceNumberSequence}</Text>
            <View style={styles.dateGrid}>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>जारी करने की तारीख:</Text>
                <Text style={styles.dateValue}>{formatDate(issueDate)}</Text>
              </View>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>भुगतान की अंतिम तारीख:</Text>
                <Text style={styles.dateValue}>{formatDate(dueDate)}</Text>
              </View>
            </View>
            <Text style={[styles.statusBadge, statusStyle]}>{displayPaymentStatus}</Text>
          </View>
        </View>
        <View style={styles.billingGrid}>
          <View style={styles.billingColumn}>
            <Text style={styles.billingSectionLabel}>ग्राहक</Text>
            <UnicodeText style={styles.profilePrimaryText}>{selectedCustomer?.displayName || "No Client Assigned"}</UnicodeText>
            {selectedCustomer?.companyName && <UnicodeText style={styles.profileSecondaryText}>{selectedCustomer.companyName}</UnicodeText>}
            {selectedCustomer?.workingPhone && <Text style={styles.profileSecondaryText}>{selectedCustomer.workingPhone}</Text>}
            {selectedCustomer?.email && <Text style={styles.profileSecondaryText}>{selectedCustomer.email}</Text>}
          </View>
          <View style={styles.billingColumn}>
            <Text style={styles.billingSectionLabel}>ठिकाना</Text>
            <UnicodeText style={[styles.profileSecondaryText, { color: "#334155", lineHeight: 1.4 }]}>
              {[
                selectedCustomer?.billingAddress?.attention,
                selectedCustomer?.billingAddress?.street1,
                selectedCustomer?.billingAddress?.street2,
                [selectedCustomer?.billingAddress?.city, selectedCustomer?.billingAddress?.state, selectedCustomer?.billingAddress?.pincode].filter(Boolean).join(", "),
                selectedCustomer?.billingAddress?.country,
              ].filter(Boolean).join("\n") || "No physical address provided"}
            </UnicodeText>
          </View>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} minPresenceAhead={20}>
            <Text style={[styles.tableHeaderLabel, styles.colDesc]}>विवरण</Text>
            <Text style={[styles.tableHeaderLabel, styles.colQty]}>मात्रा</Text>
            <Text style={[styles.tableHeaderLabel, styles.colMrp]}>एमआरपी (₹)</Text>
            <Text style={[styles.tableHeaderLabel, styles.colPrice]}>दर</Text>
            <Text style={[styles.tableHeaderLabel, styles.colTotal]}>कुल राशि</Text>
          </View>
          {itemData?.map((item, index) => {
            if (!item || (!item.name && !item.itemName)) return null;
            const quantity = Number(item?.quantity) || 0;
            const rate = Number(item?.sellingPrice || item?.itemSellingPrice) || 0;
            const mrp = Number(item?.itemMRP ?? item?.mrp ?? item?.MRP ?? item?.itemMrp) || 0;
            const individualDiscount = Number(item?.itemDiscountAmount ?? item?.discountAmount ?? item?.itemDiscount ?? item?.discount ?? 0) || 0;
            const hasIndividualDiscount = individualDiscount > 0;
            const calculatedLineAmount = Math.max(quantity * rate - individualDiscount, 0);
            return (
              <View key={item?._id || index} style={styles.tableDataRow} wrap={false}>
                <View style={styles.colDesc}>
                  <UnicodeText style={styles.itemName}>
                    {item?.itemName || item?.name}
                    {hasIndividualDiscount ? "*" : ""}
                  </UnicodeText>
                  {hasIndividualDiscount && <Text style={styles.itemDiscountText}>({money(individualDiscount)} off)</Text>}
                  {(item?.description || item?.itemDescription) && <UnicodeText style={styles.itemDesc}>{item?.description || item?.itemDescription}</UnicodeText>}
                </View>
                <Text style={[styles.colQty, styles.numericValueText]}>
                  {item?.quantity} {item?.unit || item?.itemUnit || ""}
                </Text>
                <Text style={[styles.colMrp, styles.numericValueText]}>{money(mrp)}</Text>
                <Text style={[styles.colPrice, styles.numericValueText]}>{money(rate)}</Text>
                <Text style={[styles.colTotal, styles.numericValueText, { fontWeight: "bold", color: "#1e1b4b" }]}>{money(calculatedLineAmount)}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.bottomExecutionSegment} wrap={false}>
          <View style={styles.annotationsWrapper}>
            {notes && (
              <View style={styles.annotationUnit}>
                <Text style={styles.billingSectionLabel}>टिप्पणियाँ</Text>
                <UnicodeText style={styles.annotationContent}>{notes}</UnicodeText>
              </View>
            )}
            {terms && (
              <View style={styles.annotationUnit}>
                <Text style={styles.billingSectionLabel}>नियम और शर्तें</Text>
                <UnicodeText style={styles.annotationContent}>{terms}</UnicodeText>
              </View>
            )}
          </View>
          <View style={styles.financialSummaryCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>उप-योग</Text>
              <Text style={styles.financialRowValue}>{money(subtotal)}</Text>
            </View>
            {Number(totalDiscount) > 0 && (
              <View style={styles.discountHighlightRow}>
                <Text style={styles.discountLabel}>छूट</Text>
                <Text style={styles.discountValue}>-{money(totalDiscount)}</Text>
              </View>
            )}
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>अनुमानित कर ({taxRate}%)</Text>
              <Text style={styles.financialRowValue}>{money(taxedAmount)}</Text>
            </View>
            <View style={styles.grandTotalDivider}>
              <Text style={styles.grandTotalLabel}>कुल देय राशि</Text>
              <Text style={styles.grandTotalAmount}>{money(safeGrandTotal)}</Text>
            </View>
            <View style={styles.paymentSummary}>
              <Text style={styles.paymentSummaryTitle}>भुगतान सारांश</Text>
              <View style={styles.paymentSummaryRow}>
                <Text style={styles.paymentSummaryLabel}>आज प्राप्त राशि</Text>
                <Text style={styles.paymentSummaryValue}>{money(safePaidAmount)}</Text>
              </View>
              <View style={styles.paymentSummaryRow}>
                <Text style={styles.paymentSummaryLabel}>बकाया राशि</Text>
                <Text style={styles.paymentDueValue}>{money(safeBalanceAmount)}</Text>
              </View>
              <View style={styles.paymentSummaryRow}>
                <Text style={styles.paymentSummaryLabel}>स्थिति</Text>
                <Text style={styles.paymentSummaryValue}>{displayPaymentStatus}</Text>
              </View>
              {paymentHistory.length > 0 && (
                <View style={styles.paymentHistory}>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentSummaryLabel}>कुल प्राप्त राशि</Text>
                    <Text style={styles.paymentSummaryValue}>{money(safePaidAmount)}</Text>
                  </View>
                  <Text style={styles.paymentSummaryTitle}>भुगतान इतिहास</Text>
                  {paymentHistory.map((payment, index) => {
                    const paymentDate = payment?.paymentDate ? new Date(payment.paymentDate) : null;
                    const formattedDate = paymentDate && !Number.isNaN(paymentDate.getTime())
                      ? paymentDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : "तारीख उपलब्ध नहीं";
                    return (
                      <View key={payment?._id || index} style={styles.paymentHistoryRow}>
                        <UnicodeText style={styles.paymentHistoryMeta}>
                          #{index + 1} · {formattedDate} · {payment?.paymentMethod || "नकद"}
                        </UnicodeText>
                        <Text style={styles.paymentHistoryAmount}>{money(payment?.amount)}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>
        {companySignature && (
          <View style={styles.signatureBlockContainer} wrap={false}>
            <View style={styles.signatureWrapper}>
              <Image src={companySignature} style={styles.signatureImage} />
              <View style={styles.signatureLine} />
              <UnicodeText style={styles.signatureTitleLabel}>{companyInfo?.companyName || "आपकी कंपनी का नाम"}</UnicodeText>
              <Text style={styles.signatureSubLabel}>प्रबंधक की स्वीकृतियाँ</Text>
            </View>
          </View>
        )}
        <View fixed style={styles.globalPageFooter}>
          <Text style={styles.footerDisclaimerText}>
            Thank you for selecting us as your vendor. All invoices are tied strictly to contractual service parameters.
          </Text>
          <Text style={styles.footerPlatformToken}>SaleSync // SECURE</Text>
        </View>
      </Page>
    </Document>
  );
}
