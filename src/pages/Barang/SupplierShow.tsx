import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { BoxCubeIcon, UserIcon } from "../../icons";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHeader,
//   TableRow,
// } from "../../components/ui/table";
import { supabase } from "../../services/supabaseClient";

interface Barang {
  id: string;
  nama_barang: string;
  kode_barang: string | null;
  stok: number;
  harga: number;
  satuan?: string;
  tipe?: string;
  merk?: string | null;
}

interface Supplier {
  id: string;
  nama_supplier: string;
  nama_pt: string;
  alamat: string;
  nama_pic: string;
  telp_pic: string;
  barang: Barang[];
}

function SupplierDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

function SupplierBarangSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"
        />
      ))}
    </div>
  );
}

export default function SupplierShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSupplier = async () => {
    try {
      // ambil supplier + relasi barang
      const { data, error } = await supabase
        .from("Supplier")
        .select(
          `
          id,
          nama_supplier,
          nama_pt,
          alamat,
          nama_pic,
          telp_pic,
          barang:Barang (
            id,
            nama_barang,
            kode_barang,
            harga,
            satuan,
            tipe,
            merk
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setSupplier(data as Supplier);
    } catch (err) {
      console.error("Gagal mengambil detail supplier", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSupplier();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-10 space-y-10">
        {/* Skeleton untuk detail & barang */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8">
          <h2 className="text-2xl flex gap-2 font-bold mb-6">
            <UserIcon /> Detail Supplier
          </h2>
          <SupplierDetailSkeleton />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8">
          <h2 className="text-2xl flex gap-2 font-bold mb-6">
            <BoxCubeIcon /> Daftar Barang
          </h2>
          <SupplierBarangSkeleton />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return <div className="p-6">Supplier tidak ditemukan.</div>;
  }

  return (
    <div>
      <PageMeta
        title={`Detail Supplier - ${supplier.nama_supplier}`}
        description="Detail supplier"
      />
      <PageBreadcrumb pageTitle="Detail Supplier" />

      <div className="min-h-screen px-4 py-10 space-y-10">
        {/* Detail Supplier */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-2xl flex gap-2 font-bold text-gray-800 dark:text-white/90 mb-6">
            <UserIcon /> Detail Supplier
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Nama Supplier:
              </span>
              <span className="text-gray-900 dark:text-white">
                {supplier.nama_supplier}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Nama PT:
              </span>
              <span className="text-gray-900 dark:text-white">
                {supplier.nama_pt || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Alamat:
              </span>
              <span className="text-gray-900 dark:text-white">
                {supplier.alamat || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                PIC:
              </span>
              <span className="text-gray-900 dark:text-white">
                {supplier.nama_pic || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Telp PIC:
              </span>
              <span className="text-gray-900 dark:text-white">
                {supplier.telp_pic}
              </span>
            </div>
          </div>
        </div>

        {/* Daftar Barang */}
        {/* <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-2xl flex gap-2 font-bold text-gray-800 dark:text-white/90 mb-6">
            <BoxCubeIcon /> Daftar Barang
          </h2>

          {supplier.barang && supplier.barang.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="dark:text-white">No</TableCell>
                  <TableCell className="dark:text-white">Kode</TableCell>
                  <TableCell className="dark:text-white">Nama Barang</TableCell>
                  <TableCell className="dark:text-white">Stok</TableCell>
                  <TableCell className="dark:text-white">Harga</TableCell>
                  <TableCell className="dark:text-white">Satuan</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplier.barang.map((b, i) => (
                  <TableRow key={b.id}>
                    <TableCell className="dark:text-white">{i + 1}</TableCell>
                    <TableCell className="dark:text-white">
                      {b.kode_barang || "-"}
                    </TableCell>
                    <TableCell className="dark:text-white">
                      {b.nama_barang}
                    </TableCell>
                    <TableCell className="dark:text-white">{b.stok}</TableCell>
                    <TableCell className="dark:text-white">
                      {b.harga.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </TableCell>
                    <TableCell className="dark:text-white">
                      {b.satuan || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Supplier ini belum memiliki barang.
            </p>
          )}
        </div> */}

        {/* Tombol Aksi */}
        <div className="mt-10 flex justify-end gap-2">
          <Button
            className="bg-gray-700 hover:bg-gray-800"
            onClick={() => navigate("/supplier")}
          >
            Kembali
          </Button>
          <Button onClick={() => navigate(`/supplier/edit/${supplier.id}`)}>
            Edit Supplier
          </Button>
        </div>
      </div>
    </div>
  );
}
