import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9.5,
    color: "#334155", 
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Sleek, Minimalist Top Layout
  brandHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 35,
  },
  companyBrandGroup: {
    flexDirection: "column",
  },
  companyNameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e1b4b", // Deep Indigo
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
    color: "#0d9488", // Teal Accent
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
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

  // Open-Grid Minimalist Billing Section
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

  // Modern Borderless Table Design
  tableContainer: {
    marginTop: 5,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#1e1b4b", // Solid dark accent line
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
  colDesc: { flex: 3, paddingRight: 12 },
  colQty: { flex: 0.4, textAlign: "center" },
  colPrice: { flex: 0.9, textAlign: "right" },
  colTotal: { flex: 0.9, textAlign: "right" },
  
  itemName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
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

  // Elegant Unboxed Financial Block
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

  // Subtle Signature Line
  signatureBlockContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 40,
  },
  signatureWrapper: {
    width: 160,
    alignItems: "flex-start", // Left-aligned signature line for tech clean look
  },
  signatureSpacePlaceholder: {
    height: 35, 
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

  // Global Page Footer
  globalPageFooter: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 16,
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
  }
});

export default function InvoiceDesign2({
  invoiceNumberSequence,
  isPaid,
  selectedCustomer,
  itemData = [],
  subtotal = 0,
  totalDiscount = 0,
  taxRate = 0,
  taxedAmount = 0,
  grandTotal = 0,
  notes,
  terms
}) {
  return (
    <Document title={`Invoice-${invoiceNumberSequence}`}>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.brandHeaderContainer}>
          <View style={styles.companyBrandGroup}>
            <Text style={styles.companyNameText}>YOUR COMPANY NAME</Text>
            <Text style={styles.companyMetaText}>GSTIN: 22AAAAA0000A1Z5</Text>
            <Text style={styles.companyMetaText}>Kolkata, West Bengal, India</Text>
          </View>

          <View style={styles.invoiceMetaGroup}>
            <Text style={styles.invoiceLabel}>Invoice</Text>
            <Text style={styles.invoiceSequenceId}>#{invoiceNumberSequence}</Text>
            <Text style={[styles.statusBadge, isPaid ? styles.paid : styles.unpaid]}>
              {isPaid ? "Paid" : "Outstanding"}
            </Text>
          </View>
        </View>

        <View style={styles.billingGrid}>
          <View style={styles.billingColumn}>
            <Text style={styles.billingSectionLabel}>Client</Text>
            <Text style={styles.profilePrimaryText}>
              {selectedCustomer?.displayName || "No Client Assigned"}
            </Text>
            {selectedCustomer?.companyName && (
              <Text style={styles.profileSecondaryText}>{selectedCustomer.companyName}</Text>
            )}
            {selectedCustomer?.workingPhone && (
              <Text style={styles.profileSecondaryText}>{selectedCustomer.workingPhone}</Text>
            )}
            {selectedCustomer?.email && (
              <Text style={styles.profileSecondaryText}>{selectedCustomer.email}</Text>
            )}
          </View>

          <View style={styles.billingColumn}>
            <Text style={styles.billingSectionLabel}>Deliver To</Text>
            <Text style={[styles.profileSecondaryText, { color: "#334155", lineHeight: 1.4 }]}>
              {selectedCustomer?.billingAddress?.attention || 
               selectedCustomer?.billingAddress?.street || 
               "No physical address provided on file reference ledger."}
            </Text>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} minPresenceAhead={20}>
            <Text style={[styles.tableHeaderLabel, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderLabel, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderLabel, styles.colPrice]}>Rate</Text>
            <Text style={[styles.tableHeaderLabel, styles.colTotal]}>Total</Text>
          </View>

          {itemData.map((item, index) => {
            if (!item || !item.name) return null;
            const calculatedLineAmount = (Number(item.quantity) || 0) * (Number(item.sellingPrice) || 0);

            return (
              <View key={index} style={styles.tableDataRow} wrap={false}>
                <View style={styles.colDesc}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
                </View>
                <Text style={[styles.colQty, styles.numericValueText]}>{item.quantity}</Text>
                <Text style={[styles.colPrice, styles.numericValueText]}>
                  ₹{(Number(item.sellingPrice) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.colTotal, styles.numericValueText, { fontWeight: "bold", color: "#1e1b4b" }]}>
                  ₹{calculatedLineAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomExecutionSegment} wrap={false}>
          <View style={styles.annotationsWrapper}>
            {notes && (
              <View style={styles.annotationUnit}>
                <Text style={styles.billingSectionLabel}>Notes</Text>
                <Text style={styles.annotationContent}>{notes}</Text>
              </View>
            )}
            {terms && (
              <View style={styles.annotationUnit}>
                <Text style={styles.billingSectionLabel}>Terms</Text>
                <Text style={styles.annotationContent}>{terms}</Text>
              </View>
            )}
          </View>

          <View style={styles.financialSummaryCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>Subtotal</Text>
              <Text style={styles.financialRowValue}>
                ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {totalDiscount > 0 && (
              <View style={styles.discountHighlightRow}>
                <Text style={styles.discountLabel}>Discount</Text>
                <Text style={styles.discountValue}>
                  -₹{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>Tax ({taxRate}%)</Text>
              <Text style={styles.financialRowValue}>
                ₹{taxedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.grandTotalDivider}>
              <Text style={styles.grandTotalLabel}>Total Due</Text>
              <Text style={styles.grandTotalAmount}>
                ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.signatureBlockContainer} wrap={false}>
          <View style={styles.signatureWrapper}>
            <View style={styles.signatureSpacePlaceholder} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitleLabel}>YOUR COMPANY NAME</Text>
            <Text style={styles.signatureSubLabel}>Manager Approvals</Text>
          </View>
        </View>

        <View style={styles.globalPageFooter}>
          <Text style={styles.footerDisclaimerText}>
            Thank you for selecting us as your vendor. All invoices are tied strictly to contractual service parameters.
          </Text>
          <Text style={styles.footerPlatformToken}>SYSTEM TOKEN ID // SECURE</Text>
        </View>

      </Page>
    </Document>
  );
}