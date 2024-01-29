import { ConnectWallet } from "@thirdweb-dev/react";
import { NextPage } from "next";
import Link from "next/link";
import { FaRegPenToSquare } from "react-icons/fa6";

const Navbar: NextPage = () => {
  return (
    <nav className="w-full flex flex-row justify-between py-2 px-6 shadow-md">
      <Link href={"/"} className="text-xl self-center">
        <div>Decentralize Medium</div>
      </Link>

      <div className="flex flex-row justify-between">
        <Link href="./create" className="mr-3 px-3 items-center self-center">
          <div className="flex flex-row items-center">
            <div className="mr-3">Write a post</div>
            <FaRegPenToSquare />
          </div>
        </Link>
        <ConnectWallet theme={"light"} />
      </div>
    </nav>
  );
};

export default Navbar;
