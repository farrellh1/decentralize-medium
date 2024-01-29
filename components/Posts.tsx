import { useContractRead } from "@thirdweb-dev/react";
import { useContract, useContractEvents } from "@thirdweb-dev/react-core";
import { NextPage } from "next";
import PostCard from "./PostCard";

const Posts: NextPage = () => {
  const { contract } = useContract(
    "0x32be2bdA03fdffd9C285dAa41051d2De4924815f"
  );
  const { data: events } = useContractEvents(contract, "PostCreated");

  return (
    <div className="w-full h-full flex flex-col p-[70px]">
      {events?.map((event) => {
        return (
          <PostCard event={event} contract={contract}/>
        );
      })}
    </div>
  );
};

export default Posts;
