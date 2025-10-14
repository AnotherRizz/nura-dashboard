import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import Pagination from "../../components/tables/Pagination";
import UserRegistrationTable from "../../components/tables/UserRegistrationTable";
import { supabase } from "../../services/supabaseClient";

interface Paket {
  id: number;
  nama_paket: string;
}

interface UserRegistration {
  id: number;
  nama: string;
  no_wa: string;
  status: string;
  alamat: string;
  paketId?: number | null;
  paket?: Paket | null;
}

export default function UserRegistrationPage() {
  const [userRegistration, setUserRegistration] = useState<UserRegistration[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  const fetchUser = async (currentPage = 1, keyword = "") => {
    setLoading(true);
    try {
      // --- 1️⃣ Ambil semua user
      let query = supabase
        .from("UserRegistration")
        .select("*", { count: "exact" })
        .order("createdAt", { ascending: false })
        .range((currentPage - 1) * limit, currentPage * limit - 1);

      if (keyword) {
        query = query.ilike("nama", `%${keyword}%`);
      }

      const { data: users, error: userError, count } = await query;
      if (userError) throw userError;

      // --- 2️⃣ Ambil semua paket
      const { data: paketData, error: paketError } = await supabase.from("Paket").select("*");
      if (paketError) throw paketError;

      // --- 3️⃣ Gabungkan user + paket berdasarkan paketId
      const merged = (users || []).map((u: any) => {
        const paket = paketData?.find((p) => p.id === u.paketId) || null;
        return { ...u, paket };
      });

      setUserRegistration(merged);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (err: any) {
      console.error("Gagal fetch user:", err.message);
      toast.error("Gagal memuat user");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 fetch ketika page / search berubah
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUser(page, search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [page, search]);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    try {
      const { error } = await supabase.from("UserRegistration").delete().eq("id", id);
      if (error) throw error;

      toast.success("User berhasil dihapus");
      fetchUser(page, search);
    } catch {
      toast.error("Gagal hapus user");
    }
  };

  const handleUpdated = (updatedUser: UserRegistration) => {
    setUserRegistration((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  return (
    <div>
      <PageMeta title="Registrasi User Dashboard" description="Daftar Registrasi User" />
      <PageBreadcrumb pageTitle="Registrasi User" />

      <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base md:w-2/3 mb-5">
        Halaman ini berisi daftar pengguna yang telah mendaftar pada sistem,
        termasuk detail akun dan status registrasi.
      </p>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header */}
        <div className="mx-auto w-full mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Daftar Registrasi User
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden lg:block">
              <input
                value={search}
                type="text"
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Cari User..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-4 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
              />
            </div>
            <Button
              size="sm"
              className="bg-blue-700 rounded-xl"
              onClick={() => navigate("/registrasi-user/add")}
            >
              Tambah User
            </Button>
          </div>
        </div>

        {/* Table */}
        <UserRegistrationTable
          data={userRegistration}
          loading={loading}
          onDelete={handleDelete}
          onUpdated={handleUpdated}
        />

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
}
