'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import type { GalleryLightboxLabels } from '@/src/lib/transform/transformSiteContent';
import { formatCounter, keyToAction, neighbourIndexes, stepIndex, swipeToAction } from './lightbox-nav';
import './GalleryLightbox.scss';

export interface GalleryImage {
  readonly url: string;
  /** Alt text for the image (already falls back to a generated one). */
  readonly alt: string;
  /** Caption shown under the large image, '' for none. */
  readonly caption: string;
  readonly width: number;
  readonly height: number;
}

interface GalleryLightboxProps {
  images: readonly GalleryImage[];
  labels: GalleryLightboxLabels;
}

interface PointerStart {
  readonly x: number;
  readonly y: number;
}

/**
 * Case study gallery: server-rendered thumbnail grid (visible without JS) whose
 * thumbnails open a native <dialog> lightbox at the clicked image.
 */
export default function GalleryLightbox({ images, labels }: GalleryLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const triggerIndexRef = useRef<number | null>(null);
  const pointerStartRef = useRef<PointerStart | null>(null);
  const swipedRef = useRef(false);
  const total = images.length;

  const open = (index: number) => {
    triggerIndexRef.current = index;
    setOpenIndex(index);
  };

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const step = useCallback(
    (action: 'previous' | 'next') => {
      setOpenIndex((current) => (current === null ? current : stepIndex(current, action, total)));
    },
    [total],
  );

  // Open the native modal once the lightbox has an image to show.
  const isOpen = openIndex !== null;
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog || dialog.open) return;
    dialog.showModal();
  }, [isOpen]);

  // Lock page scroll while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Fires for the close button, Escape, backdrop click and dialog.close().
  const handleClose = () => {
    setOpenIndex(null);
    const trigger = triggerIndexRef.current;
    if (trigger !== null) thumbnailRefs.current[trigger]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    const action = keyToAction(event.key);
    if (!action) return;
    event.preventDefault();
    if (action === 'close') close();
    else step(action);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    swipedRef.current = false;
    pointerStartRef.current = event.pointerType === 'mouse' ? null : { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: PointerEvent<HTMLDialogElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;
    const action = swipeToAction(event.clientX - start.x, event.clientY - start.y);
    if (!action) return;
    swipedRef.current = true;
    step(action);
  };

  // A click on the dimmed area around the image (not on the image or a control) closes.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }
    const target = event.target as HTMLElement;
    if (target.dataset.lightboxBackdrop !== undefined) close();
  };

  const current = openIndex === null ? null : images[openIndex];

  return (
    <>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <button
            key={image.url + index}
            ref={(element) => {
              thumbnailRefs.current[index] = element;
            }}
            type="button"
            className="gallery-item"
            aria-haspopup="dialog"
            onClick={() => open(index)}
          >
            <Image
              src={image.url}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="gallery-image"
            />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="gallery-lightbox"
        aria-label={current ? current.alt : undefined}
        data-lightbox-backdrop=""
        onClose={handleClose}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      >
        {current && openIndex !== null && (
          <>
            <button
              type="button"
              className="gallery-lightbox__button gallery-lightbox__close"
              aria-label={labels.close}
              autoFocus
              onClick={close}
            >
              <span aria-hidden="true">&#x2715;</span>
            </button>

            <figure className="gallery-lightbox__stage" data-lightbox-backdrop="">
              <Image
                key={openIndex}
                src={current.url}
                alt={current.alt}
                width={current.width}
                height={current.height}
                sizes="90vw"
                loading="eager"
                className="gallery-lightbox__image"
              />
              {current.caption && <figcaption className="gallery-lightbox__caption">{current.caption}</figcaption>}
            </figure>

            {total > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-lightbox__button gallery-lightbox__nav gallery-lightbox__nav--previous"
                  aria-label={labels.previous}
                  onClick={() => step('previous')}
                >
                  <span aria-hidden="true">&#x2190;</span>
                </button>
                <button
                  type="button"
                  className="gallery-lightbox__button gallery-lightbox__nav gallery-lightbox__nav--next"
                  aria-label={labels.next}
                  onClick={() => step('next')}
                >
                  <span aria-hidden="true">&#x2192;</span>
                </button>
              </>
            )}

            <p className="gallery-lightbox__counter" aria-live="polite">
              {formatCounter(labels.counterFormat, openIndex, total)}
            </p>

            <div className="gallery-lightbox__preload" aria-hidden="true">
              {neighbourIndexes(openIndex, total).map((index) => (
                <Image
                  key={index}
                  src={images[index].url}
                  alt=""
                  width={images[index].width}
                  height={images[index].height}
                  sizes="90vw"
                  loading="eager"
                />
              ))}
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
