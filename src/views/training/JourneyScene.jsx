import React from "react";
import { Companion } from "./JourneyCompanion";

// Reusable lightweight 2D scenery for the First Contact learning experience.
// Decorative SVG only: no network requests, text, lesson state or audio changes.
export default function JourneyScene({ compact = false, companion = null, label = "First Contact · Town Square" }) {
  return (
    <div className={`z-journey-landscape ${compact ? "z-journey-landscape-compact" : ""}`} aria-label={label}>
      <svg className="z-journey-landscape-art" viewBox="0 0 440 210" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrated village square with colourful houses, tall trees and a winding path">
        <rect x="0" y="0" width="440" height="210" fill="#98c6b0" />
        <circle cx="348" cy="33" r="22" fill="#f6d58c" />
        <ellipse cx="60" cy="90" rx="105" ry="49" fill="#6aa886" />
        <ellipse cx="250" cy="101" rx="185" ry="54" fill="#4c9275" />
        <ellipse cx="435" cy="108" rx="118" ry="60" fill="#2f765e" />
        <path d="M0 128 Q120 106 221 140 T440 128 V210 H0Z" fill="#3b7a61" />
        {/* town buildings */}
        <rect x="169" y="77" width="89" height="71" rx="5" fill="#f6e6c0" />
        <path d="M159 80 L214 38 L270 80Z" fill="#a75f59" />
        <rect x="198" y="107" width="24" height="41" rx="3" fill="#7394a2" />
        <rect x="177" y="96" width="16" height="18" rx="3" fill="#9fd3d2" />
        <rect x="232" y="96" width="16" height="18" rx="3" fill="#9fd3d2" />
        <rect x="284" y="88" width="66" height="62" rx="4" fill="#edcfae" />
        <path d="M276 91 L318 57 L358 91Z" fill="#bd826b" />
        <rect x="293" y="104" width="14" height="20" rx="3" fill="#a4d5cb" />
        <rect x="322" y="104" width="14" height="20" rx="3" fill="#a4d5cb" />
        <rect x="311" y="128" width="17" height="22" rx="2" fill="#7e9b8f" />
        {/* trees */}
        <rect x="92" y="113" width="12" height="39" rx="4" fill="#765841" />
        <path d="M98 33 L58 125 H138 Z" fill="#1f654e" />
        <path d="M98 56 L65 133 H131Z" fill="#2b8163" />
        <rect x="372" y="122" width="9" height="35" rx="3" fill="#69593f" />
        <path d="M376 54 L343 138 H410Z" fill="#286d54" />
        <path d="M376 85 L350 145 H402Z" fill="#3c9874" />
        {/* winding trail and stepping stones */}
        <path d="M198 210 Q155 177 213 150 Q266 130 285 150 Q312 171 264 210Z" fill="#dfc59a" opacity=".95"/>
        <path d="M211 210 Q172 179 222 164" fill="none" stroke="#f5e3b9" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="184" cy="164" rx="9" ry="3" fill="#f5e2bb" />
        <ellipse cx="240" cy="178" rx="12" ry="3.8" fill="#f5e2bb" />
        <circle cx="18" cy="150" r="4" fill="#f3d578" />
        <circle cx="31" cy="158" r="3" fill="#fff2b2" />
        <circle cx="411" cy="163" r="3.5" fill="#f3d578" />
      </svg>
      <div className="z-journey-landscape-vignette" aria-hidden="true" />
      {companion ? (
        <span className="z-journey-landscape-avatar" aria-hidden="true"><Companion companion={companion} size="text-[40px]" label={false}/></span>
      ) : null}
    </div>
  );
}
