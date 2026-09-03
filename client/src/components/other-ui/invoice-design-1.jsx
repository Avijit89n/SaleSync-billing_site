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
    paddingTop: 45,
    paddingHorizontal: 45,
    paddingBottom: 72,
    fontSize: 10,
    color: "#334155",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  /* HEADER */
  brandHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 16,
    marginBottom: 20,
  },

  companyBrandGroup: {
    flexDirection: "column",
    maxWidth: "60%",
  },

  logoContainer: {
    marginBottom: 8,
  },

  logoImage: {
    width: 30,
    height: "auto",
    maxHeight: 45,
    objectFit: "contain",
  },

  companyNameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },

  companyMetaText: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 1.3,
  },

  invoiceMetaGroup: {
    alignItems: "flex-end",
  },

  invoiceLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f97316",
    letterSpacing: 0.5,
  },

  invoiceSequenceId: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 2,
    marginBottom: 4,
  },

  dateGrid: {
    marginTop: 4,
    alignItems: "flex-end",
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
  },

  dateLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#475569",
    width: 60,
    textAlign: "right",
    marginRight: 4,
  },

  dateValue: {
    fontSize: 8.5,
    color: "#334155",
    width: 65,
    textAlign: "right",
  },

  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
  },

  paid: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  unpaid: {
    backgroundColor: "#ffe4e6",
    color: "#991b1b",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },

  partiallyPaid: {
    backgroundColor: "#ffedd5",
    color: "#9a3412",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },

  /* PAYMENT SUMMARY */
  paymentSummary: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  paymentSummaryTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },

  paymentSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.5,
  },

  paymentSummaryLabel: {
    fontSize: 9,
    color: "#64748b",
  },

  paymentSummaryValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#334155",
  },

  /*
   * LARGE BALANCE DUE
   */
  paymentDueValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#c2410c",
  },

  paymentHistory: {
    marginTop: 7,
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

  /* BILLING */
  billingGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    gap: 20,
  },

  billingCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#f97316",
    padding: 12,
    borderRadius: 4,
  },

  billingSectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  profilePrimaryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
  },

  profileSecondaryText: {
    fontSize: 9,
    color: "#475569",
    marginTop: 2,
    lineHeight: 1.3,
  },

  /* WATERMARK */
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
    color: "#ef4444",
    opacity: 0.12,
    fontWeight: "bold",
    textAlign: "center",
  },

  watermarkSub: {
    marginTop: 10,
    fontSize: 18,
    color: "#ef4444",
    opacity: 0.12,
    fontWeight: "bold",
    textAlign: "center",
  },

  /* TABLE */
  tableContainer: {
    marginTop: 8,
  },

  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },

  tableHeaderLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  tableDataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  tableDataRowAlternate: {
    backgroundColor: "#f8fafc",
  },

  colDesc: {
    flex: 2.5,
    paddingRight: 8,
  },

  colQty: {
    flex: 0.5,
    textAlign: "center",
  },

  colPrice: {
    flex: 1,
    textAlign: "right",
  },

  colTotal: {
    flex: 1,
    textAlign: "right",
  },

  itemName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },

  /*
   * Individual discount displayed below
   * the product calculation.
   */
  itemDiscountText: {
    fontSize: 8,
    color: "#166534",
    marginTop: 3,
    fontWeight: "bold",
  },

  itemDesc: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 1,
  },

  numericValueText: {
    fontSize: 10,
    color: "#334155",
  },

  /* BOTTOM */
  bottomExecutionSegment: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 24,
    gap: 30,
  },

  annotationsWrapper: {
    flex: 1.2,
    flexDirection: "column",
    gap: 12,
  },

  annotationBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 10,
  },

  annotationContent: {
    fontSize: 8.5,
    color: "#64748b",
    lineHeight: 1.3,
    marginTop: 4,
  },

  financialSummaryCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 12,
  },

  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3.5,
  },

  financialRowLabel: {
    fontSize: 9,
    color: "#64748b",
  },

  financialRowValue: {
    fontSize: 9,
    fontWeight: "medium",
    color: "#334155",
  },

  discountHighlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginVertical: 2,
  },

  discountLabel: {
    fontSize: 9,
    color: "#166534",
    fontWeight: "medium",
  },

  discountValue: {
    fontSize: 9,
    color: "#166534",
    fontWeight: "bold",
  },

  grandTotalDivider: {
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    marginTop: 6,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  grandTotalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },

  grandTotalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f97316",
  },

  /* SIGNATURE */
  signatureBlockContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 35,
    paddingRight: 10,
  },

  signatureWrapper: {
    width: 180,
    alignItems: "center",
  },

  signatureSpacePlaceholder: {
    height: 45,
  },

  signatureImage: {
    height: 45,
    width: 95,
    objectFit: "contain",
  },

  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#94a3b8",
    width: "100%",
    marginBottom: 4,
  },

  signatureTitleLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
  },

  signatureSubLabel: {
    fontSize: 8,
    color: "#94a3b8",
    textTransform: "uppercase",
  },

  /* FOOTER */
  globalPageFooter: {
    position: "absolute",
    left: 45,
    right: 45,
    bottom: 25,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  footerDisclaimerText: {
    fontSize: 8.5,
    color: "#64748b",
    textAlign: "center",
  },

  footerPlatformToken: {
    fontSize: 7.5,
    color: "#94a3b8",
    marginTop: 2,
    textAlign: "center",
    letterSpacing: 0.2,
  },
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
  const safeGrandTotal =
    Number(grandTotal) || 0;

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
    safeGrandTotal <= 0 ||
    safePaidAmount <= 0
      ? "Unpaid"
      : safeBalanceAmount <= 0
      ? "Paid"
      : "Partially Paid";

  const statusStyle =
    normalizedPaymentStatus === "Paid"
      ? styles.paid
      : normalizedPaymentStatus ===
        "Partially Paid"
      ? styles.partiallyPaid
      : styles.unpaid;

  const paymentHistory = Array.isArray(
    payments
  )
    ? payments.filter(
        (payment) =>
          Number(payment?.amount) > 0
      )
    : [];

  /*
   * Currency formatter.
   * Rs. is used instead of ₹ for Helvetica
   * compatibility.
   */
  const money = (value) =>
    `Rs. ${(Number(value) || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  return (
    <Document
      title={
        isPreview
          ? `Preview-${invoiceNumberSequence}`
          : `Invoice-${invoiceNumberSequence}`
      }
    >
      <Page size="A4" style={styles.page}>
        {/* PREVIEW */}
        {isPreview && (
          <View
            fixed
            style={styles.watermarkContainer}
          >
            <Text style={styles.watermark}>
              PREVIEW COPY
            </Text>

            <Text style={styles.watermarkSub}>
              NOT VALID FOR ACCOUNTING PURPOSES
            </Text>
          </View>
        )}

        {/* HEADER */}
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

            <Text style={styles.companyMetaText}>
              GSTIN:{" "}
              {companyInfo?.gstin || "N/A"}
            </Text>

            <Text style={styles.companyMetaText}>
              {companyInfo?.address || "N/A"}
            </Text>

            <Text style={styles.companyMetaText}>
              Contact No:{" "}
              {companyInfo?.phone || "N/A"}
            </Text>

            <Text style={styles.companyMetaText}>
              Email:{" "}
              {companyInfo?.email || "N/A"}
            </Text>
          </View>

          <View style={styles.invoiceMetaGroup}>
            <Text style={styles.invoiceLabel}>
              INVOICE
            </Text>

            <Text
              style={styles.invoiceSequenceId}
            >
              #{invoiceNumberSequence}
            </Text>

            <View style={styles.dateGrid}>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>
                  Issue Date:
                </Text>

                <Text style={styles.dateValue}>
                  {issueDate instanceof Date
                    ? issueDate.toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : issueDate}
                </Text>
              </View>

              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>
                  Due Date:
                </Text>

                <Text style={styles.dateValue}>
                  {dueDate instanceof Date
                    ? dueDate.toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : dueDate}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.statusBadge,
                statusStyle,
              ]}
            >
              {normalizedPaymentStatus}
            </Text>
          </View>
        </View>

        {/* BILLING */}
        <View style={styles.billingGrid}>
          <View style={styles.billingCard}>
            <Text
              style={styles.billingSectionLabel}
            >
              Client Record Reference
            </Text>

            <Text
              style={styles.profilePrimaryText}
            >
              {selectedCustomer?.displayName ||
                "No Client Record Assigned"}
            </Text>

            {selectedCustomer?.companyName && (
              <Text
                style={styles.profileSecondaryText}
              >
                {selectedCustomer.companyName}
              </Text>
            )}

            {selectedCustomer?.workingPhone && (
              <Text
                style={styles.profileSecondaryText}
              >
                ☎ {selectedCustomer.workingPhone}
              </Text>
            )}

            {selectedCustomer?.email && (
              <Text
                style={styles.profileSecondaryText}
              >
                {selectedCustomer.email}
              </Text>
            )}
          </View>

          <View style={styles.billingCard}>
            <Text
              style={styles.billingSectionLabel}
            >
              Logistics & Billing Address
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
                selectedCustomer?.billingAddress
                  ?.attention,

                selectedCustomer?.billingAddress
                  ?.street1,

                selectedCustomer?.billingAddress
                  ?.street2,

                [
                  selectedCustomer?.billingAddress
                    ?.city,

                  selectedCustomer?.billingAddress
                    ?.state,

                  selectedCustomer?.billingAddress
                    ?.pincode,
                ]
                  .filter(Boolean)
                  .join(", "),

                selectedCustomer?.billingAddress
                  ?.country,
              ]
                .filter(Boolean)
                .join("\n") ||
                "No billing address available"}
            </Text>
          </View>
        </View>

        {/* TABLE */}
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
              Item Specification
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
              Rate (Rs.)
            </Text>

            <Text
              style={[
                styles.tableHeaderLabel,
                styles.colTotal,
              ]}
            >
              Amount (Rs.)
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
                item?.itemSellingPrice ??
                  item?.sellingPrice
              ) || 0;

            /*
             * Individual item discount.
             */
            const individualDiscount =
              Number(
                item?.itemDiscountAmount ??
                  item?.discountAmount ??
                  item?.itemDiscount ??
                  item?.discount ??
                  0
              ) || 0;

            /*
             * Final item amount after
             * individual discount.
             */
            const calculatedLineAmount =
              Math.max(
                quantity * rate -
                  individualDiscount,
                0
              );

            /*
             * Add * after name if the item
             * has an individual discount.
             */
            const hasIndividualDiscount =
              individualDiscount > 0;

            const isAlternateRow =
              index % 2 === 1;

            return (
              <View
                key={item?._id || index}
                style={[
                  styles.tableDataRow,
                  isAlternateRow &&
                    styles.tableDataRowAlternate,
                ]}
                wrap={false}
              >
                {/* ITEM */}
                <View style={styles.colDesc}>
                  <Text style={styles.itemName}>
                    {item?.itemName ||
                      item?.name}
                    {hasIndividualDiscount
                      ? " *"
                      : ""}
                  </Text>

                  {hasIndividualDiscount && (
                    <Text
                      style={
                        styles.itemDiscountText
                      }
                    >
                      ({money(
                        individualDiscount
                      )} off)
                    </Text>
                  )}

                  {(item?.itemDescription ||
                    item?.description) && (
                    <Text style={styles.itemDesc}>
                      {item?.itemDescription ||
                        item?.description}
                    </Text>
                  )}
                </View>

                {/* QUANTITY */}
                <Text
                  style={[
                    styles.colQty,
                    styles.numericValueText,
                  ]}
                >
                  {quantity}{" "}
                  {item?.itemUnit ||
                    item?.unit ||
                    ""}
                </Text>

                {/* RATE */}
                <Text
                  style={[
                    styles.colPrice,
                    styles.numericValueText,
                  ]}
                >
                  {money(rate)}
                </Text>

                {/* FINAL AMOUNT */}
                <Text
                  style={[
                    styles.colTotal,
                    styles.numericValueText,
                    {
                      fontWeight: "bold",
                      color: "#0f172a",
                    },
                  ]}
                >
                  {money(calculatedLineAmount)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* SUMMARY */}
        <View
          style={styles.bottomExecutionSegment}
          wrap={false}
        >
          <View style={styles.annotationsWrapper}>
            {notes && (
              <View style={styles.annotationBox}>
                <Text
                  style={
                    styles.billingSectionLabel
                  }
                >
                  Notes & Instructions
                </Text>

                <Text
                  style={styles.annotationContent}
                >
                  {notes}
                </Text>
              </View>
            )}

            {terms && (
              <View style={styles.annotationBox}>
                <Text
                  style={
                    styles.billingSectionLabel
                  }
                >
                  Terms & Conditions
                </Text>

                <Text
                  style={styles.annotationContent}
                >
                  {terms}
                </Text>
              </View>
            )}
          </View>

          <View
            style={styles.financialSummaryCard}
          >
            {/* SUBTOTAL */}
            <View style={styles.financialRow}>
              <Text
                style={styles.financialRowLabel}
              >
                Subtotal (Rs.)
              </Text>

              <Text
                style={styles.financialRowValue}
              >
                {money(subtotal)}
              </Text>
            </View>

            {/* DISCOUNT */}
            {Number(totalDiscount) > 0 && (
              <View
                style={styles.discountHighlightRow}
              >
                <Text
                  style={styles.discountLabel}
                >
                  Discount Applied (Rs.)
                </Text>

                <Text
                  style={styles.discountValue}
                >
                  - {money(totalDiscount)}
                </Text>
              </View>
            )}

            {/* TAX */}
            <View style={styles.financialRow}>
              <Text
                style={styles.financialRowLabel}
              >
                Estimated Tax ({taxRate || 0}%)
              </Text>

              <Text
                style={styles.financialRowValue}
              >
                {money(taxedAmount)}
              </Text>
            </View>

            {/* GRAND TOTAL */}
            <View
              style={styles.grandTotalDivider}
            >
              <Text
                style={styles.grandTotalLabel}
              >
                Grand Total
              </Text>

              <Text
                style={styles.grandTotalAmount}
              >
                {money(safeGrandTotal)}
              </Text>
            </View>

            {/* PAYMENT SUMMARY */}
            <View
              style={styles.paymentSummary}
            >
              <Text
                style={styles.paymentSummaryTitle}
              >
                Payment Summary
              </Text>

              {/* PAID */}
              <View
                style={styles.paymentSummaryRow}
              >
                <Text
                  style={
                    styles.paymentSummaryLabel
                  }
                >
                  Paid Today
                </Text>

                <Text
                  style={
                    styles.paymentSummaryValue
                  }
                >
                  {money(safePaidAmount)}
                </Text>
              </View>

              {/* LARGE BALANCE DUE */}
              <View
                style={styles.paymentSummaryRow}
              >
                <Text
                  style={
                    styles.paymentSummaryLabel
                  }
                >
                  Balance Due
                </Text>

                <Text
                  style={styles.paymentDueValue}
                >
                  {money(safeBalanceAmount)}
                </Text>
              </View>

              {/* STATUS */}
              <View
                style={styles.paymentSummaryRow}
              >
                <Text
                  style={
                    styles.paymentSummaryLabel
                  }
                >
                  Status
                </Text>

                <Text
                  style={
                    styles.paymentSummaryValue
                  }
                >
                  {normalizedPaymentStatus}
                </Text>
              </View>

              {/* PAYMENT HISTORY */}
              {paymentHistory.length > 0 && (
                <View
                  style={styles.paymentHistory}
                >
                  <View
                    style={
                      styles.paymentSummaryRow
                    }
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
                    style={
                      styles.paymentSummaryTitle
                    }
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
                            payment?._id ||
                            index
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

        {/* SIGNATURE */}
        {companySignature && (
          <View
            style={styles.signatureBlockContainer}
            wrap={false}
          >
            <View
              style={styles.signatureWrapper}
            >
              <Image
                src={companySignature}
                style={styles.signatureImage}
              />

              <View
                style={styles.signatureLine}
              />

              <Text
                style={styles.signatureTitleLabel}
              >
                {companyInfo?.companyName ||
                  "YOUR COMPANY NAME"}
              </Text>

              <Text
                style={styles.signatureSubLabel}
              >
                Authorized Signatory
              </Text>
            </View>
          </View>
        )}

        {/* FOOTER */}
        <View
          fixed
          style={styles.globalPageFooter}
        >
          <Text
            style={styles.footerDisclaimerText}
          >
            Thank you for your business. If you
            have any inquiries regarding this
            document, please contact us.
          </Text>

          <Text
            style={styles.footerPlatformToken}
          >
            SaleSync — Sync sales. Simplify
            billing.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
