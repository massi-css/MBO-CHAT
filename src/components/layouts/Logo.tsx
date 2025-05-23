interface LogoProps {
  flexPosition?: "center" | "left" | "right";
  size?: string;
}

const Logo = ({ flexPosition }: LogoProps) => {
  const flexPositionMap = {
    center: "items-center",
    left: "items-start",
    right: "items-end",
  };
  const flexPositionClass =
    flexPositionMap[flexPosition as keyof typeof flexPositionMap] ||
    "justify-start";
  return (
    <div className="flex items-center uppercase tracking-wider">
      <a
        href="/"
        className="text-gray-900 leading-none font-semibold text-xl flex items-center"
      >
        <div className={`rounded-lg flex flex-col mr-2 ${flexPositionClass}`}>
          <span className="text-primary font-semibold">MBO</span>
          <span className="text-black font-thin">CHAT</span>
        </div>
      </a>
    </div>
  );
};

export default Logo;
