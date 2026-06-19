import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 9,
    color: "#1c1917", // Charcoal Black
    fontFamily: "Helvetica", // Universally available baseline standard
    backgroundColor: "#ffffff",
  },
  // Deep Classical Double Header Accents
  topDecorativeBar: {
    backgroundColor: "#991b1b", // Deep Crimson
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
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Classical Two-Column Address Blocks
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

  // Traditional Structured Grid Matrix
  tableContainer: {
    marginTop: 5,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#78716c", // Formal Warm Muted Gray Row
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
  colDesc: { flex: 2.8, paddingRight: 10 },
  colQty: { flex: 0.4, textAlign: "center" },
  colPrice: { flex: 0.9, textAlign: "right" },
  colTotal: { flex: 0.9, textAlign: "right" },
  
  itemName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#1c1917",
  },
  itemDesc: {
    fontSize: 8.5,
    color: "#57534e",
    marginTop: 2,
  },
  numericValueText: {
    fontSize: 9,
    color: "#1c1917",
  },

  // Ledger Aggregation Split Layout
  bottomExecutionSegment: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  annotationsWrapper: {
    width: "50%",
    flexDirection: "column",
    gap: 14,
  },
  annotationContent: {
    fontSize: 8,
    color: "#57534e",
    lineHeight: 1.3,
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

  // Formalized Enterprise Signature Layout
  signatureBlockContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 45,
  },
  signatureWrapper: {
    width: 180,
    alignItems: "center",
  },
  signatureSpacePlaceholder: {
    height: 40, 
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

  // Traditional Full-Width Corporate Footer
  globalPageFooter: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#991b1b",
    paddingTop: 10,
    alignItems: "center",
  },
  footerDisclaimerText: {
    fontSize: 8,
    color: "#78716c",
    fontStyle: "italic",
    textAlign: "center",
  }
});

export default function InvoiceDesign3({
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
        
        <View style={styles.topDecorativeBar} />

        <View style={styles.brandHeaderContainer}>
          <View style={styles.companyBrandGroup}>
            <Text style={styles.companyNameText}>YOUR COMPANY NAME</Text>
            <Text style={styles.companyMetaText}>GSTIN: 22AAAAA0000A1Z5</Text>
            <Text style={styles.companyMetaText}>Kolkata, West Bengal, India</Text>
          </View>

          <View style={styles.invoiceMetaGroup}>
            <Text style={styles.invoiceLabel}>Official Invoice</Text>
            <Text style={styles.invoiceSequenceId}>Doc No: #{invoiceNumberSequence}</Text>
            <Text style={[styles.statusText, { color: isPaid ? "#15803d" : "#b91c1c" }]}>
              Account Status: {isPaid ? "Paid" : "Settlement Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.billingSection}>
          <View style={styles.billingBox}>
            <Text style={styles.sectionTitle}>Invoice To</Text>
            <Text style={styles.profilePrimaryText}>
              {selectedCustomer?.displayName || "Unspecified Entity Account"}
            </Text>
            {selectedCustomer?.companyName && (
              <Text style={styles.profileSecondaryText}>{selectedCustomer.companyName}</Text>
            )}
            {selectedCustomer?.workingPhone && (
              <Text style={styles.profileSecondaryText}>Phone: {selectedCustomer.workingPhone}</Text>
            )}
            {selectedCustomer?.email && (
              <Text style={styles.profileSecondaryText}>Email: {selectedCustomer.email}</Text>
            )}
          </View>

          <View style={styles.billingBox}>
            <Text style={styles.sectionTitle}>Shipping / Delivery Ledger</Text>
            <Text style={[styles.profileSecondaryText, { lineHeight: 1.3 }]}>
              {selectedCustomer?.billingAddress?.attention || 
               selectedCustomer?.billingAddress?.street || 
               "No physical dispatch configuration allocated to profile metadata tracking."}
            </Text>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} minPresenceAhead={20}>
            <Text style={[styles.tableHeaderLabel, styles.colDesc]}>Item Particulars</Text>
            <Text style={[styles.tableHeaderLabel, styles.colQty]}>Unit</Text>
            <Text style={[styles.tableHeaderLabel, styles.colPrice]}>Rate</Text>
            <Text style={[styles.tableHeaderLabel, styles.colTotal]}>Net Value</Text>
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
                <Text style={[styles.colTotal, styles.numericValueText, { fontWeight: "bold" }]}>
                  ₹{calculatedLineAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomExecutionSegment} wrap={false}>
          <View style={styles.annotationsWrapper}>
            {notes && (
              <View>
                <Text style={styles.sectionTitle}>Transactional Notes</Text>
                <Text style={styles.annotationContent}>{notes}</Text>
              </View>
            )}
            {terms && (
              <View>
                <Text style={styles.sectionTitle}>Formal Terms & Conditions</Text>
                <Text style={styles.annotationContent}>{terms}</Text>
              </View>
            )}
          </View>

          <View style={styles.financialSummaryCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>Gross Value</Text>
              <Text style={styles.financialRowValue}>
                ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {totalDiscount > 0 && (
              <View style={styles.financialRow}>
                <Text style={[styles.financialRowLabel, { color: "#15803d" }]}>Rebate / Discount</Text>
                <Text style={[styles.financialRowValue, { color: "#15803d" }]}>
                  -₹{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>Statutory Tax Levies ({taxRate}%)</Text>
              <Text style={styles.financialRowValue}>
                ₹{taxedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Aggregate Total</Text>
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
            <Text style={styles.signatureTitleLabel}>For YOUR COMPANY NAME</Text>
            <Text style={styles.signatureSubLabel}>Authorized Signatory Endorsement</Text>
          </View>
        </View>

        <View style={styles.globalPageFooter}>
          <Text style={styles.footerDisclaimerText}>
            This document represents a legally binding corporate financial instrument generated under verified systemic oversight.
          </Text>
        </View>

      </Page>
    </Document>
  );
}