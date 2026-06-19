import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Professional Corporate Styling Palette
const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontSize: 10,
    color: "#334155", // slate-700
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Top Modern Brand Header Array
  brandHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1", // slate-300
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
    color: "#0f172a", // slate-900
    letterSpacing: -0.5,
  },
  companyMetaText: {
    fontSize: 9,
    color: "#64748b", // slate-500
    marginTop: 2,
    lineHeight: 1.3,
  },
  invoiceMetaGroup: {
    alignItems: "flex-end",
  },
  invoiceLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f97316", // Premium Amber Accent
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

  // Status Badge Metrics
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
    backgroundColor: "#dcfce7", // emerald-100
    color: "#166534", // emerald-800
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  unpaid: {
    backgroundColor: "#ffe4e6", // rose-100
    color: "#991b1b", // rose-800
    borderWidth: 1,
    borderColor: "#fecdd3",
  },

  // Dual Allocation Billing Profiles Block
  billingGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    gap: 20,
  },
  billingCard: {
    flex: 1,
    backgroundColor: "#f8fafc", // slate-50
    borderLeftWidth: 3,
    borderLeftColor: "#f97316", // Amber indicator bar
    padding: 12,
    borderRadius: 4,
  },
  billingSectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#94a3b8", // slate-400
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
    color: "#475569", // slate-600
    marginTop: 2,
    lineHeight: 1.3,
  },
  // Water mark
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

  // High-Readability Line Item Table Matrix
  tableContainer: {
    marginTop: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#0f172a", // Dark Slate Core Header
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
  colDesc: { flex: 2.5, paddingRight: 8 },
  colQty: { flex: 0.5, textAlign: "center" },
  colPrice: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },

  itemName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
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

  // Split Bottom Segment: Financial Summary & Authorizations
  bottomExecutionSegment: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 24,
    gap: 30,
  },

  // Terms and Notes Left Panel
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

  // Financial Breakdown Calculations Right Panel
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
    backgroundColor: "#f0fdf4", // emerald-50
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

  // Authorizations & Signature Line Block
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

  // Universal Layout Footer Node
  globalPageFooter: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
    alignItems: "center",
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
  }
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
  isPreview = true,
}) {
  return (
    <Document title={`${isPreview ? `Preview-${invoiceNumberSequence}` : `Invoice-${invoiceNumberSequence}`}`}>
      <Page size="A4" style={styles.page}>
        {isPreview && (
          <View fixed style={styles.watermarkContainer}>
            <Text style={styles.watermark}>
              PREVIEW COPY
            </Text>

            <Text style={styles.watermarkSub}>
              NOT VALID FOR ACCOUNTING PURPOSES
            </Text>
          </View>
        )}

        {/* Top Modern Brand Header Array */}
        <View style={styles.brandHeaderContainer}>
          <View style={styles.companyBrandGroup}>
            {companyLogo ? (
              <View style={styles.logoContainer}>
                {companyLogo &&
                  <Image
                    src={companyLogo}
                    style={styles.logoImage}
                  />
                }
              </View>
            ) : null}
            <Text style={styles.companyNameText}>{companyInfo?.companyName || "YOUR COMPANY NAME"}</Text>

            <Text style={styles.companyMetaText}>GSTIN: {companyInfo?.gstin || "N/A"}</Text>
            <Text style={styles.companyMetaText}>{companyInfo?.address || "N/A"}</Text>
            <Text style={styles.companyMetaText}>Contact No:{companyInfo?.phone || "N/A"}</Text>
            <Text style={styles.companyMetaText}>Email: {companyInfo?.email || "N/A"}</Text>
          </View>

          <View style={styles.invoiceMetaGroup}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceSequenceId}>#{invoiceNumberSequence}</Text>

            {/* Comprehensive Document Timestamps */}
            <View style={styles.dateGrid}>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Issue Date:</Text>
                <Text style={styles.dateValue}>
                  {issueDate instanceof Date
                    ? issueDate?.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    : issueDate}
                </Text>
              </View>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Due Date:</Text>
                <Text style={styles.dateValue}>
                  {dueDate instanceof Date
                    ? dueDate?.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    : dueDate}
                </Text>
              </View>
            </View>

            <Text style={[styles.statusBadge, isPaid ? styles.paid : styles.unpaid]}>
              {isPaid ? "Paid" : "Unpaid"}
            </Text>
          </View>
        </View>

        {/* Dual Allocation Billing Profiles Block */}
        <View style={styles.billingGrid}>
          <View style={styles.billingCard}>
            <Text style={styles.billingSectionLabel}>Client Record Reference</Text>
            <Text style={styles.profilePrimaryText}>
              {selectedCustomer?.displayName || "No Client Record Assigned"}
            </Text>
            {selectedCustomer?.companyName && (
              <Text style={styles.profileSecondaryText}>{selectedCustomer.companyName}</Text>
            )}
            {selectedCustomer?.workingPhone && (
              <Text style={styles.profileSecondaryText}>☎ {selectedCustomer.workingPhone}</Text>
            )}
            {selectedCustomer?.email && (
              <Text style={styles.profileSecondaryText}>{selectedCustomer.email}</Text>
            )}
          </View>

          <View style={styles.billingCard}>
            <Text style={styles.billingSectionLabel}>Logistics & Billing Address</Text>
            <Text
              style={[
                styles.profileSecondaryText,
                { color: "#334155", lineHeight: 1.4 },
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
                .join("\n") || "No billing address available"}
            </Text>
          </View>
        </View>

        {/* High-Readability Line Item Table Matrix */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} minPresenceAhead={20}>
            <Text style={[styles.tableHeaderLabel, styles.colDesc]}>Item Specification</Text>
            <Text style={[styles.tableHeaderLabel, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderLabel, styles.colPrice]}>Rate</Text>
            <Text style={[styles.tableHeaderLabel, styles.colTotal]}>Amount</Text>
          </View>

          {itemData?.map((item, index) => {
            if (!item || !item.name) return null;
            const calculatedLineAmount = (Number(item.quantity) || 0) * (Number(item.sellingPrice) || 0);
            const isAlternateRow = index % 2 === 1;

            return (
              <View
                key={index}
                style={[styles.tableDataRow, isAlternateRow && styles.tableDataRowAlternate]}
                wrap={false}
              >
                <View style={styles.colDesc}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
                </View>
                <Text style={[styles.colQty, styles.numericValueText]}>
                  {item.quantity} {item.unit || ""}
                </Text>
                <Text style={[styles.colPrice, styles.numericValueText]}>
                  ₹{(Number(item.sellingPrice) || 0)?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.colTotal, styles.numericValueText, { fontWeight: "bold", color: "#0f172a" }]}>
                  ₹{calculatedLineAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Split Bottom Segment: Financial Summary & Authorizations */}
        <View style={styles.bottomExecutionSegment} wrap={false}>

          {/* Left Block: Terms / Instructions */}
          <View style={styles.annotationsWrapper}>
            {notes ? (
              <View style={styles.annotationBox}>
                <Text style={styles.billingSectionLabel}>Notes & Instructions</Text>
                <Text style={styles.annotationContent}>{notes}</Text>
              </View>
            ) : null}

            {terms ? (
              <View style={styles.annotationBox}>
                <Text style={styles.billingSectionLabel}>Terms & Conditions</Text>
                <Text style={styles.annotationContent}>{terms}</Text>
              </View>
            ) : null}
          </View>

          {/* Right Block: Financial Aggregation */}
          <View style={styles.financialSummaryCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>Subtotal</Text>
              <Text style={styles.financialRowValue}>
                ₹{subtotal?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {totalDiscount > 0 && (
              <View style={styles.discountHighlightRow}>
                <Text style={styles.discountLabel}>Discount Applied</Text>
                <Text style={styles.discountValue}>
                  -₹{totalDiscount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>Estimated Tax ({taxRate}%)</Text>
              <Text style={styles.financialRowValue}>
                ₹{taxedAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.grandTotalDivider}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalAmount}>
                ₹{grandTotal?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Authorizations & Signature Line Block */}
        <View style={styles.signatureBlockContainer} wrap={false}>
          <View style={styles.signatureWrapper}>
            {/* Added dynamic check for signature image vs empty placeholder */}
            {companySignature ? (
              <Image src={companySignature} style={styles.signatureImage} />
            ) : (
              <View style={styles.signatureSpacePlaceholder} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitleLabel}>{companyInfo?.companyName || "YOUR COMPANY NAME"}</Text>
            <Text style={styles.signatureSubLabel}>Authorized Signatory</Text>
          </View>
        </View>

        {/* Universal Layout Footer Node */}
        <View style={styles.globalPageFooter}>
          <Text style={styles.footerDisclaimerText}>
            Thank you for your business. If you have any inquiries regarding this document, please contact us.
          </Text>
          <Text style={styles.footerPlatformToken}>
            SaleSync — Sync sales. Simplify billing.
          </Text>
        </View>

      </Page>
    </Document>
  );
}