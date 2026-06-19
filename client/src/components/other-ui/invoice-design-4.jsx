import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontSize: 9.5,
    color: "#292524", // Warm Stone Black
    fontFamily: "Helvetica",
    backgroundColor: "#fffdfa", // Vintage cream paper tint
  },
  // Traditional Stamp / Ledger Header Style
  ledgerTopBorder: {
    borderTopWidth: 5,
    borderTopColor: "#7c2d12", // Deep Terracotta / Crimson Ochre
    marginBottom: 15,
  },
  brandHeaderContainer: {
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#7c2d12",
    paddingBottom: 14,
    marginBottom: 22,
  },
  companyNameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7c2d12",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  companyMetaText: {
    fontSize: 8.5,
    color: "#57534e",
    marginTop: 3,
    letterSpacing: 0.2,
  },
  
  // Center-aligned document title mimicking physical receipts
  invoiceTitleBlock: {
    alignItems: "center",
    marginVertical: 12,
  },
  invoiceLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7c2d12",
    textTransform: "uppercase",
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: "#7c2d12",
    paddingHorizontal: 20,
    paddingVertical: 4,
    backgroundColor: "#fff7ed",
  },

  // Metadata Grid
  metaDataGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fbf8f3",
    borderWidth: 1,
    borderColor: "#e7e5e4",
    padding: 10,
    marginBottom: 24,
  },
  metaColumn: {
    flexDirection: "column",
  },
  metaItemText: {
    fontSize: 9,
    marginBottom: 2,
  },

  // Two-Column Traditional Billing Layout
  billingGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  billingCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#d6d3d1",
    padding: 10,
    backgroundColor: "#ffffff",
  },
  billingSectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#7c2d12",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f4",
    paddingBottom: 4,
    marginBottom: 6,
  },
  profilePrimaryText: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#292524",
  },
  profileSecondaryText: {
    fontSize: 8.5,
    color: "#57534e",
    marginTop: 3,
    lineHeight: 1.3,
  },

  // Structured Box Table Design (Classic Ledger Style)
  tableContainer: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#7c2d12",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#7c2d12",
    paddingVertical: 6,
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
    alignItems: "center",
  },
  colDesc: { flex: 2.5, paddingRight: 8 },
  colQty: { flex: 0.5, textAlign: "center" },
  colPrice: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  
  itemName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#292524",
  },
  itemDesc: {
    fontSize: 8.5,
    color: "#78716c",
    marginTop: 1,
  },
  numericValueText: {
    fontSize: 9.5,
    color: "#292524",
  },

  // Split Summary Layout
  bottomExecutionSegment: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 20,
  },
  annotationsWrapper: {
    width: "50%",
    flexDirection: "column",
    gap: 10,
  },
  annotationBox: {
    borderLeftWidth: 2,
    borderLeftColor: "#7c2d12",
    paddingLeft: 8,
  },
  annotationContent: {
    fontSize: 8,
    color: "#57534e",
    lineHeight: 1.3,
  },

  // Financial Summary Cards
  financialSummaryCard: {
    width: "44%",
    borderWidth: 1,
    borderColor: "#d6d3d1",
    backgroundColor: "#ffffff",
    padding: 10,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  financialRowLabel: {
    fontSize: 8.5,
    color: "#57534e",
  },
  financialRowValue: {
    fontSize: 8.5,
    color: "#292524",
  },
  grandTotalDivider: {
    borderTopWidth: 1.5,
    borderTopColor: "#7c2d12",
    marginTop: 6,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#7c2d12",
  },
  grandTotalAmount: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#7c2d12",
  },

  // Classic Voucher Stamp/Signature Area
  signatureBlockContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 40,
  },
  signatureWrapper: {
    width: 170,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e7e5e4",
    padding: 8,
    backgroundColor: "#fffdfa",
  },
  signatureSpacePlaceholder: {
    height: 35, 
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#7c2d12",
    width: "100%",
    marginBottom: 4,
  },
  signatureTitleLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#292524",
  },

  // Footer Disclaimer
  globalPageFooter: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#e7e5e4",
    paddingTop: 10,
    alignItems: "center",
  },
  footerDisclaimerText: {
    fontSize: 8,
    color: "#78716c",
    textAlign: "center",
  }
});

