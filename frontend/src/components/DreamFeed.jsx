import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Gift } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';

const BASE_URL = 'https://lqp.unycode.net/api/method/';

const fetchDreams = async ({ pageParam = 0 }) => {
    const response = await axios.get(`${BASE_URL}lqp.api.stream_dreams?page=${pageParam}`);
    return response.data.message;
};

const formatInterpretation = (text) => {
  // Convert line breaks to <p> tags, preserve existing HTML
  return text.split('\n').map((paragraph, index) =>
    `<br/><p key=${index}>${paragraph}</p>`
  ).join('');
};

const DreamCard = ({ dream, onLike, onComment, onGift }) => (
  <div className="bg-gray-800 p-4 mx-4 my-2 rounded-md mb-4 space-y-4">
    <div className="flex items-center space-x-2">
      <Avatar>
        <img src={dream.dreamerAvatar} alt={dream.dreamer} className="rounded-full" />
      </Avatar>
      <span className="font-semibold text-white">{dream.dreamer}</span>
    </div>
    <div className="flex flex-col">
      <h3 className='text-white'>Dream</h3>
      <p className="text-sm text-gray-200">{dream.dreamContent}.</p>
    </div>
    <div className="flex flex-col">
      <h3 className='text-white'>Interpretation</h3>
      <div
        className="text-xs italic text-gray-300"
        dangerouslySetInnerHTML={{ __html: formatInterpretation(dream.interpretation) }}
      />
    </div>
    <div className="flex justify-between items-center">
      <Button variant="ghost" size="sm" onClick={() => onLike(dream.name, dream.isLiked)}>
        <Heart className={`h-5 w-5 ${dream.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
        <span className="ml-1 text-gray-300">{dream.likes}</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onComment(dream.name)}>
        <MessageCircle className="h-5 w-5 text-gray-300" />
        <span className="ml-1 text-gray-300">{dream.comments.length}</span>
      </Button>
      {/* <Button variant="ghost" size="sm" onClick={() => onGift(dream.name)}>
        <Gift className="h-5 w-5 text-gray-300" />
        <span className="ml-1 text-gray-300">Gift</span>
      </Button> */}
    </div>
  </div>
);

const DreamFeed = () => {
  const [selectedDream, setSelectedDream] = useState(null);
  const [comment, setComment] = useState('');
  const lastDreamRef = useRef();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['dreams'],
    queryFn: fetchDreams,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    retry: 1,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (lastDreamRef.current) {
      observer.observe(lastDreamRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  const handleLike = async (dreamId, isLiked) => {
      await axios.post(`${BASE_URL}lqp.api.like`, {
        reference_name: dreamId,
        like: !isLiked
      }).then(response => {
          // Update the UI to reflect the new like status
          const updatedPages = data.pages.map(page => ({
            ...page,
            dreams: page.dreams.map(dream =>
              dream.name === dreamId
                ? { ...dream, isLiked: !isLiked, likes: isLiked ? dream.likes - 1 : dream.likes + 1 }
                : dream
            )
          }))
          queryClient.setQueryData(['dreams'], { ...data, pages: updatedPages });
      });
  };

  const handleComment = (dreamId) => {
    setSelectedDream(prevSelectedDream => prevSelectedDream === dreamId ? null : dreamId);
  };

  const handleGift = (dreamId) => {
    // Implement gift functionality
    console.log('Gifted dreamer:', dreamId);
  };

  const submitComment = async () => {
    if (comment.trim() && selectedDream) {
      try {
        const response = await axios.post(`${BASE_URL}lqp.api.comments.add_comment`, {
          comment: comment.trim(),
          reference_name: selectedDream,
        });

        if (response.data.error) {
          console.error('Error submitting comment:', response.data.error);
          // Handle error (e.g., show an error message to the user)
        } else {
          console.log('Comment submitted successfully:', response.data);
          // Update the UI to show the new comment
          // You might want to refetch the dreams or update the local state
          setComment('');
          setSelectedDream(null);
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
        // Handle error (e.g., show an error message to the user)
      }
    }
  };

  if (isLoading) return <div className="text-white">Loading dreams...</div>;
  if (isError) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <ScrollArea className="flex-grow">
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.dreams.map((dream, index) => (
              <div
                key={dream.name}
                ref={index === page.dreams.length - 1 ? lastDreamRef : null}
              >
                <DreamCard
                  dream={dream}
                  onLike={handleLike}
                  onComment={handleComment}
                  onGift={handleGift}
                />
              </div>
            ))}
          </React.Fragment>
        ))}
      </ScrollArea>
      {selectedDream && (
        <div className="p-4 bg-gray-800">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="mb-2 bg-gray-700 text-white"
          />
          <Button onClick={submitComment} className="bg-blue-500 hover:bg-blue-600 text-white">Submit Comment</Button>
        </div>
      )}
    </div>
  );
};

export default DreamFeed;

