import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Copy, RefreshCw, Home, Folder, Monitor, Music, Settings, Bell, HelpCircle, Search, Video } from 'lucide-react';

const LandingPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Animation transforms
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -50]);
  
  const logoOpacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0]);
  const buttonOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const buttonX = useTransform(scrollYProgress, [0.5, 0.7], [50, 0]);
  
  // Dashboard visibility - it "comes up" as you scroll
  const dashboardOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const dashboardY = useTransform(scrollYProgress, [0.3, 0.6], [100, 0]);
  
  // Card animations - from scattered positions TO dashboard positions
  const remoteCardX = useTransform(scrollYProgress, [0.4, 0.8], [-400, 0]);
  const remoteCardY = useTransform(scrollYProgress, [0.4, 0.8], [200, 0]);
  const remoteCardRotate = useTransform(scrollYProgress, [0.4, 0.8], [15, 0]);
  
  const controlCardX = useTransform(scrollYProgress, [0.4, 0.8], [400, 0]);
  const controlCardY = useTransform(scrollYProgress, [0.4, 0.8], [-150, 0]);
  const controlCardRotate = useTransform(scrollYProgress, [0.4, 0.8], [-12, 0]);
  
  const storageCardX = useTransform(scrollYProgress, [0.4, 0.8], [-500, 0]);
  const storageCardY = useTransform(scrollYProgress, [0.4, 0.8], [100, 0]);
  const storageCardRotate = useTransform(scrollYProgress, [0.4, 0.8], [8, 0]);
  
  const promoCardX = useTransform(scrollYProgress, [0.4, 0.8], [350, 0]);
  const promoCardY = useTransform(scrollYProgress, [0.4, 0.8], [150, 0]);
  const promoCardRotate = useTransform(scrollYProgress, [0.4, 0.8], [-6, 0]);

  return (
    <div ref={containerRef} className="min-h-[300vh] bg-gray-50 relative overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer font-medium">Features</span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer font-medium">Extension</span>
            </div>
            
            <motion.div 
              style={{ opacity: logoOpacity }}
              className="absolute left-1/2 transform -translate-x-1/2"
            >
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-sm transform rotate-45"></div>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-8">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer font-medium">Benefits</span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer font-medium">FAQ</span>
              <motion.button 
                style={{ opacity: buttonOpacity, x: buttonX }}
                className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                Join the waitlist
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div 
        style={{ opacity: heroOpacity, y: heroY }}
        className="fixed inset-0 flex flex-col items-center justify-center z-10 px-6"
      >
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Meet all-in-one platform<br />
            to <span className="bg-teal-100 px-4 py-2 rounded-xl">contact</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Stay in touch, collaborate and share in couple of clicks.<br />
            Boost your workflow by 10x. Straight from your browser.
          </p>
          <button className="bg-black text-white px-8 py-4 rounded-xl text-lg hover:bg-gray-800 transition-colors font-medium">
            Join the waitlist
          </button>
        </div>
      </motion.div>

      {/* Static Dashboard Layout */}
      <motion.div 
        style={{ opacity: dashboardOpacity, y: dashboardY }}
        className="fixed inset-0 z-30 bg-gray-50"
      >
        <div className="flex h-screen pt-20">
          {/* Sidebar - Always present */}
          <div className="w-16 bg-gray-800 flex flex-col items-center py-6 space-y-6">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-800 rounded-sm transform rotate-45"></div>
            </div>
            
            <div className="space-y-4">
              <Home className="w-6 h-6 text-white" />
              <div className="w-6 h-6 bg-white/20 rounded-sm"></div>
              <Folder className="w-6 h-6 text-white/60" />
              <Monitor className="w-6 h-6 text-white/60" />
            </div>
            
            <div className="flex-1"></div>
            
            <div className="space-y-4">
              <Bell className="w-6 h-6 text-white/60" />
              <Settings className="w-6 h-6 text-white/60" />
              <HelpCircle className="w-6 h-6 text-white/60" />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-semibold text-gray-900">Home</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search" 
                    className="bg-gray-100 rounded-xl px-4 py-3 pl-10 w-72 text-gray-700 placeholder-gray-500"
                  />
                </div>
                <button className="bg-gray-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-gray-700 transition-colors">
                  <Video className="w-4 h-4" />
                  <span className="font-medium">Start Meeting</span>
                </button>
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            {/* Card Grid Layout */}
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Remote Control Card - Animates into position */}
                <motion.div 
                  style={{ 
                    x: remoteCardX, 
                    y: remoteCardY, 
                    rotate: remoteCardRotate 
                  }}
                  className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
                >
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Remote control</h3>
                  <p className="text-gray-600 mb-6">To share access with your device to someone.</p>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2 block">YOUR ID</label>
                      <div className="flex items-center bg-gray-50 rounded-xl p-4">
                        <span className="flex-1 font-mono text-gray-800 text-lg">883 992 234</span>
                        <Copy className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2 block">PASSWORD</label>
                      <div className="flex items-center bg-gray-50 rounded-xl p-4">
                        <span className="flex-1 font-mono text-gray-800 text-lg">askd223fdlq</span>
                        <RefreshCw className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Storage Card - Animates into position */}
                <motion.div 
                  style={{ 
                    x: storageCardX, 
                    y: storageCardY, 
                    rotate: storageCardRotate 
                  }}
                  className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Storage capacity</h3>
                    <button className="text-sm bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">Send Files</button>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span className="font-semibold">87 / 512 Gb</span>
                      <span className="font-semibold">24 %</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-500 via-teal-400 via-yellow-400 to-blue-600 h-3 rounded-full" style={{width: '24%'}}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Folder className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">Documents</div>
                        <div className="text-xs text-gray-500">1238 files</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">38 Gb</div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">Videos</div>
                        <div className="text-xs text-gray-500">129 files</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">32 Gb</div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <div className="w-5 h-5 bg-yellow-600 rounded-sm"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">Images</div>
                        <div className="text-xs text-gray-500">567 files</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">17 Gb</div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Music className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">Music</div>
                        <div className="text-xs text-gray-500">258 files</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">13 Gb</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Take Control Card - Animates into position */}
                <motion.div 
                  style={{ 
                    x: controlCardX, 
                    y: controlCardY, 
                    rotate: controlCardRotate 
                  }}
                  className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
                >
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Take the control</h3>
                  <p className="text-gray-600 mb-6">Of someone's device remotely.</p>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2 block">PARTNER ID</label>
                      <input 
                        type="text" 
                        placeholder="Enter code" 
                        className="w-full bg-gray-50 rounded-xl p-4 border-0 text-gray-700 placeholder-gray-500"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center">
                        <input type="radio" className="mr-3 w-4 h-4" defaultChecked />
                        <span className="text-sm font-medium text-gray-700">Connect</span>
                      </div>
                      <span className="text-sm text-gray-600">Browse Files</span>
                    </div>
                    
                    <button className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium">Submit</button>
                  </div>
                </motion.div>

                {/* Promotional Card - Animates into position */}
                <motion.div 
                  style={{ 
                    x: promoCardX, 
                    y: promoCardY, 
                    rotate: promoCardRotate 
                  }}
                  className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-3 text-gray-900">Mota in full throttle!</h3>
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        Receive our special -25% offer<br />
                        and use all our features<br />
                        without any restrictions.
                      </p>
                      <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors font-medium">
                        Upgrade now
                      </button>
                    </div>
                    <div className="w-20 h-20 relative ml-6 flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-2xl transform rotate-12"></div>
                      <div className="absolute top-2 right-2 w-6 h-6 bg-gray-800 rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;