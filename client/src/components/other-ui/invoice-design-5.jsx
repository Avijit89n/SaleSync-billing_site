import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingLeft: 55,
    paddingRight: 42,
    paddingBottom: 76,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1f2937",
  },
  rail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 13,
    backgroundColor: "#ea580c",
  },
  topLine: {
    position: "absolute",
    left: 13,
    top: 0,
    right: 0,
    height: 3,
    backgroundColor: "#fed7aa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  companyArea: {
    width: "52%",
  },
  logo: {
    width: 42,
    height: 42,
    objectFit: "contain",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#111827",
  },
  companyMeta: {
    fontSize: 7.8,
    color: "#6b7280",
    marginTop: 3,
    lineHeight: 1.35,
  },
  invoiceArea: {
    width: "42%",
    alignItems: "flex-end",
  },
  invoiceSmall: {
    fontSize: 7.5,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ea580c",
    marginTop: 3,
  },
  invoiceNumber: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 3,
  },
  status: {
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusPartial: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  statusUnpaid: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  infoStrip: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 22,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoBlock: {
    flex: 1,
    padding: 9,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  lastInfoBlock: {
    borderRightWidth: 0,
  },
  infoLabel: {
    fontSize: 6.8,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#111827",
  },
  parties: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 22,
  },
  partyCard: {
    flex: 1,
    padding: 11,
    backgroundColor: "#fff7ed",
    borderLeftWidth: 3,
    borderLeftColor: "#ea580c",
  },
  partyCardRight: {
    backgroundColor: "#f9fafb",
    borderLeftColor: "#d1d5db",
  },
  partyLabel: {
    fontSize: 7,
    color: "#ea580c",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  partyLabelGray: {
    color: "#6b7280",
  },
  partyName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  partyText: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.35,
    marginTop: 3,
  },
  table: {
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 6,
    backgroundColor: "#111827",
    borderRadius: 2,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontSize: 7.5,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    minHeight: 34,
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  desc: {
    flex: 2.8,
    paddingRight: 8,
  },
  qty: {
    width: 48,
    textAlign: "center",
  },
  rate: {
    width: 82,
    textAlign: "right",
  },
  amount: {
    width: 88,
    textAlign: "right",
  },
  itemName: {
    fontSize: 8.8,
    fontWeight: "bold",
    color: "#111827",
  },
  itemDescription: {
    fontSize: 7.3,
    color: "#9ca3af",
    marginTop: 2,
    lineHeight: 1.25,
  },
  cellText: {
    fontSize: 8.3,
    color: "#374151",
  },
  bottomArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 20,
  },
  notesArea: {
    width: "48%",
    paddingRight: 18,
  },
  note: {
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#ea580c",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 7.8,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  summaryArea: {
    width: "44%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 8,
    color: "#374151",
  },
  discountLabel: {
    fontSize: 8,
    color: "#15803d",
  },
  discountValue: {
    fontSize: 8,
    color: "#15803d",
    fontWeight: "bold",
  },
  totalBox: {
    marginTop: 7,
    padding: 10,
    backgroundColor: "#111827",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  totalValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  paymentBox: {
    marginTop: 9,
    padding: 9,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  paymentTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#ea580c",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  paymentLabel: {
    fontSize: 7.5,
    color: "#6b7280",
  },
  paymentValue: {
    fontSize: 7.8,
    fontWeight: "bold",
    color: "#111827",
  },
  balanceValue: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#dc2626",
  },
  history: {
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#fed7aa",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  historyText: {
    fontSize: 6.7,
    color: "#78716c",
  },
  historyAmount: {
    fontSize: 7,
    color: "#15803d",
    fontWeight: "bold",
  },
  signatureSection: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  thankYou: {
    width: "55%",
  },
  thankYouText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  thankYouSub: {
    fontSize: 7.5,
    color: "#9ca3af",
    marginTop: 3,
  },
  signature: {
    width: 155,
    alignItems: "center",
  },
  signatureImage: {
    width: 95,
    height: 34,
    objectFit: "contain",
    marginBottom: 3,
  },
  signatureSpace: {
    height: 37,
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
  },
  signatureName: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 4,
    textTransform: "uppercase",
  },
  signatureSub: {
    fontSize: 6.5,
    color: "#9ca3af",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    left: 55,
    right: 42,
    bottom: 27,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 6.8,
    color: "#9ca3af",
    maxWidth: "78%",
  },
  footerBrand: {
    fontSize: 6.5,
    color: "#ea580c",
    fontWeight: "bold",
  },
  watermark: {
    position: "absolute",
    top: 365,
    left: 0,
    right: 0,
    alignItems: "center",
    transform: "rotate(-35deg)",
  },
  watermarkText: {
    fontSize: 58,
    color: "#ea580c",
    opacity: 0.045,
    fontWeight: "bold",
  },
});

