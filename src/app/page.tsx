import Link from 'next/link';
import { Rocket, Zap, Briefcase, GraduationCap, Brain, CheckCircle, ArrowRight, Play, ArrowLeft, ArrowRight as ArrowForward, Globe, AtSign } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-sans selection:bg-[#6063ee] selection:text-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-[#f7f9fb]/70 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center w-full px-5 md:px-16 py-4 max-w-[1280px] mx-auto">
          <div className="font-display text-2xl font-bold text-[#191c1e]">MyTraks</div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[#464554] hover:text-[#4648d4] transition-colors text-xs font-semibold tracking-[0.05em]" href="#features">Features</a>
            <a className="text-[#464554] hover:text-[#4648d4] transition-colors text-xs font-semibold tracking-[0.05em]" href="#how-it-works">How it Works</a>
            <a className="text-[#464554] hover:text-[#4648d4] transition-colors text-xs font-semibold tracking-[0.05em]" href="#testimonials">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-[#4648d4] font-bold text-xs tracking-[0.05em] hover:bg-[#4648d4]/10 px-4 py-2 rounded-lg transition-all active:scale-95 duration-150">
              Log In
            </Link>
            <Link href="/register" className="bg-[#4648d4] text-white px-6 py-2.5 rounded-full font-bold text-xs tracking-[0.05em] shadow-md hover:scale-105 active:scale-95 transition-all duration-150 hover:shadow-[0_0_25px_rgba(70,72,212,0.4)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-12 md:pt-24 px-5 md:px-16">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#4648d4]/5 via-transparent to-[#00687a]/5" />
          </div>
          <div className="relative z-10 max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4648d4]/10 rounded-full text-[#4648d4] text-xs font-semibold tracking-[0.05em] border border-[#4648d4]/20">
                <img 
                  alt="MyTraks Logo" 
                  className="w-4.5 h-4.5 object-contain" 
                  src="/images/mytraks_logo_nobg.png" 
                />
                VANGUARD TRACKING ENGINE
              </div>
              <h1 className="font-display text-[32px] md:text-[64px] leading-[1.1] md:leading-[1.1] tracking-[-0.02em] font-bold">
                Master Your Path.<br />
                <span className="text-[#4648d4]">Track Every Opportunity.</span>
              </h1>
              <p className="text-lg leading-[1.6] text-[#464554] max-w-lg">
                The all-in-one tracker for students and professionals to manage jobs, internships, and scholarships with precision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="bg-[#4648d4] text-white px-8 py-4 rounded-full font-bold text-xs tracking-[0.05em] shadow-lg hover:scale-105 active:scale-95 transition-all hover:shadow-[0_0_25px_rgba(70,72,212,0.4)] text-center">
                  Get Started for Free
                </Link>
                <button className="landing-glass-card px-8 py-4 rounded-full font-bold text-xs tracking-[0.05em] text-[#4648d4] hover:bg-white transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  See it in Action
                </button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-[#e6e8ea]" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-[#e6e8ea]" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-[#e6e8ea]" />
                </div>
                <div className="text-[#464554] text-xs font-semibold tracking-[0.05em]">
                  <span className="font-bold text-[#191c1e]">12k+</span> active career movers
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#4648d4]/20 rounded-3xl blur-3xl group-hover:bg-[#4648d4]/30 transition-all duration-700" />
              <div className="relative landing-glass-card p-4 md:p-6 rounded-3xl border border-white/50 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <img className="rounded-xl w-full h-auto shadow-inner" alt="MyTraks Dashboard preview showing kanban board" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0VdYgwXJyLA2LeImZWfy0mJ9nWj-xWr8zeGJYLd-vpig9cdg6izvUgj-EJ9ucsIFhuZxuvdKsVDmFMKr8y3x9zOCV9P28djniIxPTrWfWpoya2u_WTUuhNg9UDQSoPh7Sg-79-y3368GQJZmtUrcNvbqu7mknrDFy8c9TUW7nPkXLQo9JoDVW71CCMYr9po0_goNWo6uq-PDY__ss7urnK2wHiGovuuftKx2qxKsjSHiXnsqJaPL1W3MQ7yYHNWebAbJCViZAJbI" />
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase Section */}
        <section className="py-[120px] px-5 md:px-16 bg-[#f2f4f6]" id="how-it-works">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-display text-[32px] md:text-[40px] leading-[1.2] font-semibold">Your Career Control Center</h2>
              <p className="text-lg leading-[1.6] text-[#464554] max-w-2xl mx-auto">
                Precision tracking meets intelligent insights. We&apos;ve built the most comprehensive dashboard for managing your professional ascent.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Kanban Board Feature */}
              <div className="lg:col-span-2 landing-glass-card rounded-3xl overflow-hidden p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-[#57dffe] rounded-2xl text-[#006172]">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold">Visual Kanban Workflow</h3>
                  </div>
                  <p className="text-[#464554] text-base leading-[1.5] mb-8 max-w-md">
                    Organize your applications from &apos;Wishlist&apos; to &apos;Offer&apos; using our intuitive drag-and-drop interface. Never miss a follow-up or an interview date again.
                  </p>
                </div>
                <div className="relative mt-4">
                  <div className="flex gap-4 overflow-hidden">
                    <div className="min-w-[240px] p-4 bg-white/50 rounded-2xl border border-white space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold tracking-[0.05em] uppercase text-[#464554]">Applied</span>
                        <span className="bg-[#4648d4]/10 text-[#4648d4] px-2 py-0.5 rounded-full text-[10px] font-bold">12</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-[#c7c4d7]">
                        <div className="text-sm font-bold">Google</div>
                        <div className="text-xs text-[#464554]">Senior Engineer</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-[#c7c4d7]">
                        <div className="text-sm font-bold">Netflix</div>
                        <div className="text-xs text-[#464554]">UI Intern</div>
                      </div>
                    </div>
                    <div className="min-w-[240px] p-4 bg-white/50 rounded-2xl border border-white space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold tracking-[0.05em] uppercase text-[#464554]">Interviewing</span>
                        <span className="bg-[#57dffe]/30 text-[#00687a] px-2 py-0.5 rounded-full text-[10px] font-bold">4</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl shadow-md border-l-4 border-[#00687a] border-[#c7c4d7]">
                        <div className="text-sm font-bold">Stripe</div>
                        <div className="text-xs text-[#464554]">Product Designer</div>
                        <div className="mt-2 text-[10px] text-[#00687a] font-bold flex items-center gap-1">
                          📅 Oct 24, 10:00 AM
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Stats + CTA */}
              <div className="space-y-8">
                <div className="landing-glass-card rounded-3xl p-8 flex flex-col gap-6">
                  <div className="p-3 bg-[#8a4cfc] w-fit rounded-2xl text-white">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold">AI Fit Scores</h3>
                  <p className="text-[#464554] text-base leading-[1.5]">
                    Our proprietary engine analyzes job descriptions and matches them against your profile to give you a percentage success score.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold tracking-[0.05em]">
                        <span>Frontend Developer @ Vercel</span>
                        <span className="text-[#4648d4] font-bold">94%</span>
                      </div>
                      <div className="h-2 w-full bg-[#e0e3e5] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4648d4] w-[94%]" />
                      </div>
                    </div>
                    <div className="space-y-2 opacity-60">
                      <div className="flex justify-between text-xs font-semibold tracking-[0.05em]">
                        <span>UX Researcher @ Meta</span>
                        <span className="text-[#00687a] font-bold">68%</span>
                      </div>
                      <div className="h-2 w-full bg-[#e0e3e5] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00687a] w-[68%]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="landing-glass-card rounded-3xl p-8 flex flex-col gap-6 bg-[#4648d4] text-white border-none">
                  <h3 className="font-display text-2xl font-semibold">Ready to optimize?</h3>
                  <p className="opacity-90 text-base leading-[1.5]">Join 500+ universities using MyTraks to boost placement rates.</p>
                  <Link href="/register" className="mt-auto w-full py-3 bg-white text-[#4648d4] rounded-xl font-bold text-xs tracking-[0.05em] hover:bg-[#f7f9fb] transition-colors text-center block">
                    Apply to Institution
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Propositions Section */}
        <section className="py-[120px] px-5 md:px-16" id="features">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-[#4648d4]/10 rounded-2xl flex items-center justify-center text-[#4648d4]">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="font-display text-2xl font-semibold">Jobs &amp; Internships</h3>
              <p className="text-[#464554] text-base leading-relaxed">
                Never lose track of an application again. Centralize every portal, email, and task into a single source of career truth.
              </p>
              <ul className="space-y-3 text-xs font-semibold tracking-[0.05em] text-[#464554]">
                <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-[#4648d4]" /> Auto-save from LinkedIn</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-[#4648d4]" /> Email notification sync</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-[#4648d4]" /> Interview preparation guides</li>
              </ul>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-[#57dffe]/20 rounded-2xl flex items-center justify-center text-[#00687a]">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="font-display text-2xl font-semibold">Scholarship Hub</h3>
              <p className="text-[#464554] text-base leading-relaxed">
                Find and manage funding for your education. Track deadlines for grants, fellowships, and competitive institutional awards.
              </p>
              <ul className="space-y-3 text-xs font-semibold tracking-[0.05em] text-[#464554]">
                <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-[#00687a]" /> Verified funding sources</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-[#00687a]" /> Document vault for essays</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-[#00687a]" /> Automated deadline reminders</li>
              </ul>
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-[#8a4cfc]/10 rounded-2xl flex items-center justify-center text-[#712ae2]">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="font-display text-2xl font-semibold">AI Insights</h3>
              <p className="text-[#464554] text-base leading-relaxed">
                Optimize your profile with data-driven career scores. Get personalized recommendations to bridge skills gaps for your target roles.
              </p>
              <ul className="space-y-3 text-xs font-semibold tracking-[0.05em] text-[#464554]">
                <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-[#712ae2]" /> Resume keyword optimization</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-[#712ae2]" /> Market salary benchmarking</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-[#712ae2]" /> Predicted interview questions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-[120px] px-5 md:px-16 bg-[#e0e3e5]/30" id="testimonials">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-xl space-y-4">
                <h2 className="font-display text-[32px] md:text-[40px] leading-[1.2] font-semibold">Join the Next Generation of Professionals</h2>
                <p className="text-lg leading-[1.6] text-[#464554]">
                  Our members have secured positions at Fortune 500 companies and leading startups worldwide.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="landing-glass-card rounded-3xl overflow-hidden group">
                <div className="h-64 bg-[#e6e8ea] relative overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Professionals collaborating" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6LhwWqF0kny-NeykvimMdoHP_eTgA5HSfUv1njyBzinny66N6CjPpsJcqMblSZJ3xWshkJ5y-dJ45hTglF8W-GqStVLUBqyYwuGI61ovxIOlW8MMRq716vhdTELBuQ3ZHhHMGWcMAO-D9ZWXfOKK30Z2NHyTyHRHwV8OwzorRIlRydYMT1u377ITJa4M6hFfcZUAso0mO_RzKq7kijzmq0osvYxF1xjhi1EMkoAsGRkzEpQQYwtaOGu9y0Le87JcculJ0dLNxfN4" />
                </div>
                <div className="p-8">
                  <p className="text-base leading-[1.5] text-[#464554] italic mb-6">
                    &quot;MyTraks changed everything. I went from juggling 50 different spreadsheets to a single dashboard that tells me exactly what to do next.&quot;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#4648d4]/20" />
                    <div>
                      <div className="font-bold text-[#191c1e]">Jordan Chen</div>
                      <div className="text-xs tracking-[0.05em] text-[#464554]">Software Engineer @ Tesla</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 relative rounded-3xl overflow-hidden min-h-[400px]">
                <img className="w-full h-full object-cover absolute inset-0" alt="Students and professionals in diverse settings" src="https://lh3.googleusercontent.com/aida/AP1WRLu-1aMeWNDTJoucSDB74hW4KUHejysrOv2_1gbK8txUDIVoKqVkoUiSNl5Wm1kQdRilb-GwUOyDyoPsMLoU5BFG1ETZBonY7z5Kex0pVsjotnkYzrRYL6KASFzKmME1dkB1c7pwnIRUXqnrFPNaZ7KRCUM2zFiUzdeK_i5_dTGY0Moj7WAPUoMIquqx-jI7WSHIwP5dEQ1FYv1g_4gfRHO4yYvTlXxFzJyo9U-1R1MK3GqIEnwgb6YPstg" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4648d4]/80 to-transparent flex flex-col justify-end p-12">
                  <div className="max-w-md text-white">
                    <h4 className="font-display text-2xl font-semibold mb-4">Empowering students across 1,200+ global institutions</h4>
                    <button className="bg-white text-[#4648d4] px-6 py-3 rounded-xl font-bold text-xs tracking-[0.05em] hover:shadow-xl transition-all">Read Success Stories</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-[120px] px-5 md:px-16">
          <div className="max-w-[1280px] mx-auto landing-glass-card rounded-[40px] p-12 md:p-24 bg-[#4648d4] text-white border-none text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00687a]/20 blur-[100px] rounded-full -ml-32 -mb-32" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="font-display text-[32px] md:text-[40px] leading-tight font-semibold">Ready to launch your career?</h2>
              <p className="text-lg leading-[1.6] opacity-90">
                Join thousands of ambitious individuals who are tracking their way to professional excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/register" className="bg-white text-[#4648d4] px-10 py-5 rounded-full font-bold font-display text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl text-center">
                  Create Your Free Account
                </Link>
              </div>
              <div className="pt-8 text-xs tracking-[0.05em] font-semibold opacity-70">
                No credit card required. Cancel anytime.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#c7c4d7]">
        <div className="grid grid-cols-2 md:flex md:justify-between w-full px-5 md:px-16 py-[120px] max-w-[1280px] mx-auto gap-12">
          <div className="col-span-2 md:w-1/3 space-y-6">
            <div className="font-display text-2xl font-extrabold text-[#4648d4]">MyTraks</div>
            <p className="text-[#464554] text-base leading-[1.5] max-w-xs">
              The premium standard in career tracking for the ambitious next generation.
            </p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-[#eceef0] flex items-center justify-center text-[#464554] hover:text-[#4648d4] transition-colors" href="#">
                <Globe className="w-5 h-5" />
              </a>
              <a className="w-10 h-10 rounded-full bg-[#eceef0] flex items-center justify-center text-[#464554] hover:text-[#4648d4] transition-colors" href="#">
                <AtSign className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <div className="font-bold text-[#191c1e] text-xs tracking-[0.05em] font-semibold uppercase">Product</div>
            <ul className="space-y-2">
              <li><a className="text-[#464554] hover:text-[#712ae2] underline-offset-4 hover:underline transition-all" href="#features">Features</a></li>
              <li><a className="text-[#464554] hover:text-[#712ae2] underline-offset-4 hover:underline transition-all" href="#">Security</a></li>
              <li><a className="text-[#464554] hover:text-[#712ae2] underline-offset-4 hover:underline transition-all" href="#">Pricing</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="font-bold text-[#191c1e] text-xs tracking-[0.05em] font-semibold uppercase">Company</div>
            <ul className="space-y-2">
              <li><a className="text-[#464554] hover:text-[#712ae2] underline-offset-4 hover:underline transition-all" href="#">About</a></li>
              <li><a className="text-[#464554] hover:text-[#712ae2] underline-offset-4 hover:underline transition-all" href="#">Careers</a></li>
              <li><a className="text-[#464554] hover:text-[#712ae2] underline-offset-4 hover:underline transition-all" href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="font-bold text-[#191c1e] text-xs tracking-[0.05em] font-semibold uppercase">Support</div>
            <ul className="space-y-2">
              <li><a className="text-[#464554] hover:text-[#712ae2] underline-offset-4 hover:underline transition-all" href="#">Help Center</a></li>
              <li><a className="text-[#464554] hover:text-[#712ae2] underline-offset-4 hover:underline transition-all" href="#">Contact Us</a></li>
              <li><a className="text-[#464554] hover:text-[#712ae2] underline-offset-4 hover:underline transition-all" href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#c7c4d7] py-8 px-5 md:px-16 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[#464554] text-xs tracking-[0.05em] font-semibold">
          <div>© 2024 MyTraks. All rights reserved. Precision tracking for the ambitious.</div>
          <div className="flex gap-8">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
