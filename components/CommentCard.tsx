const CommentCard = ({ comment }: { comment: any }) => {
  return (
    <div key={comment.id} className="w-full border-b-[0.1px] border-solid border-foreground py-[16px]">
      <div className="text-xs">from: {comment.commenterAddress}</div>
      <div className="text-2xl">{comment.content}</div>
    </div>
  );
};

export default CommentCard;
