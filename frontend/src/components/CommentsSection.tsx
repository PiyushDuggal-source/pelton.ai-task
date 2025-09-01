import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Comment } from "../types/api";
import {
  getComments,
  type CreateCommentInput,
  createCommentSchema,
  createComment,
} from "../features/comments/comments";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

interface CommentsSectionProps {
  taskId: string;
}

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const CommentsSection: React.FC<CommentsSectionProps> = ({ taskId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { taskId: taskId },
  });

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getComments(taskId);
        setComments(data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch comments");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();

    const socket: any = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("accessToken") },
    });

    socket.on("comment:create", (payload: { comment: Comment }) => {
      if (payload.comment.taskId === taskId) {
        setComments((prev) => [payload.comment, ...prev]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [taskId]);

  const onSubmit = async (data: CreateCommentInput) => {
    const previousComments = comments;
    const tempId = `temp-${Date.now()}`;
    const newComment = { ...data, _id: tempId, authorId: "Me", createdAt: new Date().toISOString() } as Comment; // "Me" is a placeholder for current user ID
    setComments((prev) => [newComment, ...prev]); // Optimistic update
    try {
      const createdComment = await createComment(data);
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === tempId ? createdComment : comment,
        ),
      );
      reset();
      toast.success("Comment added successfully!");
    } catch (err: any) {
      setComments(previousComments); // Rollback
      toast.error(err.response?.data?.error || "Failed to add comment");
    }
  };

  if (loading)
    return <div className="text-center py-4">Loading comments...</div>;
  if (error)
    return <div className="text-center py-4 text-red-600">Error: {error}</div>;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 mb-4">
        <textarea
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
          placeholder="Add a comment..."
          {...register("body")}
        ></textarea>
        {errors.body && (
          <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Add Comment
        </button>
      </form>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((comment) => (
            <li key={comment._id} className="bg-gray-50 p-3 rounded-md">
              <p className="text-gray-800">{comment.body}</p>
              <p className="text-gray-500 text-xs mt-1">
                By {comment.authorId} on{" "}
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentsSection;
