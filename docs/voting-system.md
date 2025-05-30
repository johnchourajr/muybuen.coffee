# Voting System

This project includes an upvote/downvote system for coffee shops using the `@muybuen/retool-db-react` package with individual user vote tracking.

## How it works

1. **Database**: Uses a `buen_coffee_user_votes` table with columns:

   - `id`: Primary key
   - `alias`: Coffee shop alias (foreign key reference)
   - `user_id`: Unique user identifier (stored in localStorage)
   - `vote_type`: Either 'upvote' or 'downvote'
   - `created`: Creation timestamp
   - `updated`: Last update timestamp
   - `UNIQUE(alias, user_id)`: Ensures one vote per user per shop

2. **Hook**: `useUserVoting(alias)` provides:

   - `votes`: Current vote counts (calculated from individual votes)
   - `upvote()`: Function to upvote (or toggle off if already upvoted)
   - `downvote()`: Function to downvote (or toggle off if already downvoted)
   - `isLoading`: Loading state
   - `isSubmitting`: Submission state
   - `error`: Error state
   - `userVoteType`: User's current vote ('upvote', 'downvote', or null)
   - `hasVoted`: Whether this user has voted

3. **Component**: `VotingButtons` renders the voting interface with visual feedback

## Implementation Details

### Hook Architecture

The `useUserVoting` hook uses:

- **`useRetoolDatabase`**: Official retool-db-react hook for database operations
- **Dual queries**: One for all votes (for counts), one for user's vote
- **localStorage user ID**: Anonymous but persistent user identification
- **Toggle logic**: Same vote removes it, different vote updates it

### User Identification

- **Anonymous**: No login required
- **Persistent**: User ID stored in browser localStorage
- **Unique**: Generated with timestamp + random string
- **Cross-session**: Maintains user identity across browser sessions

### Vote Logic

```typescript
if (userVote) {
  if (userVote.vote_type === voteType) {
    // Same vote - remove it (toggle off)
    await remove({ id: userVote.id });
  } else {
    // Different vote - change it
    await update({ vote_type: voteType });
  }
} else {
  // No vote - create new vote
  await insert({ vote_type: voteType });
}
```

## Usage

```tsx
import { VotingButtons } from "@/components/voting-buttons";

// In your component
<VotingButtons alias="shop-alias" className="justify-center" />;
```

## Component Integration

The voting system is integrated into the shop detail pages via:

```tsx
// In ShopActions component
{
  alias && (
    <div className="pt-2">
      <div className="text-sm text-gray-600 mb-2 text-center">
        Rate this coffee shop:
      </div>
      <VotingButtons alias={alias} className="justify-center" />
    </div>
  );
}
```

## Features

- **One vote per user**: Database constraint ensures fairness
- **Toggle functionality**: Click again to remove your vote
- **Vote switching**: Change from upvote to downvote instantly
- **Visual feedback**: Buttons show your current vote state
- **Real-time counts**: Vote totals update immediately
- **Anonymous voting**: No account required
- **Persistent identity**: Votes remembered across sessions
- **Performance optimized**: Prevents infinite re-renders
- **Hydration safe**: Prevents SSR/client mismatch

## Technical Notes

### Performance Optimizations

1. **Memoized queries**: Prevents unnecessary API calls
2. **Individual loading states**: Each button shows its own loading spinner
3. **Optimistic updates**: Immediate UI feedback
4. **Stable rendering**: No infinite re-render loops

### User Experience

- **Clear visual states**: Buttons show voted/unvoted states
- **Tooltips**: Helpful hover messages
- **Loading indicators**: Spinners during API calls
- **Instant feedback**: No delays in UI updates

### Database Design

- **UNIQUE constraint**: Prevents duplicate votes
- **CHECK constraint**: Ensures valid vote types
- **Indexed queries**: Fast lookups by alias and user_id

## API Route

The system uses the retool-db-react API route at `/api/retool-db/[tableName]`:

```typescript
// app/api/retool-db/[tableName]/route.ts
import { retoolDbHandler } from "@muybuen/retool-db-react/server";

export {
  retoolDbHandler as DELETE,
  retoolDbHandler as POST,
  retoolDbHandler as PUT,
};
```

## File Structure

```
src/
├── hooks/
│   └── useUserVoting.ts          # Main voting logic hook
├── components/
│   ├── voting-buttons.tsx        # Voting UI component
│   └── shop/
│       └── shop-actions.tsx      # Integration point
└── types/
    └── buen_coffee_user_votes.ts # Database type definitions
```

## Setup

1. Create the database table (see `docs/database-setup.md`)
2. Import `VotingButtons` component
3. Pass the shop `alias` as a prop
4. Users can immediately start voting!
