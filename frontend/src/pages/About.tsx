import React from "react";
import { ShieldCheck, Users2, Target, HeartHandshake, Sparkles, Mail, Phone } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
      {/* Hero */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          About GearSync
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
          Keeping you on the road — reliably and transparently
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          GearSync is a modern auto service platform that connects customers, vehicles, and technicians.
          We streamline bookings, progress updates, and service history — all in one place.
        </p>
      </section>

      {/* Quick stats / pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">Our Mission</h3>
          <p className="mt-2 text-sm text-gray-600">
            Deliver effortless auto care with real-time visibility and trusted service.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">What We Value</h3>
          <p className="mt-2 text-sm text-gray-600">
            Transparency, safety, and craftsmanship — plus great communication at every step.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 grid place-items-center">
            <Users2 className="w-5 h-5" />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">Who We Serve</h3>
          <p className="mt-2 text-sm text-gray-600">
            Drivers, fleet owners, and technicians who want simple, dependable workflows.
          </p>
        </div>
      </section>

      {/* Story + features */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900">Our Story</h2>
          <p className="mt-3 text-gray-600">
            We started GearSync after years of seeing how confusing service queues, missed updates,
            and scattered notes could be. We built a platform that makes it easy to book, track,
            and complete service with confidence — for everyone involved.
          </p>
          <p className="mt-3 text-gray-600">
            Today, GearSync supports appointments, projects, time logs, and clear communication
            between customers and skilled technicians.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900">What You Can Expect</h2>
          <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
            <li>Fast booking with clear availability</li>
            <li>Real-time status updates & progress tracking</li>
            <li>Transparent estimates and final invoices</li>
            <li>Centralized vehicle history for smarter decisions</li>
            <li>Secure authentication with role-based access</li>
          </ul>
        </div>
      </section>

      {/* CTA / contact */}
      <section className="bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-2xl border border-cyan-100 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-slate-800 text-sm font-medium shadow">
              <HeartHandshake className="w-4 h-4 text-rose-500" />
              We’re here to help
            </div>
            <h3 className="mt-3 text-2xl font-bold text-gray-900">
              Want to work with us or have questions?
            </h3>
            <p className="mt-1 text-gray-600">
              Reach out to our team — we typically reply the same day.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="mailto:support@gearsync.example"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <a
              href="tel:+10000000000"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 px-4 py-2 font-semibold border hover:bg-gray-50"
            >
              <Phone className="w-4 h-4" />
              Call Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;