
export const timeAgo = (date) => {
  if (date === null || date === undefined) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds <= 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(seconds / 86400);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

export default timeAgo;
