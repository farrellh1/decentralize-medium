import { useContract, useContractEvents } from "@thirdweb-dev/react-core";
import { NextPage } from "next";
import PostCard from "./PostCard";

const Posts: NextPage = () => {
  const { contract } = useContract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
  const { data: events } = useContractEvents(contract, "PostCreated");

  return (
    <div className="w-full h-full flex flex-col p-[0px] md:px-[70px] md:py-[20px]">
      {events?.length === 0 ? (
        <div>No posts yet.</div>
      ) : (
        events?.map((event, index) => {
          return <PostCard key={index} event={event} contract={contract} />;
        })
      )}
    </div>
  );
};

export default Posts;
