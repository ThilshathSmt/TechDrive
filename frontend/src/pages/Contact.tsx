// src/pages/Contact.tsx
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Contact Us</h1>
      <p className="text-gray-600">
        Got questions or need help? Reach out and we’ll get back to you ASAP.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <Mail className="w-5 h-5 text-blue-600" />
          <p className="mt-2 font-semibold">Email</p>
          <a href="mailto:support@gearsync.example" className="text-sm text-gray-600">
            support@gearsync.example
          </a>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <Phone className="w-5 h-5 text-emerald-600" />
          <p className="mt-2 font-semibold">Phone</p>
          <a href="tel:+10000000000" className="text-sm text-gray-600">
            +1 (000) 000-0000
          </a>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <MapPin className="w-5 h-5 text-violet-600" />
          <p className="mt-2 font-semibold">Address</p>
          <p className="text-sm text-gray-600">123 Service St, Auto City</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Thanks! We’ll be in touch shortly.");
        }}
        className="bg-white rounded-xl shadow p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="Your name" required />
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="Email address" type="email" required />
        </div>
        <input className="border rounded-lg px-3 py-2 w-full" placeholder="Subject" required />
        <textarea className="border rounded-lg px-3 py-2 w-full" rows={5} placeholder="Message" required />
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;