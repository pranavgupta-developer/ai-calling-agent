import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-slate-800">

        <h1 className="text-2xl font-bold">
          RealEstateAI
        </h1>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg border border-slate-600 hover:bg-slate-800"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}

      <section className="max-w-7xl mx-auto px-8 py-28">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <span className="bg-blue-600 px-4 py-2 rounded-full text-sm">
              AI Voice Agent for Real Estate
            </span>

            <h1 className="mt-8 text-6xl font-bold leading-tight">

              Never Miss Another Property Lead.

            </h1>

            <p className="mt-8 text-xl text-slate-300">

              AI answers incoming calls 24/7, qualifies buyers,
              books appointments, captures leads,
              and syncs everything directly into your CRM.

            </p>

            <div className="mt-10 flex gap-5">

              <Link
                href="/signup"
                className="rounded-xl bg-blue-600 px-8 py-4 font-semibold hover:bg-blue-700"
              >
                Start Free Trial
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-slate-600 px-8 py-4 hover:bg-slate-800"
              >
                Login
              </Link>

            </div>

          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-700 p-8 shadow-2xl">

            <h2 className="text-2xl font-semibold">
              Live AI Dashboard
            </h2>

            <div className="mt-8 space-y-5">

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="text-sm text-gray-400">
                  Active Calls
                </div>

                <div className="text-4xl font-bold">
                  18
                </div>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="text-sm text-gray-400">
                  Leads Captured Today
                </div>

                <div className="text-4xl font-bold">
                  47
                </div>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="text-sm text-gray-400">
                  Appointments Booked
                </div>

                <div className="text-4xl font-bold">
                  12
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Features */}

      <section className="max-w-7xl mx-auto px-8 pb-24">

        <h2 className="text-4xl font-bold mb-12">

          Everything Your Agency Needs

        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          <Feature
            title="24/7 AI Calls"
            desc="Never miss an inquiry again."
          />

          <Feature
            title="Lead Qualification"
            desc="Automatically collect buyer requirements."
          />

          <Feature
            title="Appointment Booking"
            desc="Schedule property visits instantly."
          />

          <Feature
            title="CRM Dashboard"
            desc="Track conversations, leads and properties."
          />

        </div>

      </section>

      {/* Footer */}

      <footer className="border-t border-slate-800 text-center py-10 text-slate-400">

        © 2026 RealEstateAI

      </footer>

    </main>
  );
}

function Feature({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

      <h3 className="text-xl font-semibold">

        {title}

      </h3>

      <p className="mt-4 text-slate-400">

        {desc}

      </p>

    </div>
  );
}