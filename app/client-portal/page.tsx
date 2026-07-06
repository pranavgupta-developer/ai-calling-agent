export default function ClientPortalPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border/70 bg-card/70 p-10 shadow-xl backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Client Portal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Welcome to your client workspace
        </h1>
        <p className="mt-4 text-muted-foreground">
          You are signed in as a client user. Property updates, appointments, and
          messages will appear here.
        </p>
      </div>
    </main>
  );
}
