import React from "react";
import styles from "./Button.module.scss";

export default function Button({
  as: Component = "button",
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const baseClass = variant === "primary" ? styles.button : "";
  const componentProps =
    Component === "button"
      ? { type, ...props }
      : props;
  return (
    <Component className={`${styles.hoverFx} ${baseClass} ${className}`.trim()} {...componentProps}>
      {children}
    </Component>
  );
}
