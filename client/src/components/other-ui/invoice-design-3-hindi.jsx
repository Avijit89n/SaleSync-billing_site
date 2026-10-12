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
  page: { paddingTop: 50, paddingHorizontal: 50, paddingBottom: 72, fontSize: 9, color: "#1c1917", fontFamily: "NotoSansDevanagari", backgroundColor: "#ffffff" },
  watermarkContainer: { position: "absolute", top: 380, left: 0, right: 0, alignItems: "center", justifyContent: "center", transform: "rotate(-45deg)" },
  watermark: { fontSize: 60, color: "#991b1b", opacity: 0.05, fontWeight: "bold", textAlign: "center" },
  watermarkSub: { marginTop: 10, fontSize: 18, color: "#991b1b", opacity: 0.05, fontWeight: "bold", textAlign: "center" },
  topDecorativeBar: { backgroundColor: "#991b1b", height: 4, marginBottom: 20 },
  brandHeaderContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 2, borderBottomColor: "#991b1b", paddingBottom: 12, marginBottom: 24 },
  companyBrandGroup: { flexDirection: "column", maxWidth: "55%" },
  logoContainer: { marginBottom: 8 },
  logoImage: { width: 40, height: "auto", maxHeight: 40, objectFit: "contain" },
  companyNameText: { fontSize: 24, fontWeight: "bold", color: "#1c1917", letterSpacing: -0.2 },
  companyMetaText: { fontSize: 8.5, color: "#44403c", marginTop: 4, lineHeight: 1.3 },
  invoiceMetaGroup: { alignItems: "flex-end" },
  invoiceLabel: { fontSize: 20, fontWeight: "bold", color: "#991b1b", textTransform: "uppercase", letterSpacing: 1 },
  invoiceSequenceId: { fontSize: 11, color: "#1c1917", marginTop: 2 },
  dateGrid: { alignItems: "flex-end", marginTop: 6, marginBottom: 4 },
  dateRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 3 },
  dateLabel: { fontSize: 8, color: "#78716c", width: 58, textAlign: "right", marginRight: 6 },
  dateValue: { fontSize: 8, color: "#1c1917", fontWeight: "bold", width: 70, textAlign: "right" },
  statusBadge: { marginTop: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2, fontSize: 7.5, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.4 },
  paid: { backgroundColor: "#f0fdf4", color: "#166534" },
  unpaid: { backgroundColor: "#fff1f2", color: "#9f1239" },
  overdue: { backgroundColor: "#ffedd5", color: "#9a3412", borderWidth: 1, borderColor: "#fed7aa" },
  partiallyPaid: { backgroundColor: "#fef3c7", color: "#92400e" },
  billingSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  billingBox: { width: "46%" },
  sectionTitle: { fontSize: 8.5, fontWeight: "bold", color: "#991b1b", textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: "#e7e5e4", paddingBottom: 3, marginBottom: 6, letterSpacing: 0.5 },
  profilePrimaryText: { fontSize: 10.5, fontWeight: "bold", color: "#1c1917" },
  profileSecondaryText: { fontSize: 8.5, color: "#44403c", marginTop: 3, lineHeight: 1.3 },
  tableContainer: { marginTop: 5 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#78716c", paddingVertical: 5, paddingHorizontal: 6 },
  tableHeaderLabel: { fontSize: 8, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase" },
  tableDataRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e7e5e4", paddingVertical: 8, paddingHorizontal: 6, alignItems: "flex-start" },
  colDesc: { flex: 2.3, paddingRight: 10 },
  colQty: { flex: 0.4, textAlign: "center" },
  colMrp: { flex: 0.8, textAlign: "right" },
  colPrice: { flex: 0.8, textAlign: "right" },
  colTotal: { flex: 0.8, textAlign: "right" },
  itemName: { fontSize: 9.5, fontWeight: "bold", color: "#1c1917" },
  itemDesc: { fontSize: 8.5, color: "#57534e", marginTop: 2, lineHeight: 1.2 },
  itemDiscountText: { fontSize: 7.5, color: "#15803d", fontWeight: "bold", marginTop: 2 },
  numericValueText: { fontSize: 9, color: "#1c1917" },
  bottomExecutionSegment: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 25 },
  annotationsWrapper: { width: "50%", flexDirection: "column", gap: 14, paddingRight: 20 },
  annotationUnit: { flexDirection: "column" },
  annotationContent: { fontSize: 8, color: "#57534e", lineHeight: 1.3, marginTop: 3 },
  financialSummaryCard: { width: "42%" },
  financialRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f5f5f4" },
  financialRowLabel: { fontSize: 8.5, color: "#57534e" },
  financialRowValue: { fontSize: 8.5, color: "#1c1917" },
  discountRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f5f5f4" },
  discountLabel: { fontSize: 8.5, color: "#15803d", fontWeight: "bold" },
  discountValue: { fontSize: 8.5, color: "#15803d", fontWeight: "bold" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f5f5f4", paddingHorizontal: 6, paddingVertical: 6, marginTop: 6, borderWidth: 1, borderColor: "#d6d3d1" },
  grandTotalLabel: { fontSize: 10, fontWeight: "bold", color: "#991b1b", textTransform: "uppercase" },
  grandTotalAmount: { fontSize: 12, fontWeight: "bold", color: "#991b1b" },
  paymentSummary: { marginTop: 8, paddingTop: 7, borderTopWidth: 1, borderTopColor: "#d6d3d1" },
  paymentSummaryTitle: { fontSize: 7.5, fontWeight: "bold", color: "#78716c", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  paymentSummaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  paymentSummaryLabel: { fontSize: 8, color: "#57534e" },
  paymentSummaryValue: { fontSize: 8, color: "#1c1917", fontWeight: "bold" },
  paymentDueValue: { fontSize: 12, color: "#9f1239", fontWeight: "bold" },
  paymentHistory: { marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: "#e7e5e4" },
  paymentHistoryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  paymentHistoryMeta: { fontSize: 7, color: "#78716c" },
  paymentHistoryAmount: { fontSize: 7.5, fontWeight: "bold", color: "#166534" },
  balanceDueRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopStyle: "dashed", borderTopColor: "#cbd5e1" },
  balanceDueLabel: { fontSize: 8, color: "#57534e", fontWeight: "bold" },
  balanceDueAmount: { fontSize: 12, color: "#9f1239", fontWeight: "bold" },
  signatureBlockContainer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 35 },
  signatureWrapper: { width: 180, alignItems: "center" },
  signatureSpacePlaceholder: { height: 40 },
  signatureImage: { height: 40, width: 105, objectFit: "contain", marginBottom: 4 },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#1c1917", width: "100%", marginBottom: 4 },
  signatureTitleLabel: { fontSize: 8.5, fontWeight: "bold", color: "#1c1917", textTransform: "uppercase", letterSpacing: 0.3 },
  signatureSubLabel: { fontSize: 7.5, color: "#78716c" },
  globalPageFooter: { position: "absolute", bottom: 30, left: 50, right: 50, borderTopWidth: 1, borderTopColor: "#991b1b", paddingTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  footerDisclaimerText: { fontSize: 8, color: "#78716c",  maxWidth: "80%" },
  footerPlatformToken: { fontSize: 7.5, color: "#a8a29e", textAlign: "right" },
});
export default function InvoiceDesign3({
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
        <View style={styles.topDecorativeBar} />
        <View style={styles.brandHeaderContainer}>
          <View style={styles.companyBrandGroup}>
            {companyLogo && (
              <View style={styles.logoContainer}>
                <Image src={companyLogo} style={styles.logoImage} />
              </View>
            )}
            <UnicodeText style={styles.companyNameText}>{companyInfo?.companyName || "आपकी कंपनी का नाम"}</UnicodeText>
            {companyInfo?.gstin && <Text style={styles.companyMetaText}>जीएसटीआईएन : {companyInfo.gstin}</Text>}
            {companyInfo?.address && <UnicodeText style={styles.companyMetaText}>{companyInfo.address}</UnicodeText>}
            {companyInfo?.phone && <Text style={styles.companyMetaText}>संपर्क नंबर:: {companyInfo.phone}</Text>}
            {companyInfo?.email && <Text style={styles.companyMetaText}>ईमेल: {companyInfo.email}</Text>}
          </View>
          <View style={styles.invoiceMetaGroup}>
            <Text style={styles.invoiceLabel}>आधिकारिक चालान</Text>
            <Text style={styles.invoiceSequenceId}>चालान नंबर: #{invoiceNumberSequence}</Text>
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
            <Text style={[styles.statusBadge, statusStyle]}>स्थिति: {displayPaymentStatus}</Text>
          </View>
        </View>
        <View style={styles.billingSection}>
          <View style={styles.billingBox}>
            <Text style={styles.sectionTitle}>चालान प्राप्तकर्ता</Text>
            <UnicodeText style={styles.profilePrimaryText}>{selectedCustomer?.displayName || "Unspecified Entity Account"}</UnicodeText>
            {selectedCustomer?.companyName && <UnicodeText style={styles.profileSecondaryText}>{selectedCustomer.companyName}</UnicodeText>}
            {selectedCustomer?.workingPhone && <Text style={styles.profileSecondaryText}>Phone: {selectedCustomer.workingPhone}</Text>}
            {selectedCustomer?.email && <Text style={styles.profileSecondaryText}>Email: {selectedCustomer.email}</Text>}
          </View>
          <View style={styles.billingBox}>
            <Text style={styles.sectionTitle}>शिपिंग / वितरण विवरण</Text>
            <UnicodeText style={[styles.profileSecondaryText, { lineHeight: 1.3 }]}>
              {[
                selectedCustomer?.billingAddress?.attention,
                selectedCustomer?.billingAddress?.street1,
                selectedCustomer?.billingAddress?.street2,
                [selectedCustomer?.billingAddress?.city, selectedCustomer?.billingAddress?.state, selectedCustomer?.billingAddress?.pincode].filter(Boolean).join(", "),
                selectedCustomer?.billingAddress?.country,
              ].filter(Boolean).join("\n") || "No physical dispatch configuration allocated to profile metadata tracking."}
            </UnicodeText>
          </View>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} minPresenceAhead={20}>
            <Text style={[styles.tableHeaderLabel, styles.colDesc]}>वस्तु का विवरण</Text>
            <Text style={[styles.tableHeaderLabel, styles.colQty]}>इकाई</Text>
          <Text style={[styles.tableHeaderLabel, styles.colMrp]}>एमआरपी (₹)</Text>
            <Text style={[styles.tableHeaderLabel, styles.colPrice]}>दर</Text>
            <Text style={[styles.tableHeaderLabel, styles.colTotal]}>शुद्ध राशि</Text>
          </View>
          {itemData.map((item, index) => {
            if (!item || (!item.name && !item.itemName)) return null;
            const quantity = Number(item?.quantity) || 0;
            const price = Number(item?.sellingPrice || item?.itemSellingPrice) || 0;
              const mrp = Number(item?.itemMRP ?? item?.mrp ?? item?.MRP ?? item?.itemMrp) || 0;
            const individualDiscount = Number(item?.itemDiscountAmount ?? item?.discountAmount ?? item?.itemDiscount ?? item?.discount ?? 0) || 0;
            const hasIndividualDiscount = individualDiscount > 0;
            const calculatedLineAmount = Math.max(quantity * price - individualDiscount, 0);
            return (
              <View key={item?._id || index} style={styles.tableDataRow} wrap={false}>
                <View style={styles.colDesc}>
                  <UnicodeText style={styles.itemName}>
                    {item?.itemName || item?.name}
                    {hasIndividualDiscount ? " *" : ""}
                  </UnicodeText>
                  {(item?.description || item?.itemDescription) && (
                    <UnicodeText style={styles.itemDesc}>{item?.description || item?.itemDescription}</UnicodeText>
                  )}
                  {hasIndividualDiscount && (
                    <Text style={styles.itemDiscountText}>({money(individualDiscount)} off)</Text>
                  )}
                </View>
                <Text style={[styles.colQty, styles.numericValueText]}>
                  {quantity} {item?.unit || item?.itemUnit || ""}
                </Text>
                <Text style={[styles.colMrp, styles.numericValueText]}>{money(mrp)}</Text>
                <Text style={[styles.colPrice, styles.numericValueText]}>{money(price)}</Text>
                <Text style={[styles.colTotal, styles.numericValueText, { fontWeight: "bold" }]}>{money(calculatedLineAmount)}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.bottomExecutionSegment} wrap={false}>
          <View style={styles.annotationsWrapper}>
            {notes && (
              <View style={styles.annotationUnit}>
                <Text style={styles.sectionTitle}>लेन-देन संबंधी टिप्पणियाँ</Text>
                <UnicodeText style={styles.annotationContent}>{notes}</UnicodeText>
              </View>
            )}
            {terms && (
              <View style={styles.annotationUnit}>
                <Text style={styles.sectionTitle}>औपचारिक नियम और शर्तें</Text>
                <UnicodeText style={styles.annotationContent}>{terms}</UnicodeText>
              </View>
            )}
          </View>
          <View style={styles.financialSummaryCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>सकल राशि</Text>
              <Text style={styles.financialRowValue}>{money(subtotal)}</Text>
            </View>
            {totalDiscount > 0 && (
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>छूट</Text>
                <Text style={styles.discountValue}>-{money(totalDiscount)}</Text>
              </View>
            )}
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>अनुमानित कर ({taxRate}%)</Text>
              <Text style={styles.financialRowValue}>{money(taxedAmount)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
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
              <UnicodeText style={styles.signatureTitleLabel}>For {companyInfo?.companyName || "आपकी कंपनी का नाम"}</UnicodeText>
              <Text style={styles.signatureSubLabel}>अधिकृत हस्ताक्षरकर्ता की पुष्टि</Text>
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
