export function OctoPairLogo({ className = "h-7 w-auto", title, ...props }) {
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
  return (
    <svg
      viewBox="3 6 60 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="6.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...a11y}
      {...props}
    >
      <circle cx="24" cy="28" r="14" />
      <path d="M 29.5 19 A 14 14 0 1 1 29.5 37" />
      <path d="M 40 42 v 5.5 c 0 6 6 10 12 7.5 c 2.5 -1.2 3.2 -4 0 -4.5" strokeWidth="6" />
    </svg>
  );
}

export default OctoPairLogo;
