import React from "react";

interface GlowProps {
  align?: "left" | "right";
}

export default function Glow({
  align = "left"
}: GlowProps) {
  const image = align === "left" ?
    "url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20viewBox%3D%220%200%201085%20184%22%3E%3Cpath%20d%3D%22M%2077%201%20C%2077%201%20702.761%2014.525%20822%2048.5%20C%20941.239%2082.475%201084%20169%201084%20169%20L%20934.5%20133.5%20L%20822%20107%20L%20580.5%2096%20L%20278%20133.5%20L%20102%20155.5%20L%201%20183%20L%201%201%20Z%22%20fill%3D%22rgba(81%2C%2047%2C%20235%2C%200.55)%22%20stroke%3D%22%23AAA%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')"
    : "url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20viewBox%3D%220%200%201085%20184%22%3E%3Cpath%20d%3D%22M%2076%200%20C%2076%200%20701.761%2013.525%20821%2047.5%20C%20940.239%2081.475%201083%20168%201083%20168%20L%20933.5%20132.5%20L%20821%20106%20L%20579.5%2095%20L%20277%20132.5%20L%20101%20154.5%20L%200%20182%20L%200%200%20Z%22%20transform%3D%22translate(1%201)%20rotate(180%20541.5%2091)%22%20fill%3D%22rgba(81%2C%2047%2C%20235%2C%200.55)%22%20stroke%3D%22%23AAA%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')"
  return (
    <div
      className="flex-shrink-0 bg-cover w-full h-full"
      style={{
        imageRendering: "pixelated",
        backgroundImage: image,
      }}
    />
  );
};