import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/* =====================
    TYPES
  ===================== */

export interface Supplier {
  nama_supplier: string;
  nama_pic?: string | null;
}

export interface PurchaseOrder {
  no_po: string;
  tanggal: string;
  keterangan?: string | null;
  supplier: Supplier;
}

export interface PODetail {
  id: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  barang: {
    nama_barang: string;
    satuan: string;
  };
}

export interface PurchaseOrderPDFProps {
  data: PurchaseOrder;
  details: PODetail[];
  subtotal: number;
  ppn: number;
  total: number;
  dp: number;
  sisa: number;
  termLabel?: string;
}

/* =====================
    DOCUMENT
  ===================== */

export function PurchaseOrderPDF({
  data,
  details,
  subtotal,
  ppn,
  total,
  dp,
  sisa,
  termLabel = "DP 10%",
}: PurchaseOrderPDFProps) {
  const ROW_HEIGHT = 28;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* =====================
              HEADER
          ===================== */}
        <Text style={styles.date}>
          Tangerang Selatan,{" "}
          {new Date(data.tanggal).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>

        <Text style={styles.noPo}>No. {data.no_po}</Text>

        <Text style={styles.text}>
          Kepada Yth,{"\n"}
          <Text style={styles.bold}>
            {data.supplier.nama_supplier}
            {"\n"}
            Up. Bpk/Ibu {data.supplier.nama_pic || "-"}
          </Text>
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>Dengan hormat,</Text>
          {"\n"}
          Dengan ini kami sampaikan Purchase Order material dengan rincian
          sebagai berikut:
        </Text>

        {/* =====================
              TABLE
          ===================== */}
        <View style={styles.table}>
          {/* HEADER */}
          <View style={styles.tr}>
            <Text style={styles.thNo}>No</Text>
            <Text style={styles.thDesignator}>Designator</Text>
            <Text style={styles.thSat}>Satuan</Text>
            <Text style={styles.thVol}>Volume</Text>
            <Text style={styles.thHarga}>Harga Satuan{"\n"}Rp.</Text>
            <Text style={styles.thJumlah}>Jumlah Harga{"\n"}Rp.</Text>
            <Text style={styles.thKet}>Keterangan</Text>
          </View>

    <View style={styles.tableBodyRow}>
  {/* KIRI (DATA BARANG) */}
  <View>
    {details.map((d, i) => (
      <View style={[styles.tr, { height: ROW_HEIGHT }]} key={d.id}>
        <Text style={styles.tdNo}>{i + 1}</Text>
        <Text style={styles.tdDesignator}>{d.barang.nama_barang}</Text>
        <Text style={styles.tdSat}>{d.barang.satuan}</Text>
        <Text style={styles.tdVol}>{d.jumlah}</Text>
        <Text style={styles.tdHarga}>
          {d.harga_satuan.toLocaleString("id-ID")}
        </Text>
        <Text style={styles.tdJumlah}>
          {d.subtotal.toLocaleString("id-ID")}
        </Text>
      </View>
    ))}
  </View>

  {/* KANAN (KETERANGAN SEKALI SAJA) */}
  <View
    style={[
      styles.keteranganBox,
      { height: ROW_HEIGHT * details.length },
    ]}
  >
    <Text style={styles.keteranganText}>
      {data.keterangan}
    </Text>
  </View>
</View>


          {/* JUMLAH */}
          <View style={styles.tr}>
            <Text style={styles.empty5} />
            <Text style={styles.totalLabel}>Jumlah</Text>
            <Text style={styles.totalValue}>
              {subtotal.toLocaleString("id-ID")}
            </Text>
          </View>

          {/* PPN */}
          <View style={styles.tr}>
            <Text style={styles.empty5} />
            <Text style={styles.totalLabel}>PPN 11%</Text>
            <Text style={styles.totalValue}>{ppn.toLocaleString("id-ID")}</Text>
          </View>

          {/* TOTAL */}
          <View style={styles.tr}>
            <Text style={styles.empty5} />
            <Text style={styles.totalLabelBold}>TOTAL</Text>
            <Text style={styles.totalValueBold}>
              {total.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        {/* =====================
              PAYMENT BOX
          ===================== */}
        <View style={styles.paymentBox}>
          <View style={styles.paymentRow}>
            <Text>{termLabel}</Text>
            <Text>Rp {dp.toLocaleString("id-ID")}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.bold}>Sisa Pembayaran</Text>
            <Text style={styles.bold}>Rp {sisa.toLocaleString("id-ID")}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.text}>
          Demikian Purchase Order ini kami sampaikan, atas perhatian dan
          kerjasamanya diucapkan terima kasih.
        </Text>

        <Text style={styles.text}>
          Hormat kami,{"\n"}
          <Text style={styles.bold}>PT. LINEA GLOBAL TEKNOLOGI</Text>
        </Text>

        <Text style={styles.signature}>
          Bintang Aryo Dharmawan{"\n"}
          Direktur
        </Text>
      </Page>
    </Document>
  );
}

/* =====================
    STYLES
  ===================== */

const styles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Times-Roman",
    lineHeight: 1.35,
  },

  bold: { fontWeight: "bold" },

  date: { textAlign: "left", marginBottom: 4 },
  noPo: { marginBottom: 14, fontWeight: "bold" },
  text: { marginBottom: 10 },

  /* TABLE */
  table: {
    borderWidth: 1,
    borderColor: "#000",
    marginVertical: 10,
  },
  tr: { flexDirection: "row" },

  /* HEADER */
  thNo: {
    width: 30,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  thDesignator: {
    width: 170,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    fontWeight: "bold",
  },
  thSat: {
    width: 55,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  thVol: {
    width: 60,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  thHarga: {
    width: 90,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  thJumlah: {
    width: 100,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  thKet: { width: 100, padding: 4, borderBottomWidth: 1, fontWeight: "bold" },

  /* DATA */
  tdNo: {
    width: 30,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "center",
  },
  tdDesignator: {
    width: 170,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  tdSat: {
    width: 55,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "center",
  },
  tdVol: {
    width: 60,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "center",
  },
  tdHarga: {
    width: 90,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "right",
  },
  tdJumlah: {
    width: 100,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "right",
  },
tableBodyRow: {
  flexDirection: "row",
},

keteranganBox: {
  width: 100,
  borderLeftWidth: 1,
  borderBottomWidth: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 6,
},

keteranganText: {
  textAlign: "center",
  lineHeight: 1.3,
},


  /* EMPTY COLSPAN (5 kolom) */
  empty5: {
    width: 30 + 170 + 55 + 60 + 90,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },

  /* TOTAL */
  totalLabel: {
    width: 100,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "right",
  },
  totalValue: {
    width: 100,
    padding: 4,
    borderBottomWidth: 1,
    textAlign: "right",
  },
  totalLabelBold: {
    width: 100,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    textAlign: "right",
    fontWeight: "bold",
  },
  totalValueBold: {
    width: 100,
    padding: 4,
    borderBottomWidth: 1,
    textAlign: "right",
    fontWeight: "bold",
  },

  /* PAYMENT */
  paymentBox: {
    marginTop: 10,
    marginLeft: "auto",
    width: 200,
    // borderWidth: 1,
    padding: 6,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  signature: {
    marginTop: 60,
    fontWeight: "bold",
  },
});
