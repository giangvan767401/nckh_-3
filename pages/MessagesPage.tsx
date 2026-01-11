
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Plus, 
  FileText, 
  Smile, 
  ArrowLeft, 
  Filter,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle
} from 'lucide-react';

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const chats = [
    { id: 1, name: 'Sarah Drasner', status: 'Active', priority: 'High', lastMessage: 'Review requested for Module 4', time: '14:20', unread: 1, type: 'Instructor' },
    { id: 2, name: 'UI Group #402', status: 'Pending', priority: 'Medium', lastMessage: 'Final project submission', time: '12:05', unread: 0, type: 'Group' },
    { id: 3, name: 'System Support', status: 'Resolved', priority: 'Low', lastMessage: 'Ticket #882 has been closed', time: 'Yesterday', unread: 0, type: 'Admin' },
  ];

  const templates = [
    "Confirmed. I will review this shortly.",
    "Please provide the student ID for tracking.",
    "System maintenance scheduled for 12:00 UTC."
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Workspace
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inboxes: 3</span>
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex-1 flex">
        {/* Admin Sidebar */}
        <aside className="w-96 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-6 bg-white border-b border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-black text-slate-900">Communication Center</h1>
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search IDs, names, or keywords..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          
          <div className="p-3 flex gap-2 border-b border-slate-100 overflow-x-auto">
             <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-1 hover:border-blue-300">
               <Filter className="w-3 h-3" /> Unresolved
             </button>
             <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-1 hover:border-blue-300">
               <AlertCircle className="w-3 h-3 text-orange-500" /> High Priority
             </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.map((chat, idx) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(idx)}
                className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-white flex gap-3 ${selectedChat === idx ? 'bg-white shadow-inner border-r-4 border-r-blue-600' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${chat.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                  {chat.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-xs truncate text-slate-900">{chat.name}</h3>
                    <span className="text-[9px] text-slate-400 font-mono">{chat.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mb-1">{chat.lastMessage}</p>
                  <div className="flex gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase">{chat.type}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${chat.status === 'Resolved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {chat.status}
                    </span>
                  </div>
                </div>
                {chat.unread > 0 && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full self-center ring-4 ring-blue-50"></div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Message Viewport */}
        <main className="flex-1 flex flex-col bg-white">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                {chats[selectedChat].name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-slate-900">{chats[selectedChat].name}</h2>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono"><Clock className="w-3 h-3" /> Response Time: &lt;10m</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified Admin</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-500">
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-500">
                <Archive className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-500">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation History */}
          <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-50/20">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-300 tracking-[0.2em] bg-white border border-slate-100 px-4 py-1 rounded-full shadow-sm uppercase">Secure Channel Established</span>
            </div>
            
            <div className="flex gap-4 max-w-[70%]">
              <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0 self-end"></div>
              <div className="bg-white p-5 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm relative group">
                <p className="text-xs text-slate-700 leading-relaxed">System ID: {Math.random().toString(36).substr(2, 6).toUpperCase()} <br /><br />
                Instructor requested a review of the latest performance logs. Student 9942 shows high risk levels in Module 4. Please investigate deployment logs.</p>
                <span className="text-[9px] text-slate-400 mt-3 block font-mono">14:20:05 UTC</span>
              </div>
            </div>

            <div className="flex gap-4 max-w-[70%] ml-auto flex-row-reverse">
              <div className="w-8 h-8 rounded-lg bg-blue-600 shrink-0 self-end"></div>
              <div className="bg-blue-600 p-5 rounded-2xl rounded-br-none text-white shadow-xl shadow-blue-100 relative">
                <p className="text-xs leading-relaxed">Copy that. Running inference on the custom .pth model now. Will report back within the hour with the full failure-rate prediction report.</p>
                <span className="text-[9px] text-blue-200 mt-3 block text-right font-mono">14:25:31 UTC</span>
              </div>
            </div>
          </div>

          {/* Administrative Reply Block */}
          <div className="p-6 bg-white border-t border-slate-100 space-y-4">
            <div className="flex gap-2">
              {templates.map(t => (
                <button 
                  key={t}
                  onClick={() => setMessage(t)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 pl-2">
                <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose administrative response..." 
                className="flex-1 bg-transparent py-3 text-xs outline-none text-slate-700"
              />
              <div className="flex items-center gap-2 pr-1">
                <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 transition-all">
                  <Smile className="w-4 h-4" />
                </button>
                <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-xs font-bold flex items-center gap-2">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;
