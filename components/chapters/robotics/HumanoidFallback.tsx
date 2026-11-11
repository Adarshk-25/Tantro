/** Recognisable humanoid silhouette (SVG dot pattern) used when WebGL or the model is unavailable. */
export function HumanoidFallback({ reason }: { reason: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
      <svg viewBox="0 0 200 420" className="h-[78%] w-auto" role="img" aria-label="Humanoid robot silhouette">
        <defs>
          <pattern id="hf-dots" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="1.15" fill="#dfe7f3" />
          </pattern>
          <linearGradient id="hf-visor" x1="0" x2="1">
            <stop offset="0" stopColor="#3cc4d2" />
            <stop offset="1" stopColor="#5b9bf5" />
          </linearGradient>
        </defs>
        <g fill="url(#hf-dots)" stroke="rgb(226 234 246 / 0.25)" strokeWidth="0.8">
          <ellipse cx="100" cy="38" rx="22" ry="27" />
          <path d="M92 64h16l2 14H90z" />
          <path d="M62 82c10-6 66-6 76 0l6 30-8 52c-4 10-12 18-36 18s-32-8-36-18l-8-52z" />
          <path d="M66 186c10 8 58 8 68 0l4 26c-10 12-66 12-76 0z" />
          <path d="M58 84c-12 2-18 10-19 22l-6 70 12 2 10-64 8-20z" />
          <path d="M33 176l-4 60 11 2 10-60z" />
          <path d="M27 236l-2 22 14 4 4-22z" />
          <path d="M142 84c12 2 18 10 19 22l6 70-12 2-10-64-8-20z" />
          <path d="M167 176l4 60-11 2-10-60z" />
          <path d="M173 236l2 22-14 4-4-22z" />
          <path d="M66 210l-2 92 22 2 8-92z" />
          <path d="M64 304l2 92 18 0 2-92z" />
          <path d="M60 396h28l6 14H58z" />
          <path d="M134 210l2 92-22 2-8-92z" />
          <path d="M136 304l-2 92-18 0-2-92z" />
          <path d="M140 396h-28l-6 14h36z" />
        </g>
        <rect x="84" y="32" width="32" height="7" rx="3.5" fill="url(#hf-visor)" />
        <rect x="92" y="104" width="16" height="3" rx="1.5" fill="#f3f6fc" />
      </svg>
      <p className="t-label mt-3 text-center text-mid">{reason}</p>
    </div>
  );
}
