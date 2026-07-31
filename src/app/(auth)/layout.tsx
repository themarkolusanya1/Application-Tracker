// Auth layout wrapper for login and sign up pages

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="bg-animated"></div>
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>

      <main className="z-10 flex items-center justify-center w-full">
        {children}
      </main>
    </div>
  );
}