export default function InvoiceDesign5({
  companyInfo,
  companyLogo,
  companySignature,
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
  terms,
  issueDate,
  dueDate,
  paymentStatus,
  paidAmount = 0,
  balanceAmount,
  payments = [],
  isPreview = false,
}) {
  const total = Number(grandTotal) || 0;
  const paid = Math.max(Number(paidAmount) || 0, 0);
  const balance =
    balanceAmount !== undefined
      ? Math.max(Number(balanceAmount) || 0, 0)
      : Math.max(total - paid, 0);

  const status =
    paymentStatus ||
    (isPaid
      ? "Paid"
      : paid > 0
        ? "Partially Paid"
        : "Unpaid");

  const statusStyle =
    status === "Paid"
      ? styles.statusPaid
      : status === "Partially Paid"
        ? styles.statusPartial
        : styles.statusUnpaid;

  const items = Array.isArray(itemData)
    ? itemData
    : [];

  const paymentHistory = Array.isArray(payments)
    ? payments.filter(
        (payment) =>
          Number(payment?.amount) > 0
      )
    : [];

  const money = (value) =>
    `₹${(Number(value) || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const date = (value) => {
    if (!value) return "N/A";

    const parsed =
      value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return String(value);
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const address =
    selectedCustomer?.billingAddress || {};

  const customerAddress = [
    address.street1,
    address.street2,
    [
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", "),
    address.country,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Document
      title={`Invoice-${invoiceNumberSequence || "Invoice"}`}
    >
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.rail} />
        <View fixed style={styles.topLine} />

        {isPreview && (
          <View fixed style={styles.watermark}>
            <Text style={styles.watermarkText}>
              PREVIEW
            </Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.companyArea}>
            {companyLogo ? (
              <Image
                src={companyLogo}
                style={styles.logo}
              />
            ) : null}

            <Text style={styles.companyName}>
              {companyInfo?.companyName ||
                "YOUR COMPANY NAME"}
            </Text>

            {companyInfo?.gstin ? (
              <Text style={styles.companyMeta}>
                GSTIN: {companyInfo.gstin}
              </Text>
            ) : null}

            {companyInfo?.address ? (
              <Text style={styles.companyMeta}>
                {companyInfo.address}
              </Text>
            ) : null}

            {companyInfo?.phone ||
            companyInfo?.email ? (
              <Text style={styles.companyMeta}>
                {[
                  companyInfo?.phone
                    ? `Phone: ${companyInfo.phone}`
                    : null,
                  companyInfo?.email
                    ? `Email: ${companyInfo.email}`
                    : null,
                ]
                  .filter(Boolean)
                  .join("  •  ")}
              </Text>
            ) : null}
          </View>

          <View style={styles.invoiceArea}>
            <Text style={styles.invoiceSmall}>
              Tax Invoice
            </Text>

            <Text style={styles.invoiceTitle}>
              INVOICE
            </Text>

            <Text style={styles.invoiceNumber}>
              #{invoiceNumberSequence}
            </Text>

            <Text
              style={[
                styles.status,
                statusStyle,
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.infoStrip}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>
              Invoice Number
            </Text>
            <Text style={styles.infoValue}>
              #{invoiceNumberSequence}
            </Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>
              Issue Date
            </Text>
            <Text style={styles.infoValue}>
              {date(issueDate)}
            </Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>
              Due Date
            </Text>
            <Text style={styles.infoValue}>
              {date(dueDate)}
            </Text>
          </View>

          <View
            style={[
              styles.infoBlock,
              styles.lastInfoBlock,
            ]}
          >
            <Text style={styles.infoLabel}>
              Amount Due
            </Text>
            <Text style={styles.infoValue}>
              {money(balance)}
            </Text>
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>
              Bill To
            </Text>

            <Text style={styles.partyName}>
              {selectedCustomer?.displayName ||
                "No Customer"}
            </Text>

            {selectedCustomer?.companyName ? (
              <Text style={styles.partyText}>
                {selectedCustomer.companyName}
              </Text>
            ) : null}

            {selectedCustomer?.workingPhone ||
            selectedCustomer?.phone ? (
              <Text style={styles.partyText}>
                Phone:{" "}
                {selectedCustomer.workingPhone ||
                  selectedCustomer.phone}
              </Text>
            ) : null}

            {selectedCustomer?.email ? (
              <Text style={styles.partyText}>
                {selectedCustomer.email}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.partyCard,
              styles.partyCardRight,
            ]}
          >
            <Text
              style={[
                styles.partyLabel,
                styles.partyLabelGray,
              ]}
            >
              Delivery Address
            </Text>

            <Text style={styles.partyText}>
              {address.attention
                ? `${address.attention}\n`
                : ""}
              {customerAddress ||
                "No delivery address provided."}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.tableHeaderText,
                styles.desc,
              ]}
            >
              Item / Description
            </Text>

            <Text
              style={[
                styles.tableHeaderText,
                styles.qty,
              ]}
            >
              Qty
            </Text>

            <Text
              style={[
                styles.tableHeaderText,
                styles.rate,
              ]}
            >
              Rate
            </Text>

            <Text
              style={[
                styles.tableHeaderText,
                styles.amount,
              ]}
            >
              Amount
            </Text>
          </View>

          {items.map((item, index) => {
            if (!item) return null;

            const quantity =
              Number(item.quantity) || 0;

            const rate =
              Number(
                item.itemSellingPrice ??
                  item.sellingPrice
              ) || 0;

            const itemDiscount =
              Number(
                item.itemDiscountAmount ??
                  item.discountAmount ??
                  0
              ) || 0;

            const amount = Math.max(
              quantity * rate - itemDiscount,
              0
            );

            const name =
              item.itemName ||
              item.name ||
              "Unnamed Item";

            const description =
              item.itemDescription ||
              item.description;

            return (
              <View
                key={item._id || index}
                style={styles.row}
                wrap={false}
              >
                <View style={styles.desc}>
                  <Text style={styles.itemName}>
                    {name}
                  </Text>

                  {description ? (
                    <Text
                      style={styles.itemDescription}
                    >
                      {description}
                    </Text>
                  ) : null}
                </View>

                <Text
                  style={[
                    styles.qty,
                    styles.cellText,
                  ]}
                >
                  {quantity}{" "}
                  {item.itemUnit ||
                    item.unit ||
                    "pcs"}
                </Text>

                <Text
                  style={[
                    styles.rate,
                    styles.cellText,
                  ]}
                >
                  {money(rate)}
                </Text>

                <Text
                  style={[
                    styles.amount,
                    styles.cellText,
                    { fontWeight: "bold" },
                  ]}
                >
                  {money(amount)}
                </Text>
              </View>
            );
          })}
        </View>

        <View
          style={styles.bottomArea}
          wrap={false}
        >
          <View style={styles.notesArea}>
            {notes ? (
              <View style={styles.note}>
                <Text style={styles.noteTitle}>
                  Notes
                </Text>

                <Text style={styles.noteText}>
                  {notes}
                </Text>
              </View>
            ) : null}

            {terms ? (
              <View style={styles.note}>
                <Text style={styles.noteTitle}>
                  Terms & Conditions
                </Text>

                <Text style={styles.noteText}>
                  {terms}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.summaryArea}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal
              </Text>

              <Text style={styles.summaryValue}>
                {money(subtotal)}
              </Text>
            </View>

            {Number(totalDiscount) > 0 ? (
              <View style={styles.summaryRow}>
                <Text
                  style={styles.discountLabel}
                >
                  Discount
                </Text>

                <Text
                  style={styles.discountValue}
                >
                  -{money(totalDiscount)}
                </Text>
              </View>
            ) : null}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                GST ({taxRate || 0}%)
              </Text>

              <Text style={styles.summaryValue}>
                {money(taxedAmount)}
              </Text>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>
                Total
              </Text>

              <Text style={styles.totalValue}>
                {money(total)}
              </Text>
            </View>

            <View style={styles.paymentBox}>
              <Text style={styles.paymentTitle}>
                Payment Summary
              </Text>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>
                  Paid
                </Text>

                <Text style={styles.paymentValue}>
                  {money(paid)}
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>
                  Balance Due
                </Text>

                <Text
                  style={styles.balanceValue}
                >
                  {money(balance)}
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>
                  Status
                </Text>

                <Text style={styles.paymentValue}>
                  {status}
                </Text>
              </View>

              {paymentHistory.length > 0 ? (
                <View style={styles.history}>
                  <Text style={styles.paymentTitle}>
                    Payment History
                  </Text>

                  {paymentHistory.map(
                    (payment, index) => (
                      <View
                        key={
                          payment?._id || index
                        }
                        style={styles.historyRow}
                      >
                        <Text
                          style={styles.historyText}
                        >
                          #{index + 1} ·{" "}
                          {date(
                            payment?.paymentDate
                          )}{" "}
                          ·{" "}
                          {payment?.paymentMethod ||
                            "Cash"}
                        </Text>

                        <Text
                          style={
                            styles.historyAmount
                          }
                        >
                          {money(payment?.amount)}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View
          style={styles.signatureSection}
          wrap={false}
        >
          <View style={styles.thankYou}>
            <Text style={styles.thankYouText}>
              Thank you for your business.
            </Text>

            <Text style={styles.thankYouSub}>
              We appreciate your continued trust.
            </Text>
          </View>

          <View style={styles.signature}>
            {companySignature ? (
              <Image
                src={companySignature}
                style={styles.signatureImage}
              />
            ) : (
              <View style={styles.signatureSpace} />
            )}

            <View style={styles.signatureLine} />

            <Text style={styles.signatureName}>
              {companyInfo?.companyName ||
                "Authorized Signatory"}
            </Text>

            <Text style={styles.signatureSub}>
              Authorized Signatory
            </Text>
          </View>
        </View>

        <View fixed style={styles.footer}>
          <Text style={styles.footerText}>
            E.&O.E. • Please verify invoice details
            and retain this document for your records.
          </Text>

          <Text style={styles.footerBrand}>
            SaleSync
          </Text>
        </View>
      </Page>
    </Document>
  );
}