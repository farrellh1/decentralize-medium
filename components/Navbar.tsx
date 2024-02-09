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
    <nav className="w-full flex flex-row md:justify-between md:py-2 md:px-6 shadow-md">
      <Link href={"/"} className="text-xl self-center hidden md:block">
        <div>Decentralize Medium</div>
      </Link>

      <div className="flex flex-row w-full justify-between md:justify-end ">
        <Link
          href="/posts/create"
          className="md:mr-3 pl-1 md:px-3 items-center self-center hover:bg-gray-100"
        >
          <div className="flex flex-row items-center">
            <div className="hidden md:block md:text-base mr-[4px] md:mr-2">Write a post</div>
            <FaRegPenToSquare className="ml-3" />
          </div>
        </Link>
        <ConnectWallet theme={"light"} className="!min-w-[80px] !h-[40px] md:!w-[120px] md:!h-[40px] !text-xs !self-center !p-2 md:!p-0 !my-2" />
        {owner == userAddress && !ownerLoading ? (
          <button
            onClick={() => handleWithdrawTipFees()}
            className="md:ml-3 w-[80px] h-[40px] md:w-fit md:h-fit self-center bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-xs md:text-sm mr-1 md:px-6 md:py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
          >
            {withdrawLoading ? "Withdrawing..." : "Withdraw Tip Fees"}
          </button>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
