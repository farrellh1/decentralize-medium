import {
  useAddress,
  useContract,
  useContractWrite,
} from "@thirdweb-dev/react";
import { Button } from "../@/components/ui/button";
import { useState } from "react";
import CommentCard from "./CommentCard";

const Comments = ({ comments, postId }: { comments: any[], postId: number }) => {
  const userAddress = useAddress();
  const [newComment, setNewComment] = useState("");
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  );
  const { mutateAsync: createComment, isLoading: createCommentLoading } =
    useContractWrite(contract, "createComment");

  const handleCreateComment = async () => {
    if (userAddress == null) {
      alert("Please connect your wallet");
      return;
    }
    if (!newComment) {
      alert("Please enter a comment");
      return;
    }

    try {
      await createComment({
        args: [postId, newComment],
      });
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="my-[20px]">
      <div className="font-bold text-xl">Comments</div>
      <div className="flex flex-col my-[8px] gap-[16px]">
        {
         comments?.length == 0 ? (
          <div>No comments yet</div>
        ) : (
          comments.map((comment: any) => {
            return <CommentCard comment={comment} />;
          })
        )}
        <div className="mt-[70px]">
          <label htmlFor="comment">Comment to this post</label>
          <textarea
            className="w-full p-2 rounded border border-gray-300"
            placeholder="Nice content keep up the good work"
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            className="bg-black text-white w-full h-[50px] mt-5 rounded-md"
            type="submit"
            onClick={handleCreateComment}
          >
            {createCommentLoading ? "Uploading Comment..." : "Comment"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Comments;
