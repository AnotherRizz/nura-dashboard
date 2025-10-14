import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import UserRegistrationForm from "../../components/form/UserRegistrationForm";

export default function UserRegistrationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/userRegistration?id=${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Gagal fetch user registration");
          return res.json();
        })
        .then((data) => {
          setInitialData({
            nama: data.nama || "",
            no_wa: data.no_wa || "",
            alamat: data.alamat || "",
            detailAlamat: data.detailAlamat || "",
            paketId: data.paketId?.toString() || "",
            foto_ktp: data.foto_ktp || "",
            latitude: data.latitude?.toString() || "",
            longitude: data.longitude?.toString() || "",
          });
        })
        .catch(() => alert("Gagal memuat data registrasi"));
    }
  }, [id]);

  const handleSubmit = async (values: any) => {
    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `/api/userRegistration/${id}`
        : "/api/userRegistration";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Gagal menyimpan registrasi");

      navigate("/registrasi-user");
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan registrasi");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-brand-900">
        {id ? "Edit Registrasi User" : "Tambah Registrasi User"}
      </h2>
      <UserRegistrationForm
        initialValues={initialData || undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/registrasi-user")}
      />
    </div>
  );
}
