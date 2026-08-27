export function normalizeVideoUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return { kind: "none", src: "" };

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}?rel=0` } : { kind: "iframe", src: raw };
    }

    if (host.endsWith("youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
      if (id && !["watch", "shorts", "live", "embed"].includes(id)) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}?rel=0` };
      if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/live/")) {
        const pathId = url.pathname.split("/").filter(Boolean)[1];
        if (pathId) return { kind: "iframe", src: `https://www.youtube.com/embed/${pathId}?rel=0` };
      }
      if (url.pathname.startsWith("/embed/")) return { kind: "iframe", src: raw };
    }

    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id ? { kind: "iframe", src: `https://player.vimeo.com/video/${id}` } : { kind: "iframe", src: raw };
    }
    if (host === "player.vimeo.com") return { kind: "iframe", src: raw };
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url.pathname + url.search)) return { kind: "video", src: raw };
    return { kind: "iframe", src: raw };
  } catch {
    return { kind: "iframe", src: raw };
  }
}

export function normalizeDocumentUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "drive.google.com") {
      const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      const id = fileMatch?.[1] || url.searchParams.get("id");
      if (id) return `https://drive.google.com/file/d/${id}/preview`;
    }
    return raw;
  } catch {
    return raw;
  }
}

export function isPdfUrl(value) {
  return /\.pdf(\?.*)?$/i.test(String(value || ""));
}
