import React from "react";
import {
  Document,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";

export default function InvoicePDF4565656() {
  return (
    <Document>
      <Page size="A4">
        <View style={{ padding: 30 }}>
          <Text>Invoice Preview</Text>
        </View>
      </Page>
    </Document>
  );
}