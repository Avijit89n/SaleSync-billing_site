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
  page: { paddingTop: 45, paddingHorizontal: 45, paddingBottom: 72, fontSize: 9.5, color: "#292524", fontFamily: "NotoSansDevanagari", backgroundColor: "#fffdfa" },
  ledgerTopBorder: { borderTopWidth: 5, borderTopColor: "#7c2d12", marginBottom: 15 },
  brandHeaderContainer: { alignItems: "center", borderBottomWidth: 1.5, borderBottomColor: "#7c2d12", paddingBottom: 14, marginBottom: 22 },
  companyBrandGroup: { alignItems: "center", width: "100%" },
  logoContainer: { marginBottom: 8 },
  logoImage: { width: 40, height: "auto", maxHeight: 40, objectFit: "contain" },
  companyNameText: { fontSize: 22, fontWeight: "bold", color: "#7c2d12", letterSpacing: 0.5, textTransform: "uppercase" },
  companyMetaText: { fontSize: 8.5, color: "#57534e", marginTop: 3, letterSpacing: 0.2, textAlign: "center" },
  invoiceTitleBlock: { alignItems: "center", marginVertical: 12 },
  invoiceLabel: { fontSize: 14, fontWeight: "bold", color: "#7c2d12", textTransform: "uppercase", letterSpacing: 2, borderWidth: 1, borderColor: "#7c2d12", paddingHorizontal: 20, paddingVertical: 4, backgroundColor: "#fff7ed" },
  invoiceNumberText: { fontSize: 10, color: "#292524", fontWeight: "bold", marginTop: 5 },
  metaDataGrid: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fbf8f3", borderWidth: 1, borderColor: "#e7e5e4", padding: 10, marginBottom: 24 },
  metaColumn: { flexDirection: "column" },
  metaItemText: { fontSize: 9, marginBottom: 2 },
  metaLabel: { fontWeight: "bold" },
  statusText: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.3 },
  overdue: { backgroundColor: "#ffedd5", color: "#9a3412" },
  billingGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  billingCard: { width: "48%", borderWidth: 1, borderColor: "#d6d3d1", padding: 10, backgroundColor: "#ffffff" },
  billingSectionLabel: { fontSize: 8, fontWeight: "bold", color: "#7c2d12", textTransform: "uppercase", letterSpacing: 0.5, borderBottomWidth: 1, borderBottomColor: "#f5f5f4", paddingBottom: 4, marginBottom: 6 },
  profilePrimaryText: { fontSize: 10.5, fontWeight: "bold", color: "#292524" },
  profileSecondaryText: { fontSize: 8.5, color: "#57534e", marginTop: 3, lineHeight: 1.3 },
  tableContainer: { marginTop: 5, borderWidth: 1, borderColor: "#7c2d12" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#7c2d12", paddingVertical: 6, paddingHorizontal: 6 },
  tableHeaderLabel: { fontSize: 8, fontWeight: "bold", color: "#ffffff", textTransform: "uppercase" },
  tableDataRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e7e5e4", paddingVertical: 8, paddingHorizontal: 6, alignItems: "flex-start" },
  colDesc: { flex: 2.0, paddingRight: 8 },
  colQty: { flex: 0.5, textAlign: "center" },
  colMrp: { flex: 0.8, textAlign: "right" },
  colPrice: { flex: 0.85, textAlign: "right" },
  colTotal: { flex: 0.85, textAlign: "right" },
  itemName: { fontSize: 9.5, fontWeight: "bold", color: "#292524" },
  itemDesc: { fontSize: 8.5, color: "#78716c", marginTop: 1, lineHeight: 1.2 },
  itemDiscountText: { fontSize: 7.5, color: "#166534", fontWeight: "bold", marginTop: 2 },
  numericValueText: { fontSize: 9.5, color: "#292524" },
  bottomExecutionSegment: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 20 },
  annotationsWrapper: { width: "50%", flexDirection: "column", gap: 10, paddingRight: 15 },
  annotationBox: { borderLeftWidth: 2, borderLeftColor: "#7c2d12", paddingLeft: 8 },
  annotationContent: { fontSize: 8, color: "#57534e", lineHeight: 1.3 },
  financialSummaryCard: { width: "44%", borderWidth: 1, borderColor: "#d6d3d1", backgroundColor: "#ffffff", padding: 10 },
  financialRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f5f5f4" },
  financialRowLabel: { fontSize: 8.5, color: "#57534e" },
  financialRowValue: { fontSize: 8.5, color: "#292524" },
  discountRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f5f5f4" },
  discountLabel: { fontSize: 8.5, color: "#166534", fontWeight: "bold" },
  discountValue: { fontSize: 8.5, color: "#166534", fontWeight: "bold" },
  grandTotalDivider: { borderTopWidth: 1.5, borderTopColor: "#7c2d12", marginTop: 6, paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  grandTotalLabel: { fontSize: 10, fontWeight: "bold", color: "#7c2d12" },
  grandTotalAmount: { fontSize: 12, fontWeight: "bold", color: "#7c2d12" },
  paymentSummary: { marginTop: 8, paddingTop: 7, borderTopWidth: 1, borderTopColor: "#d6d3d1" },
  paymentSummaryTitle: { fontSize: 7.5, fontWeight: "bold", color: "#78716c", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  paymentSummaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  paymentSummaryLabel: { fontSize: 8, color: "#57534e" },
  paymentSummaryValue: { fontSize: 8, color: "#292524", fontWeight: "bold" },
  paymentDueValue: { fontSize: 11, color: "#9f1239", fontWeight: "bold" },
  paymentHistory: { marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: "#e7e5e4" },
  paymentHistoryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  paymentHistoryMeta: { fontSize: 7, color: "#78716c" },
  paymentHistoryAmount: { fontSize: 7.5, fontWeight: "bold", color: "#166534" },
  balanceDueRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopStyle: "dashed", borderTopColor: "#cbd5e1" },
  balanceDueLabel: { fontSize: 9, color: "#57534e", fontWeight: "bold" },
  balanceDueAmount: { fontSize: 12, color: "#9f1239", fontWeight: "bold" },
  signatureBlockContainer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 35 },
  signatureWrapper: { width: 170, alignItems: "center", borderWidth: 1, borderColor: "#e7e5e4", padding: 8, backgroundColor: "#fffdfa" },
  signatureSpacePlaceholder: { height: 35 },
  signatureImage: { height: 35, width: 100, objectFit: "contain", marginBottom: 4 },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#7c2d12", width: "100%", marginBottom: 4 },
  signatureTitleLabel: { fontSize: 8, fontWeight: "bold", color: "#292524", textTransform: "uppercase" },
  signatureSubLabel: { fontSize: 7.5, color: "#78716c", marginTop: 2 },
  globalPageFooter: { position: "absolute", bottom: 28, left: 45, right: 45, borderTopWidth: 1, borderTopColor: "#e7e5e4", paddingTop: 9, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  footerDisclaimerText: { fontSize: 8, color: "#78716c", maxWidth: "72%", lineHeight: 1.2 },
  footerPlatformToken: { fontSize: 7.5, color: "#a8a29e", textAlign: "right" },
  watermarkContainer: { position: "absolute", top: 380, left: 0, right: 0, alignItems: "center", justifyContent: "center", transform: "rotate(-45deg)" },
  watermark: { fontSize: 60, color: "#7c2d12", opacity: 0.05, fontWeight: "bold", textAlign: "center" },
  watermarkSub: { marginTop: 10, fontSize: 18, color: "#7c2d12", opacity: 0.05, fontWeight: "bold", textAlign: "center" },
});
export default function InvoiceDesign4({
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
        <View style={styles.ledgerTopBorder} />
        <View style={styles.brandHeaderContainer}>
          <View style={styles.companyBrandGroup}>
            {companyLogo && (
              <View style={styles.logoContainer}>
                <Image src={companyLogo} style={styles.logoImage} />
              </View>
            )}
            <UnicodeText style={styles.companyNameText}>{companyInfo?.companyName || "आपकी कंपनी का नाम"}</UnicodeText>
            {companyInfo?.gstin && <UnicodeText style={styles.companyMetaText}>जीएसटीआईएन: {companyInfo.gstin}</UnicodeText>}
            {companyInfo?.address && <UnicodeText style={styles.companyMetaText}>{companyInfo.address}</UnicodeText>}
            {companyInfo?.phone && <UnicodeText style={styles.companyMetaText}>संपर्क नंबर: {companyInfo.phone}</UnicodeText>}
            {companyInfo?.email && <UnicodeText style={styles.companyMetaText}>ईमेल: {companyInfo.email}</UnicodeText>}
          </View>
        </View>
        <View style={styles.invoiceTitleBlock}>
          <Text style={styles.invoiceLabel}>राजस्व चालान / वाउचर</Text>
          <Text style={styles.invoiceNumberText}>चालान नंबर: #{invoiceNumberSequence}</Text>
        </View>
        <View style={styles.metaDataGrid}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaItemText}>
              <Text style={styles.metaLabel}>चालान संख्या: </Text>#{invoiceNumberSequence}
            </Text>
            <Text style={styles.metaItemText}>
              <Text style={styles.metaLabel}>जारी करने की तारीख: </Text>{formatDate(issueDate)}
            </Text>
            <Text style={styles.metaItemText}>
              <Text style={styles.metaLabel}>भुगतान की अंतिम तारीख: </Text>{formatDate(dueDate)}
            </Text>
          </View>
          <View style={[styles.metaColumn, { alignItems: "flex-end" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>[ स्थिति: {normalizedPaymentStatus} ]</Text>
          </View>
        </View>
        <View style={styles.billingGrid}>
          <View style={styles.billingCard}>
            <Text style={styles.billingSectionLabel}>फर्म (ऋणी / ग्राहक)</Text>
            <UnicodeText style={styles.profilePrimaryText}>{selectedCustomer?.displayName || "No Client Record Assigned"}</UnicodeText>
            {selectedCustomer?.companyName && <UnicodeText style={styles.profileSecondaryText}>{selectedCustomer.companyName}</UnicodeText>}
            {selectedCustomer?.workingPhone && <UnicodeText style={styles.profileSecondaryText}>Contact: {selectedCustomer.workingPhone}</UnicodeText>}
            {selectedCustomer?.email && <UnicodeText style={styles.profileSecondaryText}>Email: {selectedCustomer.email}</UnicodeText>}
          </View>
          <View style={styles.billingCard}>
            <Text style={styles.billingSectionLabel}>माल प्राप्तकर्ता / गंतव्य</Text>
            <UnicodeText style={[styles.profileSecondaryText, { color: "#292524" }]}>
              {[
                selectedCustomer?.billingAddress?.attention,
                selectedCustomer?.billingAddress?.street1,
                selectedCustomer?.billingAddress?.street2,
                [selectedCustomer?.billingAddress?.city, selectedCustomer?.billingAddress?.state, selectedCustomer?.billingAddress?.pincode].filter(Boolean).join(", "),
                selectedCustomer?.billingAddress?.country,
              ].filter(Boolean).join("\n") || "No physical delivery address recorded."}
            </UnicodeText>
          </View>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} minPresenceAhead={20}>
            <Text style={[styles.tableHeaderLabel, styles.colDesc]}>विवरण</Text>
            <Text style={[styles.tableHeaderLabel, styles.colQty]}>मात्रा</Text>
          <Text style={[styles.tableHeaderLabel, styles.colMrp]}>एमआरपी (₹)</Text>
            <Text style={[styles.tableHeaderLabel, styles.colPrice]}>दर</Text>
            <Text style={[styles.tableHeaderLabel, styles.colTotal]}>राशि (₹)</Text>
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
              <View style={styles.annotationBox}>
                <Text style={[styles.billingSectionLabel, { borderBottomWidth: 0, marginBottom: 2 }]}>टिप्पणियाँ</Text>
                <UnicodeText style={styles.annotationContent}>{notes}</UnicodeText>
              </View>
            )}
            {terms && (
              <View style={styles.annotationBox}>
                <Text style={[styles.billingSectionLabel, { borderBottomWidth: 0, marginBottom: 2 }]}>नियम और शर्तें</Text>
                <UnicodeText style={styles.annotationContent}>{terms}</UnicodeText>
              </View>
            )}
          </View>
          <View style={styles.financialSummaryCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>उप-योग</Text>
              <Text style={styles.financialRowValue}>{money(subtotal)}</Text>
            </View>
            {totalDiscount > 0 && (
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>घटाएँ: छूट</Text>
                <Text style={styles.discountValue}>-{money(totalDiscount)}</Text>
              </View>
            )}
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>अनुमानित कर ({taxRate}%)</Text>
              <Text style={styles.financialRowValue}>{money(taxedAmount)}</Text>
            </View>
            <View style={styles.grandTotalDivider}>
              <Text style={styles.grandTotalLabel}>कुल भुगतान योग्य राशि</Text>
              <Text style={styles.grandTotalAmount}>{money(safeGrandTotal)}</Text>
            </View>
            <View style={styles.paymentSummary}>
              <Text style={styles.paymentSummaryTitle}>भुगतान सारांश</Text>
              <View style={styles.paymentSummaryRow}>
                <Text style={styles.paymentSummaryLabel}>आज प्राप्त राशि</Text>
                <Text style={styles.paymentSummaryValue}>{money(safePaidAmount)}</Text>
              </View>
              <View style={styles.paymentSummaryRow}>
                <Text style={[styles.paymentSummaryLabel, { fontSize: 9, fontWeight: "bold" }]}>बकाया राशि</Text>
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
              <UnicodeText style={styles.signatureTitleLabel}>{companyInfo?.companyName || "आपकी कंपनी का नाम"}</UnicodeText>
              <Text style={styles.signatureSubLabel}>अधिकृत हस्ताक्षरकर्ता</Text>
            </View>
          </View>
        )}
        <View fixed style={styles.globalPageFooter}>
          <Text style={styles.footerDisclaimerText}>
            E.&O.E. Please match items against physically signed delivery challans.
          </Text>
          <Text style={styles.footerPlatformToken}>SaleSync // SECURE</Text>
        </View>
      </Page>
    </Document>
  );
}
