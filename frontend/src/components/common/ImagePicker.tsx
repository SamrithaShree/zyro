import { useRef, useState, useCallback } from "react";
import { Camera, ImageIcon, X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import imageCompression from "browser-image-compression";

interface ImagePickerProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  label?: string;
  circular?: boolean;
}

export function ImagePicker({
  onImageSelected,
  label = "Upload Photo",
  circular = false,
}: ImagePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      setProgress(20);
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          onProgress: (p) => setProgress(20 + p * 0.6),
        });
        setProgress(90);
        const url = URL.createObjectURL(compressed);
        setPreview(url);
        setProgress(100);
        onImageSelected(compressed, url);
      } catch {
        setError("Failed to process image. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [onImageSelected]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreview(null);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const shape = circular ? "rounded-full" : "rounded-2xl";

  return (
    <div className="w-full">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
        aria-label="Choose from gallery"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onChange}
        aria-label="Take photo"
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative inline-block"
          >
            <img
              src={preview}
              alt="Selected"
              className={`w-32 h-32 object-cover border-2 border-accent ${shape}`}
            />
            {uploading && (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-background/80 ${shape}`}
              >
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#2A2E3C"
                    strokeWidth="3"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={88}
                    strokeDashoffset={88 - (88 * progress) / 100}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
              </div>
            )}
            {!uploading && (
              <button
                onClick={clear}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                aria-label="Remove image"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="picker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="flex gap-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex-1 flex flex-col items-center gap-2 py-4 bg-card border border-border rounded-xl hover:border-accent/50 transition-colors"
              >
                <Camera className="w-5 h-5 text-accent" />
                <span className="text-xs">Camera</span>
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 flex flex-col items-center gap-2 py-4 bg-card border border-border rounded-xl hover:border-accent/50 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs">Gallery</span>
              </button>
            </div>
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Upload className="w-3 h-3" />
                {error}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