export default function InvoiceDesign4({
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
        
        <View style={styles.ledgerTopBorder} />

        {/* Company Identity Block */}
        <View style={styles.brandHeaderContainer}>
          <Text style={styles.companyNameText}>YOUR COMPANY NAME</Text>
          <Text style={styles.companyMetaText}>GSTIN: 22AAAAA0000A1Z5 | PAN: AAAAA0000A</Text>
          <Text style={styles.companyMetaText}>Kolkata, West Bengal, India</Text>
        </View>

        {/* Document Header Title */}
        <View style={styles.invoiceTitleBlock}>
          <Text style={styles.invoiceLabel}>REVENUE INVOICE / VOUCHER</Text>
        </View>

        {/* Metadata Grid Ledger Bar */}
        <View style={styles.metaDataGrid}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaItemText}>
              <Text style={{ fontWeight: "bold" }}>Invoice No: </Text>#{invoiceNumberSequence}
            </Text>
            <Text style={styles.metaItemText}>
              <Text style={{ fontWeight: "bold" }}>Date: </Text>{new Date().toLocaleDateString("en-IN")}
            </Text>
          </View>
          <View style={[styles.metaColumn, { alignItems: "flex-end" }]}>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: isPaid ? "#166534" : "#991b1b" }}>
              [ STATUS: {isPaid ? "PAID / RECEIPTED" : "UNPAID / OUTSTANDING"} ]
            </Text>
          </View>
        </View>

        {/* Billing Layout */}
        <View style={styles.billingGrid}>
          <View style={styles.billingCard}>
            <Text style={styles.billingSectionLabel}>M/S (Debtor / Client)</Text>
            <Text style={styles.profilePrimaryText}>
              {selectedCustomer?.displayName || "No Client Record Assigned"}
            </Text>
            {selectedCustomer?.companyName && (
              <Text style={styles.profileSecondaryText}>{selectedCustomer.companyName}</Text>
            )}
            {selectedCustomer?.workingPhone && (
              <Text style={styles.profileSecondaryText}>Contact: {selectedCustomer.workingPhone}</Text>
            )}
            {selectedCustomer?.email && (
              <Text style={styles.profileSecondaryText}>Email: {selectedCustomer.email}</Text>
            )}
          </View>

          <View style={styles.billingCard}>
            <Text style={styles.billingSectionLabel}>Consignee / Destination Site</Text>
            <Text style={[styles.profileSecondaryText, { color: "#292524" }]}>
              {selectedCustomer?.billingAddress?.attention || 
               selectedCustomer?.billingAddress?.street || 
               "No physical delivery address recorded on dynamic file profile ledger lookup."}
            </Text>
          </View>
        </View>

        {/* Item Ledger Table Matrix */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow} minPresenceAhead={20}>
            <Text style={[styles.tableHeaderLabel, styles.colDesc]}>Particulars / Description</Text>
            <Text style={[styles.tableHeaderLabel, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderLabel, styles.colPrice]}>Rate</Text>
            <Text style={[styles.tableHeaderLabel, styles.colTotal]}>Amount (INR)</Text>
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
                  ₹{(Number(item.sellingPrice) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.colTotal, styles.numericValueText, { fontWeight: "bold" }]}>
                  ₹{calculatedLineAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Bottom Metrics Segment */}
        <View style={styles.bottomExecutionSegment} wrap={false}>
          <View style={styles.annotationsWrapper}>
            {notes && (
              <View style={styles.annotationBox}>
                <Text style={[styles.billingSectionLabel, { borderBottomWidth: 0, marginBottom: 2 }]}>Notes</Text>
                <Text style={styles.annotationContent}>{notes}</Text>
              </View>
            )}
            {terms && (
              <View style={styles.annotationBox}>
                <Text style={[styles.billingSectionLabel, { borderBottomWidth: 0, marginBottom: 2 }]}>Terms</Text>
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
              <View style={styles.financialRow}>
                <Text style={[styles.financialRowLabel, { color: "#166534" }]}>Less: Discount</Text>
                <Text style={[styles.financialRowValue, { color: "#166534" }]}>
                  -₹{totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            <View style={styles.financialRow}>
              <Text style={styles.financialRowLabel}>Add: GST ({taxRate}%)</Text>
              <Text style={styles.financialRowValue}>
                ₹{taxedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.grandTotalDivider}>
              <Text style={styles.grandTotalLabel}>Total Payable</Text>
              <Text style={styles.grandTotalAmount}>
                ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Traditional Corporate Stamp Area */}
        <View style={styles.signatureBlockContainer} wrap={false}>
          <View style={styles.signatureWrapper}>
            <Text style={[styles.signatureTitleLabel, { fontSize: 7, color: "#7c2d12", marginBottom: 15 }]}>
              Receiver's Stamp / Sign
            </Text>
            <View style={styles.signatureSpacePlaceholder} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitleLabel}>Authorized Signatory</Text>
          </View>
        </View>

        <View style={styles.globalPageFooter}>
          <Text style={styles.footerDisclaimerText}>
            E.&O.E. Please match items against physically signed delivery challans.
          </Text>
        </View>

      </Page>
    </Document>
  );
}