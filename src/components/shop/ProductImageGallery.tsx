"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/shared/SafeImage";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  title: string;
  images: string[];
};

type ViewerState = {
  open: boolean;
  index: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function ProductImageGallery({ title, images }: Props) {
  const uniqueImages = useMemo(() => {
    const seen = new Set<string>();
    return images.filter((src) => {
      if (!src) return false;
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    });
  }, [images]);

  const [active, setActive] = useState(0);
  const [viewer, setViewer] = useState<ViewerState>({ open: false, index: 0 });

  const openViewer = useCallback((index: number) => {
    setViewer({ open: true, index });
  }, []);

  const closeViewer = useCallback(() => {
    setViewer((v) => ({ ...v, open: false }));
  }, []);

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + uniqueImages.length) % uniqueImages.length);
  }, [uniqueImages.length]);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % uniqueImages.length);
  }, [uniqueImages.length]);

  useEffect(() => {
    setActive(0);
  }, [uniqueImages.join("|")]);

  if (uniqueImages.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-100 text-gray-400 text-sm">
        No image available
      </div>
    );
  }

  const mainSrc = uniqueImages[active];

  return (
    <div>
      <div className="relative bg-white rounded-3xl shadow-md overflow-hidden p-6 sm:p-8 mb-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
          <button
            type="button"
            onClick={() => openViewer(active)}
            className="group absolute inset-0"
            aria-label="Open image viewer"
          >
            <SafeImage
              src={mainSrc}
              alt={title}
              fill
              sizes="(min-width: 1024px) 40rem, (min-width: 768px) 50vw, 100vw"
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        </div>

        {uniqueImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-800" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {uniqueImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {uniqueImages.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={`relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm transition ring-2 ${
                idx === active ? "ring-gray-900" : "ring-transparent"
              }`}
              aria-label={`Select image ${idx + 1}`}
            >
              <SafeImage
                src={src}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                sizes="5rem"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <CanvasImageViewer
        title={title}
        images={uniqueImages}
        open={viewer.open}
        index={viewer.index}
        onOpenChange={(open) =>
          setViewer((v) => ({
            ...v,
            open,
            index: clamp(v.index, 0, uniqueImages.length - 1),
          }))
        }
        onIndexChange={(index) =>
          setViewer((v) => ({
            ...v,
            index: clamp(index, 0, uniqueImages.length - 1),
          }))
        }
        onClose={closeViewer}
      />
    </div>
  );
}

function CanvasImageViewer({
  title,
  images,
  open,
  index,
  onIndexChange,
  onOpenChange,
  onClose,
}: {
  title: string;
  images: string[];
  open: boolean;
  index: number;
  onIndexChange: (idx: number) => void;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Track drag state in a ref so mouse-move handlers don't need pan in deps
  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
    moved: boolean; // did the pointer actually move? used to distinguish click vs drag
  }>({ dragging: false, startX: 0, startY: 0, panX: 0, panY: 0, moved: false });

  const src = images[index] ?? "";

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!canvas || !container || !img) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const scaleFit = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    const scale = scaleFit * zoom;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = (w - drawW) / 2 + pan.x;
    const y = (h - drawH) / 2 + pan.y;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, x, y, drawW, drawH);
  }, [pan.x, pan.y, zoom]);

  useEffect(() => {
    if (!open) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    imgRef.current = img;

    setZoom(1);
    setPan({ x: 0, y: 0 });

    const handleLoad = () => draw();
    img.addEventListener("load", handleLoad);
    return () => img.removeEventListener("load", handleLoad);
  }, [src, open, draw]);

  useEffect(() => {
    if (!open) return;
    draw();
  }, [open, zoom, pan, draw]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, draw]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowLeft")
        onIndexChange((index - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onIndexChange((index + 1) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, index, images.length, onClose, onIndexChange, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  // ── Pointer handlers on the canvas ─────────────────────────────────────────
  // A plain click (no meaningful drag) on the canvas backdrop closes the viewer.
  // We distinguish drag vs. click via the `moved` flag.
  const handleCanvasPointerDown = (e: React.MouseEvent) => {
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
  };

  const handleCanvasPointerMove = (e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    // Only count as a drag if pointer moved > 4px
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.moved = true;
    }
    if (dragRef.current.moved) {
      setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
    }
  };

  const handleCanvasPointerUp = () => {
    dragRef.current.dragging = false;
  };

  // Clicking the canvas area (not a drag) closes the viewer
  const handleCanvasClick = () => {
    if (!dragRef.current.moved) {
      onClose();
    }
    dragRef.current.moved = false;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Full content wrapper — pointer events managed per-element */}
      <div className="relative h-full w-full">
        {/* ── Header bar ── */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-3 p-4 text-white">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{title}</p>
            <p className="text-xs text-white/70">
              Image {index + 1} of {images.length}
            </p>
          </div>
          {/* Close button — stopPropagation so the canvas click handler doesn't fire */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
            aria-label="Close viewer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Canvas area (click-to-close + drag-to-pan) ── */}
        <div
          ref={containerRef}
          className="absolute inset-0 pt-16 pb-16"
          onWheel={(e) => {
            e.preventDefault();
            setZoom((z) => clamp(z * (e.deltaY > 0 ? 0.9 : 1.1), 0.75, 6));
          }}
          onMouseDown={handleCanvasPointerDown}
          onMouseMove={handleCanvasPointerMove}
          onMouseUp={handleCanvasPointerUp}
          onMouseLeave={handleCanvasPointerUp}
          onClick={handleCanvasClick}
          style={{ cursor: zoom > 1 ? "grab" : "zoom-out" }}
        >
          <canvas ref={canvasRef} className="block h-full w-full" />
        </div>

        {/* ── Prev / Next buttons ── */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange((index - 1 + images.length) % images.length);
              }}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange((index + 1) % images.length);
              }}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* ── Hint ── */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-xs text-white/80">
          Click anywhere to close · Scroll to zoom · Drag to pan
        </div>
      </div>
    </div>
  );
}
