import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ShowUser() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();

        if (Array.isArray(data.data)) {
          const found = data.data.find((u: User) => u.id === Number(id));
          setUser(found || null);
        } else {
          setUser(data.data || null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  function formatTanggal(dateString: string) {
    const date = new Date(dateString);
    const tanggal = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const jam = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${tanggal} jam ${jam}`;
  }

  if (loading) return <p className="p-5 text-gray-500">Loading...</p>;
  if (!user) return <p className="p-5 text-red-500">User tidak ditemukan.</p>;

  return (
    <div className="max-w-full mx-auto p-6 space-y-6">
     

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-800 dark:bg-blue-700 border">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              {user.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Role: <strong>{user.role}</strong></p>
            <p className="text-sm text-gray-400">
              Akun Ini Terdaftar Sejak: <strong>{formatTanggal(user.createdAt)}</strong> 
            </p>
          </div>
        </div>
        <button className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <PencilIcon className="w-4 h-4" /> Edit
        </button>
      </div>

      {/* Personal Info Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 relative">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

        <button className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 border rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <PencilIcon className="w-4 h-4" /> Edit
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Email address</p>
            <p className="font-medium flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4" /> {user.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" /> {user.phone || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{user.address || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p
              className={`font-medium ${
                user.isActive ? "text-green-600" : "text-red-600"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Terakhir Update</p>
            <p className="font-medium">{formatTanggal(user.updatedAt)}</p>
          </div>
        </div>
      </div>
       <Link
        to="/users"
        className="text-sm text-blue-500 hover:underline dark:text-blue-400"
      >
        ← Kembali ke daftar
      </Link>
    </div>
  );
}
