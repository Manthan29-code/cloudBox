import React from 'react';
import { Link } from 'react-router-dom';
import { FaCloudUploadAlt, FaFolderOpen, FaShareAlt, FaShieldAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { MdSecurity, MdDevices, MdHistory } from 'react-icons/md';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium border border-gray-200">
            🚀 The smartest way to manage files
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-gray-900 leading-tight">
            Securely Store, Organize, <br className="hidden md:block" />
            and Share Files.
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            CloudBox is the modern workspace that gives you total control over your digital assets. Upload, organize, and share with confidence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Link to="/register" className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
              Get Started for Free
            </Link>
            <a href="#features" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:border-gray-300">
              Explore Features
            </a>
          </div>
          
          {/* Dashboard Mockup */}
          <div className="relative max-w-6xl mx-auto rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white transform hover:scale-[1.01] transition-transform duration-500">
            <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex h-96">
              {/* Sidebar */}
              <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 hidden md:block text-left">
                <div className="flex items-center gap-2 mb-6 text-gray-700 font-semibold">
                  <FaFolderOpen /> My Files
                </div>
                <div className="space-y-2 text-gray-600 text-sm">
                  <div className="pl-4 py-1 bg-gray-200 rounded">Documents</div>
                  <div className="pl-4 py-1">Images</div>
                  <div className="pl-4 py-1">Projects</div>
                </div>
              </div>
              {/* Main Content */}
              <div className="flex-1 p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                        <FaFolderOpen />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-800">Project_Alpha_{i}</div>
                        <div className="text-xs text-gray-400">2.4 MB</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem -> Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why CloudBox?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Managing files shouldn't be a headache. We solved the chaos.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Problem */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <FaTimesCircle className="text-gray-400" /> Before CloudBox
              </h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-gray-400">•</span> Files scattered across devices
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-gray-400">•</span> No clear folder structure
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-gray-400">•</span> Links shared forever without control
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-gray-400">•</span> No idea who accessed what
                </li>
              </ul>
            </div>

            {/* Solution */}
            <div className="p-8 rounded-2xl bg-black text-white shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FaCheckCircle className="text-green-400" /> With CloudBox
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-green-500 flex-shrink-0" /> Organized folder hierarchy
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-green-500 flex-shrink-0" /> Secure shareable links
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-green-500 flex-shrink-0" /> Automatic link expiration
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-green-500 flex-shrink-0" /> Full activity logs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How CloudBox Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <FaCloudUploadAlt className="text-3xl" />,
                title: "1. Upload",
                desc: "Upload files securely using a modern web interface."
              },
              {
                icon: <FaFolderOpen className="text-3xl" />,
                title: "2. Organize",
                desc: "Create folders inside folders to mirror real-world structure."
              },
              {
                icon: <FaShareAlt className="text-3xl" />,
                title: "3. Share",
                desc: "Generate public or private links with expiration options."
              },
              {
                icon: <MdHistory className="text-3xl" />,
                title: "4. Track",
                desc: "Monitor access and control your shared content."
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-800">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} CloudBox. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
