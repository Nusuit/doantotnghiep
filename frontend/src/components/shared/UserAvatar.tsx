import React from 'react';

// A predefined palette of attractive gradients
const GRADIENTS = [
  "from-indigo-500 to-purple-600", // blue-purple
  "from-emerald-400 to-teal-500", // green-teal
  "from-orange-400 to-rose-500", // orange-rose
  "from-blue-400 to-indigo-500", // lightblue-indigo
  "from-violet-400 to-fuchsia-500", // violet-fuchsia
  "from-amber-400 to-orange-500", // yellow-orange
  "from-cyan-400 to-blue-500", // cyan-blue
  "from-rose-400 to-red-500" // pink-red
];

interface UserAvatarProps {
  name?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name = "?", className = "" }) => {
  const safeName = name && name.length > 0 ? name : "?";
  
  // Calculate a deterministic index based on the name string
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  const gradientClass = GRADIENTS[index];

  const initials = safeName.substring(0, 2).toUpperCase();

  return (
    <div className={`flex items-center justify-center shrink-0 rounded-full text-white font-bold bg-gradient-to-br ${gradientClass} ${className}`}>
      {initials}
    </div>
  );
};
