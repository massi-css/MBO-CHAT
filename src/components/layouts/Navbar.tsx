import { Menu } from "lucide-react";
import { Button } from "../ui/button";

interface NavbarProps {
  title: string;
  onMenuClick?: () => void;
}

export default function Navbar({ title, onMenuClick }: NavbarProps) {
  const colorTitle = (title: string) => {
    const randomIndex = Math.floor(Math.random() * title.length);
    return title.split("").map((char, index) => (
      <span key={index} className={index === randomIndex ? "text-primary" : ""}>
        {char}
      </span>
    ));
  };

  return (
    <header className="sticky top-0 z-10 h-16 px-4 flex items-center gap-4">
      <Button size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <h1 className="text-xl sm:text-3xl font-semibold">{colorTitle(title)}</h1>
    </header>
  );
}
