"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useNavigate } from "react-router";
import ActionButton from "../ui/ActionButton";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  BarsArrowUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../../services/supabaseClient";
import Badge from "../ui/badge/Badge";

// =================== INTERFACES ===================
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
  paket?: Paket | null;
}

interface Progress {
  id: number;
  user_id: number;
  status: string;
  note: string | null;
  createdAt: string;
}

interface UserRegistrationTableProps {
  data: UserRegistration[];
  loading?: boolean;
  onDelete?: (id: number) => void;
  onUpdated?: (user: UserRegistration) => void;
}

// =================== SKELETON ===================
function UserRegistrationSkeleton() {
  return (
    <TableBody className="animate-pulse divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: 7 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((__, j) => (
            <TableCell key={j} className="px-4 py-3">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

// =================== COMPONENT ===================
export default function UserRegistrationTable({
  data,
  loading,
  // onDelete,
  onUpdated,
}: UserRegistrationTableProps) {
  const navigate = useNavigate();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRegistration | null>(
    null
  );
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // ============ DELETE USER ============
  // const handleDelete = (id: number) => {
  //   if (confirm("Yakin ingin menghapus user ini?")) {
  //     onDelete?.(id);
  //   }
  // };

  // ============ GET PROGRESS DARI SUPABASE ============
  const handleOpenProgress = async (user: UserRegistration) => {
    setSelectedUser(user);
    setStatus(user.status);
    setNote("");
    setOpenSidebar(true);
    setLoadingProgress(true);

    try {
      const { data, error } = await supabase
        .from("RegistrationProgress")
        .select("*")
        .eq("registrationId", user.id)
        .order("id", { ascending: false });

      if (error) throw error;
      setProgresses(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat riwayat progress");
      setProgresses([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  // ============ UPDATE STATUS USER ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSaving(true);
    try {
      const { data: updatedUser, error: updateError } = await supabase
        .from("UserRegistration")
        .update({ status })
        .eq("id", selectedUser.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const { error: progressError } = await supabase
        .from("RegistrationProgress")
        .insert([
          {
            registrationId: selectedUser.id,
            status,
            note: note || null,
          },
        ]);

      if (progressError) throw progressError;

      onUpdated?.(updatedUser);
      toast.success(
        `Status ${updatedUser.nama} berhasil diupdate ke ${updatedUser.status}`
      );
      setOpenSidebar(false);
    } catch (error: any) {
      console.error("Gagal update progress:", error.message);
      toast.error("Gagal memperbarui status");
    } finally {
      setSaving(false);
    }
  };

  // =================== RENDER ===================
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-800/40">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-4 sm:px-6 text-start dark:text-white">
                  Nama
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 sm:px-6 text-start dark:text-white">
                  No WA
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 sm:px-6 text-start dark:text-white">
                  Alamat
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 sm:px-6 text-start dark:text-white">
                  Paket
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 sm:px-6 text-start dark:text-white">
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 sm:px-6 text-start dark:text-white">
                  Aksi
                </TableCell>
              </TableRow>
            </TableHeader>

            {loading ? (
              <UserRegistrationSkeleton />
            ) : (
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data.length > 0 ? (
                  data.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <TableCell className="px-4 py-3 dark:text-white">
                        {user.nama}
                      </TableCell>
                      <TableCell className="px-4 py-3 dark:text-white">
                        {user.no_wa}
                      </TableCell>
                      <TableCell className="px-4 py-3 dark:text-white">
                        {user.alamat.length > 40
                          ? user.alamat.substring(0, 40) + "..."
                          : user.alamat}
                      </TableCell>
                      <TableCell className="px-4 py-3 dark:text-white">
                        {user.paket?.nama_paket || "-"}
                      </TableCell>
                      <TableCell className=" ">
                        <Badge
                          size="sm"
                          color={
                            user.status === "APPLIED"
                              ? "primary"
                              : user.status === "VERIFIED"
                              ? "success"
                              : user.status === "INSTALLATION"
                              ? "warning"
                              : user.status === "ACTIVE"
                              ? "info"
                              : user.status === "REJECTED"
                              ? "error"
                              : "dark"
                          }>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <ActionButton
                          onClick={() =>
                            navigate(`/registrasi-user/${user.id}`)
                          }
                          title="Detail"
                          color="brand">
                          <InformationCircleIcon className="w-6 h-6" />
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleOpenProgress(user)}
                          title="Update Progress"
                          color="orange">
                          <BarsArrowUpIcon className="w-6 h-6" />
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-gray-500 dark:text-gray-400">
                      Tidak ada user ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </div>
      </div>

      {/* Sidebar Update Progress */}
      <AnimatePresence>
        {openSidebar && (
          <div className="fixed inset-0 flex justify-end z-[5000]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpenSidebar(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
              className="relative w-96 bg-white dark:bg-gray-800 shadow-xl p-6 overflow-y-auto rounded-l-2xl">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">
                Update Progress — {selectedUser?.nama}
              </h2>

              <h3 className="font-semibold mb-2 dark:text-white">
                Riwayat Progress
              </h3>
              <div className="max-h-60 overflow-y-auto mb-4 pr-2 border rounded-lg p-3 dark:border-gray-700">
                {loadingProgress ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Memuat...
                  </p>
                ) : progresses.length > 0 ? (
                  <ul className="space-y-3">
                    {progresses.map((p) => {
                      // Tentukan warna berdasarkan status
                      const colorClass =
                        p.status === "APPLIED"
                          ? "bg-cyan-100 text-cyan-800 border-cyan-300"
                          : p.status === "VERIFIED"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : p.status === "INSTALLATION"
                          ? "bg-purple-100 text-purple-800 border-purple-300"
                          : p.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : p.status === "REJECTED"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : "bg-gray-100 text-gray-800 border-gray-300";

                      const formattedDate = p.createdAt
                        ? new Date(
                            p.createdAt.endsWith("Z")
                              ? p.createdAt
                              : `${p.createdAt}Z`
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "—";

                      return (
                        <li
                          key={p.id}
                          className={`border-l-4 ${colorClass} rounded-lg px-3 py-2 shadow-sm`}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{p.status}</span>
                            <span className="text-xs opacity-80">
                              {formattedDate}
                            </span>
                          </div>
                          {p.note && (
                            <div className="text-xs mt-1 italic opacity-90">
                              {p.note}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Belum ada progress
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <select
                  className="border p-2 rounded-lg dark:bg-gray-700 dark:text-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}>
                  <option value="APPLIED">Applied</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="INSTALLATION">Installation</option>
                  <option value="ACTIVE">Active</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <textarea
                  placeholder="Catatan..."
                  className="border p-2 rounded-lg dark:bg-gray-700 dark:text-white min-h-[80px]"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-gray-800 text-white dark:bg-gray-600"
                    onClick={() => setOpenSidebar(false)}>
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
