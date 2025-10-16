import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useNavigate } from "react-router";
import ActionButton from "../ui/ActionButton";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isactive: boolean;
}

interface UserTableProps {
  data: User[];
  onDelete?: (id: string) => void;
  onToggle?: (id: string, newValue: boolean) => void;
  loading?: boolean;
}

// Skeleton untuk loading
function UserTableSkeleton() {
  return (
    <TableBody className="animate-pulse divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: 7 }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {[...Array(4)].map((_, colIndex) => (
            <TableCell key={colIndex} className="px-4 py-3">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            </TableCell>
          ))}
          <TableCell className="flex gap-2 px-4 py-3">
            <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export default function UserTable({
  data,
  // onDelete,
  loading,
  onToggle,
}: UserTableProps) {
  const navigate = useNavigate();

  // const handleDelete = (id: string) => {
  //   if (confirm("Yakin ingin menghapus user ini?")) {
  //     onDelete?.(id);
  //   }
  // };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white">
                Nama
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white">
                Email
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white">
                Role
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white">
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white">
                Aksi
              </TableCell>
            </TableRow>
          </TableHeader>

          {loading ? (
            <UserTableSkeleton />
          ) : (
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.length > 0 ? (
                data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-4 py-3 dark:text-white">
                      {user.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white">
                      {user.role}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.isactive}
                          onChange={(e) =>
                            onToggle?.(user.id, e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div
                          className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none 
        peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-800 
        rounded-full peer dark:bg-gray-700 
        peer-checked:after:translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
        after:bg-white after:border-gray-300 after:border after:rounded-full 
        after:h-5 after:w-5 after:transition-all 
        dark:border-gray-600 peer-checked:bg-blue-800 dark:peer-checked:bg-blue-600"></div>
                        <span
                          className={`ml-3 text-sm font-medium ${
                            user.isactive
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}>
                          {user.isactive ? "Aktif" : "Nonaktif"}
                        </span>
                      </label>
                    </TableCell>

                    <TableCell className="flex gap-1">
                      <ActionButton
                        onClick={() => navigate(`/users/${user.id}`)}
                        title="Detail"
                        color="brand">
                        Detail
                      </ActionButton>

                      {/* <ActionButton
                        onClick={() => navigate(`/users/edit/${user.id}`)}
                        title="Edit"
                        color="green">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </ActionButton>

                      <ActionButton
                        onClick={() => handleDelete(user.id)}
                        title="Hapus"
                        color="red">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </ActionButton> */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 dark:text-white">
                    User tidak ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}
