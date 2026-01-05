import React from 'react';
import { Upload, Layout, Loader, ArrowRight, AlertCircle } from 'lucide-react';

export default function UploadCard({
  imagePreview,
  onUpload,
  userContext,
  onUserContextChange,
  onAnalyze,
  isAnalyzing,
  hasImage,
  error,
}) {
  const disabled = isAnalyzing || !hasImage;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-shrink-0 transition-all overflow-y-auto max-h-[40vh]">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-blue-600" />
        1. Upload Interface
      </h2>

      <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors group">
        <input
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {imagePreview ? (
          <div className="relative flex items-center justify-center space-x-4">
            <img src={imagePreview} alt="Preview" className="h-16 rounded shadow-sm" />
            <span className="text-sm text-slate-500">Click to change</span>
          </div>
        ) : (
          <div className="space-y-2 pointer-events-none py-2">
            <div className="mx-auto w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Layout className="w-5 h-5" />
            </div>
            <p className="font-medium text-sm">Drop screenshot here</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Context for AI (Optional)
        </label>
        <textarea
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none"
          rows={2}
          placeholder="E.g. 'Target audience is seniors', 'Make it dark mode', 'This is a medical app'..."
          value={userContext}
          onChange={(e) => onUserContextChange(e.target.value)}
        />
      </div>

      <button
        onClick={onAnalyze}
        disabled={disabled}
        className={`w-full mt-4 py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all
          ${
            isAnalyzing
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
          }`}
      >
        {isAnalyzing ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <span>Run C.L.E.A.R. Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-md flex items-start">
          <AlertCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

