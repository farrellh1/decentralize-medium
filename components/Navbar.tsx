import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
import { NextPage } from "next";
import Link from "next/link";
import { FaRegPenToSquare } from "react-icons/fa6";

const Navbar: NextPage = () => {
  const userAddress = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  );
  const { data: owner, isLoading: ownerLoading } = useContractRead(
    contract,
    "getOwner",
    []
  );
  const {
    mutateAsync: withdrawFees,
    isLoading: withdrawLoading,
    isSuccess,
  } = useContractWrite(contract, "withdrawFees");

  const handleWithdrawTipFees = async () => {
    try {
      await withdrawFees({});
      if (isSuccess) {
        alert("Tip fees withdrawn");
      }
    } catch (error) {}
  };

  return (
    <nav className="w-full flex flex-row md:justify-between py-2 px-6 shadow-md">
      <Link href={"/"} className="text-xl self-center hidden md:block">
        <div>Decentralize Medium</div>
      </Link>

      <div className="flex flex-row w-full justify-between md:justify-end">
        <Link
          href="/posts/create"
          className="mr-3 px-3 items-center self-center"
        >
          <div className="flex flex-row items-center">
            <div className="mr-3">Write a post</div>
            <FaRegPenToSquare />
          </div>
        </Link>
        <ConnectWallet theme={"light"} />
        {owner == userAddress && !ownerLoading ? (
          <button
            onClick={() => handleWithdrawTipFees()}
            className="ml-3 bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
          >
            {withdrawLoading ? "Withdrawing..." : "Withdraw Tip Fees"}
          </button>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
