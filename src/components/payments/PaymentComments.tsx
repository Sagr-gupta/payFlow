import React, { useState } from 'react';
import { Comment, User } from '../../types';
import { usePaymentStore } from '../../store/paymentStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { MessageSquare, Send } from 'lucide-react';

interface PaymentCommentsProps {
  paymentId: string;
  comments: Comment[];
  currentUser: User;
  isAdmin: boolean;
}

const PaymentComments: React.FC<PaymentCommentsProps> = ({
  paymentId,
  comments,
  currentUser,
  isAdmin
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addComment, sendForReview } = usePaymentStore();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addComment(paymentId, newComment.trim(), currentUser);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendForReview = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await sendForReview(paymentId, newComment.trim(), currentUser);
      setNewComment('');
    } catch (error) {
      console.error('Failed to send for review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900">Comments</h3>
      </div>

      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No comments yet</p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{comment.userName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Add a comment
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type your comment here..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAddComment}
            disabled={isSubmitting || !newComment.trim()}
            icon={<Send className="h-4 w-4" />}
          >
            Add Comment
          </Button>
          {isAdmin && (
            <Button
              onClick={handleSendForReview}
              disabled={isSubmitting || !newComment.trim()}
              variant="secondary"
              icon={<MessageSquare className="h-4 w-4" />}
            >
              Send for Review
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PaymentComments; 