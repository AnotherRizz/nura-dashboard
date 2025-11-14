import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserMetaCard() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  // state form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(" ") || [];
      setFirstName(nameParts[0] || "");
      setLastName(nameParts[1] || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async (e : any) => {
    e.preventDefault();
    const fullName = `${firstName} ${lastName}`.trim();

    const { error } = await supabase.auth.updateUser({
      email,
      data: {
        full_name: fullName,
        phone,
        bio,
      },
    });

    if (error) {
      console.error("Update error:", error);
      alert("Gagal update profile!");
      return;
    }

    alert("Profile berhasil diperbarui!");
    setIsEditing(false);
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* Foto dan info */}
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img src="/images/user/profile.png" alt="user" />
          </div>
          <div className="order-3 xl:order-2 w-full">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" type="submit">
                    Save
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                  {`${firstName} ${lastName}` || "Guest"}
                </h4>
                <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {bio || "No bio yet"}
                  </p>
                  <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {phone || "No phone"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 lg:w-auto"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
