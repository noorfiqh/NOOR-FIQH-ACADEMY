'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Award, 
  Download, 
  Printer, 
  CheckCircle, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText,
  Image as ImageIcon,
  Loader2,
  Sliders,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { AppStore, DEFAULT_SETTINGS } from '@/lib/store';
import { SiteSettings } from '@/lib/types';

interface CertificateViewProps {
  userName: string;
  courseTitle: string;
  issueDate: string;
  certificateNumber: string;
  grade?: string;
  certificateCopyUrl?: string;
  customPdfUrl?: string;
  onClose?: () => void;
}

// Helper to parse Google Drive, Dropbox, and other media URLs for template background
export function parseCertificateMedia(rawUrl?: string) {
  if (!rawUrl || !rawUrl.trim()) return null;
  const url = rawUrl.trim();

  // Check if Google Drive link
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                     url.match(/[?&]id=([a-zA-Z0-9_-]+)/) || 
                     url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                     
  if (driveMatch && (url.includes('drive.google.com') || url.includes('docs.google.com') || url.includes('googleusercontent.com'))) {
    const fileId = driveMatch[1];
    return {
      type: 'google_drive' as const,
      originalUrl: url,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      directImageUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      fileId
    };
  }

  // Check Dropbox link
  if (url.includes('dropbox.com')) {
    const directUrl = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/[?&]dl=0/, '');
    return {
      type: 'image' as const,
      originalUrl: url,
      previewUrl: directUrl,
      directImageUrl: directUrl,
      downloadUrl: directUrl
    };
  }

  // Check direct image or generic URL
  const isImage = /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(url) || url.startsWith('data:image');
  const isPdf = url.toLowerCase().endsWith('.pdf');

  return {
    type: isImage ? 'image' as const : isPdf ? 'pdf' as const : 'web' as const,
    originalUrl: url,
    previewUrl: url,
    directImageUrl: !isPdf ? url : '',
    downloadUrl: url
  };
}

