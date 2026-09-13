import React, { useState, useEffect, useRef } from 'react';
import { FileJson, Upload, Copy, Check, X, RefreshCw, Sparkles, Download } from 'lucide-react';
import { TeamMember } from '../types';
import { normalizeMemberJson, exportMemberAsJson } from '../data/members';

interface JsonInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: TeamMember;
  onApplyJson: (member: TeamMember) => void;
}

const SAMPLE_JSON = {
  name: "ALEX CHEN",
  designation: "NEURAL SYSTEMS RESEARCHER",
  department: "RESEARCH",
  clearanceLevel: "LVL-05 // DIR",
  photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85",
  specialWord: "CATALYST",
  quote: "Bridging human intuition with neural spatial intelligence to construct resilient systems.",
  nodeLocation: "NODE 07 // SINGAPORE",
  frequency: "94.20 MHz",
  securityZone: "SEC // ALPHA",
  badgeIssue: "2026.Q2"
};

export const JsonInputModal: React.FC<JsonInputModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  onApplyJson,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with current member JSON whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setJsonText(exportMemberAsJson(currentMember));
      setError(null);
    }
  }, [isOpen, currentMember]);

  if (!isOpen) return null;

  const handleApply = () => {
    try {
      if (!jsonText.trim()) {
        setError('Please enter valid JSON content.');
        return;
      }
      const parsed = JSON.parse(jsonText);
      const normalized = normalizeMemberJson(parsed);
      onApplyJson(normalized);
      onClose();
    } catch (err: any) {
      setError(`JSON Parse Error: ${err.message || 'Invalid JSON syntax'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        // If file contains an array, pick the first or target
        const memberData = Array.isArray(parsed) ? parsed[0] : parsed;
        const normalized = normalizeMemberJson(memberData);
        setJsonText(JSON.stringify(normalized, null, 2));
        setError(null);
        onApplyJson(normalized);
        onClose();
      } catch (err: any) {
        setError(`Failed to read JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setJsonText(JSON.stringify(SAMPLE_JSON, null, 2));
    setError(null);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentMember.slug || 'member'}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#111111] border border-white/15 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-hidden text-[#F5F5F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 flex items-center justify-center">
              <FileJson className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono-tech uppercase tracking-wider text-white">
                Input Person Data (JSON)
              </h2>
              <p className="text-[10px] font-mono-tech text-[#8A8A82]">
                Provide any person's JSON to instantly output their physical ID card
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A8A82] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-mono-tech">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
          >
            <Upload className="w-3 h-3 text-[#FF5A1F]" />
            <span>Upload .JSON File</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#C8C8C0] hover:text-white transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Load Sample</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#C8C8C0] hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#8A8A82]" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#C8C8C0] hover:text-white transition-colors cursor-pointer ml-auto"
          >
            <Download className="w-3 h-3 text-[#8A8A82]" />
            <span>Export</span>
          </button>
        </div>

        {/* JSON Editor Textarea */}
        <div className="flex-1 flex flex-col min-h-[220px]">
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setError(null);
            }}
            placeholder='Paste person JSON here, e.g. { "name": "Jane Doe", "designation": "Staff Engineer", "quote": "...", "photo": "..." }'
            className="w-full flex-1 p-3.5 bg-[#090909] border border-white/15 rounded-xl font-mono-tech text-[11px] text-[#00FF66] placeholder:text-[#555555] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] resize-none leading-relaxed overflow-y-auto"
            rows={12}
            spellCheck={false}
          />

          {error && (
            <div className="mt-2 p-2 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-[10px] font-mono-tech">
              {error}
            </div>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[9.5px] font-mono-tech text-[#7A7A72]">
            Tip: You can also drag & drop any <code className="text-[#FF5A1F]">.json</code> file onto the screen or pass <code className="text-[#FF5A1F]">?json=&#123;...&#125;</code> in URL.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-[11px] font-mono-tech text-[#8A8A82] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-lg bg-[#FF5A1F] hover:bg-[#FF7038] active:bg-[#E04B14] text-black font-extrabold text-[11px] font-mono-tech uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Render Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
