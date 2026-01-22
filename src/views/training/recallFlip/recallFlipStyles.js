// src/views/training/recallFlip/recallFlipStyles.js
export const recallFlipCss = `
.rf-root{
  position: relative;
}

.rf-perspective{
  perspective: 1200px;
}
.rf-card{
  position: relative;
  transform-style: preserve-3d;
  transition: transform 520ms cubic-bezier(.2,.9,.2,1);
  min-height: 420px;
  cursor: pointer;
  outline: none;
}
.rf-card:focus{
  box-shadow: 0 0 0 2px rgba(52,211,153,0.22);
}
.rf-face{
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
}
.rf-front{ transform: rotateY(0deg); }
.rf-back{ transform: rotateY(180deg); }
.rf-flipped{ transform: rotateY(180deg); }

.rf-flip-pulse{ will-change: transform; }

.rf-card-top-min{
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 40px;
}
.rf-top-spacer{
  flex: 1;
}

.rf-center-zone{
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 6px;
  text-align: center;
}

.rf-hero-text{
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  white-space: pre-wrap;
  word-break: break-word;
}
@media (min-width: 640px){
  .rf-hero-text{ font-size: 30px; }
}

.rf-sub-text{
  margin-top: 12px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(161,161,170,1);
  white-space: pre-wrap;
  word-break: break-word;
}

.rf-hint{
  margin-top: 18px;
  font-size: 12px;
  color: rgba(113,113,122,1);
}

.rf-bottom-spacer{
  min-height: 84px;
}

.rf-grade-zone{
  padding-top: 8px;
}

.rf-grade-grid{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.rf-grade-btn{
  border-radius: 16px;
  padding: 12px 10px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid rgba(39,39,42,1);
  background: rgba(9,9,11,0.30);
  color: rgba(244,244,245,1);
  transition: transform 140ms ease, background 140ms ease, opacity 140ms ease, filter 140ms ease;
}
.rf-grade-btn:hover{
  background: rgba(9,9,11,0.52);
  transform: translateY(-1px);
}
.rf-grade-disabled{
  opacity: 0.55;
  cursor: not-allowed;
  transform: none !important;
}

.rf-grade-right{
  border-color: rgba(52, 211, 153, 0.55);
  background: rgba(52, 211, 153, 0.12);
  color: rgba(244,244,245,1);
}
.rf-grade-right:hover{
  background: rgba(52, 211, 153, 0.16);
}

.rf-grade-close{
  border-color: rgba(52, 211, 153, 0.30);
  background: rgba(52, 211, 153, 0.06);
}

.rf-grade-wrong{
  border-color: rgba(39,39,42,1);
}

.rf-footnote{
  margin-top: 10px;
  font-size: 11px;
  color: rgba(113,113,122,1);
  text-align: center;
}

/* Top button */
.rf-top-btn{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(39,39,42,1);
  background: rgba(9,9,11,0.35);
  color: rgba(228,228,231,1);
  transition: transform 140ms ease, background 140ms ease, opacity 140ms ease;
}
.rf-top-btn:hover{
  background: rgba(9,9,11,0.55);
  transform: translateY(-1px);
}

/* Buttons (modal) */
.rf-primary-btn{
  width: 100%;
  border-radius: 16px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 700;
  background: rgba(52, 211, 153, 1);
  color: rgba(9,9,11,1);
  transition: filter 140ms ease, transform 140ms ease, opacity 140ms ease;
}
.rf-primary-btn:hover{ filter: brightness(1.03); transform: translateY(-1px); }
.rf-primary-btn:disabled{ opacity: 0.55; cursor: not-allowed; transform: none; }

.rf-secondary-btn{
  width: 100%;
  border-radius: 16px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 650;
  border: 1px solid rgba(39,39,42,1);
  background: rgba(9,9,11,0.35);
  color: rgba(244,244,245,1);
  transition: transform 140ms ease, background 140ms ease, opacity 140ms ease;
}
.rf-secondary-btn:hover{ background: rgba(9,9,11,0.55); transform: translateY(-1px); }
.rf-secondary-btn:disabled{ opacity: 0.6; cursor: not-allowed; transform: none; }

.rf-ghost-btn{
  width: 100%;
  border-radius: 16px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 650;
  border: 1px solid rgba(39,39,42,1);
  background: transparent;
  color: rgba(161,161,170,1);
  transition: transform 140ms ease, opacity 140ms ease, color 140ms ease;
}
.rf-ghost-btn:hover{ transform: translateY(-1px); color: rgba(244,244,245,1); }

/* Audio */
.rf-audio-wrap{
  display: inline-flex;
  gap: 8px;
}
.rf-audio-btn{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(39,39,42,1);
  background: rgba(9,9,11,0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: transform 140ms ease, background 140ms ease, opacity 140ms ease;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
.rf-audio-icon{ line-height: 1; transform: translateY(-0.5px); }
.rf-audio-enabled{ cursor: pointer; opacity: 1; }
.rf-audio-enabled:hover{ background: rgba(9,9,11,0.55); transform: translateY(-1px); }
.rf-audio-disabled{ cursor: not-allowed; opacity: 0.45; transform: none; }

/* Modal */
.rf-modal-backdrop{
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.62);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.rf-modal{
  width: 100%;
  max-width: 420px;
  border-radius: 22px;
  border: 1px solid rgba(39,39,42,1);
  background: rgba(9,9,11,0.90);
  box-shadow: 0 22px 70px rgba(0,0,0,0.65);
  padding: 18px;
}

/* successGlow(strong) */
.rf-success-strong{
  box-shadow:
    0 0 0 0 rgba(52, 211, 153, 0.0),
    0 0 40px 8px rgba(52, 211, 153, 0.18),
    0 0 90px 24px rgba(52, 211, 153, 0.10);
  animation: rfGlowStrong 700ms ease-out forwards;
}
@keyframes rfGlowStrong{
  0%{ opacity: 0.0; transform: scale(0.995); filter: blur(0px); }
  25%{ opacity: 1.0; transform: scale(1.01); filter: blur(0.2px); }
  100%{ opacity: 0.0; transform: scale(1.02); filter: blur(0.6px); }
}

/* successGlow(soft) */
.rf-success-soft{
  box-shadow:
    0 0 0 0 rgba(52, 211, 153, 0.0),
    0 0 26px 6px rgba(52, 211, 153, 0.12),
    0 0 60px 16px rgba(52, 211, 153, 0.07);
  animation: rfGlowSoft 620ms ease-out forwards;
}
@keyframes rfGlowSoft{
  0%{ opacity: 0.0; transform: scale(0.996); filter: blur(0px); }
  30%{ opacity: 0.85; transform: scale(1.008); filter: blur(0.2px); }
  100%{ opacity: 0.0; transform: scale(1.015); filter: blur(0.55px); }
}

/* ghostFade() */
.rf-ghost-fade{
  animation: rfGhost 700ms ease-out forwards;
}
@keyframes rfGhost{
  0%{ opacity: 0.0; transform: scale(1); filter: blur(0px) saturate(1); }
  30%{ opacity: 0.6; transform: scale(0.995); filter: blur(0.6px) saturate(0.85); }
  100%{ opacity: 0.0; transform: scale(0.985); filter: blur(1.0px) saturate(0.65); }
}
`;
