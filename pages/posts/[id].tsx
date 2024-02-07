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
    "0x32be2bdA03fdffd9C285dAa41051d2De4924815f"
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
    <div className="max-w-[40%] text-center mt-10 mx-auto">
      <div className="text-3xl font-bold">{post?.title}</div>
      <div className="flex flex-row mx-auto w-full justify-center mt-4">
        <FaM className="text-xl text-white bg-black rounded-full w-[40px] h-[40px] p-2 self-center"></FaM>
        <div className="text-xl self-center ml-3">
          Author address: {post?.author}
        </div>
      </div>
      <Divider />
      <div className="flex flex-row mt-4 mx-6 justify-between items-center">
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
      <div className="my-[60px]"></div>
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
