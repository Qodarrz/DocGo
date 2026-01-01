"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Download,
  X,
  Smartphone,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { adminAppApi, type AppRelease } from "@/client/appRelease";

export const FloatingDownload = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [androidRelease, setAndroidRelease] = useState<AppRelease | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active Android release
  useEffect(() => {
    const fetchAndroidRelease = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Gunakan endpoint khusus untuk Android jika perlu, atau ambil semua lalu filter
        // Berdasarkan error, mungkin API mengembalikan object tunggal, bukan array
        const releaseData = await adminAppApi.getReleasesActive();
        
        // Cek apakah response adalah array atau object
        if (releaseData && typeof releaseData === 'object') {
          if (Array.isArray(releaseData)) {
            // Jika array, ambil yang pertama (asumsi hanya ada satu release Android)
            if (releaseData.length > 0) {
              setAndroidRelease(releaseData[0]);
            } else {
              setError("Tidak ada versi Android yang tersedia saat ini");
            }
          } else {
            // Jika langsung object, gunakan langsung
            setAndroidRelease(releaseData);
          }
        } else {
          setError("Format data tidak valid");
        }
      } catch (err) {
        console.error("Gagal mengambil data release:", err);
        setError("Gagal memuat informasi aplikasi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndroidRelease();
  }, []);

  const handleDownload = (platformId: string) => {
    if (!androidRelease || !androidRelease.downloadUrl) {
      setError("URL download tidak tersedia");
      return;
    }

    setDownloading(platformId);
    setTimeout(() => {
      setDownloading(null);
      setShowWarning(true);
    }, 500);
  };

  const handleAPKDownload = () => {
    if (!androidRelease?.downloadUrl) {
      setError("URL download tidak tersedia");
      return;
    }
    
    setShowWarning(false);
    window.open(androidRelease.downloadUrl, "_blank");
    setIsOpen(false);
  };

  // Format ukuran file
  const formatFileSize = (): string => {
    // Default size, bisa ditambahkan field di backend nanti
    return "45 MB";
  };

  // Format min Android version dari versionCode
  const getMinAndroidVersion = (): string => {
    if (!androidRelease?.versionCode) return "8.0+";
    
    if (androidRelease.versionCode >= 10) return "10.0+";
    if (androidRelease.versionCode >= 9) return "9.0+";
    return "8.0+";
  };

  if (isLoading && !isOpen) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:scale-110 hover:bg-primary-dark hover:shadow-xl"
        aria-label="Download App"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Download className="h-5 w-5" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Download Panel */}
      <div
        className={cn(
          "fixed right-6 bottom-36 z-50 w-80 transform rounded-lg bg-white shadow-2xl transition-all duration-300 dark:bg-black",
          isOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Download App</h3>
              {androidRelease ? (
                <p className="text-sm text-muted-foreground">
                  {androidRelease.appName} {androidRelease.versionName}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : androidRelease ? (
            <>
              <div className="mb-4 rounded-lg bg-muted p-3">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      File APK langsung untuk instalasi manual. Cocok untuk Android {getMinAndroidVersion()}.
                    </p>
                    {androidRelease.releaseNotes && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs font-medium text-foreground">Catatan Rilis:</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {androidRelease.releaseNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload("android")}
                disabled={downloading === "android" || !androidRelease.downloadUrl}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors",
                  downloading === "android" || !androidRelease.downloadUrl
                    ? "bg-primary/80 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark"
                )}
              >
                {downloading === "android" ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="text-white">Menyiapkan...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 text-white" />
                    <span className="text-white">
                      Download APK ({formatFileSize()})
                    </span>
                  </>
                )}
              </button>

              {/* App Info */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Ukuran</p>
                  <p className="font-medium text-foreground">{formatFileSize()}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Versi</p>
                  <p className="font-medium text-foreground">{androidRelease.versionName}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Min. Android</p>
                  <p className="font-medium text-foreground">{getMinAndroidVersion()}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Kode Versi</p>
                  <p className="font-medium text-foreground">{androidRelease.versionCode}</p>
                </div>
              </div>

              {/* Force Update Warning */}
              {androidRelease.isForceUpdate && (
                <div className="mt-4 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Update wajib! Versi ini mengandung perbaikan penting.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Tidak ada versi aplikasi yang tersedia
              </p>
            </div>
          )}
        </div>
      </div>

      {/* APK Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-black">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Install APK Manual
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Perlu mengizinkan instalasi dari sumber tidak dikenal
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-foreground">
              <p>Sebelum menginstall:</p>
              <ul className="space-y-2 pl-5">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>
                    Aktifkan "Sumber Tidak Dikenal" di pengaturan Android
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Pastikan storage tersedia minimal 100 MB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Scan file dengan antivirus setelah download</span>
                </li>
                {androidRelease?.releaseNotes && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Catatan: {androidRelease.releaseNotes}</span>
                  </li>
                )}
              </ul>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Batal
              </button>
              <button
                onClick={handleAPKDownload}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Download Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};