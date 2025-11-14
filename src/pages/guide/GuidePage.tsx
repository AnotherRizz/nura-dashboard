import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { BookOpenIcon, UserCircleIcon, WrenchIcon, ChartBarIcon, ClockIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export default function GuidePage() {
  return (
    <div>
      <PageMeta
        title="Panduan Penggunaan | TailAdmin"
        description="Panduan lengkap cara menggunakan aplikasi dashboard ini."
      />
      <PageBreadcrumb pageTitle="Panduan Penggunaan" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-8 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-10">
        <div className="max-w-4xl mx-auto space-y-10 text-gray-700 dark:text-gray-300">
          {/* Pendahuluan */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpenIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">1. Pendahuluan</h2>
            </div>
            <p>
              Selamat datang di <strong>Dashboard Monitoring Jaringan</strong>. 
              Aplikasi ini digunakan untuk memantau status perangkat jaringan (device), mencatat log koneksi, 
              serta menampilkan data statistik secara real-time.  
              Panduan ini membantu Anda memahami setiap fitur dan cara penggunaannya.
            </p>
          </section>

          {/* Login & Role */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <UserCircleIcon className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">2. Login & Hak Akses</h2>
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Buka halaman <code>/login</code> untuk masuk ke sistem.</li>
              <li>Gunakan email dan password yang telah terdaftar.</li>
              <li>Jika lupa password, gunakan menu <strong>Lupa Password</strong> untuk reset melalui email.</li>
              <li><strong>Role Pengguna:</strong>
                <ul className="list-disc list-inside pl-5 mt-1">
                  <li><strong>Admin</strong> — dapat mengelola seluruh data dan pengguna.</li>
                  <li><strong>Teknisi</strong> — dapat memantau perangkat dan mencatat log.</li>
                  <li><strong>Viewer</strong> — hanya dapat melihat data dan statistik.</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Navigasi */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <WrenchIcon className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">3. Navigasi & Menu Utama</h2>
            </div>
            <table className="w-full border border-gray-200 dark:border-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800/50">
                <tr>
                  <th className="border px-3 py-2 text-left">Menu</th>
                  <th className="border px-3 py-2 text-left">Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2">Dashboard</td>
                  <td className="border px-3 py-2">Menampilkan ringkasan status perangkat dan statistik.</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Device</td>
                  <td className="border px-3 py-2">Daftar perangkat jaringan dan detail statusnya.</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Log</td>
                  <td className="border px-3 py-2">Riwayat aktivitas dan status perangkat.</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Realtime</td>
                  <td className="border px-3 py-2">Pemantauan perangkat secara langsung.</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">Settings</td>
                  <td className="border px-3 py-2">Pengaturan profil dan preferensi sistem.</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Detail Device */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">4. Detail Device & Statistik</h2>
            </div>
            <p>
              Klik nama perangkat untuk membuka halaman detail. Di sana Anda dapat melihat:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Informasi umum perangkat (nama, IP, interface)</li>
              <li>Status koneksi (online, offline, solved)</li>
              <li>Grafik statistik uptime/downtime</li>
              <li>Riwayat log dalam bentuk timeline</li>
            </ul>
          </section>

          {/* Log Timeline */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">5. Membaca Log & Timeline</h2>
            </div>
            <p>Warna status membantu Anda mengenali kondisi perangkat:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><span className="text-green-500 font-semibold">Hijau</span> — Perangkat Online</li>
              <li><span className="text-red-500 font-semibold">Merah</span> — Perangkat Offline</li>
              <li><span className="text-blue-500 font-semibold">Biru</span> — Masalah telah diselesaikan</li>
            </ul>
          </section>

          {/* Tips */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">6. Tips & Troubleshooting</h2>
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li> <strong>Data tidak muncul?</strong> Coba refresh halaman atau pastikan koneksi stabil.</li>
              <li> <strong>Gagal login?</strong> Gunakan fitur "Lupa Password" untuk reset.</li>
              <li> <strong>Status tidak update?</strong> Pastikan perangkat dan koneksi API berjalan normal.</li>
            </ul>
          </section>

          {/* Footer Info */}
          <div className="pt-10 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
            © {new Date().getFullYear()} - Panduan Penggunaan Sistem Monitoring Jaringan
          </div>
        </div>
      </div>
    </div>
  );
}
