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

      {/* MainHeader */}
      <header className="flex flex-col items-center mb-5 z-10">
        <div className="w-20 h-16 flex items-center justify-center mb-0">
          <img 
            alt="MyTraks Logo" 
            className="w-full h-full object-contain" 
            src="/images/mytraks_logo_nobg.png" 
          />
        </div>
        <h1 className="text-3xl font-bold logo-text tracking-tighter">MyTraks</h1>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-lg glass-effect shadow-2xl rounded-[2.5rem] px-8 pt-12 pb-10 sm:px-12 z-10">
        {children}
      </main>
    </div>
  );
}
