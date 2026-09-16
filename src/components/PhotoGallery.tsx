import React, { useState, useRef } from 'react';
import { PhotoItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoGalleryProps {
  photos: PhotoItem[];
  onAddPhoto?: (photo: PhotoItem) => void;
  onRemovePhoto?: (id: string) => void;
  readOnly?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
  readOnly = false,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newUrl, setNewUrl] = useState<string>('');
  const [newCaption, setNewCaption] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFormattedDate = (val?: Date | number | string) => {
    if (!val) {
      return new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).toUpperCase();
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setNewUrl(dataUrl);
      if (!newCaption) {
        setNewCaption(file.name.replace(/\.[^/.]+$/, '').slice(0, 30));
      }
      if (!newDate && file.lastModified) {
        setNewDate(getFormattedDate(file.lastModified));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    const finalDate = newDate.trim(); // Clean and leave empty if not filled
    if (onAddPhoto) {
      onAddPhoto({
        id: `photo-${Date.now()}`,
        url: newUrl.trim(),
        caption: (newCaption.trim() || 'A sweet memory ★'),
        date: finalDate,
        rotation: Math.floor(Math.random() * 6) - 3,
      });
    }
    setNewUrl('');
    setNewCaption('');
    setNewDate('');
    setIsAdding(false);
  };

  // Staggered entrance animation variants for Polaroids
  const polaroidVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      y: 45,
      scale: 0.85,
      rotate: i % 2 === 0 ? -8 : 8,
    }),
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: photos[i]?.rotation ?? (i % 2 === 0 ? -2 : 2.5),
      transition: {
        duration: 0.65,
        delay: 0.15 + i * 0.18, // Staggered delay for each Polaroid
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div id="photo-gallery-section" className="w-full font-typewriter">
      {/* Polaroid Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {photos.length === 0 && (
          <div className="col-span-2 text-center py-6 px-4 bg-stone-50 border-2 border-dashed border-slate-300">
            <span className="font-pixel text-[10px] text-slate-600 block">[ NO POLAROID PHOTOS YET ]</span>
            <span className="font-typewriter text-xs text-slate-500 mt-1 block">
              {readOnly ? 'No photos in this parcel.' : 'Add or upload your first photo memory below.'}
            </span>
          </div>
        )}

        {photos.map((photo, index) => {
          return (
            <motion.div
              key={photo.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={polaroidVariants}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedPhoto(photo)}
              className="cursor-pointer bg-white p-2 pb-3 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1e293b] relative group select-none transition-shadow"
            >
              {/* Indie Pixel Blue Tape */}
              <div
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-sky-300 border border-slate-900 shadow-[1px_1px_0px_0px_#000] z-10 font-pixel text-[7px] text-slate-900 flex items-center justify-center tracking-tighter"
              >
                SKY COTL
              </div>

              {/* Photo Image Container */}
              <div className="relative aspect-square w-full bg-slate-900 overflow-hidden mb-2 border border-slate-900">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to cute Sky illustration if image path or link fails
                    (e.target as HTMLImageElement).src = index % 2 === 0 ? '/polaroid-sky-beach.svg' : '/polaroid-sky-night.svg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-blue-950/25 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white border border-slate-900 text-slate-950 text-[9px] font-pixel px-1.5 py-0.5 shadow-[1px_1px_0px_0px_#000]">
                    [ VIEW ]
                  </span>
                </div>
              </div>

              {/* Caption & Date */}
              <div className="text-center px-1">
                <p className="font-handwriting text-sm text-slate-900 font-semibold leading-tight line-clamp-2">
                  {photo.caption}
                </p>
                {photo.date && photo.date !== 'SPECIAL MEMORY' && (
                  <span className="text-[9px] text-slate-500 font-pixel block mt-0.5 tracking-tight">
                    {photo.date}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Add photo button - only visible if editing is enabled (not readOnly) */}
        {onAddPhoto && !readOnly && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + photos.length * 0.18 }}
            onClick={() => {
              if (!newDate) setNewDate(getFormattedDate());
              setIsAdding(true);
            }}
            className="border-2 border-dashed border-sky-400 hover:border-slate-900 p-4 flex flex-col items-center justify-center cursor-pointer text-sky-700 hover:text-slate-950 bg-sky-50/60 hover:bg-sky-100 transition min-h-[160px] shadow-[2px_2px_0px_0px_#0f172a]"
          >
            <span className="text-xl font-bold font-pixel mb-1">+</span>
            <span className="text-[10px] font-pixel text-center leading-tight">[ ADD / UPLOAD PHOTO ]</span>
          </motion.div>
        )}
      </div>

      {/* Add / Upload Photo Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-5 max-w-sm w-full border-4 border-slate-900 shadow-[5px_5px_0px_0px_#0f172a] font-typewriter"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-pixel text-[11px] text-sky-950">[ ADD TO POLAROIDS ]</h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="font-pixel text-xs text-slate-500 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              {/* Drag and drop upload zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-3 mb-3 text-center cursor-pointer transition ${
                  isDraggingFile
                    ? 'border-blue-600 bg-sky-100'
                    : 'border-slate-400 bg-stone-50 hover:bg-sky-50 hover:border-slate-800'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="font-pixel text-base block font-bold text-sky-700">[ + ]</span>
                <span className="font-pixel text-[9px] text-slate-800 block mt-1">
                  CLICK TO BROWSE OR DRAG PHOTO HERE
                </span>
                <span className="text-[8px] text-slate-500 font-mono block">
                  Supports JPG, PNG, WEBP
                </span>
              </div>

              {newUrl && (
                <div className="mb-3 p-2 bg-stone-100 border border-slate-400 flex items-center gap-2">
                  <img
                    src={newUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover border border-slate-800"
                  />
                  <span className="font-pixel text-[8px] text-emerald-700">✓ PHOTO LOADED</span>
                </div>
              )}

              <form onSubmit={handleAddNew} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-pixel text-[9px]">
                    OR PASTE IMAGE URL:
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or /polaroid-sky-beach.svg"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-900 text-xs focus:outline-none focus:bg-sky-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-pixel text-[9px]">
                    SWEET CAPTION:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Together in Sky ★"
                    value={newCaption}
                    onChange={e => setNewCaption(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-900 text-xs focus:outline-none focus:bg-sky-50 font-handwriting text-base"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-pixel text-[9px]">
                    PHOTO DATE (OPTIONAL):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SEP 29, 2026 (Leave empty to omit)"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-900 text-xs focus:outline-none focus:bg-sky-50 font-pixel text-[9px]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 border-2 border-slate-900 text-slate-700 hover:bg-slate-100 font-pixel text-[10px]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 border-2 border-slate-900 bg-sky-600 hover:bg-sky-500 text-white font-pixel text-[10px] shadow-[2px_2px_0px_0px_#0f172a]"
                  >
                    SAVE POLAROID
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-xs flex items-center justify-center p-4 select-none"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="bg-white p-4 pb-6 max-w-md w-full border-4 border-slate-900 shadow-[5px_5px_0px_0px_#000] relative"
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-2 right-2 w-7 h-7 border-2 border-slate-900 bg-stone-100 hover:bg-rose-100 text-slate-900 flex items-center justify-center font-pixel text-xs"
              >
                ✕
              </button>

              <div className="w-full max-h-[60vh] overflow-hidden mb-4 bg-stone-900 border-2 border-slate-900">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain mx-auto"
                />
              </div>

              <div className="text-center">
                <p className="font-handwriting text-2xl text-slate-900 font-bold mb-1">
                  {selectedPhoto.caption}
                </p>
                {selectedPhoto.date && selectedPhoto.date !== 'SPECIAL MEMORY' && (
                  <p className="font-pixel text-[10px] text-slate-500">
                    DATE: {selectedPhoto.date}
                  </p>
                )}
                {onRemovePhoto && !readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this polaroid photo?')) {
                        onRemovePhoto(selectedPhoto.id);
                        setSelectedPhoto(null);
                      }
                    }}
                    className="mt-3 px-3 py-1 bg-gray-50 hover:bg-black-100 text-black-700 border-2 border-gray-300 font-pixel text-[9px] cursor-pointer inline-flex items-center gap-1 shadow-xs"
                  >
                    <span>✕</span> DELETE PHOTO 
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
