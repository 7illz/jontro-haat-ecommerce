import { useState, useRef, useEffect, useContext } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { StoreContext } from '../context/StoreContextContext';
import { createAuthenticatedSocket } from '../api/chatApi';

let socket;

export default function Chatbot() {
  const { user } = useContext(StoreContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Socket Connection
  useEffect(() => {
    if (user && isOpen) {
      // Connect to socket when chat is opened
      socket = createAuthenticatedSocket();

      // Join the chat room for this specific user
      socket.emit('join_chat');

      // Receive historical messages
      socket.on('chat_history', (history) => {
        setMessages(history);
      });

      // Receive a new real-time message (from themselves or admin)
      socket.on('receive_message', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on('chat_error', (message) => {
        setMessages((prev) => [...prev, { sender: 'admin', text: message }]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    // Send the message through the socket
    socket.emit('send_message', { text: input });
    setInput('');
  };

  // Only show the chatbot button if the user is logged in, and NOT an admin
  if (!user || user.role === 'owner') return null; 

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* The floating chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group"
        >
          <div className="absolute inset-0 bg-brand-500 rounded-full glow-ring" />
          <div className="relative bg-gradient-to-r from-brand-600 to-accent-500 p-4 rounded-full shadow-lg shadow-brand-500/30 text-white hover:shadow-brand-500/50 hover:scale-105 transition-all duration-300">
            <MessageSquare className="h-6 w-6" />
          </div>
        </button>
      )}

      {/* The Chat Window */}
      {isOpen && (
        <div className="glass-strong w-80 sm:w-96 rounded-2xl shadow-2xl shadow-brand-900/20 overflow-hidden flex flex-col h-[500px] animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-700 to-accent-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-bold">Live Support</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10 p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-950/80">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-4">
                Send a message to start chatting with support!
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'customer' 
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-tr-sm' 
                      : 'bg-white/10 text-gray-200 border border-white/10 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-4 bg-gray-900/90 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-brand-500 text-white p-2.5 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
