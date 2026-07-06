import Link from "next/link";

type CheckEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const { email } = await searchParams;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-12">
        <div className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-blue-600/20 text-3xl">
            ✉️
          </div>

          <h1 className="text-3xl font-bold">Check your email</h1>

          <p className="mt-4 text-slate-300">
            We sent a verification link to{" "}
            {email ? (
              <span className="font-medium text-white">{email}</span>
            ) : (
              "your business email"
            )}
            . Click the link to verify your account and continue setup.
          </p>

          <p className="mt-6 text-sm text-slate-400">
            Didn&apos;t receive the email? Check your spam folder or try signing
            up again with the correct address.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
