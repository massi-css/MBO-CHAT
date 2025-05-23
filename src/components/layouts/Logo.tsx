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
    <div className="flex items-center  tracking-wider">
      <a
        href="/"
        className="text-gray-900 leading-none font-semibold text-xl flex items-center"
      >
        <div className={`rounded-lg flex gap-1 mr-2 ${flexPositionClass}`}>
          <span className="text-primary font-bold uppercase">MBO</span>
          <span className="text-black font-semibold">chat</span>
        </div>
      </a>
    </div>
  );
};

export default Logo;
