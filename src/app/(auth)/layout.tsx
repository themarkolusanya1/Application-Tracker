// AuthLayout for Auth-related pages

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
      <header className="flex flex-col items-center mb-8 z-10">
        <div className="w-24 h-24 bg-white/85 backdrop-blur-md rounded-3xl shadow-xl flex items-center justify-center mb-4 p-3 border border-white/50">
          <img 
            alt="MyTraks Logo" 
            className="w-full h-full object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwytUbecYlmiaVMgOrc2uUPXjS8IgVj2zQJweiqgGKE_wRwp_hd6cePvk-eXAwTyD-1T9lxaeBTF-3W_rqV-OPz5ir7_C1pbxbrI5jfqNQAVjcMOsTcXZweEKBHBwXxF52x2Vy9I4-BdUNgsoFlqa25izKIgqJwfytIAF0BrL9NIsE1uGcFI9PFwqJZlVABilyfs3MlSwz1PpX1fQGtXWacKCmCDwtac8aZDahpRYAiRIdrGvJbH9cm-twXRDPzsKdR_dxC1dtzG8" 
          />
        </div>
        <h1 className="text-4xl font-bold logo-text tracking-tighter">MyTraks</h1>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-lg glass-effect shadow-2xl rounded-[2.5rem] px-8 pt-12 pb-10 sm:px-12 floating-card z-10">
        {children}
      </main>
    </div>
  );
}
