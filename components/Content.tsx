import { MediaRenderer } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";

const Content = ({ content }: { content: string }) => {

  return <MediaRenderer src={content} mimeType="text/html"> </MediaRenderer>;
};

export default Content;
