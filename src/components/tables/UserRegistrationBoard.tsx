import { UserRegistration } from "../../types/UserRegistration";
interface Props {
  data: UserRegistration[];
  onUpdateStatus?: (user: UserRegistration, newStatus: string) => void;
}

export default function UserRegistrationBoard({ data, onUpdateStatus }: Props) {
  const grouped = {
    APPLIED: data.filter((u) => u.status === "APPLIED"),
    VERIFIED: data.filter((u) => u.status === "VERIFIED"),
    INSTALLATION: data.filter((u) => u.status === "INSTALLATION"),
    ACTIVE: data.filter((u) => u.status === "ACTIVE"),
    REJECTED: data.filter((u) => u.status === "REJECTED"),
  };

  const statusTitles: Record<string, string> = {
    APPLIED: "Applied",
    VERIFIED: "Verified",
    INSTALLATION: "Installation",
    ACTIVE: "Active",
    REJECTED: "Rejected",
  };

  const statusColors: Record<string, string> = {
    APPLIED: "bg-yellow-600",
    VERIFIED: "bg-blue-600",
    INSTALLATION: "bg-purple-600",
    ACTIVE: "bg-green-600",
    REJECTED: "bg-red-600",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(grouped).map(([status, users]) => (
        <div key={status} className="bg-gray-900 rounded-2xl p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">
              {statusTitles[status]}{" "}
              <span className="text-sm text-gray-400">({users.length})</span>
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className="bg-gray-800 rounded-xl p-4 shadow-sm text-white"
                >
                  <h4 className="font-semibold">{user.nama}</h4>
                  <p className="text-sm text-gray-300">{user.no_wa}</p>
                  <p className="text-xs text-gray-400 mb-2">
                    {user.alamat.length > 40
                      ? user.alamat.substring(0, 40) + "..."
                      : user.alamat}
                  </p>

                  <div className="mt-2 flex justify-between items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${statusColors[status]}`}
                    >
                      {user.paket?.nama_paket || "No Paket"}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateStatus?.(user, getNextStatus(status))
                      }
                      className="text-xs px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Belum ada user</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// fungsi helper untuk next status
function getNextStatus(current: string): string {
  switch (current) {
    case "APPLIED":
      return "VERIFIED";
    case "VERIFIED":
      return "INSTALLATION";
    case "INSTALLATION":
      return "ACTIVE";
    default:
      return "ACTIVE";
  }
}
