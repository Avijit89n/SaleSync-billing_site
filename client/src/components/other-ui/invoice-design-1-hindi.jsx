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
  const parts = text.split(/([\u0900-\u097F]+|[\u0980-\u09FF]+)/);
  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (!part) return null;
        if (/[\u0900-\u097F]/.test(part)) {
          return (
            <Text key={index} style={[style, { fontFamily: "NotoSansDevanagari" }]}>
              {part}
            </Text>
          );
        }
        if (/[\u0980-\u09FF]/.test(part)) {
          return (
            <Text key={index} style={[style, { fontFamily: "NotoSansBengali" }]}>
              {part}
            </Text>
          );
        }
        return (
          <Text key={index} style={style}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
};
const styles = StyleSheet.create({
  page: { paddingTop: 45, paddingHorizontal: 45, paddingBottom: 72, fontSize: 10, color: "#334155", fontFamily: "NotoSansDevanagari", backgroundColor: "#ffffff" },
  brandHeaderContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 16, marginBottom: 20 },
  companyBrandGroup: { flexDirection: "column", maxWidth: "60%" },
  logoContainer: { marginBottom: 8 },
  logoImage: { width: 30, height: "auto", maxHeight: 45, objectFit: "contain" },
  companyNameText: { fontSize: 20, fontWeight: "bold", color: "#0f172a", letterSpacing: -0.5 },
  companyMetaText: { fontSize: 9, color: "#64748b", marginTop: 2, lineHeight: 1.3 },
  invoiceMetaGroup: { alignItems: "flex-end" },
  invoiceLabel: { fontSize: 24, fontWeight: "bold", color: "#f97316", letterSpacing: 0.5 },
  invoiceSequenceId: { fontSize: 12, fontWeight: "bold", color: "#334155", marginTop: 2, marginBottom: 4 },
  dateGrid: { marginTop: 4, alignItems: "flex-end" },
  dateRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 2 },
  dateLabel: { fontSize: 8.5, fontWeight: "bold", color: "#475569", width: 60, textAlign: "right", marginRight: 4 },
  dateValue: { fontSize: 8.5, color: "#334155", width: 65, textAlign: "right" },
  statusBadge: { marginTop: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 8, fontWeight: "bold", textTransform: "uppercase", textAlign: "center" },
  paid: { backgroundColor: "#dcfce7", color: "#166534", borderWidth: 1, borderColor: "#bbf7d0" },
  unpaid: { backgroundColor: "#ffe4e6", color: "#991b1b", borderWidth: 1, borderColor: "#fecdd3" },
  overdue: { backgroundColor: "#ffedd5", color: "#9a3412", borderWidth: 1, borderColor: "#fed7aa" },
  partiallyPaid: { backgroundColor: "#ffedd5", color: "#9a3412", borderWidth: 1, borderColor: "#fed7aa" },
  paymentSummary: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  paymentSummaryTitle: { fontSize: 8, fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 },
  paymentSummaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5 },
  paymentSummaryLabel: { fontSize: 9, color: "#64748b" },
  paymentSummaryValue: { fontSize: 9, fontWeight: "bold", color: "#334155" },
  paymentDueValue: { fontSize: 12, fontWeight: "bold", color: "#c2410c" },
  paymentHistory: { marginTop: 7, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  paymentHistoryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  paymentHistoryMeta: { fontSize: 7.5, color: "#64748b" },
  paymentHistoryAmount: { fontSize: 8, fontWeight: "bold", color: "#166534" },
  billingGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28, gap: 20 },
  billingCard: { flex: 1, backgroundColor: "#f8fafc", borderLeftWidth: 3, borderLeftColor: "#f97316", padding: 12, borderRadius: 4 },
  billingSectionLabel: { fontSize: 8, fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  profilePrimaryText: { fontSize: 12, fontWeight: "bold", color: "#0f172a" },
  profileSecondaryText: { fontSize: 9, color: "#475569", marginTop: 2, lineHeight: 1.3 },
  watermarkContainer: { position: "absolute", top: 380, left: 0, right: 0, alignItems: "center", justifyContent: "center", transform: "rotate(-45deg)" },
  watermark: { fontSize: 60, color: "#ef4444", opacity: 0.12, fontWeight: "bold", textAlign: "center" },
  watermarkSub: { marginTop: 10, fontSize: 18, color: "#ef4444", opacity: 0.12, fontWeight: "bold", textAlign: "center" },
  tableContainer: { marginTop: 8 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#0f172a", paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4 },
  tableHeaderLabel: { fontSize: 8, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase", letterSpacing: 0.5 },
  tableDataRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 8, paddingHorizontal: 8, alignItems: "center" },
  tableDataRowAlternate: { backgroundColor: "#f8fafc" },
  colDesc: { flex: 2.2, paddingRight: 8 },
  colQty: { flex: 0.5, textAlign: "center" },
  colMrp: { flex: 0.8, textAlign: "right" },
  colPrice: { flex: 0.75, textAlign: "right" },
  colTotal: { flex: 0.75, textAlign: "right" },
  itemName: { fontSize: 10, fontWeight: "bold", color: "#0f172a" },
  itemDiscountText: { fontSize: 8, color: "#166534", marginTop: 3, fontWeight: "bold" },
  itemDesc: { fontSize: 9, color: "#64748b", marginTop: 1 },
  numericValueText: { fontSize: 10, color: "#334155" },
  bottomExecutionSegment: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 24, gap: 30 },
  annotationsWrapper: { flex: 1.2, flexDirection: "column", gap: 12 },
  annotationBox: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, padding: 10 },
  annotationContent: { fontSize: 8.5, color: "#64748b", lineHeight: 1.3, marginTop: 4 },
  financialSummaryCard: { flex: 1, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, padding: 12 },
  financialRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3.5 },
  financialRowLabel: { fontSize: 9, color: "#64748b" },
  financialRowValue: { fontSize: 9, fontWeight: "medium", color: "#334155" },
  discountHighlightRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f0fdf4", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginVertical: 2 },
  discountLabel: { fontSize: 9, color: "#166534", fontWeight: "medium" },
  discountValue: { fontSize: 9, color: "#166534", fontWeight: "bold" },
  grandTotalDivider: { borderTopWidth: 1, borderTopColor: "#cbd5e1", marginTop: 6, paddingTop: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  grandTotalLabel: { fontSize: 11, fontWeight: "bold", color: "#0f172a" },
  grandTotalAmount: { fontSize: 14, fontWeight: "bold", color: "#f97316" },
  signatureBlockContainer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 35, paddingRight: 10 },
  signatureWrapper: { width: 180, alignItems: "center" },
  signatureImage: { height: 45, width: 95, objectFit: "contain" },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#94a3b8", width: "100%", marginBottom: 4 },
  signatureTitleLabel: { fontSize: 9, fontWeight: "bold", color: "#475569" },
  signatureSubLabel: { fontSize: 8, color: "#94a3b8", textTransform: "uppercase" },
  globalPageFooter: { position: "absolute", left: 45, right: 45, bottom: 25, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 8, alignItems: "center", justifyContent: "center" },
  footerDisclaimerText: { fontSize: 8.5, color: "#64748b", textAlign: "center" },
  footerPlatformToken: { fontSize: 7.5, color: "#94a3b8", marginTop: 2, textAlign: "center", letterSpacing: 0.2 },
});
export default function InvoiceDesign1({
  companyInfo,
  companyLogo,
  companySignature,
  invoiceNumberSequence,
  isPaid,
  issueDate,
  dueDate,
  selectedCustomer,
  itemData,
  subtotal,
  totalDiscount,
  taxRate,
  taxedAmount,
  grandTotal,
  notes,
  terms,
  paymentStatus,
  paidAmount = 0,
  balanceAmount = 0,
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
  const money = (value) => `Rs. ${(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (date) => (date instanceof Date ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : date);
  return (
    <Document title={isPreview ? `Preview-${invoiceNumberSequence}` : `Invoice-${invoiceNumberSequence}`}>
      <Page size="A4" style={styles.page}>
        {isPreview && (
          <View fixed style={styles.watermarkContainer}>
            <Text style={styles.watermark}>पूर्वावलोकन प्रति</Text>
            <Text style={styles.watermarkSub}>लेखा प्रयोजनों के लिए मान्य नहीं</Text>
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
            <UnicodeText style={styles.companyMetaText}>जीएसटीआईएन: {companyInfo?.gstin || "N/A"}</UnicodeText>
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
          <View style={styles.billingCard}>
            <Text style={styles.billingSectionLabel}>ग्राहक रिकॉर्ड संदर्भ</Text>
            <UnicodeText style={styles.profilePrimaryText}>{selectedCustomer?.displayName || "No Client Record Assigned"}</UnicodeText>
            {selectedCustomer?.companyName && <UnicodeText style={styles.profileSecondaryText}>{selectedCustomer.companyName}</UnicodeText>}
            {selectedCustomer?.workingPhone && <Text style={styles.profileSecondaryText}>☎ {selectedCustomer.workingPhone}</Text>}
            {selectedCustomer?.email && <Text style={styles.profileSecondaryText}>{selectedCustomer.email}</Text>}
          </View>
          <View style={styles.billingCard}>
            <Text style={styles.billingSectionLabel}>वितरण और बिलिंग का पता</Text>
            <UnicodeText style={[styles.profileSecondaryText, { color: "#334155", lineHeight: 1.4 }]}>
              {[
                selectedCustomer?.billingAddress?.attention,
                selectedCustomer?.billingAddress?.street1,
                selectedCustomer?.billingAddress?.street2,
                [selectedCustomer?.billingAddress?.city, selectedCustomer?.billingAddress?.state, selectedCustomer?.billingAddress?.pincode].filter(Boolean).join(", "),
                selectedCustomer?.billingAddress?.country,
              ].filter(Boolean).join("\n") || "बिलिंग का पता उपलब्ध नहीं"}
            </UnicodeText>
          </View>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} minPresenceAhead={20}>
            <Text style={[styles.tableHeaderLabel, styles.colDesc]}>वस्तु का विवरण</Text>
            <Text style={[styles.tableHeaderLabel, styles.colQty]}>मात्रा</Text>
            <Text style={[styles.tableHeaderLabel, styles.colMrp]}>एमआरपी (₹)</Text>
            <Text style={[styles.tableHeaderLabel, styles.colPrice]}>दर (₹)</Text>
            <Text style={[styles.tableHeaderLabel, styles.colTotal]}>राशि (₹)</Text>
          </View>
          {itemData?.map((item, index) => {
            if (!item || (!item.name && !item.itemName)) return null;
            const quantity = Number(item?.quantity) || 0;
            const rate = Number(item?.itemSellingPrice ?? item?.sellingPrice) || 0;
            const mrp = Number(item?.itemMRP ?? item?.mrp ?? item?.MRP ?? item?.itemMrp) || 0;
            const individualDiscount = Number(item?.itemDiscountAmount ?? item?.discountAmount ?? item?.itemDiscount ?? item?.discount ?? 0) || 0;
            const calculatedLineAmount = Math.max(quantity * rate - individualDiscount, 0);
            const hasIndividualDiscount = individualDiscount > 0;
            const isAlternateRow = index % 2 === 1;
            return (
              <View key={item?._id || index} style={[styles.tableDataRow, isAlternateRow && styles.tableDataRowAlternate]} wrap={false}>
                <View style={styles.colDesc}>
                  <UnicodeText style={styles.itemName}>
                    {item?.itemName || item?.name}
                    {hasIndividualDiscount ? "*" : ""}
                  </UnicodeText>
                  {hasIndividualDiscount && <Text style={styles.itemDiscountText}>({money(individualDiscount)} off)</Text>}
                  {(item?.itemDescription || item?.description) && <UnicodeText style={styles.itemDesc}>{item?.itemDescription || item?.description}</UnicodeText>}
                </View>
                <Text style={[styles.colQty, styles.numericValueText]}>
                  {quantity} {String(item?.itemUnit || item?.unit || "").replace(/^[,\s]+/, "")}
                </Text>
                <Text style={[styles.colMrp, styles.numericValueText]}>{money(mrp)}</Text>
                <Text style={[styles.colPrice, styles.numericValueText]}>{money(rate)}</Text>
                <Text style={[styles.colTotal, styles.numericValueText, { fontWeight: "bold", color: "#0f172a" }]}>{money(calculatedLineAmount)}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.bottomExecutionSegment} wrap={false}>
          <View style={styles.annotationsWrapper}>
            {notes && (
              <View style={styles.annotationBox}>
                <Text style={styles.billingSectionLabel}>टिप्पणियाँ और निर्देश</Text>
                <UnicodeText style={styles.annotationContent}>{notes}</UnicodeText>
              </View>
            )}
            {terms && (
              <View style={styles.annotationBox}>
                <Text style={styles.billingSectionLabel}>नियम और शर्तें</Text>
                <UnicodeText style={styles.annotationContent}>{terms}</UnicodeText>
              </View>
            )}
          </View>
          <View style={styles.financialSummaryCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>उप-योग (₹)</Text>
              <Text style={styles.financialRowValue}>{money(subtotal)}</Text>
            </View>
            {Number(totalDiscount) > 0 && (
              <View style={styles.discountHighlightRow}>
                <Text style={styles.discountLabel}>लागू छूट (₹)</Text>
                <Text style={styles.discountValue}>- {money(totalDiscount)}</Text>
              </View>
            )}
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>अनुमानित कर ({taxRate || 0}%)</Text>
              <Text style={styles.financialRowValue}>{money(taxedAmount)}</Text>
            </View>
            <View style={styles.grandTotalDivider}>
              <Text style={styles.grandTotalLabel}>कुल योग</Text>
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
              <Text style={styles.signatureSubLabel}>अधिकृत हस्ताक्षरकर्ता</Text>
            </View>
          </View>
        )}
        <View fixed style={styles.globalPageFooter}>
          <Text style={styles.footerDisclaimerText}>
            Thank you for your business. If you have any inquiries regarding this document, please contact us.
            {/* आपके व्यवसाय के लिए धन्यवाद। यदि इस दस्तावेज़ के संबंध में आपका कोई प्रश्न हो, तो कृपया हमसे संपर्क करें। */}
          </Text>
          <Text style={styles.footerPlatformToken}>SaleSync — Sync Sales. Simplify Billing</Text>
        </View>
      </Page>
    </Document>
  );
}
