import Image from "next/image";
import Link from "next/link";
import LoopIcon from "./icons/loopIcon";

const NavBar = () => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-2">
        <nav className="flex items-center space-x-6">
            <div className="my-2">
                <Image src="/logos/Logo_CANAL_Plus_Dark_Mode.svg" alt="Canal+ Logo" width={100} height={100} />
            </div>

            <ul className="flex items-center space-x-4">
                <li className="font-medium hover:text-accent transition-colors duration-300">
                    <Link href="/" className="font-canal-demi-romain">Acceuil</Link>
                </li>
                <li className="font-medium font-canal-demi-romain hover:text-accent transition-colors duration-300">
                    <Link href="/">En direct</Link>
                </li>
                <li className="font-bol font-canal-demi-romain hover:text-accent transition-colors duration-300">
                    <Link href="/">Programme TV</Link>
                </li>
                <li className="font-medium font-canal-demi-romain hover:text-accent transition-colors duration-300">
                    <Link href="/">Chaînes & Apps</Link>
                </li>
                <li className="font-medium font-canal-demi-romain hover:text-accent transition-colors duration-300">
                    <Link href="/">Mes vidéos</Link>
                </li>
            </ul>
        </nav>

        <menu className="flex items-center space-x-4">
            <button type="button">
                <LoopIcon />
            </button>

            <button type="button">
                <Image src="/avatars/avatar_canal.webp" alt="Profil" width={32} height={32} />
            </button>
        </menu>
    </div>
  );
};

export default NavBar;