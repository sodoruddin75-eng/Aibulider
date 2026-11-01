import React, { useState } from 'react';
import { Download, FileText, Package, Eye, Check, Sparkles, X } from 'lucide-react';

interface DirectDownloadBannerProps {
  onOpenSourceModal?: () => void;
}

export function DirectDownloadBanner({ onOpenSourceModal }: DirectDownloadBannerProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDownload = (type: 'targz' | 'txt' | 'zip') => {
    setDownloading(type);

    let url = '/download.tar.gz';
    let filename = 'buildai-pro-full-source.tar.gz';

    if (type === 'txt') {
      url = '/download.txt';
      filename = 'buildai-pro-all-code.txt';
    } else if (type === 'zip') {
      url = '/download.zip';
      filename = 'buildai-pro-full-source.zip';
    }

    // Trigger direct browser download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(null);
      setDownloaded(type);
      setTimeout(() => setDownloaded(null), 4000);
    }, 800);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-3 py-2.5 sm:py-3 border-b border-indigo-500/30 shadow-md relative z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        
        {/* Left Notice */}
        <div className="flex items-center space-x-2 text-center md:text-left">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="font-semibold flex items-center gap-1.5 flex-wrap">
            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 text-[11px]">
              এক ক্লিকে ডাউনলোড
            </span>
            <span className="text-slate-200">
              সরাসরি প্রজেক্ট ফাইল ডাউনলোড করুন (কোনো ZIP সফটওয়্যার ছাড়াই):
            </span>
          </div>
        </div>

        {/* Right Download Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* Button 1: TAR.GZ (NO ZIP) */}
          <button
            onClick={() => handleDownload('targz')}
            disabled={downloading === 'targz'}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl font-bold shadow-sm hover:shadow-indigo-500/30 transition text-xs cursor-pointer active:scale-95"
            title="Download full project as .tar.gz archive without zip"
          >
            {downloaded === 'targz' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-300">ডাউনলোড শুরু হয়েছে!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-indigo-200" />
                <span>১. TAR.GZ ডাউনলোড (No ZIP)</span>
              </>
            )}
          </button>

          {/* Button 2: Plain Text All-in-One (.txt) */}
          <button
            onClick={() => handleDownload('txt')}
            disabled={downloading === 'txt'}
            className="flex items-center space-x-1.5 bg-sky-700 hover:bg-sky-600 text-white px-3 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer active:scale-95"
            title="Download single plain text file containing all code"
          >
            {downloaded === 'txt' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-300">ডাউনলোড হয়েছে!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-sky-200" />
                <span>২. টেক্সট ফাইল (.txt)</span>
              </>
            )}
          </button>

          {/* Button 3: ZIP */}
          <button
            onClick={() => handleDownload('zip')}
            disabled={downloading === 'zip'}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-xl font-medium transition text-xs cursor-pointer border border-slate-700 active:scale-95"
            title="Download standard ZIP file"
          >
            {downloaded === 'zip' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Package className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>ZIP ফাইল</span>
          </button>

          {/* Button 4: View Code in browser */}
          {onOpenSourceModal && (
            <button
              onClick={onOpenSourceModal}
              className="flex items-center space-x-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl font-medium text-xs border border-slate-700 transition cursor-pointer"
              title="View and copy all files directly in browser"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>কোড দেখুন</span>
            </button>
          )}

          {/* Close button */}
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition ml-1"
            title="Hide banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
