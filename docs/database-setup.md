# Database Setup

## Required Table

### buen_coffee_user_votes (Individual user votes)

```sql
CREATE TABLE buen_coffee_user_votes (
  id SERIAL PRIMARY KEY,
  alias VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(alias, user_id) -- Ensures one vote per user per shop
);
```

### Recommended Indexes

```sql
-- Index for fast lookups by alias
CREATE INDEX idx_user_votes_alias ON buen_coffee_user_votes(alias);

-- Index for fast lookups by user_id
CREATE INDEX idx_user_votes_user_id ON buen_coffee_user_votes(user_id);

-- Composite index for the most common query
CREATE INDEX idx_user_votes_alias_user_id ON buen_coffee_user_votes(alias, user_id);
```

## Features

This voting system provides:

- **One vote per user per shop**: Enforced by UNIQUE constraint
- **Toggle functionality**: Click again to remove vote
- **Vote switching**: Change from upvote to downvote and vice versa
- **Real-time counting**: Vote totals calculated from individual votes
- **Anonymous users**: Uses localStorage-based user IDs
- **No double voting**: Database constraint prevents multiple votes

## How it works

1. Each user gets a unique ID stored in browser localStorage
2. Users can cast one vote (upvote or downvote) per coffee shop
3. Clicking the same vote again removes it (toggle off)
4. Clicking the opposite vote switches the vote type
5. Vote counts are calculated by counting individual votes from the table
