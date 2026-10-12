import { useState, useEffect, useCallback } from 'react';
import { MAX_FILE_BYTES, MAX_SOPS } from '@/lib/sop/constants';
import { createBrowserClient } from '@/lib/auth/supabase-browser';

export type Sop = {
  id: string;
  title: string;
  mime_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  page_count: number | null;
};

export function useSops() {
  const [sops, setSops] = useState<Sop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSops = useCallback(async () => {
    try {
      const res = await fetch('/api/sop');
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to load SOPs");
      }
      const data = await res.json();
      setSops(data.sops);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSops();
  }, [fetchSops]);

  const activateSop = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/sop/${id}/activate`, { method: 'PATCH' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to activate");
      }
      await fetchSops();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const renameSop = async (id: string, newTitle: string) => {
    // Optimistic update
    setSops((prev) => prev.map((s) => s.id === id ? { ...s, title: newTitle } : s));
    try {
      const res = await fetch(`/api/sop/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to rename");
      }
      // Re-fetch to guarantee sync (or rely on optimistic)
      await fetchSops();
    } catch (err: any) {
      setError(err.message);
      // Revert optimistic on fail
      await fetchSops();
    }
  };

  const deleteSop = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/sop/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      await fetchSops();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const uploadSop = async (file: File) => {
    setError(null);
    try {
      if (file.size > MAX_FILE_BYTES) throw new Error("File exceeds 5 MB limit.");
      if (sops.length >= MAX_SOPS) throw new Error("Maximum of 5 SOPs reached.");

      const initRes = await fetch('/api/sop/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
        })
      });

      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || "Failed to initialize upload");

      const supabase = createBrowserClient();
      const { error: uploadErr } = await supabase.storage
        .from('sops')
        .uploadToSignedUrl(initData.path, initData.token, file);

      if (uploadErr) throw new Error("Failed to upload file to storage");

      const finalRes = await fetch(`/api/sop/${initData.sopId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: initData.path })
      });

      const finalData = await finalRes.json();
      if (!finalRes.ok) throw new Error(finalData.error || "Failed to finalize upload");

      await fetchSops();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { sops, loading, error, uploadSop, activateSop, renameSop, deleteSop, setError };
}
