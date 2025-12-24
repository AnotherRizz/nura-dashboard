import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/* =====================
   TYPES
===================== */
export interface PurchaseOrderPDFProps {
  data: {
    no_po: string;
    tanggal: string;
    keterangan?: string | null;
    supplier: {
      nama_supplier: string;
      nama_pic?: string | null;
    };
    ketentuan?: string[];
  };
  details: {
    id: string;
    jumlah: number;
    harga_satuan: number;
    subtotal: number;
    barang: {
      nama_barang: string;
      satuan: string;
    };
  }[];
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
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
          Dengan ini kami sampaikan Purchase Order material dengan perincian
          sebagai berikut:
        </Text>

        {/* ================= TABLE HEADER ================= */}
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={styles.thNo}>No</Text>
            <Text style={styles.thDesignator}>Designator</Text>
            <Text style={styles.thSat}>Satuan</Text>
            <Text style={styles.thVol}>Volume</Text>
            <Text style={styles.thHarga}>Harga Satuan{"\n"}Rp.</Text>
            <Text style={styles.thJumlah}>Jumlah Harga{"\n"}Rp.</Text>
            <Text style={styles.thKet}>Keterangan</Text>
          </View>

          {/* ================= TABLE BODY ================= */}
          <View style={styles.bodyRow}>
            {/* LEFT ITEMS */}
            <View>
              {details.map((d, i) => (
                <View key={d.id} style={styles.tr}>
                  <Text style={styles.tdNo}>{i + 1}</Text>
                  <Text style={styles.tdDesignator}>
                    {d.barang.nama_barang}
                  </Text>
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

            {/* RIGHT KETERANGAN */}
            <View style={styles.keteranganBox}>
              <Text style={styles.keteranganText}>
                {data.keterangan || "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= TOTAL TABLE ================= */}
        <View style={styles.totalTable}>
          <View style={styles.tr}>
            <Text style={styles.totalLabel}>Jumlah</Text>
            <Text style={styles.totalValue}>
              {subtotal.toLocaleString("id-ID")}
            </Text>
          </View>

          <View style={styles.tr}>
            <Text style={styles.totalLabel}>PPN 11%</Text>
            <Text style={styles.totalValue}>
              {ppn.toLocaleString("id-ID")}
            </Text>
          </View>

          <View style={styles.tr}>
            <Text style={styles.totalLabelBold}>TOTAL</Text>
            <Text style={styles.totalValueBold}>
              {total.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        {/* ================= SYARAT & PAYMENT ================= */}
        <View style={styles.bottomRow}>
          <View style={styles.syaratBox}>
            <Text style={styles.bold}>Syarat dan Ketentuan:</Text>
            {data.ketentuan && data.ketentuan.length > 0 ? (
              data.ketentuan.map((k, i) => (
                <Text key={i}>- {k}</Text>
              ))
            ) : (
              <Text>- Tidak ada ketentuan</Text>
            )}
          </View>

          <View style={styles.paymentBox}>
            <View style={styles.paymentRow}>
              <Text>{termLabel}</Text>
              <Text>Rp {dp.toLocaleString("id-ID")}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.bold}>Sisa Pembayaran</Text>
              <Text style={styles.bold}>
                Rp {sisa.toLocaleString("id-ID")}
              </Text>
            </View>
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

  date: { marginBottom: 4 },
  noPo: { marginBottom: 12, fontWeight: "bold" },
  text: { marginBottom: 10 },

  /* TABLE */
  table: {
    borderWidth: 1,
    borderColor: "#000",
  },
  tr: { flexDirection: "row" },

  thNo: { width: 30, borderRightWidth: 1, borderBottomWidth: 1, textAlign: "center", fontWeight: "bold", padding: 4 },
  thDesignator: { width: 170, borderRightWidth: 1, borderBottomWidth: 1, fontWeight: "bold", padding: 4 },
  thSat: { width: 55, borderRightWidth: 1, borderBottomWidth: 1, textAlign: "center", fontWeight: "bold", padding: 4 },
  thVol: { width: 60, borderRightWidth: 1, borderBottomWidth: 1, textAlign: "center", fontWeight: "bold", padding: 4 },
  thHarga: { width: 90, borderRightWidth: 1, borderBottomWidth: 1, textAlign: "center", fontWeight: "bold", padding: 4 },
  thJumlah: { width: 100, borderRightWidth: 1, borderBottomWidth: 1, textAlign: "center", fontWeight: "bold", padding: 4 },
  thKet: { width: 100, borderBottomWidth: 1, fontWeight: "bold", padding: 4 },

  tdNo: { width: 30, borderRightWidth: 1, borderBottomWidth: 1, textAlign: "center", padding: 4 },
  tdDesignator: { width: 170, borderRightWidth: 1, borderBottomWidth: 1, padding: 4 },
  tdSat: { width: 55, borderRightWidth: 1, borderBottomWidth: 1, textAlign: "center", padding: 4 },
  tdVol: { width: 60, borderRightWidth: 1, borderBottomWidth: 1, textAlign: "center", padding: 4 },
  tdHarga: { width: 90, borderRightWidth: 1, borderBottomWidth: 1, textAlign: "right", padding: 4 },
  tdJumlah: { width: 100, borderRightWidth: 1, borderBottomWidth: 1, textAlign: "right", padding: 4 },

  bodyRow: { flexDirection: "row" },

  keteranganBox: {
    width: 100,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    padding: 6,
    justifyContent: "flex-start",
  },
  keteranganText: { lineHeight: 1.3 },

  /* TOTAL */
  totalTable: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  totalLabel: {
    width: 505,
    borderRightWidth: 1,
    padding: 4,
    textAlign: "right",
  },
  totalValue: {
    width: 100,
    padding: 4,
    textAlign: "right",
  },
  totalLabelBold: {
    width: 505,
    borderRightWidth: 1,
    padding: 4,
    textAlign: "right",
    fontWeight: "bold",
  },
  totalValueBold: {
    width: 100,
    padding: 4,
    textAlign: "right",
    fontWeight: "bold",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  syaratBox: { width: 300 },
  paymentBox: { width: 200 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between" },

  signature: { marginTop: 60, fontWeight: "bold" },
});
