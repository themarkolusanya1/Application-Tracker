// Auth layout wrapper for login and sign up pages

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      <div className="bg-animated"></div>
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>

      {/* Main Card */}
      <main className="w-full max-w-lg glass-effect shadow-2xl rounded-[2.5rem] px-8 pt-12 pb-10 sm:px-12 z-10">
        {children}
      </main>
    </div>
  );
}
