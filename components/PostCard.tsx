import { useContractRead } from "@thirdweb-dev/react";
import Link from "next/link";
import { FaEthereum } from "react-icons/fa6";
import { BigNumber, utils } from "ethers";

type Props = {
  event: any;
  contract: any;
};

const PostCard = ({ event, contract }: Props) => {
  const { data: post, isLoading } = useContractRead(contract, "getPost", [
    event.data.id,
  ]);

  return (
    <Link href={`./posts/${event.data.id}`}>
      <div className="flex flex-col gap-[8px] w-full p-[20px] md:p-6 hover:bg-gray-100 rounded-[8px]">
        <div className="text-xs truncate md:text-sm">Author address: {event.data.author}</div>
        <div className="font-bold text-xl md:text-3xl">{event.data.title}</div>
        <div className="text-xs md:text-base">{event.data.summary}</div>
        <div className="text-xs md:text-base flex flex-row">
          Tip earned{" "}
          {isLoading ? (
            "..."
          ) : (
            <div className="px-[4px] text-purple">
              {utils.formatEther(BigNumber.from(post.tipEarned.toString()))}
            </div>
          )}{" "}
          ETH
          <span className="ml-2 self-center">
            <FaEthereum className="text-[#12100B]"></FaEthereum>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
