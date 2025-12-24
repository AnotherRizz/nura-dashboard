# 📊 Linea Dashboard

**Linea Dashboard** adalah aplikasi web **inventory & project monitoring** yang dirancang khusus untuk kebutuhan **ISP, NOC, dan Gudang Proyek**. Aplikasi ini membantu memantau stok perangkat, serial number, serta progres penggunaan barang pada proyek jaringan secara real-time.

---

## ✨ Fitur Utama

* 🔐 **Role & Akses Pengguna**

  * **Admin**: akses penuh sistem
  * **NOC**: monitoring device & inventory
  * **Gudang**: kelola stok dan serial number

* 📦 **Inventory Management**

  * Data barang (device jaringan, material proyek)
  * Stok real-time
  * Multi gudang

* 🏷️ **Serial Number Tracking**

  * Input & generate serial number
  * Status SN (Available, Used, Installed, Rusak)
  * Riwayat penggunaan device

* 🏗️ **Project Monitoring**

  * Penggunaan barang per proyek
  * Monitoring progres instalasi
  * Mengurangi selisih stok proyek

* 📄 **Laporan**

  * Laporan stok gudang
  * Laporan penggunaan barang proyek
  * Export PDF

---

## 🛠️ Teknologi

* **Frontend**: React + TypeScript + Tailwind CSS
* **Backend / Database**: Supabase (PostgreSQL)
* **Auth & API**: Supabase Auth & REST

---

## 🎯 Use Case

* Monitoring stok perangkat jaringan ISP
* Tracking serial number ONT, OLT, Router
* Kontrol distribusi barang ke proyek
* Membantu kerja tim NOC & Gudang
* Mendukung audit & laporan proyek

---

## 🚀 Development Setup (Singkat)

```bash
# install dependency
npm install

# jalankan aplikasi
npm run dev
```

---

## 👨‍💻 Developer

**Risqi Japana**
Web Developer

---

> 💡 *Linea Dashboard dibangun untuk operasional yang rapi, cepat, dan terkontrol dalam lingkungan ISP & project jaringan.*
