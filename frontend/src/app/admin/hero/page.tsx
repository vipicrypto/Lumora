"use client";

import { FormEvent, useEffect, useState, useRef } from "react";

type HeroSlide = {
  id: string;
  title: string;
  description: string | null;
  mediaType: string;
  mediaUrl: string;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  isActive: boolean;
  animation: string;
  animationDuration: number;
  createdAt: string;
  updatedAt: string;
};

type HeroForm = {
  title: string;
  description: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  buttonText: string;
  buttonLink: string;
  sortOrder: string;
  isActive: boolean;
  animation: string;
  animationDuration: number;
};

const emptyForm: HeroForm = {
  title: "",
  description: "",
  mediaType: "IMAGE",
  mediaUrl: "",
  buttonText: "",
  buttonLink: "",
  sortOrder: "0",
  isActive: true,
  animation: "fade",
  animationDuration: 600,
};

const ANIMATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "zoom", label: "Zoom" },
];

const DURATION_OPTIONS = [
  { value: 300, label: "300 ms" },
  { value: 500, label: "500 ms" },
  { value: 600, label: "600 ms" },
  { value: 700, label: "700 ms" },
  { value: 1000, label: "1000 ms" },
];

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<HeroForm>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);

  async function loadSlides() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/hero", { method: "GET", cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load hero slides.");
      setSlides(data.slides || []);
    } catch (err) {
      console.error("Load hero slides error:", err);
      setError(err instanceof Error ? err.message : "Unable to load hero slides.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSlides(); }, []);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setUploadError("");
    setUploadedMediaUrl(null);
    setShowForm(true);
  }

  function closeForm() {
    if (saving || uploading) return;
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setUploadError("");
    setUploadedMediaUrl(null);
  }

  function updateForm(field: keyof HeroForm, value: string | boolean | number) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const response = await fetch("/api/admin/hero/upload", { method: "POST", body: uploadFormData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setUploadedMediaUrl(data.url);
      setForm((current) => ({ ...current, mediaUrl: data.url }));
      if (file.type.startsWith("video/")) {
        setForm((current) => ({ ...current, mediaType: "VIDEO" }));
      } else {
        setForm((current) => ({ ...current, mediaType: "IMAGE" }));
      }
    } catch (err) {
      console.error("File upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    const isValidType = [...validImageTypes, ...validVideoTypes].includes(file.type);
    if (!isValidType) {
      setUploadError("Invalid file type. Please upload an image (JPEG, PNG, WEBP, GIF) or video (MP4, WEBM, OGG).");
      return;
    }
    const maxSize = file.type.startsWith("video/") ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File too large. Max size is ${file.type.startsWith("video/") ? "50MB" : "10MB"}.`);
      return;
    }
    handleFileUpload(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Determine the final mediaUrl:
      // 1. If we have a newly uploaded file, use that (uploadedMediaUrl takes precedence)
      // 2. If editing and user explicitly entered an external URL (form.mediaUrl is not empty and is an external URL)
      // 3. If editing, preserve existing slide mediaUrl
      let finalMediaUrl = "";
      
      if (uploadedMediaUrl) {
        // New upload takes precedence
        finalMediaUrl = uploadedMediaUrl;
      } else if (form.mediaUrl) {
        // Use external URL (either newly entered or existing from edit)
        finalMediaUrl = form.mediaUrl;
      } else if (editingId) {
        // Editing with no new upload and no external URL - preserve existing
        const existingSlide = slides.find(s => s.id === editingId);
        finalMediaUrl = existingSlide?.mediaUrl || "";
      }

      if (!finalMediaUrl) {
        throw new Error("Please upload an image/video or enter an external URL.");
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        mediaType: form.mediaType,
        mediaUrl: finalMediaUrl,
        buttonText: form.buttonText.trim() || null,
        buttonLink: form.buttonLink.trim() || null,
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
        animation: form.animation,
        animationDuration: form.animationDuration,
      };
      const url = "/api/admin/hero";
      const method = editingId ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: editingId ? JSON.stringify({ id: editingId, ...payload }) : JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save slide.");
      setSuccess(editingId ? "Slide updated successfully!" : "Slide created successfully!");
      await loadSlides();
      closeForm();
    } catch (err) {
      console.error("Save hero slide error:", err);
      setError(err instanceof Error ? err.message : "Failed to save slide.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(slide: HeroSlide) {
    setEditingId(slide.id);
    setForm({
      title: slide.title || "",
      description: slide.description || "",
      mediaType: slide.mediaType as "IMAGE" | "VIDEO",
      mediaUrl: slide.mediaUrl || "",
      buttonText: slide.buttonText || "",
      buttonLink: slide.buttonLink || "",
      sortOrder: String(slide.sortOrder || "0"),
      isActive: slide.isActive,
      animation: slide.animation || "fade",
      animationDuration: slide.animationDuration || 600,
    });
    setUploadedMediaUrl(null);
    setError("");
    setSuccess("");
    setUploadError("");
    setShowForm(true);
  }

  async function handleDelete(slide: HeroSlide) {
    if (!confirm(`Delete slide "${slide.title}"? This cannot be undone.`)) return;
    try {
      const response = await fetch("/api/admin/hero", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: slide.id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete slide.");
      setSuccess("Slide deleted successfully.");
      await loadSlides();
    } catch (err) {
      console.error("Delete hero slide error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete slide.");
    }
  }

  async function handleToggleActive(slide: HeroSlide) {
    try {
      const response = await fetch("/api/admin/hero", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: slide.id, isActive: !slide.isActive }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update slide.");
      await loadSlides();
    } catch (err) {
      console.error("Toggle active error:", err);
      setError(err instanceof Error ? err.message : "Failed to update slide.");
    }
  }

  async function handleMove(slide: HeroSlide, direction: -1 | 1) {
    const sortedSlides = [...slides].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
    const currentIndex = sortedSlides.findIndex((s) => s.id === slide.id);
    const swapIndex = currentIndex + direction;
    if (swapIndex < 0 || swapIndex >= sortedSlides.length) return;
    const swapSlide = sortedSlides[swapIndex];
    const currentOrder = Number(slide.sortOrder || 0);
    const swapOrder = Number(swapSlide.sortOrder || 0);
    try {
      await Promise.all([
        fetch("/api/admin/hero", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: slide.id, sortOrder: swapOrder }) }),
        fetch("/api/admin/hero", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: swapSlide.id, sortOrder: currentOrder }) }),
      ]);
      await loadSlides();
    } catch (err) {
      console.error("Reorder error:", err);
      setError(err instanceof Error ? err.message : "Failed to reorder slides.");
    }
  }

  const filteredSlides = slides.filter((slide) => slide.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const sortedSlides = [...filteredSlides].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Hero Slides</h1>
            <p className="mt-1 text-sm text-neutral-500">Manage your homepage hero carousel slides</p>
          </div>
          <button type="button" onClick={openCreateForm} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Slide
          </button>
        </div>

        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-black">{editingId ? "Edit Slide" : "Create New Slide"}</h2>
                <button type="button" onClick={closeForm} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600" disabled={saving || uploading}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="max-h-[85vh] overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">Title <span className="text-red-500">*</span></label>
                    <input type="text" value={form.title} onChange={(e) => updateForm("title", e.target.value)} required className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none" placeholder="Slide title" />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">Description</label>
                    <textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={3} className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none" placeholder="Optional description" />
                  </div>

                  {/* Media Upload Section */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">Media <span className="text-red-500">*</span></label>
                    
                    {/* Current Media Preview */}
                    {(uploadedMediaUrl || form.mediaUrl) && (
                      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            {uploadedMediaUrl ? "Uploaded Media Active" : "External URL"}
                          </span>
                          {uploadedMediaUrl && (
                            <span className="text-xs text-green-600">(Local upload will be used)</span>
                          )}
                        </div>
                        <div className="relative h-40 w-full overflow-hidden rounded-lg bg-neutral-100">
                          {form.mediaType === "VIDEO" || (form.mediaUrl && form.mediaUrl.match(/\.(mp4|webm|ogg)(\?|$)/i)) ? (
                            <video src={uploadedMediaUrl || form.mediaUrl} controls className="h-full w-full object-contain" />
                          ) : (
                            <img src={uploadedMediaUrl || form.mediaUrl} alt="Media preview" className="h-full w-full object-contain" />
                          )}
                        </div>
                        <p className="mt-2 truncate text-xs text-neutral-500">
                          {uploadedMediaUrl ? `Upload: ${uploadedMediaUrl}` : `URL: ${form.mediaUrl}`}
                        </p>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="mb-4">
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg" onChange={handleFileInputChange} className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-50">
                        {uploading ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Upload Image / Video
                          </>
                        )}
                      </button>
                      {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
                    </div>

                    {/* OR External URL */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-sm text-neutral-400">OR USE EXTERNAL URL (OPTIONAL)</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <input type="text" value={form.mediaUrl} onChange={(e) => updateForm("mediaUrl", e.target.value)} className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none" placeholder="https://example.com/image.jpg" />
                      <p className="mt-1.5 text-xs text-neutral-400">
                        {uploadedMediaUrl 
                          ? "External URL is optional. Uploaded media will be used if this field is empty." 
                          : "Enter an external image or video URL if you prefer not to upload a file."}
                      </p>
                    </div>
                  </div>

                  {/* Button Settings */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">Button Text</label>
                      <input type="text" value={form.buttonText} onChange={(e) => updateForm("buttonText", e.target.value)} className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none" placeholder="Shop Now" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">Button Link</label>
                      <input type="text" value={form.buttonLink} onChange={(e) => updateForm("buttonLink", e.target.value)} className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none" placeholder="#gifts or /products" />
                    </div>
                  </div>

                  {/* Animation Settings */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">Animation</label>
                      <select value={form.animation} onChange={(e) => updateForm("animation", e.target.value)} className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none">
                        {ANIMATION_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">Duration</label>
                      <select value={form.animationDuration} onChange={(e) => updateForm("animationDuration", Number(e.target.value))} className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none">
                        {DURATION_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">Sort Order</label>
                      <input type="number" value={form.sortOrder} onChange={(e) => updateForm("sortOrder", e.target.value)} min="0" className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-400 focus:outline-none" />
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => updateForm("isActive", !form.isActive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-black" : "bg-neutral-200"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    <span className="text-sm font-medium text-neutral-700">{form.isActive ? "Active" : "Inactive"}</span>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
                    <button type="button" onClick={closeForm} disabled={saving || uploading} className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50">
                      {saving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-white" />
                          Saving...
                        </>
                      ) : (
                        editingId ? "Update Slide" : "Create Slide"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-black" /></div>
        ) : slides.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-white py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <svg className="h-6 w-6 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
            </div>
            <p className="mb-2 font-medium text-neutral-700">No hero slides yet</p>
            <p className="mb-6 text-sm text-neutral-500">Create your first slide to get started</p>
            <button type="button" onClick={openCreateForm} className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800">Create Slide</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mb-4">
              <input type="text" placeholder="Search slides..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none" />
            </div>
            {sortedSlides.map((slide) => (
              <div key={slide.id} className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {slide.mediaUrl && (
                    slide.mediaType === "VIDEO" || slide.mediaUrl.match(/\.(mp4|webm|ogg)(\?|$)/i) ? (
                      <video src={slide.mediaUrl} className="h-full w-full object-cover" />
                    ) : (
                      <img src={slide.mediaUrl} alt={slide.title} className="h-full w-full object-cover" />
                    )
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-black">{slide.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${slide.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{slide.isActive ? "Active" : "Inactive"}</span>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-600">{slide.mediaType}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-600">{slide.animation}</span>
                  </div>
                  {slide.description && <p className="mt-1 line-clamp-1 max-w-xl text-sm text-neutral-500">{slide.description}</p>}
                  <p className="mt-1 text-xs text-neutral-400">Order #{slide.sortOrder}  {slide.animation}  {slide.animationDuration}ms</p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button type="button" onClick={() => handleMove(slide, -1)} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black">?</button>
                  <button type="button" onClick={() => handleMove(slide, 1)} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black">?</button>
                  <button type="button" onClick={() => startEdit(slide)} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black">Edit</button>
                  <button type="button" onClick={() => handleToggleActive(slide)} className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black">{slide.isActive ? "Disable" : "Enable"}</button>
                  <button type="button" onClick={() => handleDelete(slide)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

