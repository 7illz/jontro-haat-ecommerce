import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-100 mb-4">
          Come <span className="gradient-text">Visit Us</span>
        </h1>
        <p className="text-lg text-gray-500">Experience our tech gear in person at our flagship location.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Contact Information Cards */}
        <div className="glass-strong p-8 rounded-2xl flex flex-col justify-center space-y-8">
          
          {/* Location Block */}
          <div className="flex items-start group">
            <div className="relative flex-shrink-0 mr-4">
              <div className="bg-brand-600/20 p-3 rounded-xl border border-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/10 transition-all duration-300">
                <MapPin className="w-6 h-6 text-brand-400" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-100 text-lg">Store Location</h3>
              <p className="text-gray-500 mt-1">Rose Valley 2<br/>Chattogram, Bangladesh</p>
            </div>
          </div>

          {/* Phone Block */}
          <div className="flex items-start group">
            <div className="relative flex-shrink-0 mr-4">
              <div className="bg-brand-600/20 p-3 rounded-xl border border-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/10 transition-all duration-300">
                <Phone className="w-6 h-6 text-brand-400" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-100 text-lg">Phone</h3>
              <p className="text-gray-500 mt-1">+880 1234 567890</p>
            </div>
          </div>

          {/* Email Block */}
          <div className="flex items-start group">
            <div className="relative flex-shrink-0 mr-4">
              <div className="bg-brand-600/20 p-3 rounded-xl border border-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/10 transition-all duration-300">
                <Mail className="w-6 h-6 text-brand-400" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-100 text-lg">Email</h3>
              <p className="text-gray-500 mt-1">support@yourstore.com</p>
            </div>
          </div>
          
        </div>

        {/* Right Side: The Google Map */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden glass h-[450px]">
          
          {/* This is your exact Rose Valley 2 map, updated for React! */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d461.21762953894586!2d91.81052850290618!3d22.36340498246102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30acd9c78211db03%3A0x691784c57b3e4a36!2sRose%20valley%202!5e0!3m2!1sen!2sbd!4v1783419715022!5m2!1sen!2sbd" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="strict-origin-when-cross-origin"
            title="Rose Valley 2 Shop Location"
          ></iframe>

        </div>
      </div>
    </div>
  );
}
