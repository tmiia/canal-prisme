import Image from "next/image";
import Link from "next/link";
import LoopIcon from "./icons/loopIcon";

const NavBar = () => {

    const variants = {
        active: "font-bold font-canal-demi-romain text-accent transition-colors duration-300",
        inactive: "font-medium font-canal-demi-romain hover:text-accent transition-colors duration-300",
    }
  return (
    <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 md:px-8 py-2">
        <nav className="flex items-center space-x-4 md:space-x-6">
            <div className="my-2">
                <Image src="/logos/Logo_CANAL_Plus_Dark_Mode.svg" alt="Canal+ Logo" width={100} height={100} />
            </div>

            <ul className="hidden md:flex items-center space-x-4">
                <li className={variants.inactive}>
                    <Link href="/" className="font-canal-demi-romain">Accueil</Link>
                </li>
                <li className={variants.inactive}>
                    <Link href="/">En direct</Link>
                </li>
                <li className={variants.inactive}>
                    <Link href="/">Programme TV</Link>
                </li>
                <li className={variants.inactive}>
                    <Link href="/">Chaînes & Apps</Link>
                </li>
                <li className={variants.inactive}>
                    <Link href="/">Mes vidéos</Link>
                </li>
                <li className={variants.active}>
                    <Link href="/">Originals+1</Link>
                </li>
            </ul>
        </nav>

        <menu className="hidden md:flex items-center space-x-4">
            <button type="button">
                <LoopIcon />
            </button>

            <button type="button">
                <Image src="/avatars/avatar_canal.webp" alt="Profil" width={32} height={32} />
            </button>
        </menu>

        <button
          type="button"
          className="md:hidden flex flex-col justify-center gap-[5px] p-1"
          aria-label="Menu"
        >
            <span className="block w-5 h-[2px] bg-foreground rounded-full" />
            <span className="block w-5 h-[2px] bg-foreground rounded-full" />
            <span className="block w-5 h-[2px] bg-foreground rounded-full" />
        </button>
    </div>
  );
};

export default NavBar;