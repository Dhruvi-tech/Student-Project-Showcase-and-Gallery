import React, { useEffect, useRef } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

export function VoteControls({ project, onVote, isVoting = false }) {
  const clickTimer = useRef(null);
  useEffect(() => () => clearTimeout(clickTimer.current), []);
  const vote = project.user_vote || (project.has_voted ? 'up' : project.has_disliked ? 'down' : null);
  const handleClick = (direction) => {
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      if (vote !== direction) onVote(project.id, direction);
    }, 280);
  };
  const handleDoubleClick = (direction) => {
    clearTimeout(clickTimer.current);
    if (vote === direction) onVote(project.id, null);
  };

  return (
    <div className="vote-controls" aria-label="Project rating">
      <button
        type="button"
        className={`vote-button vote-like ${vote === 'up' ? 'selected' : ''}`}
        onClick={() => handleClick('up')}
        onDoubleClick={() => handleDoubleClick('up')}
        disabled={isVoting}
        aria-pressed={vote === 'up'}
        title={vote === 'up' ? 'Double-click to remove your like' : 'Like this project'}
      >
        <ThumbsUp size={15} fill={vote === 'up' ? 'currentColor' : 'none'} />
        <span>Like</span>
        <strong>{project.upvote_count ?? 0}</strong>
      </button>
      <button
        type="button"
        className={`vote-button vote-dislike ${vote === 'down' ? 'selected' : ''}`}
        onClick={() => handleClick('down')}
        onDoubleClick={() => handleDoubleClick('down')}
        disabled={isVoting}
        aria-pressed={vote === 'down'}
        title={vote === 'down' ? 'Double-click to remove your dislike' : 'Dislike this project'}
      >
        <ThumbsDown size={15} fill={vote === 'down' ? 'currentColor' : 'none'} />
        <span>Dislike</span>
        <strong>{project.downvote_count ?? 0}</strong>
      </button>
    </div>
  );
}
