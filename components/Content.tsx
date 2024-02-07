const Content = ({ content }: { content: string }) => {
  return (
    <div className="py-[24px]">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default Content;
