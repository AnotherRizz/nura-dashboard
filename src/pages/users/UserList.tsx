import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import toast from "react-hot-toast";
import Pagination from "../../components/tables/Pagination";
import UserTable from "../../components/tables/UserTable";
import { supabase } from "../../services/supabaseClient";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isactive: boolean;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("user");
  const [, setAdding] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  // 🔹 Ambil data user dari Supabase
  const fetchUsers = async (currentPage = 1, keyword = "") => {
    setLoading(true);
    try {
      let query = supabase
        .from("User")
        .select("*", { count: "exact" })
        .order("createdat", { ascending: false })
        .range((currentPage - 1) * limit, currentPage * limit - 1);

      if (keyword) {
        query = query.or(`name.ilike.%${keyword}%,email.ilike.%${keyword}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setUsers(data || []);
      setTotalPages(count ? Math.ceil(count / limit) : 1);
    } catch (err) {
      console.error("Gagal fetch users:", err);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Fetch saat page berubah
  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  // ⌛ Debounce pencarian
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchUsers(1, search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  // 🔹 Hapus user dari Supabase
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;

      toast.success("User berhasil dihapus");
      fetchUsers(page, search);
    } catch (err) {
      console.error(err);
      toast.error("Gagal hapus user");
    }
  };
const handleAddUser = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setAdding(true);

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: addEmail,
    password: addPassword,
    name: addName,
    role: addRole,
  }),
});


    const result = await res.json();

    if (res.status !== 200) {
      toast.error(result.error || "Gagal membuat user");
      return;
    }

    toast.success("User berhasil ditambahkan!");

    setAddName("");
    setAddEmail("");
    setAddPassword("");
    setAddRole("user");
    setOpenAdd(false);

    fetchUsers(page, search);

  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Error!");
  } finally {
    setAdding(false);
  }
};



  // 🔹 Ubah status aktif user
  const handleToggle = async (id: string, newValue: boolean) => {
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isactive: newValue } : u))
    );

    try {
      const { error } = await supabase
        .from("User")
        .update({ isactive: newValue })
        .eq("id", id);

      if (error) throw error;
      toast.success("Status user diperbarui");
    } catch (err) {
      console.error(err);
      toast.error("Gagal update status user");

      // Rollback jika gagal
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isactive: !newValue } : u))
      );
    }
  };

  return (
    <div>
      <PageMeta title="Account List Dashboard" description="Daftar User" />
      <PageBreadcrumb pageTitle="Account List" />
      <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base md:w-2/3 mb-5">
        Halaman ini menampilkan daftar akun sistem yang telah terdaftar, lengkap
        dengan informasi hak akses dan detail pengguna.
      </p>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Daftar User
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden lg:block">
              <form>
                <div className="relative">
                  <input
                    value={search}
                    type="text"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari user..."
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 xl:w-[430px]"
                  />
                </div>
              </form>
            </div>
            <Button
              size="sm"
              className="bg-orange-500 rounded-xl hover:bg-orange-600"
              onClick={() => setOpenAdd(true)}>
              Tambah User
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <UserTable
            data={users}
            loading={loading}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
      {openAdd && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">
              Tambah User
            </h3>

            <form
              className="space-y-4"
              onSubmit={handleAddUser}
              autoComplete="off">
              {/* Name */}
              <div>
                <label className="text-sm font-medium dark:text-white/90">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 rounded-lg border dark:bg-dark-800 dark:text-white"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium dark:text-white/90">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="off"
                  className="w-full mt-1 p-2 rounded-lg border dark:bg-dark-800 dark:text-white"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium dark:text-white/90">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="off"
                  className="w-full mt-1 p-2 rounded-lg border dark:bg-dark-800 dark:text-white"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-sm font-medium dark:text-white/90">
                  Role
                </label>
                <select
                  className="w-full mt-1 p-2 rounded-lg border dark:bg-gray-800 dark:text-white"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  required>
                  <option value="admin">Admin</option>
                  <option value="noc">Noc</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  onClick={() => setOpenAdd(false)}>
                  Batal
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  className="bg-brand-500 rounded-lg hover:bg-brand-600">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
