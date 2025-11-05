import React from "react";

interface UserAvatarProps {
  user: any; // Consider defining a more specific type for user
  size?: "sm" | "md" | "lg" | "table"; // Various predefined sizes
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = "md" }) => {
  const imageUrl = user?.attributes?.avatar || user?.attributes?.image;
  const userName = user?.attributes?.name || "User";

  let dimensions = "w-12 h-12 text-sm"; // Default 'md'
  if (size === "sm") dimensions = "w-8 h-8 text-xs";
  else if (size === "lg") dimensions = "w-16 h-16 text-lg";
  else if (size === "table") dimensions = "w-10 h-10 text-sm"; // Specific size for table rows

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={userName}
        className={`${dimensions} rounded-full object-cover`}
        style={{ border: "none", outline: "none", boxShadow: "none" }}
      />
    );
  }

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${dimensions} bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold`}
      style={{ border: "none", outline: "none", boxShadow: "none" }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
