// "use client";
// import React, { useState } from "react";
// import { FaSearch, FaUserCircle, FaPaperPlane } from "react-icons/fa";
// import { FiMoreHorizontal } from "react-icons/fi";
// import {mockUsers, mockMessages} from "../../../data/mockData";

// function Sidebar({ users, selectedUserId, onSelect }) {
//   return (
//     <aside className="w-72  border-r border-[#23272e] flex flex-col">
//       <div className="p-4">
//         <input
//           type="text"
//           placeholder="Search"
//           className="w-full px-4 py-2 rounded-lg bg-[#23272e] text-white placeholder-gray-400 focus:outline-none"
//         />
//       </div>
//       <div className="flex-1 overflow-y-auto">
//         <div className="px-4 text-gray-400 text-xs mb-2">Direct Messages</div>
//         {users.map((user) => (
//           <div
//             key={user.id}
//             className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer mb-1 ${
//               selectedUserId === user.id
//                 ? "bg-[#23272e] text-white"
//                 : "hover:bg-[#23272e] text-gray-300"
//             }`}
//             onClick={() => onSelect(user.id)}
//           >
//             <img
//               src={user.avatar}
//               alt={user.name}
//               className="w-9 h-9 rounded-full object-cover"
//             />
//             <span className="flex-1 truncate">{user.name}</span>
//             {user.active && (
//               <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//             )}
//           </div>
//         ))}
//       </div>
//     </aside>
//   );
// }

// function ChatHeader({ user }) {
//   return (
//     <div className="flex items-center px-8 py-6 border-b border-[#23272e]">
//       <img
//         src={user.avatar}
//         alt={user.name}
//         className="w-10 h-10 rounded-full object-cover mr-4"
//       />
//       <div>
//         <div className="font-semibold text-lg">{user.name}</div>
//       </div>
//       <div className="ml-auto">
//         <FiMoreHorizontal className="text-2xl text-gray-400 cursor-pointer" />
//       </div>
//     </div>
//   );
// }

// function ChatMessages({ messages }) {
//   return (
//     <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
//       {messages.map((msg) => (
//         <div
//           key={msg.id}
//           className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
//         >
//           {!msg.mine && (
//             <img
//               src={msg.avatar}
//               alt={msg.sender}
//               className="w-8 h-8 rounded-full object-cover mr-3 self-end"
//             />
//           )}
//           <div>
//             <div
//               className={`${
//                 msg.mine
//                   ? "bg-[#23272e] text-white rounded-xl rounded-br-none"
//                   : "bg-[#23272e] text-white rounded-xl rounded-bl-none"
//               } px-5 py-3 max-w-xs md:max-w-md break-words`}
//             >
//               {msg.text}
//             </div>
//             <div
//               className={`text-xs text-gray-400 mt-1 ${
//                 msg.mine ? "text-right" : "text-left"
//               }`}
//             >
//               {msg.time}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function ChatInput({ value, onChange, onSend }) {
//   return (
//     <form
//       className="flex items-center px-8 py-6 border-t border-[#23272e] bg-[#181b20]"
//       onSubmit={(e) => {
//         e.preventDefault();
//         onSend();
//       }}
//     >
//       <input
//         type="text"
//         placeholder="Type a message..."
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="flex-1 px-4 py-3 rounded-lg bg-[#23272e] text-white placeholder-gray-400 focus:outline-none"
//       />
//       <button
//         type="submit"
//         className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
//       >
//         <FaPaperPlane />
//         Send
//       </button>
//     </form>
//   );
// }

// export default function ChatPage() {
//   const [selectedUserId, setSelectedUserId] = useState(mockUsers[0].id);
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState(mockMessages);

//   const selectedUser = mockUsers.find((u) => u.id === selectedUserId);

//   const handleSend = () => {
//     if (!input.trim()) return;
//     setMessages([
//       ...messages,
//       {
//         id: messages.length + 1,
//         sender: "me",
//         text: input,
//         time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//         mine: true,
//       },
//     ]);
//     setInput("");
//   };

//   return (
//     <div className="h-screen bg-[#181b20] flex flex-col">
//       {/* Top Nav */}

//       {/* Main Content */}
//       <div className="flex flex-1 min-h-0">
//         <Sidebar
//           users={mockUsers}
//           selectedUserId={selectedUserId}
//           onSelect={setSelectedUserId}
//         />
//         <section className="flex-1 flex flex-col bg-[#181b20]">
//           <ChatHeader user={selectedUser} />
//           <ChatMessages messages={messages} />
//           <ChatInput value={input} onChange={setInput} onSend={handleSend} />
//         </section>
//       </div>
//     </div>
//   );
// }

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <h1 className="text-4xl font-bold">Chat Page Coming Soon</h1>
    </div>
  );
}
