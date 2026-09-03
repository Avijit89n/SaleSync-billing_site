import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingHorizontal: 50,
    paddingBottom: 72,
    fontSize: 9,
    color: "#1c1917",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  watermarkContainer: {
    position: "absolute",
    top: 380,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(-45deg)",
  },

  watermark: {
    fontSize: 60,
    color: "#991b1b",
    opacity: 0.05,
    fontWeight: "bold",
    textAlign: "center",
  },

  watermarkSub: {
    marginTop: 10,
    fontSize: 18,
    color: "#991b1b",
    opacity: 0.05,
    fontWeight: "bold",
    textAlign: "center",
  },

  topDecorativeBar: {
    backgroundColor: "#991b1b",
    height: 4,
    marginBottom: 20,
  },

  brandHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#991b1b",
    paddingBottom: 12,
    marginBottom: 24,
  },

  companyBrandGroup: {
    flexDirection: "column",
    maxWidth: "55%",
  },

  logoContainer: {
    marginBottom: 8,
  },

  logoImage: {
    width: 40,
    height: "auto",
    maxHeight: 40,
    objectFit: "contain",
  },

  companyNameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1c1917",
    letterSpacing: -0.2,
  },

  companyMetaText: {
    fontSize: 8.5,
    color: "#44403c",
    marginTop: 4,
    lineHeight: 1.3,
  },

  invoiceMetaGroup: {
    alignItems: "flex-end",
  },

  invoiceLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#991b1b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  invoiceSequenceId: {
    fontSize: 11,
    color: "#1c1917",
    marginTop: 2,
  },

  dateGrid: {
    alignItems: "flex-end",
    marginTop: 6,
    marginBottom: 4,
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 3,
  },

  dateLabel: {
    fontSize: 8,
    color: "#78716c",
    width: 58,
    textAlign: "right",
    marginRight: 6,
  },

  dateValue: {
    fontSize: 8,
    color: "#1c1917",
    fontWeight: "bold",
    width: 70,
    textAlign: "right",
  },

  statusBadge: {
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    fontSize: 7.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  paid: {
    backgroundColor: "#f0fdf4",
    color: "#166534",
  },

  unpaid: {
    backgroundColor: "#fff1f2",
    color: "#9f1239",
  },

  partiallyPaid: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },

  billingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  billingBox: {
    width: "46%",
  },

  sectionTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#991b1b",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
    paddingBottom: 3,
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  profilePrimaryText: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#1c1917",
  },

  profileSecondaryText: {
    fontSize: 8.5,
    color: "#44403c",
    marginTop: 3,
    lineHeight: 1.3,
  },

  tableContainer: {
    marginTop: 5,
  },

  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#78716c",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },

  tableHeaderLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
  },

  tableDataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "flex-start",
  },

  colDesc: {
    flex: 2.8,
    paddingRight: 10,
  },

  colQty: {
    flex: 0.4,
    textAlign: "center",
  },

  colPrice: {
    flex: 0.9,
    textAlign: "right",
  },

  colTotal: {
    flex: 0.9,
    textAlign: "right",
  },

  itemName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#1c1917",
  },

  itemDesc: {
    fontSize: 8.5,
    color: "#57534e",
    marginTop: 2,
    lineHeight: 1.2,
  },

  itemDiscountText: {
    fontSize: 7.5,
    color: "#15803d",
    fontWeight: "bold",
    marginTop: 2,
  },

  numericValueText: {
    fontSize: 9,
    color: "#1c1917",
  },

  bottomExecutionSegment: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 25,
  },

  annotationsWrapper: {
    width: "50%",
    flexDirection: "column",
    gap: 14,
    paddingRight: 20,
  },

  annotationUnit: {
    flexDirection: "column",
  },

  annotationContent: {
    fontSize: 8,
    color: "#57534e",
    lineHeight: 1.3,
    marginTop: 3,
  },

  financialSummaryCard: {
    width: "42%",
  },

  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f4",
  },

  financialRowLabel: {
    fontSize: 8.5,
    color: "#57534e",
  },

  financialRowValue: {
    fontSize: 8.5,
    color: "#1c1917",
  },

  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f4",
  },

  discountLabel: {
    fontSize: 8.5,
    color: "#15803d",
    fontWeight: "bold",
  },

  discountValue: {
    fontSize: 8.5,
    color: "#15803d",
    fontWeight: "bold",
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f4",
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#d6d3d1",
  },

  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#991b1b",
    textTransform: "uppercase",
  },

  grandTotalAmount: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#991b1b",
  },

  paymentSummary: {
    marginTop: 8,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: "#d6d3d1",
  },

  paymentSummaryTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#78716c",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },

  paymentSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },

  paymentSummaryLabel: {
    fontSize: 8,
    color: "#57534e",
  },

  paymentSummaryValue: {
    fontSize: 8,
    color: "#1c1917",
    fontWeight: "bold",
  },

  paymentDueValue: {
    fontSize: 12,
    color: "#9f1239",
    fontWeight: "bold",
  },

  paymentHistory: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#e7e5e4",
  },

  paymentHistoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },

  paymentHistoryMeta: {
    fontSize: 7,
    color: "#78716c",
  },

  paymentHistoryAmount: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#166534",
  },

  balanceDueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopStyle: "dashed",
    borderTopColor: "#cbd5e1",
  },

  balanceDueLabel: {
    fontSize: 8,
    color: "#57534e",
    fontWeight: "bold",
  },

  balanceDueAmount: {
    fontSize: 12,
    color: "#9f1239",
    fontWeight: "bold",
  },

  signatureBlockContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 35,
  },

  signatureWrapper: {
    width: 180,
    alignItems: "center",
  },

  signatureSpacePlaceholder: {
    height: 40,
  },

  signatureImage: {
    height: 40,
    width: 105,
    objectFit: "contain",
    marginBottom: 4,
  },

  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#1c1917",
    width: "100%",
    marginBottom: 4,
  },

  signatureTitleLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#1c1917",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  signatureSubLabel: {
    fontSize: 7.5,
    color: "#78716c",
  },

  globalPageFooter: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: "#991b1b",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  footerDisclaimerText: {
    fontSize: 8,
    color: "#78716c",
    fontStyle: "italic",
    maxWidth: "72%",
  },

  footerPlatformToken: {
    fontSize: 7.5,
    color: "#a8a29e",
    textAlign: "right",
  },
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

  const safePaidAmount = Math.min(
    Math.max(Number(paidAmount) || 0, 0),
    Math.max(safeGrandTotal, 0)
  );

  const safeBalanceAmount = Math.max(
    0,
    Number(
      balanceAmount !== undefined
        ? balanceAmount
        : safeGrandTotal - safePaidAmount
    ) || 0
  );

  const normalizedPaymentStatus =
    safeGrandTotal <= 0 || safePaidAmount <= 0
      ? "Outstanding"
      : safeBalanceAmount <= 0
      ? "Paid"
      : "Partially Paid";

  const statusStyle =
    normalizedPaymentStatus === "Paid"
      ? styles.paid
      : normalizedPaymentStatus === "Partially Paid"
      ? styles.partiallyPaid
      : styles.unpaid;

  const paymentHistory = Array.isArray(payments)
    ? payments.filter((payment) => Number(payment?.amount) > 0)
    : [];

  const formatDate = (date) => {
    if (!date) return "N/A";

    return date instanceof Date
      ? date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : date;
  };

  const money = (value) =>
    `Rs. ${(Number(value) || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <Document
      title={
        isPreview
          ? `Preview-${invoiceNumberSequence}`
          : `Invoice-${invoiceNumberSequence}`
      }
    >
      <Page size="A4" style={styles.page}>
        {isPreview && (
          <View fixed style={styles.watermarkContainer}>
            <Text style={styles.watermark}>PREVIEW</Text>
            <Text style={styles.watermarkSub}>UNOFFICIAL COPY</Text>
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

            <Text style={styles.companyNameText}>
              {companyInfo?.companyName || "YOUR COMPANY NAME"}
            </Text>

            {companyInfo?.gstin && (
              <Text style={styles.companyMetaText}>
                GSTIN: {companyInfo.gstin}
              </Text>
            )}

            {companyInfo?.address && (
              <Text style={styles.companyMetaText}>
                {companyInfo.address}
              </Text>
            )}

            {companyInfo?.phone && (
              <Text style={styles.companyMetaText}>
                Phone: {companyInfo.phone}
              </Text>
            )}

            {companyInfo?.email && (
              <Text style={styles.companyMetaText}>
                Email: {companyInfo.email}
              </Text>
            )}
          </View>

          <View style={styles.invoiceMetaGroup}>
            <Text style={styles.invoiceLabel}>Official Invoice</Text>

            <Text style={styles.invoiceSequenceId}>
              Doc No: #{invoiceNumberSequence}
            </Text>

            <View style={styles.dateGrid}>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Issue Date:</Text>
                <Text style={styles.dateValue}>
                  {formatDate(issueDate)}
                </Text>
              </View>

              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Due Date:</Text>
                <Text style={styles.dateValue}>
                  {formatDate(dueDate)}
                </Text>
              </View>
            </View>

            <Text style={[styles.statusBadge, statusStyle]}>
              Account Status: {normalizedPaymentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.billingSection}>
          <View style={styles.billingBox}>
            <Text style={styles.sectionTitle}>Invoice To</Text>

            <Text style={styles.profilePrimaryText}>
              {selectedCustomer?.displayName ||
                "Unspecified Entity Account"}
            </Text>

            {selectedCustomer?.companyName && (
              <Text style={styles.profileSecondaryText}>
                {selectedCustomer.companyName}
              </Text>
            )}

            {selectedCustomer?.workingPhone && (
              <Text style={styles.profileSecondaryText}>
                Phone: {selectedCustomer.workingPhone}
              </Text>
            )}

            {selectedCustomer?.email && (
              <Text style={styles.profileSecondaryText}>
                Email: {selectedCustomer.email}
              </Text>
            )}
          </View>

          <View style={styles.billingBox}>
            <Text style={styles.sectionTitle}>
              Shipping / Delivery Ledger
            </Text>

            <Text
              style={[
                styles.profileSecondaryText,
                { lineHeight: 1.3 },
              ]}
            >
              {[
                selectedCustomer?.billingAddress?.attention,
                selectedCustomer?.billingAddress?.street1,
                selectedCustomer?.billingAddress?.street2,
                [
                  selectedCustomer?.billingAddress?.city,
                  selectedCustomer?.billingAddress?.state,
                  selectedCustomer?.billingAddress?.pincode,
                ]
                  .filter(Boolean)
                  .join(", "),
                selectedCustomer?.billingAddress?.country,
              ]
                .filter(Boolean)
                .join("\n") ||
                "No physical dispatch configuration allocated to profile metadata tracking."}
            </Text>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} minPresenceAhead={20}>
            <Text style={[styles.tableHeaderLabel, styles.colDesc]}>
              Item Particulars
            </Text>

            <Text style={[styles.tableHeaderLabel, styles.colQty]}>
              Unit
            </Text>

            <Text style={[styles.tableHeaderLabel, styles.colPrice]}>
              Rate
            </Text>

            <Text style={[styles.tableHeaderLabel, styles.colTotal]}>
              Net Value
            </Text>
          </View>

          {itemData.map((item, index) => {
            if (!item || (!item.name && !item.itemName)) {
              return null;
            }

            const quantity = Number(item?.quantity) || 0;

            const price =
              Number(
                item?.sellingPrice || item?.itemSellingPrice
              ) || 0;

            const individualDiscount =
              Number(
                item?.itemDiscountAmount ??
                  item?.discountAmount ??
                  item?.itemDiscount ??
                  item?.discount ??
                  0
              ) || 0;

            const hasIndividualDiscount =
              individualDiscount > 0;

            const calculatedLineAmount = Math.max(
              quantity * price - individualDiscount,
              0
            );

            return (
              <View
                key={item?._id || index}
                style={styles.tableDataRow}
                wrap={false}
              >
                <View style={styles.colDesc}>
                  <Text style={styles.itemName}>
                    {item?.itemName || item?.name}
                    {hasIndividualDiscount ? " *" : ""}
                  </Text>

                  {(item?.description ||
                    item?.itemDescription) && (
                    <Text style={styles.itemDesc}>
                      {item?.description ||
                        item?.itemDescription}
                    </Text>
                  )}

                  {hasIndividualDiscount && (
                    <Text style={styles.itemDiscountText}>
                      ({money(individualDiscount)} off)
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.colQty,
                    styles.numericValueText,
                  ]}
                >
                  {quantity}{" "}
                  {item?.unit || item?.itemUnit || ""}
                </Text>

                <Text
                  style={[
                    styles.colPrice,
                    styles.numericValueText,
                  ]}
                >
                  {money(price)}
                </Text>

                <Text
                  style={[
                    styles.colTotal,
                    styles.numericValueText,
                    { fontWeight: "bold" },
                  ]}
                >
                  {money(calculatedLineAmount)}
                </Text>
              </View>
            );
          })}
        </View>

        <View
          style={styles.bottomExecutionSegment}
          wrap={false}
        >
          <View style={styles.annotationsWrapper}>
            {notes && (
              <View style={styles.annotationUnit}>
                <Text style={styles.sectionTitle}>
                  Transactional Notes
                </Text>

                <Text style={styles.annotationContent}>
                  {notes}
                </Text>
              </View>
            )}

            {terms && (
              <View style={styles.annotationUnit}>
                <Text style={styles.sectionTitle}>
                  Formal Terms & Conditions
                </Text>

                <Text style={styles.annotationContent}>
                  {terms}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.financialSummaryCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>
                Gross Value
              </Text>

              <Text style={styles.financialRowValue}>
                {money(subtotal)}
              </Text>
            </View>

            {totalDiscount > 0 && (
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>
                  Rebate / Discount
                </Text>

                <Text style={styles.discountValue}>
                  -{money(totalDiscount)}
                </Text>
              </View>
            )}

            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>
                Statutory Tax Levies ({taxRate}%)
              </Text>

              <Text style={styles.financialRowValue}>
                {money(taxedAmount)}
              </Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>
                Aggregate Total
              </Text>

              <Text style={styles.grandTotalAmount}>
                {money(safeGrandTotal)}
              </Text>
            </View>

            <View style={styles.paymentSummary}>
              <Text style={styles.paymentSummaryTitle}>
                Payment Summary
              </Text>

              <View style={styles.paymentSummaryRow}>
                <Text style={styles.paymentSummaryLabel}>
                  Paid Today
                </Text>

                <Text style={styles.paymentSummaryValue}>
                  {money(safePaidAmount)}
                </Text>
              </View>

              <View style={styles.paymentSummaryRow}>
                <Text style={styles.paymentSummaryLabel}>
                  Balance Due
                </Text>

                <Text style={styles.paymentDueValue}>
                  {money(safeBalanceAmount)}
                </Text>
              </View>

              <View style={styles.paymentSummaryRow}>
                <Text style={styles.paymentSummaryLabel}>
                  Status
                </Text>

                <Text style={styles.paymentSummaryValue}>
                  {normalizedPaymentStatus}
                </Text>
              </View>

              {paymentHistory.length > 0 && (
                <View style={styles.paymentHistory}>
                  <Text style={styles.paymentSummaryTitle}>
                    Payment History
                  </Text>

                  {paymentHistory.map((payment, index) => {
                    const paymentDate =
                      payment?.paymentDate
                        ? new Date(payment.paymentDate)
                        : null;

                    const formattedDate =
                      paymentDate &&
                      !Number.isNaN(paymentDate.getTime())
                        ? paymentDate.toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Date unavailable";

                    return (
                      <View
                        key={payment?._id || index}
                        style={styles.paymentHistoryRow}
                      >
                        <Text
                          style={styles.paymentHistoryMeta}
                        >
                          #{index + 1} · {formattedDate} ·{" "}
                          {payment?.paymentMethod || "Cash"}
                        </Text>

                        <Text
                          style={styles.paymentHistoryAmount}
                        >
                          {money(payment?.amount)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>

        {companySignature && (
          <View
            style={styles.signatureBlockContainer}
            wrap={false}
          >
            <View style={styles.signatureWrapper}>
              <Image
                src={companySignature}
                style={styles.signatureImage}
              />

              <View style={styles.signatureLine} />

              <Text style={styles.signatureTitleLabel}>
                For{" "}
                {companyInfo?.companyName ||
                  "YOUR COMPANY NAME"}
              </Text>

              <Text style={styles.signatureSubLabel}>
                Authorized Signatory Endorsement
              </Text>
            </View>
          </View>
        )}

        <View fixed style={styles.globalPageFooter}>
          <Text style={styles.footerDisclaimerText}>
            Thank you for selecting us as your vendor. All
            invoices are tied strictly to contractual service
            parameters.
          </Text>

          <Text style={styles.footerPlatformToken}>
            SaleSync // SECURE
          </Text>
        </View>
      </Page>
    </Document>
  );
}
