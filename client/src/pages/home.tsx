import { useState } from "react";
import { Download, Settings } from "lucide-react";
import DownloadInterface from "@/components/download-interface";
import InstallationGuide from "@/components/installation-guide";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"download" | "install">("download");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                <Download className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Video Downloader</h1>
                <p className="text-sm text-slate-600">Interface web para yt-dlp • Download rápido e seguro</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500">
              <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                ✓ Online
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("download")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "download"
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Download className="inline mr-2" size={16} />
                Download de Vídeo
              </button>
              <button
                onClick={() => setActiveTab("install")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "install"
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Settings className="inline mr-2" size={16} />
                Instalação do yt-dlp
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "download" && <DownloadInterface />}
            {activeTab === "install" && <InstallationGuide onBackToDownload={() => setActiveTab("download")} />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <p>Interface para yt-dlp • Baixe vídeos de múltiplas plataformas</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="text-xs">Versão 1.0</span>
              <span className="text-xs">•</span>
              <span className="text-xs">yt-dlp {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
