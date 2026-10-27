import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { DEFAULT_AVATAR } from "../utils/constants";
import { cn } from "@/lib/utils";

const BaseUserCard = ({
  user,
  variant = "horizontal",
  className,
  avatarSize = "default",
  skillsLimit = 3,
  actions,
  subtitle,
  children,
  onClick,
}) => {
  if (!user) return null;

  const initials = (
    (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
  ).toUpperCase() || "U";

  const avatarSizeClass =
    avatarSize === "sm"
      ? "h-10 w-10 text-xs"
      : avatarSize === "lg"
      ? "h-16 w-16 text-lg"
      : "h-12 w-12 text-sm";

  const skills = user.skills || [];

  if (variant === "vertical") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex flex-col items-center p-6 rounded-2xl bg-card text-card-foreground border border-border shadow-sm transition-all",
          onClick && "cursor-pointer hover:border-primary/50",
          className
        )}
      >
        <Avatar className={cn(avatarSizeClass, "mb-4 border-2 border-border")}>
          <AvatarImage
            src={user.photoUrl || DEFAULT_AVATAR}
            alt={`${user.firstName} ${user.lastName}`}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <h3 className="text-lg font-bold text-foreground text-center">
          {user.firstName} {user.lastName}
          {user.age ? <span className="text-muted-foreground font-normal ml-1">, {user.age}</span> : null}
        </h3>

        <p className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
          {subtitle || user.about || user.headline || "Developer"}
        </p>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {skills.slice(0, skillsLimit).map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                {skill}
              </Badge>
            ))}
            {skills.length > skillsLimit && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{skills.length - skillsLimit}
              </span>
            )}
          </div>
        )}

        {children}

        {actions && <div className="mt-4 w-full flex items-center justify-center gap-2">{actions}</div>}
      </div>
    );
  }

  // Default: "horizontal"
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-xl bg-card text-card-foreground border border-border transition-all",
        onClick && "cursor-pointer hover:border-primary/50",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className={cn(avatarSizeClass, "flex-shrink-0 border border-border")}>
          <AvatarImage
            src={user.photoUrl || DEFAULT_AVATAR}
            alt={`${user.firstName} ${user.lastName}`}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">
            {user.firstName} {user.lastName}
            {user.age ? <span className="text-muted-foreground font-normal ml-1">, {user.age}</span> : null}
          </h4>

          <p className="text-xs text-muted-foreground truncate">
            {subtitle || user.about || user.headline || "Developer"}
          </p>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {skills.slice(0, skillsLimit).map((skill, i) => (
                <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                  {skill}
                </Badge>
              ))}
              {skills.length > skillsLimit && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{skills.length - skillsLimit}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {children}

      {actions && <div className="flex items-center gap-2 flex-shrink-0 ml-3">{actions}</div>}
    </div>
  );
};

export default BaseUserCard;
