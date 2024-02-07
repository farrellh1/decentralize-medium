import { useContractRead } from "@thirdweb-dev/react";
import Link from "next/link";
import { FaEthereum } from "react-icons/fa6";
import Divider from "./Divider";
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
      <div className="w-full rounded shadow-lg p-6">
        <div className="mb-4">Author address: {event.data.author}</div>
        <div className="mb-4 font-bold text-3xl">{event.data.title}</div>
        <div className="mb-4 text-ellipsis">{event.data.summary}</div>
        <div className="flex flex-row text-green-400">
          Tip Earned{" "}
          {isLoading ? "..." : utils.formatEther(BigNumber.from(post.tipEarned.toString()))} ETH
          <span className="ml-2 self-center">
            <FaEthereum className="text-purple-700"></FaEthereum>
          </span>
        </div>
      </div>
      <Divider />
    </Link>
  );
};

export default PostCard;
