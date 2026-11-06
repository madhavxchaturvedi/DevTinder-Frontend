import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Twisting Ribbon (Vengeance UI Component - Vibrant 3D Edition)
 * 
 * 3D Waving Neon Ribbon Animation Canvas
 */
export const TwistingRibbon = ({
  className = "",
  segments = 450,
  waveSpeed = 0.016,
  waveAmplitude = 1.15,
  twistCycles = 5,
  ribbonWidth = 72,
  darkColors = {
    face: "#ccff00",
    foldA: "#bbf424",
    foldB: "#c084fc",
    foldC: "#7e22ce",
  },
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let time = 0;
    let dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      time += waveSpeed;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const centerY = height * 0.48;

      ctx.clearRect(0, 0, width, height);

      // Precalculate 3D ribbon spine and ribbon edge points
      const topPoints = [];
      const bottomPoints = [];
      const normals = [];

      for (let i = 0; i <= segments; i++) {
        const progress = i / segments;
        const x = progress * (width + 160) - 80; // Extend past canvas edges

        // 3D waving path
        const waveY =
          Math.sin(progress * Math.PI * 2.8 + time * 1.1) * 85 * waveAmplitude +
          Math.cos(progress * Math.PI * 1.4 - time * 0.7) * 45 * waveAmplitude;
        const spineY = centerY + waveY;
        const spineZ = Math.sin(progress * Math.PI * 2 + time * 0.9) * 120;

        // 3D twist rotation around spine tangent
        const twistAngle = progress * Math.PI * twistCycles + time * 1.4;
        const cosTwist = Math.cos(twistAngle);
        const sinTwist = Math.sin(twistAngle);

        const dy = cosTwist * (ribbonWidth / 2);
        const dz = sinTwist * (ribbonWidth / 2);

        // Perspective projection
        const cameraDist = 650;
        const scaleTop = cameraDist / (cameraDist + (spineZ + dz));
        const scaleBottom = cameraDist / (cameraDist + (spineZ - dz));

        topPoints.push({
          x: x,
          y: centerY + (spineY + dy - centerY) * scaleTop,
          z: spineZ + dz,
        });

        bottomPoints.push({
          x: x,
          y: centerY + (spineY - dy - centerY) * scaleBottom,
          z: spineZ - dz,
        });

        normals.push(cosTwist);
      }

      // 1. Draw ribbon quads with full vibrancy & gradient depth
      for (let i = 0; i < segments; i++) {
        const norm = (normals[i] + normals[i + 1]) / 2;

        let fillColor;
        let strokeColor;

        if (norm > 0.4) {
          fillColor = darkColors.face;
          strokeColor = "#ffffff";
        } else if (norm > 0.0) {
          fillColor = darkColors.foldA;
          strokeColor = darkColors.face;
        } else if (norm > -0.4) {
          fillColor = darkColors.foldB;
          strokeColor = darkColors.foldB;
        } else {
          fillColor = darkColors.foldC;
          strokeColor = darkColors.foldC;
        }

        ctx.beginPath();
        ctx.moveTo(topPoints[i].x, topPoints[i].y);
        ctx.lineTo(topPoints[i + 1].x, topPoints[i + 1].y);
        ctx.lineTo(bottomPoints[i + 1].x, bottomPoints[i + 1].y);
        ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
        ctx.closePath();

        // High opacity solid fill
        ctx.globalAlpha = 0.96;
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Sharp highlight between facets
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 2. High-glow Neon Edges pass
      ctx.globalAlpha = 1;
      ctx.shadowColor = darkColors.face;
      ctx.shadowBlur = 24;
      ctx.lineWidth = 3;
      ctx.strokeStyle = darkColors.face;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        if (i === 0) ctx.moveTo(topPoints[i].x, topPoints[i].y);
        else ctx.lineTo(topPoints[i].x, topPoints[i].y);
      }
      ctx.stroke();

      ctx.shadowColor = darkColors.foldB;
      ctx.shadowBlur = 24;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = darkColors.foldB;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        if (i === 0) ctx.moveTo(bottomPoints[i].x, bottomPoints[i].y);
        else ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
      }
      ctx.stroke();

      // Reset context state
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [segments, waveSpeed, waveAmplitude, twistCycles, ribbonWidth, darkColors]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden pointer-events-none", className)}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default TwistingRibbon;
