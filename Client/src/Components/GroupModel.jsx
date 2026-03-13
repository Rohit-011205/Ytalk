import React from "react";
import { useEffect, useState } from "react";
import { useGroupStore } from "../Store/useGroupStore";
import GroupSettingsModal from "./GroupSettingModal";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");

  const {
    allUsers,
    selectedMembers,
    fetchAllUsers,
    toggleMember,
    createGroup,
    clearSelectedMembers,
    isLoading,
  } = useGroupStore();

  useEffect(() => {
    if (isOpen) {
      fetchAllUsers();
    }
  }, [isOpen, fetchAllUsers]);

  const filteredUsers = allUsers.filter((u) =>
    u.Fullname.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    if (selectedMembers.length < 2) {
      alert("Select at least 2 members");
      return;
    }

    try {
      await createGroup({
        name: groupName,
        description,
        members: selectedMembers,
      });

      setGroupName("");
      setDescription("");
      setSearch("");
      clearSelectedMembers();
      onClose();
    } catch (err) {
      console.error("Create group failed", err);
      alert("Failed to create group");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0A0510] w-full max-w-md rounded-xl border border-purple-900/30 p-5">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-purple-100 font-semibold text-lg">
            Create Group
          </h2>
          <button onClick={onClose} className="text-purple-400 hover:text-purple-200">
            ✕
          </button>
        </div>

        {/* INPUTS */}
        <input
          className="w-full bg-black/40 border border-purple-900/40 text-purple-100 p-2 rounded mb-2 outline-none"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <input
          className="w-full bg-black/40 border border-purple-900/40 text-purple-100 p-2 rounded mb-3 outline-none"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="w-full bg-black/40 border border-purple-900/40 text-purple-100 p-2 rounded mb-3 outline-none"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* USERS LIST */}
        <div className="max-h-56 overflow-y-auto space-y-1">
          {filteredUsers.map((user) => (
            <label
              key={user._id}
              className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.profilePic ||
                    `https://ui-avatars.com/api/?name=${user.Fullname}`
                  }
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-purple-100">
                  {user.Fullname}
                </span>
              </div>

              <input
                type="checkbox"
                checked={selectedMembers.includes(user._id)}
                onChange={() => toggleMember(user._id)}
                className="accent-purple-500"
              />
            </label>
          ))}
        </div>

        {/* ACTION */}
        <button
          disabled={isLoading || !groupName || selectedMembers.length < 2}
          onClick={handleCreate}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Group"}
        </button>
      </div>
    </div>
  );
};

export default CreateGroupModal;
