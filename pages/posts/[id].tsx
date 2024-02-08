import {
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { FaComment, FaEthereum, FaHandsClapping, FaM } from "react-icons/fa6";
import Divider from "../../components/Divider";
import TipModal from "../../components/TipModal";
import { BigNumber, utils } from "ethers";
import Content from "../../components/Content";
import Comments from "../../components/Comments";

const PostDetail = () => {
  const router = useRouter();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  );
  const userAddress = useAddress();
  const { data: post } = useContractRead(contract, "getPost", [
    router.query.id,
  ]);
  const { data: comments, isLoading } = useContractRead(
    contract,
    "getComments",
    [router.query.id]
  );
  const { data: clapCount } = useContractRead(contract, "postIdToClapCount", [
    router.query.id,
  ]);
  const { mutateAsync: clapPost } = useContractWrite(contract, "clapPost");

  const handleClick = () => {
    if (!userAddress) {
      alert("Please connect your wallet");
      return;
    }
    if (post.author == userAddress) {
      alert("Can't clap your own post");
      return;
    }

    try {
      clapPost({
        args: [router.query.id, 1],
      });
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="max-w-[936px] p-2 md:mt-10 mx-auto">
      <div className="text-xl md:text-3xl font-bold py-[16px]">{post?.title}</div>
      <div className="flex flex-col w-full items-center md:flex-row py-[8px] pb-[16px] md:py-[16px] md:pb-[24px]">
        <FaM className="text-sm text-white bg-black rounded-full w-[20px] h-[20px] md:w-[40px] md:h-[40px] p-1 md:p-2 self-center"></FaM>
        <div className="text-xs text-center md:text-sm self-center md:ml-3">
          Author address: {post?.author}
        </div>
      </div>
      <Divider />
      <div className="flex flex-row mx-3 md:mx-6 justify-between items-center py-[8px] md:py-[12px]">
        <div className="flex flex-row mx-2">
          <FaHandsClapping
            className="text-xl mr-3 cursor-pointer"
            onClick={handleClick}
          ></FaHandsClapping>
          <div>{clapCount ?? 0}</div>
        </div>
        <div className="flex flex-row mx-2 cursor-pointer">
          <FaComment className="text-xl mr-3" onClick={() => router.push("#comments")}></FaComment>
          <div>{comments?.length ?? 0}</div>
        </div>
        <div className="flex flex-row mx-2">
          <div className="flex flex-row">
            <span className="self-center mr-2">
              <FaEthereum></FaEthereum>
            </span>
            {post?.tipEarned
              ? utils.formatEther(BigNumber.from(post?.tipEarned.toString()))
              : 0}{" "}
            ETH
          </div>
        </div>
        <TipModal post={post} />
      </div>
      <Divider />
      <Content content={post?.content} />
      <Divider />
      <div id="comments">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Comments comments={comments} postId={Number(router.query.id)} />
        )}
      </div>
    </div>
  );
};

export default PostDetail;
