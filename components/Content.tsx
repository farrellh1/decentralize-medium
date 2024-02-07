const Content = ({ content }: { content: string }) => {
  return (
    <div className="mt-4">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default Content;
