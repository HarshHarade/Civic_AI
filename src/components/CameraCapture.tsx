import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  SwitchCamera,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

interface CameraCaptureProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  onAnalyzeTrigger?: (mainImage: string) => void;
}

// Curated realistic sample images for desktop testing without physical road access
const PRESET_CIVIC_SAMPLES = [
  {
    label: 'Deep Road Pothole (FC Road)',
    category: 'Roads and potholes',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Overflowing Garbage Bin (Wakad)',
    category: 'Garbage collection and overflowing bins',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Broken Streetlight / Dark Pole (Camp)',
    category: 'Broken streetlights',
    url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Waterlogging & Flood (Hinjawadi)',
    category: 'Flooding and waterlogging',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Water Pipeline Leak (Baner)',
    category: 'Water leakage and water supply',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'
  }
];

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  images,
  onChange,
  maxImages = 4,
  onAnalyzeTrigger
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showSamplePicker, setShowSamplePicker] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream safely
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start real camera stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your current browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera permission or device error:', err);
      let msg = 'Unable to access camera. Please allow camera permissions in your browser.';
      if (err.name === 'NotAllowedError') {
        msg = 'Camera permission denied. Please grant permission in browser settings, or upload an image below.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No video camera detected on this device. You can upload an image from your files.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  // Capture frame from active video stream
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const updated = [...images, dataUrl].slice(0, maxImages);
    onChange(updated);
    stopCamera();

    if (onAnalyzeTrigger) {
      onAnalyzeTrigger(dataUrl);
    }
  };

  // Switch between rear/front camera
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Handle file picker upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const promises = filesToProcess.map((file) => {
      return new Promise<string>((resolve, reject) => {
        // Validate file size (< 10MB)
        if (file.size > 10 * 1024 * 1024) {
          reject(new Error(`File ${file.name} exceeds 10MB limit.`));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then((newImages) => {
        const combined = [...images, ...newImages].slice(0, maxImages);
        onChange(combined);
        if (onAnalyzeTrigger && newImages.length > 0) {
          onAnalyzeTrigger(newImages[0]);
        }
      })
      .catch((err) => {
        setCameraError(err.message || 'Failed to read image.');
      });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove photo
  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Add sample image
  const selectSampleImage = (url: string) => {
    const updated = [...images, url].slice(0, maxImages);
    onChange(updated);
    setShowSamplePicker(false);
    if (onAnalyzeTrigger) {
      onAnalyzeTrigger(url);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {!isCameraActive ? (
          <button
            type="button"
            onClick={() => startCamera()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Open Real Camera</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-all"
          >
            <X className="w-4 h-4" />
            <span>Close Camera</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 rounded-xl font-medium text-sm transition-all shadow-xs disabled:opacity-50"
        >
          <Upload className="w-4 h-4 text-blue-600" />
          <span>Upload from Gallery</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSamplePicker(!showSamplePicker)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors ml-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Try Pune Sample Photos</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Error / Alert banner */}
      {cameraError && (
        <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-900">Camera Notice</p>
            <p className="text-xs text-amber-700 mt-0.5">{cameraError}</p>
          </div>
          <button
            type="button"
            onClick={() => setCameraError(null)}
            className="text-amber-500 hover:text-amber-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Preset Pune Civic Samples Picker */}
      {showSamplePicker && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select a Realistic Pune Civic Photo
            </span>
            <button
              type="button"
              onClick={() => setShowSamplePicker(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {PRESET_CIVIC_SAMPLES.map((sample, idx) => (
              <div
                key={idx}
                onClick={() => selectSampleImage(sample.url)}
                className="group relative cursor-pointer border border-slate-200 hover:border-blue-500 rounded-lg overflow-hidden bg-white shadow-2xs hover:shadow-sm transition-all"
              >
                <img
                  src={sample.url}
                  alt={sample.label}
                  className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="p-1.5 bg-white">
                  <p className="text-[11px] font-medium text-slate-800 truncate">{sample.label}</p>
                  <p className="text-[9px] text-blue-600 font-medium truncate">{sample.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:aspect-16/9 shadow-lg border-2 border-blue-500">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Viewfinder Target Reticle */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-white/60 rounded-2xl relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs font-mono">
                ALIGN CIVIC ISSUE
              </div>
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
            </div>
          </div>

          {/* Top Bar Controls */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between text-white z-10">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Lens (Pune Geotag Active)
            </span>
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-colors"
              title="Switch Camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Bar Controls */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6 z-10">
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-md hover:bg-black/80"
            >
              Cancel
            </button>

            {/* Shutter Button */}
            <button
              type="button"
              onClick={captureSnapshot}
              className="w-16 h-16 rounded-full border-4 border-white bg-blue-600 hover:bg-blue-500 shadow-xl flex items-center justify-center transition-transform active:scale-90"
              title="Capture Photo"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600">
                <Camera className="w-6 h-6" />
              </div>
            </button>

            <span className="text-white text-xs font-medium px-4 py-2 bg-black/40 backdrop-blur-md rounded-full">
              {images.length}/{maxImages} photos
            </span>
          </div>
        </div>
      )}

      {/* Captured / Uploaded Images Preview Strip */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Attached Evidence ({images.length}/{maxImages})</span>
            {images.length > 0 && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High-Resolution Photo Ready
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video shadow-xs"
              >
                <img
                  src={img}
                  alt={`Civic issue capture ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                    Primary / AI Input
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {onAnalyzeTrigger && (
                    <button
                      type="button"
                      onClick={() => onAnalyzeTrigger(img)}
                      className="p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                      title="Analyze with AI"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {images.length < maxImages && !isCameraActive && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center aspect-video p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50/30"
              >
                <ImageIcon className="w-6 h-6 mb-1 text-slate-400" />
                <span className="text-xs font-medium">+ Add Photo</span>
                <span className="text-[10px] text-slate-400">Max {maxImages}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
