"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getThemeColors, type Theme } from "@/lib/theme-utils";

type UserRole = "teacher" | "student" | "parent" | "coordinator";

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isRead: boolean;
};

type GroupInvite = {
  id: string;
  groupId: string;
  groupName: string;
  inviterId: string;
  inviterName: string;
  inviterRole: UserRole;
  status: "pending" | "accepted" | "declined";
  timestamp: string;
};

type Group = {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  members: {
    id: string;
    name: string;
    role: UserRole;
  }[];
  messages: Message[];
  pendingInvites: GroupInvite[];
  createdAt: string;
};

type MessagingSystemProps = {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: UserRole;
  theme?: Theme;
};

export function MessagingSystem({
  currentUserId,
  currentUserName,
  currentUserRole,
  theme = "dark",
}: MessagingSystemProps) {
  const themeColors = getThemeColors(theme);
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "g-1",
      name: "Grade 11 Physics Support",
      description: "Parent-Coordinator group for Grade 11 Physics student progress updates",
      creatorId: "c-1",
      creatorName: "Dr. Alistair Vance",
      creatorRole: "coordinator",
      members: [
        { id: "c-1", name: "Dr. Alistair Vance", role: "coordinator" },
        { id: "p-1", name: "Sarah Johnson (Parent)", role: "parent" },
        { id: "t-1", name: "Mr. Michael Chen (Teacher)", role: "teacher" },
      ],
      messages: [
        {
          id: "m-1",
          senderId: "c-1",
          senderName: "Dr. Alistair Vance",
          senderRole: "coordinator",
          content: "Welcome to the Grade 11 Physics support group. We'll use this channel to share updates on student progress and coordinate any additional support needed.",
          timestamp: "2026-06-01T09:00:00Z",
          isRead: true,
        },
        {
          id: "m-2",
          senderId: "p-1",
          senderName: "Sarah Johnson (Parent)",
          senderRole: "parent",
          content: "Thank you for setting this up. I appreciate being kept in the loop about my child's progress.",
          timestamp: "2026-06-01T09:30:00Z",
          isRead: true,
        },
      ],
      pendingInvites: [],
      createdAt: "2026-06-01T08:00:00Z",
    },
    {
      id: "g-2",
      name: "Student Council Planning",
      description: "Group for student council members to plan events and initiatives",
      creatorId: "s-1",
      creatorName: "Emma Wilson",
      creatorRole: "student",
      members: [
        { id: "s-1", name: "Emma Wilson", role: "student" },
        { id: "s-2", name: "James Rodriguez", role: "student" },
        { id: "t-2", name: "Ms. Lisa Park (Teacher)", role: "teacher" },
      ],
      messages: [
        {
          id: "m-3",
          senderId: "s-1",
          senderName: "Emma Wilson",
          senderRole: "student",
          content: "Hey everyone! Let's start planning the spring fundraiser. I've sent invites to a few more teachers who might be interested in helping.",
          timestamp: "2026-06-01T10:00:00Z",
          isRead: true,
        },
      ],
      pendingInvites: [
        {
          id: "inv-1",
          groupId: "g-2",
          groupName: "Student Council Planning",
          inviterId: "s-1",
          inviterName: "Emma Wilson",
          inviterRole: "student",
          status: "pending",
          timestamp: "2026-06-01T10:05:00Z",
        },
      ],
      createdAt: "2026-06-01T09:00:00Z",
    },
  ]);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const cardStyle = themeColors.panelBg;

  const userGroups = groups.filter((g) =>
    g.members.some((m) => m.id === currentUserId)
  );

  const userPendingInvites = groups
    .flatMap((g) => g.pendingInvites)
    .filter((inv) => inv.inviterId !== currentUserId && inv.status === "pending");

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGroup) return;

    const message: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroup.id
          ? { ...g, messages: [...g.messages, message] }
          : g
      )
    );
    setNewMessage("");
  };

  const handleCreateGroup = (name: string, description: string) => {
    const newGroup: Group = {
      id: `g-${Date.now()}`,
      name,
      description,
      creatorId: currentUserId,
      creatorName: currentUserName,
      creatorRole: currentUserRole,
      members: [{ id: currentUserId, name: currentUserName, role: currentUserRole }],
      messages: [],
      pendingInvites: [],
      createdAt: new Date().toISOString(),
    };

    setGroups((prev) => [...prev, newGroup]);
    setShowCreateGroupModal(false);
  };

  const handleSendInvite = (groupId: string) => {
    const invite: GroupInvite = {
      id: `inv-${Date.now()}`,
      groupId,
      groupName: groups.find((g) => g.id === groupId)?.name || "",
      inviterId: currentUserId,
      inviterName: currentUserName,
      inviterRole: currentUserRole,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, pendingInvites: [...g.pendingInvites, invite] }
          : g
      )
    );
    setShowInviteModal(false);
  };

  const handleAcceptInvite = (invite: GroupInvite) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === invite.groupId) {
          const updatedInvites = g.pendingInvites.map((inv) =>
            inv.id === invite.id ? { ...inv, status: "accepted" as GroupInvite["status"] } : inv
          );
          const newMember = {
            id: currentUserId,
            name: currentUserName,
            role: currentUserRole,
          };
          return {
            ...g,
            members: [...g.members, newMember],
            pendingInvites: updatedInvites,
          };
        }
        return g;
      })
    );
  };

  const handleDeclineInvite = (invite: GroupInvite) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === invite.groupId) {
          const updatedInvites = g.pendingInvites.map((inv) =>
            inv.id === invite.id ? { ...inv, status: "declined" as GroupInvite["status"] } : inv
          );
          return { ...g, pendingInvites: updatedInvites };
        }
        return g;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
              Messaging
            </span>
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-medium text-emerald-400">Connected</span>
          </div>
          <h3 className={`text-xl font-medium tracking-tight mt-1 ${themeColors.textPrimary}`}>Messages & Groups</h3>
          <p className={`text-xs mt-1 ${themeColors.textMuted}`}>Communicate with groups and manage invites</p>
        </div>

        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Group
        </button>
      </div>

      {/* Pending Invites Section */}
      {userPendingInvites.length > 0 && (
        <div className={`rounded-2xl border p-4 ${cardStyle}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              Pending Invites
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-bold">
              {userPendingInvites.length}
            </span>
          </div>

          <div className="space-y-2">
            {userPendingInvites.map((invite) => (
              <div
                key={invite.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${theme === "light" ? "bg-black/[0.02] border-black/[0.04]" : "bg-white/[0.02] border-white/[0.04]"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-sm">
                    {invite.inviterName.charAt(0)}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${themeColors.textPrimary}`}>{invite.groupName}</p>
                    <p className={`text-[10px] ${themeColors.textMuted}`}>
                      Invite from {invite.inviterName} ({invite.inviterRole})
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptInvite(invite)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(invite)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-semibold text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {userGroups.map((group) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl border p-5 cursor-pointer transition-all hover:border-white/[0.12] ${cardStyle}`}
              onClick={() => setSelectedGroup(group)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className={`text-sm font-semibold ${themeColors.textPrimary}`}>{group.name}</h4>
                  <p className={`text-[10px] ${themeColors.textMuted}`}>{group.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[8px] font-bold">
                  {group.members.length} members
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className={`size-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${theme === "light" ? "bg-black/10 border-white text-black/80" : "bg-white/10 border-[#0C0C0E] text-white/80"}`}
                      title={member.name}
                    >
                      {member.name.charAt(0)}
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <div className={`size-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${theme === "light" ? "bg-black/5 border-white text-black/40" : "bg-white/5 border-[#0C0C0E] text-white/40"}`}>
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>

                <span className={`text-[9px] ${themeColors.textMuted}`}>
                  {group.messages.length} messages
                </span>
              </div>

              {group.creatorId === currentUserId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInviteModal(true);
                  }}
                  className={`mt-3 w-full px-3 py-2 rounded-lg border text-[10px] font-semibold transition-all ${theme === "light" ? "bg-black/[0.02] border-black/[0.06] text-black/60 hover:bg-black/[0.05]" : "bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05]"}`}
                >
                  Send Invite
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Group Chat Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-3xl h-[600px] rounded-2xl border flex flex-col shadow-[0_16px_48px_rgba(0,0,0,0.8)] ${theme === "light" ? "border-black/[0.08] bg-white" : "border-white/[0.08] bg-[#0E0E10]"}`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-4 border-b ${theme === "light" ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                <div>
                  <h3 className={`text-lg font-bold ${themeColors.textPrimary}`}>{selectedGroup.name}</h3>
                  <p className={`text-xs ${themeColors.textMuted}`}>{selectedGroup.members.length} members</p>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className={`transition-colors ${theme === "light" ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white"}`}
                >
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedGroup.messages.map((message) => {
                  const isOwn = message.senderId === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] border rounded-xl p-3 ${isOwn ? "bg-cyan-500/10 border-cyan-500/20" : theme === "light" ? "bg-black/[0.02] border-black/[0.06]" : "bg-white/[0.02] border-white/[0.06]"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold ${theme === "light" ? "text-black/80" : "text-white/80"}`}>
                            {message.senderName}
                          </span>
                          <span className={`text-[8px] ${theme === "light" ? "text-black/30" : "text-white/30"}`}>
                            {message.senderRole}
                          </span>
                        </div>
                        <p className={`text-xs ${theme === "light" ? "text-black/90" : "text-white/90"}`}>{message.content}</p>
                        <span className={`text-[8px] mt-1 block ${theme === "light" ? "text-black/30" : "text-white/30"}`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className={`p-4 border-t ${theme === "light" ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    placeholder="Type a message..."
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-xs focus:border-cyan-500/50 focus:outline-none ${themeColors.inputBg}`}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2.5 rounded-lg bg-cyan-500 text-[11px] font-bold text-black hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-[0_16px_48px_rgba(0,0,0,0.8)] ${theme === "light" ? "border-black/[0.08] bg-white" : "border-white/[0.08] bg-[#0E0E10]"}`}
            >
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className={`absolute top-4 right-4 transition-colors ${theme === "light" ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white"}`}
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-bold ${themeColors.textPrimary}`}>Create New Group</h3>
                  <p className={`text-sm mt-1 ${themeColors.textSecondary}`}>
                    Create a group and send invites to members
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = form.elements.namedItem("groupName") as HTMLInputElement;
                    const description = form.elements.namedItem("groupDescription") as HTMLTextAreaElement;
                    handleCreateGroup(name.value, description.value);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className={`text-[9px] uppercase tracking-wider ${themeColors.textMuted}`}>
                      Group Name
                    </label>
                    <input
                      name="groupName"
                      type="text"
                      placeholder="Enter group name"
                      required
                      className={`w-full rounded-lg border px-3 py-2 text-xs focus:border-cyan-500/50 focus:outline-none ${themeColors.inputBg}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9px] uppercase tracking-wider ${themeColors.textMuted}`}>
                      Description
                    </label>
                    <textarea
                      name="groupDescription"
                      placeholder="Enter group description"
                      rows={3}
                      required
                      className={`w-full rounded-lg border px-3 py-2 text-xs focus:border-cyan-500/50 focus:outline-none resize-none ${themeColors.inputBg}`}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[10px] text-amber-400">
                      <strong>Note:</strong> As the group creator, you can send invites to others. Members must accept invites before joining.
                    </p>
                  </div>

                  <div className={`flex gap-3 pt-4 border-t ${theme === "light" ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                    <button
                      type="button"
                      onClick={() => setShowCreateGroupModal(false)}
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-[11px] font-semibold transition-all ${theme === "light" ? "border-black/[0.08] text-black/80 hover:bg-black/[0.02]" : "border-white/[0.08] text-white/80 hover:bg-white/[0.02]"}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500 text-[11px] font-bold text-black hover:bg-cyan-400 transition-all"
                    >
                      Create Group
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send Invite Modal */}
      <AnimatePresence>
        {showInviteModal && selectedGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-[0_16px_48px_rgba(0,0,0,0.8)] ${theme === "light" ? "border-black/[0.08] bg-white" : "border-white/[0.08] bg-[#0E0E10]"}`}
            >
              <button
                onClick={() => setShowInviteModal(false)}
                className={`absolute top-4 right-4 transition-colors ${theme === "light" ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white"}`}
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-bold ${themeColors.textPrimary}`}>Send Group Invite</h3>
                  <p className={`text-sm mt-1 ${themeColors.textSecondary}`}>
                    Invite someone to join &quot;{selectedGroup.name}&quot;
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendInvite(selectedGroup.id);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className={`text-[9px] uppercase tracking-wider ${themeColors.textMuted}`}>
                      Recipient Name
                    </label>
                    <input
                      name="recipientName"
                      type="text"
                      placeholder="Enter recipient's name"
                      required
                      className={`w-full rounded-lg border px-3 py-2 text-xs focus:border-cyan-500/50 focus:outline-none ${themeColors.inputBg}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9px] uppercase tracking-wider ${themeColors.textMuted}`}>
                      Recipient Role
                    </label>
                    <select
                      name="recipientRole"
                      required
                      className={`w-full rounded-lg border px-3 py-2 text-xs focus:border-cyan-500/50 focus:outline-none ${themeColors.inputBg}`}
                    >
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="coordinator">Coordinator</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[10px] text-emerald-400">
                      <strong>Invite System:</strong> The recipient will receive a pending invite and must accept it before joining the group. No random additions allowed.
                    </p>
                  </div>

                  <div className={`flex gap-3 pt-4 border-t ${theme === "light" ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-[11px] font-semibold transition-all ${theme === "light" ? "border-black/[0.08] text-black/80 hover:bg-black/[0.02]" : "border-white/[0.08] text-white/80 hover:bg-white/[0.02]"}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500 text-[11px] font-bold text-black hover:bg-cyan-400 transition-all"
                    >
                      Send Invite
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
