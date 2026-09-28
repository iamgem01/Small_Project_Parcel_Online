import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CardConfig } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CardConfig;
  isRecipientMode: boolean;
  onToggleRecipientMode: (enabled: boolean) => void;
  onSaveToServer: () => Promise<string | null>;
  serverCardId: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  config,
  isRecipientMode,
  onToggleRecipientMode,
  onSaveToServer,
  serverCardId,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedCardId, setSavedCardId] = useState<string | null>(serverCardId);

  if (!isOpen) return null;

  // Generate locked recipient URL — prefer server card URL if available, fallback to encoded hash for static deployment
  const getRecipientUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'recipient');
    if (savedCardId) {
      url.searchParams.set('cid', savedCardId);
      url.hash = '';
    } else {
      url.searchParams.delete('cid');
      try {
        const serialized = btoa(unescape(encodeURIComponent(JSON.stringify(config))));
        url.hash = `card=${serialized}`;
      } catch (e) {
        console.warn('Could not serialize config:', e);
      }
    }
    return url.toString();
  };

  const recipientUrl = getRecipientUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(recipientUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyGreetingMessage = () => {
    const text = `Dear ${config.recipient},\nA special vintage parcel has arrived for you! 💌\nParcel Passcode: ${config.passcode}\nOpen your parcel here: ${recipientUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleSaveToServer = async () => {
    setSaveStatus('saving');
    try {
      const id = await onSaveToServer();
      if (id) {
        setSavedCardId(id);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none font-typewriter overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#fffdfa] border-4 border-slate-900 max-w-lg w-full p-4 sm:p-6 shadow-[6px_6px_0px_0px_#0f172a] relative overflow-hidden my-4"
      >
        {/* Vintage Top Label */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-base font-bold text-sky-800">[✦]</span>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm font-bold text-sky-950 tracking-wider">
                SHARE
              </h3>
              <p className="font-pixel text-[8px] text-slate-500">
                Publish & recipient view
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 border-2 border-slate-900 bg-stone-100 hover:bg-stone-200 text-slate-900 flex items-center justify-center font-pixel text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Recipient Details Preview */}
        <div className="bg-stone-100 border border-slate-400 p-3 mb-4 space-y-1.5 text-xs font-typewriter">
          <div className="flex justify-between text-slate-700">
            <span className="font-pixel text-[9px] text-slate-500">TO (RECIPIENT):</span>
            <span className="font-bold text-slate-900">{config.recipient}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span className="font-pixel text-[9px] text-slate-500">FROM (SENDER):</span>
            <span className="font-bold text-slate-900">{config.sender}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span className="font-pixel text-[9px] text-slate-500">PASSCODE PIN:</span>
            <span className="font-mono font-bold text-blue-700 bg-white px-2 border border-slate-400 text-xs">
              {config.passcode}
            </span>
          </div>
        </div>

        {/* Share Link Input & Copy */}
        <div className="space-y-2 mb-4">
          <label className="block font-pixel text-[9px] text-slate-800 font-bold">
            SHAREABLE LINK FOR RECIPIENT:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={recipientUrl}
              className="flex-1 px-3 py-2 border-2 border-slate-900 bg-white font-mono text-xs text-slate-700 outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-pixel text-[10px] border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>{copiedLink ? '✓' : '✦'}</span>
              <span>{copiedLink ? 'COPIED!' : 'COPY LINK'}</span>
            </button>
          </div>
        </div>

        {/* Copy Friendly Invitation Message */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleCopyGreetingMessage}
            className="w-full py-2 bg-sky-100 hover:bg-sky-200 text-sky-950 font-pixel text-[9px] border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="font-pixel text-[10px]">✉</span>
            <span>
              {copiedMessage
                ? '✓ COPIED INVITATION WITH PASSCODE & LINK!'
                : 'COPY INVITATION MESSAGE WITH PASSCODE'}
            </span>
          </button>
        </div>

        {/* Close Button */}
        <div className="pt-3 border-t-2 border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 text-white font-pixel text-[10px] hover:bg-slate-800 cursor-pointer shadow-[2px_2px_0px_0px_#0f172a]"
          >
            CLOSE
          </button>
        </div>
      </motion.div>
    </div>
  );
};
