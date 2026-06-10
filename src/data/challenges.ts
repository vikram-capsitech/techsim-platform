export interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
  description: string;
  scale: { users: string; rps: string; storage: string };
  functionalReqs: string[];
  nonFunctionalReqs: string[];
  hints: string[];
  followUpQuestions: string[];
  tags: string[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'url-shortener',
    title: 'URL Shortener',
    difficulty: 'Easy',
    timeLimit: 45,
    description: 'Design a URL shortening service like bit.ly. Users can submit a long URL and receive a short alias (e.g., short.io/abc123). Anyone with the alias should be instantly redirected to the original URL.',
    scale: { users: '100M DAU', rps: '10K writes/s, 100K reads/s', storage: '10TB over 5 years' },
    functionalReqs: [
      'Given a long URL, generate a unique short alias',
      'Short URL redirects to original URL',
      'Custom alias support (user-chosen slug)',
      'URL expiry — links can have a TTL',
      'Analytics — click count per short URL',
    ],
    nonFunctionalReqs: [
      '99.9% availability (read path)',
      'Redirect latency < 10ms (p99)',
      'Short URLs must be unique and not guessable',
      'System must handle 10:1 read/write ratio',
    ],
    hints: [
      'The short code generation is the core problem. Think about Base62 encoding vs hash truncation — how do you avoid collisions at 100M links?',
      'The hot path is redirect: DNS → CDN → cache lookup → redirect. Where does the database fit? When can you skip it entirely?',
      'Counter-based ID generation scales but creates a sequential pattern (guessable). How do you make IDs non-guessable without sacrificing performance?',
    ],
    followUpQuestions: [
      'How would you handle a "celebrity link" that gets 1M hits in 5 minutes?',
      'How do you prevent abuse? (link spam, phishing)',
      'How would you implement analytics without slowing down the redirect path?',
      'How would you support custom domains (company.short.io)?',
    ],
    tags: ['caching', 'database', 'hashing', 'cdn'],
  },
  {
    id: 'twitter-feed',
    title: 'Twitter-like Feed',
    difficulty: 'Medium',
    timeLimit: 60,
    description: 'Design the home timeline feed for a social network like Twitter. When a user opens the app, they see recent tweets from accounts they follow in reverse chronological order. Tweets can include text, images, and retweets.',
    scale: { users: '300M DAU', rps: '600K reads/s, 6K writes/s', storage: '100TB/year' },
    functionalReqs: [
      'Users can post tweets (text, images)',
      'Users can follow/unfollow other users',
      'Home timeline shows tweets from followed users (reverse chronological)',
      'Retweet and like functionality',
      'Push notifications for mentions and replies',
    ],
    nonFunctionalReqs: [
      'Timeline load < 200ms (p99)',
      '99.99% availability for reads',
      'Eventually consistent — slight delay on new tweets is acceptable',
      'Celebrities with 50M+ followers are a special case',
    ],
    hints: [
      'The core problem is fan-out: when a user tweets, how do their followers see it? Fan-out-on-write (pre-compute timelines) vs fan-out-on-read (compute at query time). What are the tradeoffs?',
      'Twitter uses a hybrid: fan-out-on-write for normal users, fan-out-on-read for celebrities (accounts with >1M followers). Why?',
      'The timeline is essentially a sorted set of tweet IDs. Redis ZADD/ZRANGE with scores as timestamps maps perfectly to this. What does your write path look like?',
    ],
    followUpQuestions: [
      'How would you handle Lady Gaga tweeting to 100M followers — she can\'t fan-out to 100M Redis lists synchronously?',
      'How do you order tweets if clocks across servers are slightly skewed?',
      'How would you implement "trending topics" at scale?',
      'How would you design the notification system to deliver push notifications within 1 second?',
    ],
    tags: ['fan-out', 'redis', 'kafka', 'cdn', 'feed'],
  },
  {
    id: 'uber-driver-tracking',
    title: 'Uber Driver Tracking',
    difficulty: 'Hard',
    timeLimit: 60,
    description: 'Design the real-time driver location tracking system for a ride-sharing app. Drivers continuously report their GPS coordinates (every 4 seconds), and riders can see nearby drivers on a map in real time. The matching service needs to find the closest available driver.',
    scale: { users: '5M active drivers', rps: '1.25M location updates/s', storage: '50TB/year' },
    functionalReqs: [
      'Driver app sends GPS coordinates every 4 seconds',
      'Rider app shows nearby available drivers on a map',
      'Matching: find the closest available driver to a rider',
      'ETA calculation for driver arrival',
      'Trip history storage',
    ],
    nonFunctionalReqs: [
      'Location update ingestion < 50ms',
      'Nearby drivers query < 100ms (p99)',
      'System must handle 1.25M location writes/second at peak',
      'Driver locations must be < 10 seconds stale',
    ],
    hints: [
      'Standard SQL with lat/lng columns cannot do spatial proximity queries at scale. Think about spatial indexing — what does Uber actually use? (H3 hexagonal geo-grid, S2 cells, geohash)',
      'The ingestion path (driver → server) and the query path (rider → nearby drivers) have very different requirements. Design them separately. The ingestion path is write-heavy; the query path is read-heavy with spatial lookups.',
      'Redis GEO commands (GEOADD, GEORADIUS) can store and query driver locations with O(N+log M) complexity. How do you handle the 1.25M writes/second without Redis becoming a bottleneck?',
    ],
    followUpQuestions: [
      'How do you handle a driver that goes offline (app crash)? When do you mark them unavailable?',
      'How would you design the surge pricing algorithm that reads current supply/demand by area?',
      'The matching service needs to claim a driver atomically — two riders shouldn\'t match the same driver. How?',
      'How would you store and query trip history for analytics (avg fare by city, peak hours)?',
    ],
    tags: ['geo-spatial', 'redis', 'kafka', 'websocket', 'real-time'],
  },
];
