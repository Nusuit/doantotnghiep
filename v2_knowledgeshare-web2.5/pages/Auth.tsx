
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/feed');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero (Redesigned) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1120] relative overflow-hidden flex-col justify-between p-12">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">KS</div>
            <span className="font-bold text-xl text-white tracking-tight">KnowledgeShare</span>
        </div>

        {/* Central Content */}
        <div className="relative z-10 max-w-lg">
            <div className="mb-8">
                <div className="inline-block px-3 py-1 mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                    Decentralized Knowledge Protocol
                </div>
                <h1 className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                    Own your content.<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Monetize your mind.</span>
                </h1>
                <p className="text-lg text-blue-200/80 leading-relaxed font-light">
                    Join the first platform where knowledge contributions are immutable, verifiable, and directly rewarded with ownership.
                </p>
            </div>

            {/* Testimonial / Quote Card */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="flex gap-4">
                    <span className="text-4xl text-cyan-500 font-serif leading-none">"</span>
                    <div>
                        <p className="text-lg font-medium text-white italic mb-4">
                            The beautiful thing about learning is that no one can take it away from you.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-xs border border-blue-500/30">BB</div>
                            <div>
                                <div className="text-sm font-bold text-white">B.B. King</div>
                                <div className="text-xs text-blue-300">Legendary Blues Musician</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="relative z-10 flex justify-between items-center text-xs text-blue-300/60 font-mono">
          <span>© 2024 Knowledge Sharing Inc.</span>
          <div className="flex gap-4">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Protocol</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-[#050608] flex items-center justify-center p-8 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl mx-auto flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-blue-500/20">KS</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">KnowledgeShare</h2>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400">Enter your details to access your workspace.</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => navigate('/app/feed')}
              className="group w-full flex items-center justify-center gap-3 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 p-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
              <span className="font-bold text-sm">Sign in with Google</span>
            </button>
            <button 
              onClick={() => navigate('/app/feed')}
              className="group w-full flex items-center justify-center gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 p-3.5 rounded-xl text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-blue-500 group-hover:scale-110 transition-transform">account_balance_wallet</span>
              <span className="font-bold text-sm">Connect Phantom Wallet</span>
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="px-4 bg-white dark:bg-[#050608] text-gray-400">Or continue with</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide ml-1">Email address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                className="block w-full px-4 py-3.5 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" 
                placeholder="you@example.com" 
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Password</label>
                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400">Forgot password?</a>
              </div>
              <input 
                id="password" 
                name="password" 
                type="password" 
                autoComplete="current-password" 
                required 
                className="block w-full px-4 py-3.5 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" 
                placeholder="••••••••" 
              />
            </div>

            <button type="submit" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              Sign in to Dashboard
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account? <a href="#" className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">Create account</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
