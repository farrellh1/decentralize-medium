const CommentCard = ({ comment }: { comment: any }) => {
  return (
    <div key={comment.id} className="w-full rounded shadow-lg p-6 text-start">
      <div className="text-xs">from: {comment.commenterAddress}</div>
      <div className="text-2xl">{comment.content}</div>
    </div>
  );
};

export default CommentCard;
