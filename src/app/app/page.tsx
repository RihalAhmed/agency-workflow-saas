"use client";

import React, { useState, useRef } from "react";
import type { GeneratedCopyOutput } from "@/lib/ai/copy-generator";
import { Upload, RotateCcw, Wand2, Loader2, ExternalLink, Save, CheckCircle, Search } from "lucide-react";
import { TrustBadgeSelector } from "@/lib/trust/TrustBadgeSelector";
import { ImageUploadZone, type ClassifiedImage } from "@/lib/images/ImageUploadZone";
import { templateMetas, type TemplateId } from "@/templates/registry";
export default function GeneratorPage() {
  const [formData, setFormData] = useState({
    name: "Crown Pest Control",
    category: "pest-control",
    city: "Jacksonville",
    phone: "(904) 743-1132",
    email: "crownpestcontroljax@gmail.com",
    companyContext:
      "Family-owned local pest control firm operating since 1979 in Jacksonville, Florida. We specialize in 100% kid and pet safe botanical treatments, state licensed technicians, free reinspections if pests return, and emergency response for termites and rodents.",
    apiKey: "",
    prospectUrl: "",
    trustBadges: [] as string[],
    templateId: "crown-home" as TemplateId,
  });

  // Logo file upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>("/assets/logo.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prospect images upload state
  const [prospectImages, setProspectImages] = useState<ClassifiedImage[]>([]);

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<{
    slug: string;
    previewUrl: string;
    tokens: Record<string, string>;
    copy: GeneratedCopyOutput;
    logoPath: string;
  } | null>(null);
  const [editableCopy, setEditableCopy] = useState<GeneratedCopyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [scanningTrust, setScanningTrust] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const handleResetToDemoLogo = () => {
    setLogoFile(null);
    setLogoPreview("/assets/logo.png");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleScanTrust = async () => {
    if (!formData.prospectUrl) return;
    setScanningTrust(true);
    try {
      const res = await fetch("/api/scrape-trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.prospectUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        const foundBadges = Object.keys(data).filter((key) => data[key].found);
        // Combine newly found badges with currently selected (no duplicates)
        const combined = Array.from(new Set([...formData.trustBadges, ...foundBadges]));
        setFormData({ ...formData, trustBadges: combined });
      }
    } catch (err) {
      console.error("Failed to scan trust signals", err);
    } finally {
      setScanningTrust(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("city", formData.city);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("companyContext", formData.companyContext);
      data.append("apiKey", formData.apiKey);
      data.append("templateId", formData.templateId);

      if (logoFile) {
        data.append("logo", logoFile);
      } else {
        data.append("logoPath", "/assets/logo.png");
      }
      
      // Pass trust badges as JSON
      data.append("trustBadges", JSON.stringify(formData.trustBadges));

      // Pass prospect images and their slots
      const imageSlots: Record<string, string> = {};
      prospectImages.forEach((img, i) => {
        data.append(`image_${i}`, img.file);
        imageSlots[`image_${i}`] = img.slot;
      });
      data.append("imageSlots", JSON.stringify(imageSlots));

      const res = await fetch("/api/generate", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Generation failed");
      }
      setResult(json);
      setEditableCopy(json.copy);
    } catch (err: any) {
      setError(err.message || "Failed to generate landing page");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCopy = async () => {
    if (!result || !editableCopy) return;
    setUpdating(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          slug: result.slug,
          logoPath: result.logoPath,
          copy: editableCopy,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Update failed");
      }
      setResult(data);
      setEditableCopy(data.copy);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update copy");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-body selection:bg-amber-400 selection:text-slate-950">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading tracking-wide text-amber-400">
              NICHE LANDING PAGE GENERATOR
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Deterministic Token Pipeline + AI Copywriting Engine for Instant Client Pitch Pages
            </p>
          </div>
          <span className="px-3.5 py-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs rounded-full font-mono font-semibold">
            Logo Upload & AI Copy
          </span>
        </div>

        {/* Input Form */}
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>1. Choose a Design Template</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {templateMetas.map((template) => {
                const isMatch = template.niche.includes(formData.category);
                return (
                  <div
                    key={template.id}
                    onClick={() => setFormData({ ...formData, templateId: template.id as TemplateId })}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative ${
                      formData.templateId === template.id
                        ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                        : "border-slate-800 bg-slate-950 hover:border-slate-600"
                    }`}
                  >
                    {!isMatch && (
                      <div className="absolute top-2 right-2 flex">
                        <span className="text-[9px] uppercase bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Other Niche</span>
                      </div>
                    )}
                    <div className="font-bold text-white mb-2">{template.name}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {template.styleTags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-8">
              <span>2. Company Information & Logo</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Prospect Website URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.prospectUrl}
                    onChange={(e) => setFormData({ ...formData, prospectUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleScanTrust}
                    disabled={scanningTrust || !formData.prospectUrl}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-medium text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                  >
                    {scanningTrust ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Scan</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Niche / Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="pest-control">Pest Control</option>
                  <option value="roofing">Roofing</option>
                  <option value="hvac">HVAC</option>
                  <option value="plumbing">Plumbing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target City / Region *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Logo Upload Zone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Upload Business Logo (PNG, JPG, WebP, SVG) *
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
                {/* Logo Preview Frame */}
                <div className="relative w-44 h-24 bg-slate-900 border border-slate-700/80 rounded-lg flex items-center justify-center p-2 overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">No logo</span>
                  )}
                </div>

                {/* Upload Buttons & Status */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="logo-file-input"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-file-input"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-lg cursor-pointer transition-colors inline-flex items-center gap-2 shadow-sm"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Choose Logo File</span>
                    </label>

                    {logoFile && (
                      <button
                        type="button"
                        onClick={handleResetToDemoLogo}
                        className="text-xs text-slate-400 hover:text-red-400 underline cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to Demo Logo</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    {logoFile ? (
                      <span className="text-emerald-400 font-medium">
                        ✓ Selected: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                      </span>
                    ) : (
                      "Using default Crown Pest Control logo (/assets/logo.png). Click 'Choose Logo File' to upload your client's logo."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Prospect Photos Upload Zone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Prospect Photos (Auto-Categorized)
              </label>
              <ImageUploadZone onImagesChange={setProspectImages} />
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <TrustBadgeSelector
                selected={formData.trustBadges}
                onChange={(badges) => setFormData({ ...formData, trustBadges: badges })}
                isScanning={scanningTrust}
                niche={formData.category}
              />
            </div>

            {/* Company Context Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Company Context & Story (Used by AI to write draft copy) *
                </label>
                <span className="text-[11px] text-amber-400/80">
                  Describe what makes them unique, guarantees, history
                </span>
              </div>
              <textarea
                rows={4}
                value={formData.companyContext}
                onChange={(e) =>
                  setFormData({ ...formData, companyContext: e.target.value })
                }
                placeholder="Paste information about the company: e.g. 'Founded in 1985 by veteran John Doe. Specialize in 100% pet-friendly organic termite treatments. Offer 24/7 same day service with a money back guarantee. Over 10,000 happy clients across Austin.'"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-600 leading-relaxed"
              />
            </div>

            {/* Optional Gemini API Key */}
            <div className="pt-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Google Gemini API Key (Optional — Free from aistudio.google.com)
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="AIzaSy... (Leave blank to use the built-in smart contextual generator)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Gemini API offers a generous 100% free tier. If omitted, the engine uses our smart built-in contextual rule model.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: "Crown Pest Control",
                    category: "pest-control",
                    city: "Jacksonville",
                    phone: "(904) 743-1132",
                    email: "crownpestcontroljax@gmail.com",
                    companyContext:
                      "Family-owned local pest control firm operating since 1979 in Jacksonville, Florida. We specialize in 100% kid and pet safe botanical treatments, state licensed technicians, free reinspections if pests return, and emergency response for termites and rodents.",
                    apiKey: "",
                    prospectUrl: "",
                    trustBadges: [],
                    templateId: "crown-home",
                  });
                  handleResetToDemoLogo();
                }}
                className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                Reset to Crown Pest Control defaults
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3 bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm hover:bg-amber-300 disabled:opacity-50 transition-all shadow-lg hover:shadow-amber-400/20 cursor-pointer flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 text-slate-950" />
                    <span>Extracting Logo Tokens & Generating Copy...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-slate-950" />
                    <span>Generate Landing Page (1-Click)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results & Interactive Copy Editor */}
        {result && editableCopy && (
          <div className="space-y-6">
            {/* Success Bar */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-emerald-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider inline-flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Page Generated Successfully</span>
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Site Spec Ready: <span className="text-amber-400">{result.slug}</span>
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={result.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-lg shadow-md transition-colors flex items-center gap-2"
                >
                  <span>Open Live Preview</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Tokens Swatches */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Extracted OKLCH Brand Tokens (Derived from Logo)
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
                {Object.entries(result.tokens).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center"
                  >
                    <div
                      className="w-full h-8 rounded mb-1 border border-white/10"
                      style={{ backgroundColor: val }}
                    />
                    <div className="text-[10px] font-mono text-slate-300 truncate">
                      {key}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 truncate">
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editable AI Copy Panel */}
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>2. Review & Tweak AI-Generated Copy</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Make any tweaks to headings or paragraphs below, then click "Update Live Preview" to refresh the site.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateCopy}
                  disabled={updating}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-md disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Update & Re-Save Preview</span>
                    </>
                  )}
                </button>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Changes updated! Refresh your preview tab to see the new copy.</span>
                </div>
              )}

              {/* Hero Heading Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Hero Section Heading
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Prefix Words
                    </label>
                    <input
                      type="text"
                      value={editableCopy.heroPrefix}
                      onChange={(e) =>
                        setEditableCopy({ ...editableCopy, heroPrefix: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                      Highlighted Phrase (Accent Color)
                    </label>
                    <input
                      type="text"
                      value={editableCopy.heroHighlight}
                      onChange={(e) =>
                        setEditableCopy({ ...editableCopy, heroHighlight: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-amber-400/50 rounded px-3 py-2 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Suffix Words
                    </label>
                    <input
                      type="text"
                      value={editableCopy.heroSuffix}
                      onChange={(e) =>
                        setEditableCopy({ ...editableCopy, heroSuffix: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-Badges */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Hero Sub-Badges Row
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {editableCopy.subBadges.map((badge, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={badge.icon}
                        onChange={(e) => {
                          const updated = [...editableCopy.subBadges];
                          updated[idx].icon = e.target.value;
                          setEditableCopy({ ...editableCopy, subBadges: updated });
                        }}
                        className="w-12 bg-slate-950 border border-slate-800 rounded px-2 py-2 text-center text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        value={badge.text}
                        onChange={(e) => {
                          const updated = [...editableCopy.subBadges];
                          updated[idx].text = e.target.value;
                          setEditableCopy({ ...editableCopy, subBadges: updated });
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Heading */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                  Quote Form Title
                </h4>
                <input
                  type="text"
                  value={editableCopy.formTitle}
                  onChange={(e) =>
                    setEditableCopy({ ...editableCopy, formTitle: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* About Section Heading & Story */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  About Section Heading & 3-Paragraph Story
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    About Section Headline
                  </label>
                  <input
                    type="text"
                    value={editableCopy.aboutHeadline}
                    onChange={(e) =>
                      setEditableCopy({ ...editableCopy, aboutHeadline: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-3">
                  {editableCopy.aboutParagraphs.map((para, idx) => (
                    <div key={idx}>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Paragraph {idx + 1}
                      </label>
                      <textarea
                        rows={3}
                        value={para}
                        onChange={(e) => {
                          const updated = [...editableCopy.aboutParagraphs];
                          updated[idx] = e.target.value;
                          setEditableCopy({ ...editableCopy, aboutParagraphs: updated });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400 leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleUpdateCopy}
                  disabled={updating}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-lg transition-colors shadow-md disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update & Re-Save Preview</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
