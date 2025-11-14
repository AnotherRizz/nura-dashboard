import {
  EyeIcon,
  EyeSlashIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../services/supabaseClient";

interface Area {
  id: string;
  nama_area: string;
}

interface InterfaceData {
  name: string;
  type: string;
  mac: string;
  status: string;
  comment: string;
}

interface DeviceFormData {
  nama: string;
  no_sn: string;
  ip: string;
  portApi: string;
  username: string;
  password: string;
  status: string;
  areaId: string;
  interfaces: InterfaceData[];
}

interface DeviceFormProps {
  initialValues?: Partial<DeviceFormData>;
  onSubmit: (formData: DeviceFormData) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export default function DeviceForm({
  initialValues,
  onSubmit,
  onCancel,
}: DeviceFormProps) {
  const [formData, setFormData] = useState<DeviceFormData>({
    nama: "",
    no_sn: "",
    ip: "",
    portApi: "8728",
    username: "",
    password: "",
    status: "nonaktif",
    areaId: "",
    interfaces: [
      { name: "", type: "ether", mac: "", status: "nonaktif", comment: "" },
    ],
    ...initialValues,
  });

  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialValues)
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
        interfaces: initialValues.interfaces?.length
          ? initialValues.interfaces.map((i) => ({
              name: i.name || "",
              type: i.type || "ether",
              mac: i.mac || "",
              status: i.status || "nonaktif",
              comment: i.comment || "",
            }))
          : [
              {
                name: "",
                type: "ether",
                mac: "",
                status: "nonaktif",
                comment: "",
              },
            ],
      }));
  }, [initialValues]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const { data, error } = await supabase
          .from("Area")
          .select("id, nama_area")
          .order("nama_area", { ascending: true });
        if (error) throw error;
        setAreas(data || []);
      } catch (err) {
        console.error("Gagal memuat area:", err);
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchAreas();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterfaceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...formData.interfaces];
    updated[index][field as keyof InterfaceData] = value;
    setFormData((prev) => ({ ...prev, interfaces: updated }));
  };

  const addInterface = () =>
    setFormData((prev) => ({
      ...prev,
      interfaces: [
        ...prev.interfaces,
        { name: "", type: "ether", mac: "", status: "aktif", comment: "" },
      ],
    }));

  const removeInterface = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      interfaces: prev.interfaces.filter((_, i) => i !== index),
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.no_sn || !formData.areaId) {
      return alert("Nama, Nomor Seri, dan Area wajib diisi");
    }
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100  pb-2">
        Form Data Device
      </h2>

      {/* GRID INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Nama Device"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          placeholder="Masukkan nama device"
        />
        <FormInput
          label="Nomor Seri"
          name="no_sn"
          value={formData.no_sn}
          onChange={handleChange}
          placeholder="Masukkan nomor seri"
        />
        <FormInput
          label="IP Address"
          name="ip"
          value={formData.ip}
          onChange={handleChange}
          placeholder="192.168.88.1"
        />
        <FormInput
          label="Port API"
          name="portApi"
          value={formData.portApi}
          onChange={handleChange}
          type="number"
          placeholder="8728"
        />
        <FormInput
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="admin"
        />

        {/* PASSWORD */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 pr-10 text-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
              {showPassword ? (
                <EyeIcon className="h-5 w-5" />
              ) : (
                <EyeSlashIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* STATUS */}
        <SelectInput
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { label: "Aktif", value: "aktif" },
            { label: "Nonaktif", value: "nonaktif" },
          ]}
        />

        {/* AREA */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Area
          </label>
          {loadingAreas ? (
            <p className="text-gray-500 text-sm">Memuat area...</p>
          ) : (
            <select
              name="areaId"
              value={formData.areaId}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="">-- Pilih Area --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama_area}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* INTERFACE */}
      <div className="mt-8 border-t border-gray-300 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            Device Interfaces
          </h3>
          <button
            type="button"
            onClick={addInterface}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
            <PlusCircleIcon className="h-5 w-5" /> Tambah Interface
          </button>
        </div>

        {formData.interfaces.map((iface, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-900">
            {/* Nama Interface */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Interface
              </label>
              <input
                type="text"
                placeholder="Contoh: ether1"
                value={iface.name}
                onChange={(e) =>
                  handleInterfaceChange(index, "name", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={iface.status}
                onChange={(e) =>
                  handleInterfaceChange(index, "status", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm">
                <option value="nonaktif">Nonaktif</option>
                <option value="aktif">Aktif</option>
              </select>
            </div>

            {/* Komentar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Komentar
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Komentar"
                  value={iface.comment}
                  onChange={(e) =>
                    handleInterfaceChange(index, "comment", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm"
                />
                {formData.interfaces.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInterface(index)}
                    className="text-red-500 hover:text-red-700">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-red-500 px-4 py-2 text-white text-sm font-medium hover:bg-red-600">
          Batal
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700">
          Simpan
        </button>
      </div>
    </form>
  );
}

function FormInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}

function SelectInput({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        {...props}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
