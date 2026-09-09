import { useState, useEffect, useCallback, useRef } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { createAuthenticatedSocket, getChatSessions } from '../../api/chatApi';

let socket;

export default function AdminChat() {
  const token = localStorage.getItem('token');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const fetchSessions = useCallback(async () => {
    try {
      setSessions(await getChatSessions());
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => void fetchSessions(), 0);

      socket = createAuthenticatedSocket();
      socket.emit('join_admin');

      socket.on('new_admin_message', ({ userId, message }) => {
        setSessions((prevSessions) => {
          let updatedSessions = [...prevSessions];
          let sessionIndex = updatedSessions.findIndex(s => s.user._id === userId);
          
          if (sessionIndex > -1) {
            updatedSessions[sessionIndex].messages.push(message);
            updatedSessions[sessionIndex].lastUpdated = new Date().toISOString();
            updatedSessions.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
          } else {
            void fetchSessions();
          }
          return updatedSessions;
        });

        setActiveSession((prevActive) => {
          if (prevActive && prevActive.user._id === userId) {
            return {
              ...prevActive,
              messages: [...prevActive.messages, message],
              lastUpdated: new Date().toISOString()
            };
          }
          return prevActive;
        });
      });

      return () => {
        clearTimeout(timer);
        socket.disconnect();
      };
    }
  }, [token, fetchSessions]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;

    socket.emit('admin_reply', { userId: activeSession.user._id, text: input });
    setInput('');
  };

  return (
    <div className="max-w-6xl mx-auto flex h-[calc(100vh-12rem)] bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-800 animate-fade-in mt-8 relative z-10">
      
      {/* Sidebar: Chat List */}
      <div className="w-1/3 border-r border-gray-800 bg-gray-900/60 backdrop-blur-md flex flex-col">
        <div className="p-6 border-b border-gray-800 bg-gray-900/80">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-green-500" />
            Active Support
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">
              No active chat sessions right now.
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session._id}
                onClick={() => setActiveSession(session)}
                className={`w-full text-left p-5 hover:bg-gray-800/50 transition-colors flex flex-col gap-1.5 relative
                  ${activeSession?._id === session._id ? 'bg-gray-800/80' : ''}`}
              >
                {activeSession?._id === session._id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                )}
                <div className="font-bold text-gray-200 flex items-center gap-2">
                  <User className={`w-4 h-4 ${activeSession?._id === session._id ? 'text-green-400' : 'text-gray-500'}`} />
                  {session.user.name}
                </div>
                <div className="text-sm text-gray-400 truncate pl-6 font-medium">
                  {session.messages.length > 0 
                    ? session.messages[session.messages.length - 1].text 
                    : 'Started a chat'}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-950 relative">
        {activeSession ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-800 bg-gray-900/80 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
              <div>
                <h3 className="text-lg font-bold text-gray-200">Chatting with <span className="text-green-400">{activeSession.user.name}</span></h3>
                <p className="text-sm text-gray-500 font-medium">{activeSession.user.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-950">
              {activeSession.messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.sender === 'admin' 
                        ? 'bg-green-600 text-black rounded-tr-sm shadow-[0_4px_15px_rgba(34,197,94,0.2)]' 
                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={sendMessage} className="p-5 bg-gray-900/80 border-t border-gray-800 flex gap-4 backdrop-blur-md">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your reply to the customer..."
                className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-6 py-3.5 text-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-green-500 text-black px-8 py-3.5 rounded-xl font-bold hover:bg-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Reply
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-5">
            <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
              <MessageSquare className="w-10 h-10 text-gray-700" />
            </div>
            <p className="font-medium text-gray-400">Select a customer from the sidebar to view the conversation</p>
          </div>
        )}
      </div>

    </div>
  );
}

