import React, { useEffect, useRef, useState } from "react";
import { WordCard } from "../types";
import { Move, Sparkles } from "lucide-react";
import { playGrabSound } from "../sound";

interface FloatingWordBankProps {
  availableWords: WordCard[];
  onWordDropped: (wordId: string, clientX: number, clientY: number) => void;
  onWordClicked: (wordId: string) => void;
}

interface FloatingItem {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isDragging: boolean;
}

export const FloatingWordBank: React.FC<FloatingWordBankProps> = ({
  availableWords,
  onWordDropped,
  onWordClicked,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<FloatingItem[]>([]);
  const [itemsState, setItemsState] = useState<WordCard[]>([]);
  
  // Keep track of the active dragging item
  const dragInfoRef = useRef<{
    itemId: string | null;
    pointerId: number | null;
    offsetX: number;
    offsetY: number;
  }>({ itemId: null, pointerId: null, offsetX: 0, offsetY: 0 });

  // Update item dimensions and list when availableWords changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 220;

    const currentItemsMap = new Map<string, FloatingItem>(itemsRef.current.map(item => [item.id, item]));
    
    const newItems: FloatingItem[] = availableWords.map(word => {
      // Generous card width calculation: 13.5px per character + 56px for padding & icon
      const cardHeight = 44;
      const cardWidth = Math.max(82, Math.ceil(word.text.length * 13.5) + 56);
      
      const existing = currentItemsMap.get(word.id);
      if (existing) {
        // Keep existing positions but ensure width is at least the updated generous size
        return {
          ...existing,
          width: Math.max(existing.width, cardWidth),
        };
      }

      // Generate a nice random starting speed that is never too slow or zero
      const speedScale = 0.8 + Math.random() * 1.0; // random speed multiplier
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speedScale;
      const vy = Math.sin(angle) * speedScale;

      // Start at random positions within the middle of the board
      const startX = Math.max(10, Math.random() * (width - cardWidth - 20));
      const startY = Math.max(10, Math.random() * (height - cardHeight - 20));

      return {
        id: word.id,
        text: word.text,
        color: word.color,
        x: startX,
        y: startY,
        vx,
        vy,
        width: cardWidth,
        height: cardHeight,
        isDragging: false,
      };
    });

    itemsRef.current = newItems;
    setItemsState([...availableWords]);
  }, [availableWords]);

  // Synchronize actual rendered DOM element dimensions with physics items
  useEffect(() => {
    const timer = setTimeout(() => {
      itemsRef.current.forEach(item => {
        const el = document.getElementById(`floating-card-${item.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0) {
            item.width = Math.ceil(rect.width);
            item.height = Math.ceil(rect.height) || 44;
          }
        }
      });
    }, 40);
    return () => clearTimeout(timer);
  }, [itemsState]);

  // Frame loop for continuous physics movement & bouncing
  useEffect(() => {
    let animationId: number;

    const updatePhysics = () => {
      const container = containerRef.current;
      if (!container) {
        animationId = requestAnimationFrame(updatePhysics);
        return;
      }

      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      itemsRef.current.forEach(item => {
        // Skip physics if currently being dragged
        if (item.isDragging) return;

        // Apply velocities
        item.x += item.vx;
        item.y += item.vy;

        // Bounce off Left / Right edges
        if (item.x <= 4) {
          item.x = 4;
          item.vx = Math.abs(item.vx); // Move right
        } else if (item.x + item.width >= containerWidth - 4) {
          item.x = Math.max(4, containerWidth - item.width - 4);
          item.vx = -Math.abs(item.vx); // Move left
        }

        // Bounce off Top / Bottom edges
        if (item.y <= 4) {
          item.y = 4;
          item.vy = Math.abs(item.vy); // Move down
        } else if (item.y + item.height >= containerHeight - 4) {
          item.y = Math.max(4, containerHeight - item.height - 4);
          item.vy = -Math.abs(item.vy); // Move up
        }

        // Update DOM element directly
        const el = document.getElementById(`floating-card-${item.id}`);
        if (el) {
          el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0px)`;
        }
      });

      animationId = requestAnimationFrame(updatePhysics);
    };

    animationId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Handle pointer down on a word card
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, wordId: string) => {
    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();
    const item = itemsRef.current.find(it => it.id === wordId);
    if (!item) return;

    // Direct DOM interaction audio
    playGrabSound();

    // Set dragging state
    item.isDragging = true;
    
    // Calculate pointer location relative to container
    const containerRect = container.getBoundingClientRect();
    const pointerX = e.clientX - containerRect.left;
    const pointerY = e.clientY - containerRect.top;

    // Track original offsets so card doesn't jump to the cursor center
    dragInfoRef.current = {
      itemId: wordId,
      pointerId: e.pointerId,
      offsetX: pointerX - item.x,
      offsetY: pointerY - item.y,
    };

    // Capture the pointer on the target element
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Handle pointer move relative to the container
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { itemId, pointerId, offsetX, offsetY } = dragInfoRef.current;
    if (!itemId || pointerId !== e.pointerId) return;

    const container = containerRef.current;
    if (!container) return;

    const item = itemsRef.current.find(it => it.id === itemId);
    if (!item || !item.isDragging) return;

    // Calculate pointer location relative to container
    const containerRect = container.getBoundingClientRect();
    const pointerX = e.clientX - containerRect.left;
    const pointerY = e.clientY - containerRect.top;

    // Update positions (allow moving outside boundaries so children can drag it to the drop area)
    item.x = pointerX - offsetX;
    item.y = pointerY - offsetY;

    // Update DOM directly for smooth visual response
    const el = document.getElementById(`floating-card-${item.id}`);
    if (el) {
      el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0px)`;
      el.style.zIndex = "50"; // Elevate when dragging
    }
  };

  // Handle pointer release
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>, wordId: string) => {
    const { itemId, pointerId } = dragInfoRef.current;
    if (!itemId || pointerId !== e.pointerId) return;

    const item = itemsRef.current.find(it => it.id === wordId);
    if (item) {
      item.isDragging = false;
      const el = document.getElementById(`floating-card-${item.id}`);
      if (el) {
        el.style.zIndex = "10";
      }

      // Check if it was a quick tap or a real drag
      const { offsetX, offsetY } = dragInfoRef.current;
      const container = containerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const pointerX = e.clientX - containerRect.left;
        const pointerY = e.clientY - containerRect.top;
        const dist = Math.hypot(pointerX - (item.x + offsetX), pointerY - (item.y + offsetY));
        
        // If they barely moved the pointer, treat it as a click
        if (dist < 5) {
          onWordClicked(wordId);
        } else {
          // Trigger drop-zone check with the global cursor clientX & clientY
          onWordDropped(wordId, e.clientX, e.clientY);
        }
      }
    }

    // Reset tracking info
    dragInfoRef.current = { itemId: null, pointerId: null, offsetX: 0, offsetY: 0 };
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-pulse">🎈</span>
          <h2 className="text-base sm:text-lg font-bold text-teal-800 flex items-center gap-1.5">
            Word Bank <span className="text-xs sm:text-sm font-medium text-teal-600/90">(Trạm từ vựng bay)</span>
          </h2>
        </div>
        <div className="text-xs text-teal-600 font-medium hidden sm:flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          Kéo thả hoặc bấm nhanh để chọn từ!
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full h-52 sm:h-56 bg-[#f0f9ff] border-4 border-dashed border-[#bae6fd] rounded-[24px] relative overflow-hidden shadow-sm cursor-default select-none"
        onPointerMove={handlePointerMove}
      >
        {itemsState.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-teal-600/70">
            <span className="text-3xl sm:text-4xl mb-1">✨</span>
            <p className="text-xs sm:text-sm font-semibold">Tất cả từ đã được chọn!</p>
            <p className="text-[11px] mt-0.5 opacity-80">Bấm vào từ ở dưới để hoàn lại nếu muốn sửa.</p>
          </div>
        ) : (
          itemsState.map(word => {
            const item = itemsRef.current.find(it => it.id === word.id);
            // Default styles to prevent flash of zero coordinate
            const initialX = item ? item.x : 50;
            const initialY = item ? item.y : 50;
            const calculatedWidth = item ? item.width : 100;

            return (
              <div
                id={`floating-card-${word.id}`}
                key={word.id}
                onPointerDown={e => handlePointerDown(e, word.id)}
                onPointerUp={e => handlePointerUp(e, word.id)}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  minWidth: `${calculatedWidth}px`,
                  width: "max-content",
                  height: "44px",
                  transform: `translate3d(${initialX}px, ${initialY}px, 0px)`,
                  touchAction: "none",
                }}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl border-2 ${word.color} shadow-md active:scale-105 hover:border-teal-500 hover:shadow-lg active:shadow-indigo-200/50 transition-all duration-150 select-none cursor-grab active:cursor-grabbing`}
              >
                <span className="font-extrabold text-slate-800 text-sm sm:text-base whitespace-nowrap select-none pointer-events-none tracking-normal">
                  {word.text}
                </span>
                <Move className="w-3.5 h-3.5 text-slate-400 pointer-events-none shrink-0 ml-2" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
