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
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 72,
    fontSize: 9.5,
    color: "#334155",
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
    color: "#1e1b4b",
    opacity: 0.05,
    fontWeight: "bold",
    textAlign: "center",
  },

  watermarkSub: {
    marginTop: 10,
    fontSize: 18,
    color: "#1e1b4b",
    opacity: 0.05,
    fontWeight: "bold",
    textAlign: "center",
  },

  brandHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 35,
  },

  companyBrandGroup: {
    flexDirection: "column",
    maxWidth: "55%",
  },

  logoContainer: {
    marginBottom: 12,
  },

  logoImage: {
    width: 40,
    height: "auto",
    maxHeight: 40,
    objectFit: "contain",
  },

  companyNameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e1b4b",
    letterSpacing: -0.5,
  },

  companyMetaText: {
    fontSize: 8.5,
    color: "#64748b",
    marginTop: 3,
    lineHeight: 1.4,
  },

  invoiceMetaGroup: {
    alignItems: "flex-end",
  },

  invoiceLabel: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: -1,
  },

  invoiceSequenceId: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0d9488",
    marginTop: 2,
    marginBottom: 8,
  },

  dateGrid: {
    alignItems: "flex-end",
    marginBottom: 6,
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 3,
  },

  dateLabel: {
    fontSize: 8.5,
    color: "#94a3b8",
    width: 60,
    textAlign: "right",
    marginRight: 6,
  },

  dateValue: {
    fontSize: 8.5,
    color: "#1e1b4b",
    fontWeight: "bold",
    width: 65,
    textAlign: "right",
  },

  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    fontSize: 7.5,
    fontWeight: "bold",
    textTransform: "uppercase",
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

  billingGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 16,
    marginBottom: 35,
  },

  billingColumn: {
    flex: 1,
  },

  billingSectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  profilePrimaryText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e1b4b",
  },

  profileSecondaryText: {
    fontSize: 8.5,
    color: "#475569",
    marginTop: 3,
    lineHeight: 1.3,
  },

  tableContainer: {
    marginTop: 5,
  },

  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#1e1b4b",
    paddingBottom: 6,
    paddingHorizontal: 4,
  },

  tableHeaderLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1e1b4b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  tableDataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
  },

  colDesc: {
    flex: 3,
    paddingRight: 12,
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
    color: "#0f172a",
  },

  itemDiscountText: {
    fontSize: 7.5,
    color: "#0d9488",
    fontWeight: "bold",
    marginTop: 2,
  },

  itemDesc: {
    fontSize: 8.5,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 1.2,
  },

  numericValueText: {
    fontSize: 9.5,
    color: "#334155",
  },

  bottomExecutionSegment: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 30,
  },

  annotationsWrapper: {
    flex: 1.3,
    flexDirection: "column",
    gap: 16,
    paddingRight: 40,
  },

  annotationUnit: {
    flexDirection: "column",
  },

  annotationContent: {
    fontSize: 8.5,
    color: "#64748b",
    lineHeight: 1.4,
    marginTop: 4,
  },

  financialSummaryCard: {
    flex: 0.9,
  },

  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  financialRowLabel: {
    fontSize: 9,
    color: "#64748b",
  },

  financialRowValue: {
    fontSize: 9,
    color: "#334155",
  },

  discountHighlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  discountLabel: {
    fontSize: 9,
    color: "#0d9488",
    fontWeight: "bold",
  },

  discountValue: {
    fontSize: 9,
    color: "#0d9488",
    fontWeight: "bold",
  },

  grandTotalDivider: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    marginTop: 8,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  grandTotalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e1b4b",
  },

  grandTotalAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e1b4b",
  },

  paymentSummary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  paymentSummaryTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  paymentSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },

  paymentSummaryLabel: {
    fontSize: 8.5,
    color: "#64748b",
  },

  paymentSummaryValue: {
    fontSize: 8.5,
    color: "#334155",
    fontWeight: "bold",
  },

  paymentDueValue: {
    fontSize: 13,
    color: "#9f1239",
    fontWeight: "bold",
  },

  paymentHistory: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  paymentHistoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },

  paymentHistoryMeta: {
    fontSize: 7.5,
    color: "#64748b",
  },

  paymentHistoryAmount: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#166534",
  },

  balanceDueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopStyle: "dashed",
    borderTopColor: "#cbd5e1",
  },

  balanceDueLabel: {
    fontSize: 9,
    color: "#64748b",
    fontWeight: "bold",
  },

  balanceDueAmount: {
    fontSize: 10,
    color: "#9f1239",
    fontWeight: "bold",
  },

  signatureBlockContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 40,
  },

  signatureWrapper: {
    width: 160,
    alignItems: "flex-start",
  },

  signatureSpacePlaceholder: {
    height: 35,
  },

  signatureImage: {
    height: 35,
    width: 100,
    objectFit: "contain",
    marginBottom: 4,
  },

  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    width: "100%",
    marginBottom: 4,
  },

  signatureTitleLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#1e1b4b",
  },

  signatureSubLabel: {
    fontSize: 7.5,
    color: "#94a3b8",
    textTransform: "uppercase",
  },

  globalPageFooter: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerDisclaimerText: {
    fontSize: 8,
    color: "#94a3b8",
    maxWidth: "70%",
  },

  footerPlatformToken: {
    fontSize: 7.5,
    color: "#cbd5e1",
    textAlign: "right",
  },
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
    ? payments.filter(
        (payment) => Number(payment?.amount) > 0
      )
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
            <Text style={styles.watermarkSub}>
              UNOFFICIAL COPY
            </Text>
          </View>
        )}

        <View style={styles.brandHeaderContainer}>
          <View style={styles.companyBrandGroup}>
            {companyLogo && (
              <View style={styles.logoContainer}>
                <Image
                  src={companyLogo}
                  style={styles.logoImage}
                />
              </View>
            )}

            <Text style={styles.companyNameText}>
              {companyInfo?.companyName ||
                "YOUR COMPANY NAME"}
            </Text>

            {companyInfo?.gstin && (
              <Text style={styles.companyMetaText}>
                GSTIN: {companyInfo.gstin}
              </Text>
            )}

            <Text style={styles.companyMetaText}>
              {[
                companyInfo?.address,
                companyInfo?.phone,
                companyInfo?.email,
              ]
                .filter(Boolean)
                .join(" • ") ||
                "No contact info provided"}
            </Text>
          </View>

          <View style={styles.invoiceMetaGroup}>
            <Text style={styles.invoiceLabel}>
              Invoice
            </Text>

            <Text style={styles.invoiceSequenceId}>
              #{invoiceNumberSequence}
            </Text>

            <View style={styles.dateGrid}>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>
                  Issue Date:
                </Text>

                <Text style={styles.dateValue}>
                  {formatDate(issueDate)}
                </Text>
              </View>

              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>
                  Due Date:
                </Text>

                <Text style={styles.dateValue}>
                  {formatDate(dueDate)}
                </Text>
              </View>
            </View>

            <Text
              style={[styles.statusBadge, statusStyle]}
            >
              {normalizedPaymentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.billingGrid}>
          <View style={styles.billingColumn}>
            <Text style={styles.billingSectionLabel}>
              Client
            </Text>

            <Text style={styles.profilePrimaryText}>
              {selectedCustomer?.displayName ||
                "No Client Assigned"}
            </Text>

            {selectedCustomer?.companyName && (
              <Text style={styles.profileSecondaryText}>
                {selectedCustomer.companyName}
              </Text>
            )}

            {selectedCustomer?.workingPhone && (
              <Text style={styles.profileSecondaryText}>
                {selectedCustomer.workingPhone}
              </Text>
            )}

            {selectedCustomer?.email && (
              <Text style={styles.profileSecondaryText}>
                {selectedCustomer.email}
              </Text>
            )}
          </View>

          <View style={styles.billingColumn}>
            <Text style={styles.billingSectionLabel}>
              Deliver To
            </Text>

            <Text
              style={[
                styles.profileSecondaryText,
                {
                  color: "#334155",
                  lineHeight: 1.4,
                },
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
                "No physical address provided"}
            </Text>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View
            style={styles.tableHeaderRow}
            minPresenceAhead={20}
          >
            <Text
              style={[
                styles.tableHeaderLabel,
                styles.colDesc,
              ]}
            >
              Description
            </Text>

            <Text
              style={[
                styles.tableHeaderLabel,
                styles.colQty,
              ]}
            >
              Qty
            </Text>

            <Text
              style={[
                styles.tableHeaderLabel,
                styles.colPrice,
              ]}
            >
              Rate
            </Text>

            <Text
              style={[
                styles.tableHeaderLabel,
                styles.colTotal,
              ]}
            >
              Total
            </Text>
          </View>

          {itemData?.map((item, index) => {
            if (
              !item ||
              (!item.name && !item.itemName)
            ) {
              return null;
            }

            const quantity =
              Number(item?.quantity) || 0;

            const rate =
              Number(
                item?.sellingPrice ||
                  item?.itemSellingPrice
              ) || 0;

            // Individual product discount.
            // Supports all discount field names used by the invoice data.
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

            // Final amount for this product after its own discount.
            const calculatedLineAmount = Math.max(
              quantity * rate - individualDiscount,
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
                    {hasIndividualDiscount
                      ? " *"
                      : ""}
                  </Text>

                  {hasIndividualDiscount && (
                    <Text
                      style={styles.itemDiscountText}
                    >
                      ({money(individualDiscount)} off)
                    </Text>
                  )}

                  {(item?.description ||
                    item?.itemDescription) && (
                    <Text style={styles.itemDesc}>
                      {item?.description ||
                        item?.itemDescription}
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.colQty,
                    styles.numericValueText,
                  ]}
                >
                  {item?.quantity}{" "}
                  {item?.unit ||
                    item?.itemUnit ||
                    ""}
                </Text>

                <Text
                  style={[
                    styles.colPrice,
                    styles.numericValueText,
                  ]}
                >
                  {money(rate)}
                </Text>

                <Text
                  style={[
                    styles.colTotal,
                    styles.numericValueText,
                    {
                      fontWeight: "bold",
                      color: "#1e1b4b",
                    },
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
                <Text
                  style={styles.billingSectionLabel}
                >
                  Notes
                </Text>

                <Text
                  style={styles.annotationContent}
                >
                  {notes}
                </Text>
              </View>
            )}

            {terms && (
              <View style={styles.annotationUnit}>
                <Text
                  style={styles.billingSectionLabel}
                >
                  Terms
                </Text>

                <Text
                  style={styles.annotationContent}
                >
                  {terms}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.financialSummaryCard}>
            <View style={styles.financialRow}>
              <Text
                style={styles.financialRowLabel}
              >
                Subtotal
              </Text>

              <Text
                style={styles.financialRowValue}
              >
                {money(subtotal)}
              </Text>
            </View>

            {Number(totalDiscount) > 0 && (
              <View
                style={styles.discountHighlightRow}
              >
                <Text style={styles.discountLabel}>
                  Discount
                </Text>

                <Text style={styles.discountValue}>
                  -{money(totalDiscount)}
                </Text>
              </View>
            )}

            <View style={styles.financialRow}>
              <Text
                style={styles.financialRowLabel}
              >
                Tax ({taxRate}%)
              </Text>

              <Text
                style={styles.financialRowValue}
              >
                {money(taxedAmount)}
              </Text>
            </View>

            <View
              style={styles.grandTotalDivider}
            >
              <Text style={styles.grandTotalLabel}>
                Total Due
              </Text>

              <Text
                style={styles.grandTotalAmount}
              >
                {money(safeGrandTotal)}
              </Text>
            </View>

            <View style={styles.paymentSummary}>
              <Text
                style={styles.paymentSummaryTitle}
              >
                Payment Summary
              </Text>

              <View
                style={styles.paymentSummaryRow}
              >
                <Text
                  style={styles.paymentSummaryLabel}
                >
                  Paid Today
                </Text>

                <Text
                  style={styles.paymentSummaryValue}
                >
                  {money(safePaidAmount)}
                </Text>
              </View>

              <View
                style={styles.paymentSummaryRow}
              >
                <Text
                  style={styles.paymentSummaryLabel}
                >
                  Balance Due
                </Text>

                <Text
                  style={styles.paymentDueValue}
                >
                  {money(safeBalanceAmount)}
                </Text>
              </View>

              <View
                style={styles.paymentSummaryRow}
              >
                <Text
                  style={styles.paymentSummaryLabel}
                >
                  Status
                </Text>

                <Text
                  style={styles.paymentSummaryValue}
                >
                  {normalizedPaymentStatus}
                </Text>
              </View>

              {paymentHistory.length > 0 && (
                <View style={styles.paymentHistory}>
                  <View
                    style={styles.paymentSummaryRow}
                  >
                    <Text
                      style={
                        styles.paymentSummaryLabel
                      }
                    >
                      Total Paid
                    </Text>

                    <Text
                      style={
                        styles.paymentSummaryValue
                      }
                    >
                      {money(safePaidAmount)}
                    </Text>
                  </View>

                  <Text
                    style={styles.paymentSummaryTitle}
                  >
                    Payment History
                  </Text>

                  {paymentHistory.map(
                    (payment, index) => {
                      const paymentDate =
                        payment?.paymentDate
                          ? new Date(
                              payment.paymentDate
                            )
                          : null;

                      const formattedDate =
                        paymentDate &&
                        !Number.isNaN(
                          paymentDate.getTime()
                        )
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
                          key={
                            payment?._id || index
                          }
                          style={
                            styles.paymentHistoryRow
                          }
                        >
                          <Text
                            style={
                              styles.paymentHistoryMeta
                            }
                          >
                            #{index + 1} ·{" "}
                            {formattedDate} ·{" "}
                            {payment?.paymentMethod ||
                              "Cash"}
                          </Text>

                          <Text
                            style={
                              styles.paymentHistoryAmount
                            }
                          >
                            {money(
                              payment?.amount
                            )}
                          </Text>
                        </View>
                      );
                    }
                  )}
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

              <Text
                style={styles.signatureTitleLabel}
              >
                {companyInfo?.companyName ||
                  "YOUR COMPANY NAME"}
              </Text>

              <Text
                style={styles.signatureSubLabel}
              >
                Manager Approvals
              </Text>
            </View>
          </View>
        )}

        <View
          fixed
          style={styles.globalPageFooter}
        >
          <Text
            style={styles.footerDisclaimerText}
          >
            Thank you for selecting us as your vendor.
            All invoices are tied strictly to
            contractual service parameters.
          </Text>

          <Text
            style={styles.footerPlatformToken}
          >
            SaleSync // SECURE
          </Text>
        </View>
      </Page>
    </Document>
  );
}