export function CertificateView({
  userName,
  courseTitle,
  issueDate,
  certificateNumber,
  grade = 'Mumtaz (Distinction)',
  certificateCopyUrl,
  customPdfUrl,
  onClose
}: CertificateViewProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [proxiedImageUrl, setProxiedImageUrl] = useState<string>('');
  const [showAdjustments, setShowAdjustments] = useState(false);

  useEffect(() => {
    setSiteSettings(AppStore.getSettings());
  }, []);

  // Position calibrations (2 inches from left = ~17.1%, 3 inches from bottom = ~36.3% on A4 Landscape)
  const [dateLeftPercent, setDateLeftPercent] = useState<number>(17.1);
  const [dateBottomPercent, setDateBottomPercent] = useState<number>(36.3);
  const [nameTopPercent, setNameTopPercent] = useState<number>(45);
  const [showTextBackground, setShowTextBackground] = useState<boolean>(false);

  // Check course specific template or site setting template
  const certObj = AppStore.getCertificateByNumber(certificateNumber);
  const courseObj = certObj ? AppStore.getCourseById(certObj.courseId) : null;
  
  const rawCopyUrl = certificateCopyUrl || customPdfUrl || courseObj?.certificateTemplateUrl || siteSettings?.certificateTemplateUrl;
  const media = parseCertificateMedia(rawCopyUrl);

  const hasCatalogImage = !!(media && (media.directImageUrl || media.type === 'google_drive' || media.type === 'image'));
  const rawImageUrl = media?.directImageUrl || (media?.type === 'google_drive' ? `https://lh3.googleusercontent.com/d/${media.fileId}` : media?.previewUrl);

  // Set proxied image URL to avoid CORS/tainted canvas issues during high-res canvas rendering
  useEffect(() => {
    if (rawImageUrl) {
      if (rawImageUrl.startsWith('data:') || rawImageUrl.startsWith('blob:')) {
        setProxiedImageUrl(rawImageUrl);
      } else if (rawImageUrl.includes('lh3.googleusercontent.com') || rawImageUrl.includes('drive.google.com')) {
        // Direct safe image URL for Google CDN or fallback proxy for static hosting
        setProxiedImageUrl(rawImageUrl);
      } else {
        // Use direct or client-safe CORS image service (works 100% on Firebase Static Hosting)
        const encoded = encodeURIComponent(rawImageUrl);
        setProxiedImageUrl(`https://images.weserv.nl/?url=${encoded}&default=${encoded}`);
      }
    }
  }, [rawImageUrl]);

  // Default view mode: If catalog exists, show customized catalog template with student overlay
  const [viewMode, setViewMode] = useState<'catalog_overlay' | 'classic'>(
    hasCatalogImage ? 'catalog_overlay' : 'classic'
  );

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  // Helper to load image securely into an HTMLImageElement
  const loadHtmlImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback without crossOrigin if local or already loaded
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.onerror = (err) => reject(err);
        fallback.src = src;
      };
      img.src = src;
    });
  };

  /**
   * Pure HTML5 Canvas Certificate Generator (100% immune to html2canvas oklch / CSS parsing bugs).
   * Generates a 2480 x 1754 px (300 DPI A4 Landscape) crystal-clear certificate canvas.
   */
  const renderCertificateToCanvas = async (): Promise<HTMLCanvasElement> => {
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready;
    }

    const canvas = document.createElement('canvas');
    const width = 2480;
    const height = 1754;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not supported');

    // Fill white base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const activeUrl = proxiedImageUrl || rawImageUrl;

    if (viewMode === 'catalog_overlay' && hasCatalogImage && activeUrl) {
      // --- CATALOG OVERLAY MODE ---
      try {
        const bgImg = await loadHtmlImage(activeUrl);
        ctx.drawImage(bgImg, 0, 0, width, height);
      } catch (e) {
        console.warn('Could not load background template image, drawing clean background:', e);
        ctx.fillStyle = '#fdfcf9';
        ctx.fillRect(0, 0, width, height);
      }

      const centerY = height * (nameTopPercent / 100);

      // Optional subtle backdrop if enabled
      if (showTextBackground) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.roundRect(width / 2 - 600, centerY - 80, 1200, 240, 24);
        ctx.fill();
      }

      // 1. Student Name
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 64px "Noto Serif Bengali", "Anek Bangla", serif';
      ctx.fillStyle = '#112734';
      ctx.fillText(userName, width / 2, centerY - 20);

      // 2. Course Title (Directly below name)
      ctx.font = 'bold 36px "Noto Serif Bengali", "Anek Bangla", serif';
      ctx.fillStyle = '#112734';
      ctx.fillText(courseTitle, width / 2, centerY + 55);

      // 3. Result / Grade Badge (Directly below course title)
      if (grade) {
        ctx.font = 'bold 28px "Noto Serif Bengali", "Anek Bangla", serif';
        ctx.fillStyle = '#92400e';
        ctx.fillText(`ফলাফল / মূল্যায়ন: ${grade}`, width / 2, centerY + 115);
      }

      // 4. Date & Certificate Number (Calibrated: 2 inches from left, 3 inches from bottom)
      const leftX = width * (dateLeftPercent / 100);
      const bottomY = height - (height * (dateBottomPercent / 100));

      if (showTextBackground) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.roundRect(leftX - 15, bottomY - 35, 380, 85, 12);
        ctx.fill();
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.font = 'bold 26px "Noto Serif Bengali", "Anek Bangla", serif';
      ctx.fillStyle = '#2c3e50';
      ctx.fillText(`তারিখ: ${issueDate}`, leftX, bottomY);

      ctx.font = 'bold 28px "Courier New", monospace';
      ctx.fillStyle = '#23626F';
      ctx.fillText(`সনদ নং: ${certificateNumber}`, leftX, bottomY + 38);

      // Security Seal Marker
      ctx.textAlign = 'right';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillStyle = '#5a524d';
      ctx.fillText('OFFICIALLY VERIFIED • NOOR FIQH ACADEMY', width - 80, height - 60);

    } else {
      // --- CLASSIC DIGITAL ISLAMIC FRAME MODE ---
      // Off-white canvas
      ctx.fillStyle = '#fdfcf9';
      ctx.fillRect(0, 0, width, height);

      // Dark Frame Border
      ctx.lineWidth = 36;
      ctx.strokeStyle = '#112734';
      ctx.strokeRect(18, 18, width - 36, height - 36);

      // Inner Gold Accent Border
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#17A2B8';
      ctx.strokeRect(45, 45, width - 90, height - 90);

      // Corner Ornaments
      const cornerSize = 80;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#d97706';
      // Top Left
      ctx.strokeRect(55, 55, cornerSize, cornerSize);
      // Top Right
      ctx.strokeRect(width - 55 - cornerSize, 55, cornerSize, cornerSize);
      // Bottom Left
      ctx.strokeRect(55, height - 55 - cornerSize, cornerSize, cornerSize);
      // Bottom Right
      ctx.strokeRect(width - 55 - cornerSize, height - 55 - cornerSize, cornerSize, cornerSize);

      // Arabic Watermark in Center
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '400px "Amiri", "Traditional Arabic", serif';
      ctx.fillStyle = 'rgba(17, 39, 52, 0.035)';
      ctx.fillText(siteSettings.logoSymbol || 'ن', width / 2, height / 2);

      // Header: Academy Name Badge
      ctx.font = 'bold 24px "Noto Serif Bengali", "Anek Bangla", serif';
      ctx.fillStyle = '#17A2B8';
      ctx.fillText(`${siteSettings.siteNameBn || 'নূর ফিকহ একাডেমি'} • ${siteSettings.siteName || 'NOOR FIQH ACADEMY'}`, width / 2, 170);

      // Header Title
      ctx.font = 'bold 52px "Anek Bangla", sans-serif';
      ctx.fillStyle = '#112734';
      ctx.fillText('সনদপত্র (CERTIFICATE OF COMPLETION)', width / 2, 245);

      // Subtitle
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#8a817c';
      ctx.fillText('BOARD OF ISLAMIC JURISPRUDENCE & CONTEMPORARY RESEARCH', width / 2, 290);

      // Intro
      ctx.font = 'italic 26px "Noto Serif Bengali", serif';
      ctx.fillStyle = '#5a524d';
      ctx.fillText('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,', width / 2, 420);

      // Student Name
      ctx.font = 'bold 68px "Noto Serif Bengali", "Anek Bangla", serif';
      ctx.fillStyle = '#112734';
      ctx.fillText(userName, width / 2, 530);

      // Gold Underline for Name
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#17A2B8';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 350, 580);
      ctx.lineTo(width / 2 + 350, 580);
      ctx.stroke();

      // Description text
      ctx.font = '26px "Noto Serif Bengali", serif';
      ctx.fillStyle = '#5a524d';
      ctx.fillText('নূর ফিকহ একাডেমি পরিচালিত নিম্নোক্ত উচ্চতর ফিকহি প্রশিক্ষণ কোর্স ও সকল মূল্যায়ন পরীক্ষা সফলভাবে সম্পন্ন করেছেন:', width / 2, 670);

      // Course Box
      ctx.fillStyle = 'rgba(17, 39, 52, 0.05)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 500, 725, 1000, 110, 20);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(17, 39, 52, 0.15)';
      ctx.stroke();

      ctx.font = 'bold 42px "Noto Serif Bengali", "Anek Bangla", serif';
      ctx.fillStyle = '#112734';
      ctx.fillText(courseTitle, width / 2, 785);

      // Grade Badge
      if (grade) {
        ctx.font = 'bold 28px "Noto Serif Bengali", serif';
        ctx.fillStyle = '#92400e';
        ctx.fillText(`ফলাফল / মূল্যায়ন: ${grade}`, width / 2, 900);
      }

      // Footer Divider
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(17, 39, 52, 0.15)';
      ctx.beginPath();
      ctx.moveTo(120, height - 340);
      ctx.lineTo(width - 120, height - 340);
      ctx.stroke();

      // Footer: Left Date & Cert Number
      ctx.textAlign = 'left';
      ctx.font = 'bold 26px "Noto Serif Bengali", serif';
      ctx.fillStyle = '#2c3e50';
      ctx.fillText(`ইস্যু তারিখ: ${issueDate}`, 150, height - 260);

      ctx.font = 'bold 28px "Courier New", monospace';
      ctx.fillStyle = '#23626F';
      ctx.fillText(`সনদ নং: ${certificateNumber}`, 150, height - 210);

      // Footer: Center Official Seal
      ctx.save();
      ctx.translate(width / 2, height - 240);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, 0, 65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fffbeb';
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#112734';
      ctx.fillText('OFFICIAL', 0, -10);
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#d97706';
      ctx.fillText('SEAL', 0, 15);
      ctx.restore();

      // Footer: Right Signature
      ctx.textAlign = 'right';
      ctx.font = 'italic bold 32px "Noto Serif Bengali", serif';
      ctx.fillStyle = '#112734';
      ctx.fillText('Mufti Abdullah Al-Noor', width - 150, height - 260);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2c3e50';
      ctx.beginPath();
      ctx.moveTo(width - 450, height - 245);
      ctx.lineTo(width - 150, height - 245);
      ctx.stroke();

      ctx.font = 'bold 24px "Noto Serif Bengali", serif';
      ctx.fillStyle = '#2c3e50';
      ctx.fillText('প্রধান মুফতী ও পরিচালক', width - 150, height - 210);

      ctx.font = '20px "Noto Serif Bengali", serif';
      ctx.fillStyle = '#8a817c';
      ctx.fillText('নূর ফিকহ একাডেমি', width - 150, height - 175);
    }

    return canvas;
  };

  // 1-Click Bulletproof High-Res PDF Download
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    triggerConfetti();

    try {
      const canvas = await renderCertificateToCanvas();
      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const fileName = `Sanad_${userName.replace(/\s+/g, '_')}_${certificateNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF Generation failed, triggering fallback print window:', err);
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 1-Click High-Res Image Download (PNG with student details overlay)
  const handleDownloadImage = async () => {
    setIsGeneratingImage(true);
    triggerConfetti();

    try {
      const canvas = await renderCertificateToCanvas();
      const link = document.createElement('a');
      const fileName = `Sanad_${userName.replace(/\s+/g, '_')}_${certificateNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Image Generation failed:', err);
      if (rawImageUrl) {
        window.open(rawImageUrl, '_blank');
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Standalone Clean Print Window (Works 100% reliably in iframes, mobile & desktop)
  const handlePrint = async () => {
    triggerConfetti();

    try {
      const canvas = await renderCertificateToCanvas();
      const imgData = canvas.toDataURL('image/png');

      const printWindow = window.open('', '_blank', 'width=1100,height=800');
      if (!printWindow) {
        window.print();
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sanad - ${certificateNumber}</title>
            <meta charset="utf-8" />
            <style>
              @page {
                size: A4 landscape;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background-color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100vw;
                height: 100vh;
                overflow: hidden;
              }
              img {
                width: 297mm;
                height: 210mm;
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                display: block;
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Certificate" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error('Canvas print fallback to direct window.print:', e);
      window.print();
    }
  };

  const handleCopyLink = () => {
    const verifyUrl = `${window.location.origin}/verify-certificate?id=${encodeURIComponent(certificateNumber)}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const activeImageUrl = proxiedImageUrl || rawImageUrl;

  return (
    <div className="flex flex-col items-center justify-start max-w-5xl mx-auto w-full font-sans space-y-4 pt-1 pb-8 text-slate-800">
      
      {/* Top Action & Control Bar */}
      <div className="w-full bg-white border border-[#ece8e0] p-3 sm:p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
        
        {/* Left: Certificate Info */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#17A2B8]/15 text-[#112734] rounded-xl font-bold">
            <Award size={20} className="text-[#17A2B8]" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#112734]">
              সনদপত্র প্রিভিউ ও ডাউনলোড সেন্টার
            </h4>
            <p className="text-[11px] text-[#8a817c] font-mono">
              সনদ নম্বর: <span className="font-bold text-[#112734]">{certificateNumber}</span>
            </p>
          </div>
        </div>

        {/* Middle / Right: Actions & Display Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {hasCatalogImage && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('catalog_overlay')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'catalog_overlay'
                    ? 'bg-white text-[#112734] shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ক্যাটালগ ডিজাইনে শিক্ষার্থীর নাম ও তথ্য সহ সনদ"
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>ক্যাটালগ সনদ</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('classic')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'classic'
                    ? 'bg-white text-[#112734] shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="একাডেমি গোল্ডেন ফ্রেম ডিজাইন"
              >
                <FileText size={13} />
                <span>ডিজিটাল ফ্রেম</span>
              </button>
            </div>
          )}

          {/* Position Calibration Toggle */}
          {hasCatalogImage && viewMode === 'catalog_overlay' && (
            <button
              type="button"
              onClick={() => setShowAdjustments(!showAdjustments)}
              className={`px-2.5 py-2 text-[11px] font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
                showAdjustments 
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-inner' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
              }`}
              title="টেক্সট ও তারিখের অবস্থান কাস্টমাইজ করুন"
            >
              <Sliders size={13} />
              <span>পজিশন সেটিং</span>
            </button>
          )}

          {/* Copy Verification Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 text-[11px] font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copied ? 'কপি হয়েছে' : 'যাচাই লিংক'}</span>
          </button>

          {/* Direct 1-Click PDF Download Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 bg-[#17A2B8] hover:bg-[#138496] disabled:opacity-50 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="সরাসরি হাই-কোয়ালিটি A4 PDF ডাউনলোড করুন"
          >
            {isGeneratingPdf ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            <span>{isGeneratingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
          </button>

          {/* PNG Image Download Button */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-[11px] rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            title="নামসহ ছবি হিসেবে (PNG) ডাউনলোড করুন"
          >
            {isGeneratingImage ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ImageIcon size={14} />
            )}
            <span>ইমেজ ডাউনলোড</span>
          </button>

          {/* Clean Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="প্রিন্টার দিয়ে প্রিন্ট করুন"
          >
            <Printer size={14} />
            <span>প্রিন্ট</span>
          </button>

          {/* Close button if provided */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition-colors cursor-pointer"
            >
              বন্ধ
            </button>
          )}
        </div>
      </div>

      {/* Position Fine-Tuning Bar (Optional Drawer) */}
      {showAdjustments && hasCatalogImage && viewMode === 'catalog_overlay' && (
        <div className="w-full bg-amber-50/90 border border-amber-200 p-3.5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-700 print:hidden animate-in fade-in">
          <div>
            <label className="font-bold block mb-1">
              তারিখ ও আইডি (বাম থেকে): <span className="font-mono text-amber-900">{dateLeftPercent.toFixed(1)}% (~2 ইঞ্চি)</span>
            </label>
            <input
              type="range"
              min="5"
              max="40"
              step="0.5"
              value={dateLeftPercent}
              onChange={(e) => setDateLeftPercent(parseFloat(e.target.value))}
              className="w-full accent-[#17A2B8]"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">
              তারিখ ও আইডি (নিচ থেকে): <span className="font-mono text-amber-900">{dateBottomPercent.toFixed(1)}% (~3 ইঞ্চি)</span>
            </label>
            <input
              type="range"
              min="10"
              max="60"
              step="0.5"
              value={dateBottomPercent}
              onChange={(e) => setDateBottomPercent(parseFloat(e.target.value))}
              className="w-full accent-[#17A2B8]"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">
              নাম ও কোর্সের অবস্থান (উপর থেকে): <span className="font-mono text-amber-900">{nameTopPercent}%</span>
            </label>
            <input
              type="range"
              min="25"
              max="65"
              step="1"
              value={nameTopPercent}
              onChange={(e) => setNameTopPercent(parseInt(e.target.value))}
              className="w-full accent-[#17A2B8]"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-3">
            <button
              type="button"
              onClick={() => {
                setDateLeftPercent(17.1);
                setDateBottomPercent(36.3);
                setNameTopPercent(45);
                setShowTextBackground(false);
              }}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>ডিফল্ট মাপ</span>
            </button>

            <label className="flex items-center gap-1.5 font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showTextBackground}
                onChange={(e) => setShowTextBackground(e.target.checked)}
                className="accent-[#17A2B8] rounded"
              />
              <span>টেক্সট ব্যাকড্রপ</span>
            </label>
          </div>
        </div>
      )}

      {/* Main Unified Certificate Canvas Container */}
      <div className="w-full flex justify-center items-center overflow-x-auto py-1">
        <div
          id="certificate-print-area"
          ref={certRef}
          className="w-full max-w-4xl relative overflow-hidden rounded-2xl bg-white shadow-2xl transition-all select-none border border-slate-200"
          style={{
            aspectRatio: '1.414 / 1', // Standard A4 Landscape (297mm x 210mm)
            boxShadow: '0 20px 50px rgba(17, 39, 52, 0.16)',
          }}
        >
          
          {/* ========================================================================= */}
          {/* VIEW MODE 1: CATALOG OVERLAY DESIGN (আসল ক্যাটালগের ওপর নাম, কোর্স, গ্রেড ও তারিখ) */}
          {/* ========================================================================= */}
          {hasCatalogImage && viewMode === 'catalog_overlay' && activeImageUrl && (
            <div className="relative w-full h-full bg-white overflow-hidden flex flex-col justify-between">
              
              {/* High Quality Background Catalog Template Image */}
              <img
                src={activeImageUrl}
                alt="Certificate Template"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0 block"
                crossOrigin="anonymous"
                loading="eager"
              />

              {/* Top Header Placeholder spacing */}
              <div className="relative z-10 w-full h-[15%] pointer-events-none" />

              {/* Center Details Section: Name, Course & Grade */}
              <div 
                className="relative z-10 w-full text-center px-6 sm:px-12 pointer-events-none transition-all flex flex-col items-center justify-center"
                style={{
                  position: 'absolute',
                  top: `${nameTopPercent}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%'
                }}
              >
                {/* 1. Student Name */}
                <div className={`inline-block px-6 sm:px-10 py-0.5 rounded-xl transition-all ${
                  showTextBackground ? 'bg-white/75 backdrop-blur-[2px] border border-white/80 shadow-sm' : ''
                }`}>
                  <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#112734] font-serif tracking-wide drop-shadow-sm">
                    {userName}
                  </h3>
                </div>

                {/* 2. Course Title (Directly below name) */}
                <div className={`mt-2 max-w-xl mx-auto px-4 py-0.5 rounded-lg ${
                  showTextBackground ? 'bg-white/65 backdrop-blur-[2px] border border-white/60' : ''
                }`}>
                  <h4 className="text-xs sm:text-base md:text-lg font-bold text-[#112734]">
                    {courseTitle}
                  </h4>
                </div>

                {/* 3. Grade Badge (Directly below course title as requested) */}
                {grade && (
                  <div className="mt-1.5 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-600/30 text-amber-950 text-[10px] sm:text-xs font-bold shadow-xs">
                    <CheckCircle size={12} className="text-emerald-700 shrink-0" />
                    <span>ফলাফল / মূল্যায়ন: <strong className="font-extrabold text-[#112734]">{grade}</strong></span>
                  </div>
                )}
              </div>

              {/* Precise Date & Certificate Number Placement: */}
              {/* User requested: "তারিখ বা সনদ ইস্যুটা বাম দিক থেকে ২ ইঞ্চি নিচ থেকে ৩ ইঞ্চি উপরে বসবে" */}
              <div 
                className={`absolute z-20 pointer-events-none text-left leading-tight transition-all rounded-lg p-1 ${
                  showTextBackground ? 'bg-white/85 backdrop-blur-sm border border-slate-200/60 shadow-xs' : ''
                }`}
                style={{
                  left: `${dateLeftPercent}%`,      // Default ~17.1% = 2 inches on A4 Landscape
                  bottom: `${dateBottomPercent}%`,  // Default ~36.3% = 3 inches from bottom
                  transform: 'translateY(50%)'
                }}
              >
                <div className="space-y-0.5 font-sans">
                  <div className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-[#2c3e50]">
                    <span>তারিখ:</span>
                    <span className="font-mono text-[#112734] font-bold">{issueDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-[#2c3e50]">
                    <span>সনদ নং:</span>
                    <span className="font-mono text-[#23626F] font-extrabold">{certificateNumber}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Official Security Seal Mark */}
              <div className="absolute bottom-2.5 right-4 z-10 pointer-events-none opacity-90">
                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-[#5a524d] font-mono font-semibold bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200">
                  <CheckCircle size={10} className="text-emerald-600" />
                  <span>OFFICIALLY VERIFIED</span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW MODE 2: CLASSIC GOLDEN ISLAMIC FRAME (একাডেমি ডিজিটাল ফ্রেম মোড)    */}
          {/* ========================================================================= */}
          {(!hasCatalogImage || viewMode === 'classic') && (
            <div className="relative w-full h-full p-6 sm:p-10 flex flex-col justify-between text-center bg-[#fdfcf9] border-[12px] sm:border-[16px] border-[#112734]">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-500 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-500 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-amber-500 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-amber-500 rounded-br-lg pointer-events-none" />

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <span className="text-arabic text-[260px] font-black text-[#112734]">
                  {siteSettings.logoSymbol || 'ن'}
                </span>
              </div>

              {/* Header Section */}
              <div className="relative z-10 space-y-1.5 pt-1">
                {siteSettings.logoType === 'image' && siteSettings.logoImageUrl ? (
                  <div className="flex justify-center pb-1">
                    <img
                      src={siteSettings.logoImageUrl}
                      alt={siteSettings.siteNameBn || 'নূর ফিকহ একাডেমি'}
                      className="max-h-10 sm:max-h-12 w-auto object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#17A2B8]/15 border border-[#17A2B8]/30 text-[#112734] text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>{siteSettings.siteNameBn || 'নূর ফিকহ একাডেমি'} • {siteSettings.siteName || 'NOOR FIQH ACADEMY'}</span>
                  </div>
                )}

                <h2 className="text-lg sm:text-2xl font-black text-[#112734] tracking-tight">
                  সনদপত্র (CERTIFICATE OF COMPLETION)
                </h2>
                <p className="text-[9px] sm:text-[11px] text-[#8a817c] font-extrabold tracking-wider uppercase">
                  BOARD OF ISLAMIC JURISPRUDENCE & CONTEMPORARY RESEARCH
                </p>
              </div>

              {/* Recipient & Course Details Body */}
              <div className="relative z-10 my-auto py-2 space-y-2">
                <p className="text-xs text-[#5a524d] font-serif italic">
                  এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,
                </p>

                {/* Student Name */}
                <div className="inline-block max-w-xl px-6 sm:px-10 py-1 border-b-2 border-[#17A2B8]/70">
                  <h3 className="text-xl sm:text-3xl font-black text-[#112734] tracking-wide font-serif">
                    {userName}
                  </h3>
                </div>

                <p className="text-[11px] sm:text-xs text-[#5a524d] max-w-xl mx-auto px-4 leading-relaxed">
                  নূর ফিকহ একাডেমি পরিচালিত নিম্নোক্ত উচ্চতর ফিকহি প্রশিক্ষণ কোর্স ও সকল মূল্যায়ন পরীক্ষা সফলভাবে সম্পন্ন করেছেন:
                </p>

                {/* Course Title Badge */}
                <div className="bg-[#112734]/5 border border-[#112734]/15 py-2 px-4 rounded-xl max-w-lg mx-auto shadow-sm">
                  <h4 className="text-sm sm:text-lg font-black text-[#112734] font-serif">
                    {courseTitle}
                  </h4>
                </div>

                {/* Result Grade (Directly Below Course) */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/15 rounded-full border border-amber-500/30 text-amber-950 text-[10px] sm:text-[11px] font-bold">
                  <CheckCircle size={12} className="text-emerald-600" />
                  <span>ফলাফল / মূল্যায়ন: <strong className="text-amber-900">{grade}</strong></span>
                </div>
              </div>

              {/* Footer Signatures, Issue Date & Academy Seal */}
              <div className="relative z-10 grid grid-cols-3 items-end pt-3 border-t border-[#112734]/15 text-[10px] sm:text-[11px] text-[#5a524d]">
                
                {/* Left: Issue Date & Cert Number */}
                <div className="text-left space-y-0.5">
                  <p className="font-bold text-[#2c3e50] text-[9px] sm:text-[11px]">ইস্যু তারিখ:</p>
                  <p className="font-mono font-medium text-slate-800 text-[10px] sm:text-xs">{issueDate}</p>
                  <div>
                    <span className="font-mono text-[8px] sm:text-[9px] text-[#8a817c] bg-[#112734]/5 px-2 py-0.5 rounded border border-[#112734]/10 inline-block font-semibold">
                      নং: {certificateNumber}
                    </span>
                  </div>
                </div>

                {/* Center: Official Academy Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-amber-500 bg-amber-50/90 flex flex-col items-center justify-center p-1 text-center shadow-md">
                    <Award size={16} className="text-amber-600 mb-0.5" />
                    <span className="text-[7px] sm:text-[8px] font-black uppercase text-[#112734] leading-tight">OFFICIAL</span>
                    <span className="text-[6px] sm:text-[7px] font-bold text-amber-700">SEAL</span>
                  </div>
                </div>

                {/* Right: Instructor / Principal Signature */}
                <div className="text-right space-y-0.5">
                  <div className="font-serif italic font-extrabold text-xs sm:text-sm text-[#112734]">
                    Mufti Abdullah Al-Noor
                  </div>
                  <div className="w-24 sm:w-32 border-b border-[#2c3e50] ml-auto pb-0.5" />
                  <p className="font-bold text-[#2c3e50] text-[9px] sm:text-[10px]">প্রধান মুফতী ও পরিচালক</p>
                  <p className="text-[8px] sm:text-[9px] text-[#8a817c]">নূর ফিকহ একাডেমি</p>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Direct Link Option if raw url is external */}
      {media && (
        <div className="w-full flex flex-wrap items-center justify-center gap-3 pt-1 print:hidden text-xs text-[#8a817c]">
          <span>মূল ক্যাটালগ টেমপ্লেট ড্রাইভ ফাইল লিংক:</span>
          <a
            href={media.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#17A2B8] hover:text-[#112734] font-bold underline flex items-center gap-1"
          >
            <span>ড্রাইভ লিঙ্ক খুলুন</span>
            <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
