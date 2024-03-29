import {
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
import { BigNumber, utils } from "ethers";
import { useState } from "react";

const TipModal = ({ post }: { post: any }) => {
  const userAddress = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  );
  const { data: withdrawableTip } = useContractRead(
    contract,
    "postIdToTipPost",
    [post?.id]
  );
  const [showModal, setShowModal] = useState(false);
  const [tipAmount, setTipAmount] = useState("0");
  const {
    mutateAsync: tipPost,
    isLoading,
    isSuccess,
  } = useContractWrite(contract, "tipPost");

  const {
    mutateAsync: withdrawTip,
    isLoading: withdrawLoading,
    isSuccess: withdrawSuccess,
  } = useContractWrite(contract, "withdrawTip");

  const handleTipPost = async () => {
    if (!userAddress) {
      alert("Please connect your wallet");
      return;
    }
    if (post.author == userAddress) {
      alert("Can't tip your own post");
      return;
    }
    try {
      await tipPost({
        args: [Number(post.id)],
        overrides: {
          value: utils.parseEther(tipAmount),
        },
      });
      if (isSuccess) {
        setShowModal(false);
        alert("Tip sent");
      }
    } catch (error) {
      alert(error);
    }
  };

  const isAuthor = post?.author == userAddress;

  const handleWithdrawTip = async () => {
    try {
      await withdrawTip({
        args: [Number(post.id)],
      });
      if (withdrawSuccess) {
        setShowModal(false);
        alert("Tip withdrawn");
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <button
        className="bg-emerald-500 w-[120px] md:w-fit md:h-[40px] text-white active:bg-emerald-600 font-bold uppercase text-xs md:text-sm px-[8px] rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
        type="button"
        onClick={() => setShowModal(true)}
      >
        {isAuthor ? "Withdraw Tip" : "Support Author"}
      </button>
      {showModal && isAuthor ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold">
                    Are you sure u want to withdraw the tip?
                  </h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
                    Expected amount:{" "}
                    {utils.formatEther(
                      BigNumber.from(((withdrawableTip * 97) / 100).toString())
                    )}
                  </p>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => handleWithdrawTip()}
                  >
                    {withdrawLoading ? "Sending..." : "Withdraw Tip"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold">Send tip to author</h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
                    How much would you like to tip the author? (in ethers)
                  </p>
                  <input
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="0.01"
                    type="number"
                    className="w-full text-xl outline-none border border-solid p-3 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => handleTipPost()}
                  >
                    {isLoading ? "Sending..." : "Send tip"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
};

export default TipModal;
