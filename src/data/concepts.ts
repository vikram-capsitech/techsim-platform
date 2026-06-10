export type DemoType =
  | 'cap' | 'hashing' | 'sharding'
  | 'replication' | 'circuit-breaker' | 'rate-limiting'
  | 'load-balancing' | 'caching' | 'cqrs'
  | 'twopc-animation' | 'saga-animation' | 'eventsourcing-animation';

export interface ConceptRef {
  title: string;
  url: string;
  type: 'paper' | 'blog' | 'docs' | 'video';
}

export interface Concept {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  tags: string[];
  summary: string;
  theory: string[];
  hasDemo: boolean;
  demoType?: DemoType;
  references: ConceptRef[];
}

export const CONCEPTS: Concept[] = [
  {
    id: 'cap-theorem',
    title: 'CAP Theorem',
    category: 'Distributed Systems',
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    tags: ['consistency', 'availability', 'partitions', 'distributed'],
    summary: 'Any distributed data store can provide at most two of three guarantees: Consistency, Availability, and Partition tolerance.',
    theory: [
      'The CAP theorem, formally proven by Eric Brewer in 2002, states that a distributed system can guarantee at most two of three properties simultaneously. Consistency (C) means every read receives the most recent write or an error. Availability (A) means every request receives a non-error response — but it might not be the latest data. Partition tolerance (P) means the system continues operating even when network partitions split nodes into isolated groups.',
      'In practice, network partitions are not optional — they happen in any real distributed system due to hardware failures, network congestion, or datacenter splits. This means the meaningful choice is between CP and AP. CP systems (like ZooKeeper, HBase, and etcd) choose consistency: when a partition occurs, they block or reject requests to prevent stale reads. AP systems (like Cassandra, DynamoDB, and CouchDB) choose availability: they continue serving requests using potentially stale data and reconcile differences when the partition heals.',
      'The theorem is often misunderstood as a binary choice. In reality, both C and A are spectrums. Systems like Google Spanner use TrueTime and globally synchronized clocks to approach "CA" behavior in practice, even though partitions can still cause brief unavailability. Modern designs often tune consistency per-operation: critical financial transactions use strong consistency while user profile reads tolerate eventual consistency. Understanding where your system needs CP vs AP semantics is one of the most important early architecture decisions.',
    ],
    hasDemo: true,
    demoType: 'cap',
    references: [
      { title: 'Brewer\'s CAP Theorem (Original paper)', url: 'https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf', type: 'paper' },
      { title: 'CAP Twelve Years Later: How the "Rules" Have Changed', url: 'https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/', type: 'blog' },
      { title: 'PACELC: An extension to CAP', url: 'https://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html', type: 'blog' },
    ],
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    category: 'Distributed Systems',
    difficulty: 'Intermediate',
    estimatedTime: '30 min',
    tags: ['hashing', 'sharding', 'partitioning', 'distributed'],
    summary: 'A hashing technique that minimizes key remapping when nodes are added or removed from a distributed system.',
    theory: [
      'Consistent hashing solves the key redistribution problem in distributed caches and databases. With naive modular hashing (key % N), adding or removing a node reshuffles almost all keys — catastrophic for a cache that would suddenly miss everything. Consistent hashing maps both nodes and keys onto a circular hash ring (typically 0–2³² − 1). Each key is owned by the nearest clockwise node. When a node is added or removed, only the keys in the adjacent arc move.',
      'The expected fraction of keys that move when one node changes is 1/N (where N is the number of nodes), versus nearly 100% with modular hashing. Amazon DynamoDB and Apache Cassandra pioneered this in production. However, a basic ring creates uneven distribution — one node might own a large arc while another owns a tiny one. The solution is virtual nodes (vnodes): each physical server gets mapped to K positions on the ring (typically 150–256 vnodes per node). This creates a much more uniform load distribution and makes node failures less impactful.',
      'Consistent hashing is also used in CDNs (Akamai), distributed caches (Memcached), and load balancers that need session affinity without centralized routing tables. Modern variants like Rendezvous hashing (highest random weight) and Jump Consistent Hash offer additional properties: Rendezvous distributes keys to exactly the K highest-weighted nodes (perfect for replication factor K), while Jump hash is cache-efficient and needs no ring data structure.',
    ],
    hasDemo: true,
    demoType: 'hashing',
    references: [
      { title: 'Consistent Hashing and Random Trees (Karger et al.)', url: 'https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf', type: 'paper' },
      { title: 'Consistent Hashing: Algorithmic Tradeoffs', url: 'https://medium.com/@dgryski/consistent-hashing-algorithmic-tradeoffs-ef6b8e2fcae8', type: 'blog' },
      { title: 'DynamoDB: Amazon\'s Dynamo paper', url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf', type: 'paper' },
    ],
  },
  {
    id: 'database-sharding',
    title: 'Database Sharding',
    category: 'Database Design',
    difficulty: 'Advanced',
    estimatedTime: '35 min',
    tags: ['sharding', 'partitioning', 'database', 'scalability'],
    summary: 'Horizontal partitioning of data across multiple database nodes, each holding a subset of the total dataset.',
    theory: [
      'Sharding splits a large dataset horizontally across multiple database instances called shards. Unlike replication (which copies the same data to multiple nodes for redundancy and read scaling), sharding divides the data so each shard owns a disjoint subset. This allows both read and write throughput to scale linearly with the number of shards — something a single-master replica set cannot achieve.',
      'Three common sharding strategies: Range-based sharding assigns contiguous key ranges to shards (e.g., users A–M go to shard 1, N–Z to shard 2). It\'s simple and supports efficient range queries, but creates hotspots when access patterns are skewed (e.g., all new users have recent timestamps that land on the same shard). Hash-based sharding applies a hash function to the shard key to distribute rows evenly, preventing hotspots but making range queries expensive. Directory-based sharding uses a lookup service to route each key to its shard, offering flexibility but introducing a centralized bottleneck.',
      'Cross-shard operations are the primary cost of sharding. Joins, aggregations, and transactions spanning multiple shards require scatter-gather queries or application-level coordination. Resharding — adding or removing shards — is operationally expensive and usually requires downtime or careful choreography with consistent hashing. Instagram famously sharded PostgreSQL into 1000s of logical shards mapped to fewer physical servers, allowing online resharding by moving logical shards without changing application routing logic.',
    ],
    hasDemo: true,
    demoType: 'sharding',
    references: [
      { title: 'Vitess: Scalable MySQL for YouTube', url: 'https://vitess.io/', type: 'docs' },
      { title: 'Instagram\'s Sharding ID Generation', url: 'https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c', type: 'blog' },
      { title: 'MongoDB Sharding Documentation', url: 'https://www.mongodb.com/docs/manual/sharding/', type: 'docs' },
    ],
  },
  {
    id: 'load-balancing',
    title: 'Load Balancing Algorithms',
    category: 'Networking',
    difficulty: 'Beginner',
    estimatedTime: '20 min',
    tags: ['load-balancing', 'networking', 'round-robin', 'least-connections'],
    summary: 'Algorithms for distributing incoming requests across a pool of backend servers to maximize throughput and minimize latency.',
    theory: [
      'Load balancers sit between clients and backend servers and route each incoming request to a specific server. The simplest algorithm is Round Robin — each new request goes to the next server in a circular list. It works well when all requests have similar cost, but fails when some requests are expensive (long computations, large uploads) and others are trivial. Weighted Round Robin addresses this by assigning more requests to more powerful servers.',
      'Least Connections routes each request to the server with the fewest active connections. This adapts dynamically to varying request durations and is the default in most production load balancers (HAProxy, Nginx). A variant, Least Response Time, combines connection count with recent latency to route to the fastest available server. For stateful applications that need session affinity, Sticky Sessions (IP hash or cookie-based) ensures a client always reaches the same backend — critical for cart sessions or WebSocket connections.',
      'Layer 7 (application-layer) load balancers can route based on HTTP content: URL path, headers, cookies, or request body. This enables features like A/B testing, blue/green deployments, and routing API versions to different backend pools. Modern service meshes (Envoy, Linkerd) extend this with circuit breaking, retries, and observability built directly into the data plane, making load balancing an integral part of microservice reliability.',
    ],
    hasDemo: true,
    demoType: 'load-balancing',
    references: [
      { title: 'HAProxy Load Balancing Algorithms', url: 'https://www.haproxy.com/documentation/haproxy-configuration-tutorials/load-balancing/overview/', type: 'docs' },
      { title: 'NGINX Load Balancing Guide', url: 'https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/', type: 'docs' },
    ],
  },
  {
    id: 'circuit-breaker',
    title: 'Circuit Breaker Pattern',
    category: 'Microservices',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    tags: ['resilience', 'circuit-breaker', 'microservices', 'patterns'],
    summary: 'A stability pattern that prevents cascading failures by stopping calls to a failing service and allowing it time to recover.',
    theory: [
      'Named after electrical circuit breakers, the software circuit breaker monitors calls to an external service and "trips" (opens) when failure rates exceed a threshold. In the Open state, all calls are immediately rejected with a fallback response — no network calls are made. This prevents thread pools and connection pools from exhausting, stopping the failure cascade that kills the entire system when one downstream service degrades.',
      'The circuit breaker has three states: Closed (normal operation, calls pass through, failures tracked), Open (all calls rejected, allowing the downstream to recover), and Half-Open (a probe state where a limited number of test requests are allowed through to check if the service has recovered). If the test requests succeed, the breaker closes; if they fail, it reopens for another timeout period.',
      'Netflix\'s Hystrix popularized circuit breakers in microservices (though it\'s now in maintenance; Resilience4j is the modern Java equivalent). Key configuration parameters are: failure threshold (% of calls that must fail to trip), minimum request volume (prevents tripping on a single failure in low traffic), wait duration (how long to stay open), and slow call rate threshold (calls taking longer than a set duration count as failures). Most cloud SDKs and service meshes implement circuit breaking transparently, but understanding the semantics is critical for debugging mysterious silent failures.',
    ],
    hasDemo: true,
    demoType: 'circuit-breaker',
    references: [
      { title: 'Martin Fowler: Circuit Breaker', url: 'https://martinfowler.com/bliki/CircuitBreaker.html', type: 'blog' },
      { title: 'Resilience4j Documentation', url: 'https://resilience4j.readme.io/docs/circuitbreaker', type: 'docs' },
    ],
  },
  {
    id: 'event-sourcing',
    title: 'Event Sourcing',
    category: 'Architecture Patterns',
    difficulty: 'Advanced',
    estimatedTime: '40 min',
    tags: ['event-sourcing', 'events', 'projections', 'audit-log'],
    summary: 'Store state as an immutable sequence of events rather than current values, enabling full audit trails, temporal queries, and time-travel debugging.',
    theory: [
      'Event sourcing flips the traditional data model. Instead of storing the current state of an entity, you store an ordered log of events that led to that state. An account balance isn\'t stored as "$1500" — instead, the system stores "AccountOpened($500)", "Deposited($1200)", "Withdrawn($200)". The current state is derived by replaying events. This provides complete audit history, the ability to replay events to fix bugs or build new projections, and easier debugging since you can see every state transition.',
      'Projections are derived read models built by subscribing to the event stream. Multiple projections can exist for the same event stream, each optimized for different query patterns. A snapshotting strategy periodically captures a checkpoint state so replaying from the beginning isn\'t required for every read. Snapshotting is essential when an event stream grows to millions of events.',
      'The tradeoff is complexity. Eventual consistency between write and read models means queries might return slightly stale data. The event schema must be carefully versioned since old events can never be changed. Event sourcing excels in financial systems, audit-heavy domains, and collaborative real-time applications (like Google Docs, where every keystroke is an event). It\'s overkill for simple CRUD applications.',
    ],
    hasDemo: true,
    demoType: 'eventsourcing-animation',
    references: [
      { title: 'Martin Fowler: Event Sourcing', url: 'https://martinfowler.com/eaaDev/EventSourcing.html', type: 'blog' },
      { title: 'Microsoft CQRS Pattern Docs', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs', type: 'docs' },
    ],
  },
  {
    id: 'saga-pattern',
    title: 'Saga Pattern',
    category: 'Distributed Systems',
    difficulty: 'Advanced',
    estimatedTime: '35 min',
    tags: ['saga', 'transactions', 'microservices', 'distributed'],
    summary: 'A way to manage data consistency across microservices in distributed transactions without using 2PC.',
    theory: [
      'In a monolith, a database transaction can span multiple tables atomically. In microservices, each service owns its own database, making cross-service atomic transactions impossible without distributed locks (2PC). The Saga pattern breaks a long-running transaction into a sequence of local transactions, each publishing an event or message that triggers the next step. If a step fails, compensating transactions undo the preceding steps.',
      'There are two saga coordination approaches. Choreography-based sagas have no central coordinator — each service listens for events and decides what to do next. This keeps services decoupled but makes the overall flow hard to reason about. Orchestration-based sagas have a central saga orchestrator (often implemented as a state machine) that tells each service what to do next. This is easier to debug and monitor but introduces a centralized component. Most production systems use orchestration for complex sagas.',
      'Designing compensating transactions is the hard part. Not all operations can be truly reversed — sending an email cannot be "unsent". These non-idempotent operations are called pivot transactions: once they execute, the saga must complete. Sagas also require careful handling of out-of-order messages, duplicate events, and lost compensations. The semantic difference between compensating (logically undo) and idempotent (safe to run twice) transactions must be documented. Systems like Apache Camel, Netflix Conductor, and AWS Step Functions provide saga orchestration infrastructure.',
    ],
    hasDemo: true,
    demoType: 'saga-animation',
    references: [
      { title: 'Microservices.io: Saga Pattern', url: 'https://microservices.io/patterns/data/saga.html', type: 'docs' },
      { title: 'Saga: How to implement complex business transactions (Chris Richardson)', url: 'https://chrisrichardson.net/post/sagas/2019/08/04/developing-sagas-part-1.html', type: 'blog' },
    ],
  },
  {
    id: 'bloom-filters',
    title: 'Bloom Filters',
    category: 'Data Structures',
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    tags: ['bloom-filter', 'probabilistic', 'cache', 'data-structures'],
    summary: 'A space-efficient probabilistic data structure that answers "is this element in the set?" with no false negatives but a tunable false positive rate.',
    theory: [
      'A Bloom filter uses a bit array of size m and k hash functions. To add an element, all k hash functions are applied and the corresponding bits are set to 1. To query, apply the same k functions — if any bit is 0, the element is definitely not in the set. If all bits are 1, the element is probably in the set (false positive possible). The false positive rate is (1 − e^(−kn/m))^k where n is the number of inserted elements.',
      'The killer use case is avoiding expensive lookups. Google BigTable and Apache Cassandra use Bloom filters to avoid disk reads for SSTable files that don\'t contain a requested key. Without a filter, a read might scan every SSTable on disk before concluding the key doesn\'t exist. With a filter, you can skip most files with near-certainty, reducing I/O by 60–80% for read-heavy workloads. Medium used Bloom filters to prevent users from seeing repeated stories. Akamai uses them for web caching.',
      'Bloom filters cannot delete elements (setting bits to 0 would affect other elements sharing those positions). Counting Bloom filters extend the structure with counters instead of bits, enabling deletion at the cost of more memory. Cuckoo filters are a modern alternative with better practical performance: they support deletion, have lower false positive rates at high load factors, and offer faster lookup by storing fingerprints rather than hashed positions. When memory is precious and you need approximate membership testing, no structure beats a tuned Bloom filter.',
    ],
    hasDemo: false,
    references: [
      { title: 'Network Applications of Bloom Filters (Broder & Mitzenmacher)', url: 'https://www.eecs.harvard.edu/~michaelm/postscripts/im2005b.pdf', type: 'paper' },
      { title: 'Cuckoo Filter: Practically Better Than Bloom', url: 'https://www.cs.cmu.edu/~dga/papers/cuckoo-conext2014.pdf', type: 'paper' },
    ],
  },
  {
    id: 'rate-limiting',
    title: 'Rate Limiting Algorithms',
    category: 'Networking',
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    tags: ['rate-limiting', 'token-bucket', 'leaky-bucket', 'api'],
    summary: 'Algorithms for controlling the rate of requests to a service, preventing abuse and ensuring fair resource allocation.',
    theory: [
      'Four main rate-limiting algorithms: Fixed Window Counter counts requests in fixed time windows (e.g., 100 req/minute). Simple to implement and understand, but allows 2× bursting at window boundaries — a client can send 100 requests at 00:59 and 100 more at 01:00. Sliding Window Log tracks timestamps of each request in a circular buffer — accurate but memory-intensive (stores one timestamp per request). Sliding Window Counter (used by Cloudflare) approximates the sliding window using two buckets, using only O(1) memory.',
      'Token Bucket works like a bucket being filled at a constant rate — each request consumes one token. Clients can burst up to the bucket capacity, then are throttled to the fill rate. This is the algorithm behind AWS API Gateway and most CDN rate limiters. Leaky Bucket queues requests and processes them at a constant rate — it smooths out bursts entirely but adds latency during spikes. Token bucket is preferred when you want to allow brief bursts; leaky bucket when you need strict constant-rate processing (e.g., invoice generation).',
      'Distributed rate limiting requires agreement across multiple API gateway nodes. Naive per-node limits allow K×N total requests where K is the limit and N is the node count. Redis-based central counters (INCRBY + EXPIRE) provide exact global rate limiting but add latency. A popular middle ground: each node keeps a local counter and periodically syncs to Redis, accepting slight over-limit behavior in exchange for much lower latency and Redis load. Stripe and Twilio rate limit by API key using this hybrid approach.',
    ],
    hasDemo: true,
    demoType: 'rate-limiting',
    references: [
      { title: 'Cloudflare: How we built rate limiting', url: 'https://blog.cloudflare.com/counting-things-a-lot-of-different-things/', type: 'blog' },
      { title: 'Stripe Rate Limiting', url: 'https://stripe.com/docs/rate-limits', type: 'docs' },
    ],
  },
  {
    id: 'caching',
    title: 'Caching Patterns',
    category: 'Performance',
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    tags: ['caching', 'invalidation', 'ttl', 'redis'],
    summary: 'Write patterns for caching layers: Cache-Aside, Write-Through, and Write-Behind — each trades off latency, consistency, and data-loss risk differently.',
    theory: [
      'Cache-Aside (lazy loading) puts the application in control: check cache → on miss, fetch from DB → write to cache. This pattern is popular because the cache only holds data that was actually requested, reducing memory waste. The downside is stale data — if the DB changes between reads, the cache serves old values until TTL expires. Write-Through simultaneously writes to cache and DB on every update, keeping them in sync, at the cost of higher write latency.',
      'Write-Behind (write-back) writes to cache only and asynchronously flushes to the DB, giving the lowest write latency and absorbing burst writes into batch flushes. The risk: if the cache node crashes before flushing, data is lost. This pattern is used in gaming leaderboards and IoT pipelines where occasional loss is acceptable. Read-through has the cache itself fetch from the database on misses — the application only ever talks to the cache, simplifying code at the cost of requiring cache nodes to have DB connectivity.',
      'TTL-based expiry is the simplest invalidation strategy but creates staleness windows. Event-driven invalidation subscribes to DB change events (CDC tools like Debezium) and purges affected keys immediately. Cache tags (Varnish, Fastly CDN) attach metadata so all entries for "user:123" can be atomically invalidated. The key insight: cache strategy must match your data\'s access patterns — a social feed tolerates 5-second staleness; a bank balance does not.',
    ],
    hasDemo: true,
    demoType: 'caching',
    references: [
      { title: 'AWS ElastiCache Caching Strategies', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/Strategies.html', type: 'docs' },
      { title: 'Facebook TAO: Facebook\'s caching layer', url: 'https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf', type: 'paper' },
    ],
  },
  {
    id: 'leader-election',
    title: 'Leader Election',
    category: 'Distributed Systems',
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    tags: ['leader-election', 'consensus', 'zookeeper', 'raft'],
    summary: 'How distributed systems elect a single coordinator to prevent split-brain and ensure only one node performs privileged operations.',
    theory: [
      'Leader election is the process of designating one node among a distributed group as the coordinator for a period. This is needed when only one node should perform certain operations: writing to a primary database, processing a Kafka partition, or coordinating a distributed transaction. Without a single leader, two nodes might simultaneously believe they are the leader — a "split brain" scenario that causes data corruption, duplicate processing, and inconsistency.',
      'The Bully algorithm elects the node with the highest ID that is still alive. It works by sending election messages to all higher-ID nodes; if no response, the sender declares itself leader. Simple but chatty. The Ring algorithm sends election messages around a circular topology; each node appends its ID and the highest ID wins. ZooKeeper\'s leader election uses ephemeral sequential znodes: each candidate creates an ephemeral node and watches the one with the next-lowest sequence number; when a node dies, its ephemeral node disappears and the watcher gets elected.',
      'Raft consensus algorithm (used by etcd, CockroachDB, TiKV) provides both leader election and log replication. Raft requires a quorum (majority) to elect a leader and commit entries, ensuring at most one leader per term. The key safety property: a leader can only be elected if it has all committed log entries. This prevents a stale node from being elected and overwriting committed data. Most modern distributed systems prefer Raft over Paxos due to its superior understandability and formal specification.',
    ],
    hasDemo: false,
    references: [
      { title: 'In Search of an Understandable Consensus Algorithm (Raft paper)', url: 'https://raft.github.io/raft.pdf', type: 'paper' },
      { title: 'ZooKeeper Leader Election Recipe', url: 'https://zookeeper.apache.org/doc/current/recipes.html#sc_leaderElection', type: 'docs' },
    ],
  },
  {
    id: 'service-mesh',
    title: 'Service Mesh',
    category: 'Microservices',
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    tags: ['service-mesh', 'istio', 'envoy', 'sidecar'],
    summary: 'A dedicated infrastructure layer for handling service-to-service communication, providing observability, security, and traffic management without code changes.',
    theory: [
      'A service mesh moves cross-cutting networking concerns (TLS, retries, circuit breaking, observability, load balancing) out of application code and into a separate infrastructure layer. The most common implementation uses the sidecar proxy pattern: a lightweight proxy (typically Envoy) is injected alongside each service container. All inbound and outbound traffic flows through this sidecar, which applies policies and emits telemetry without any application code changes. The collection of sidecars is the data plane; a control plane (Istio, Linkerd, Consul Connect) configures all sidecars centrally.',
      'Service meshes provide mTLS (mutual TLS) automatically — every service-to-service connection is encrypted and both sides authenticate, without any certificate management code in services. Traffic management includes canary deployments (route 5% of traffic to new version), A/B testing, header-based routing, fault injection (deliberately delay 10% of requests to test resilience), and circuit breaking. Observability is built-in: distributed traces, per-service latency percentiles, and dependency maps are automatically generated from sidecar telemetry.',
      'The primary cost is complexity and latency. Each sidecar adds 1–5ms to every request (two hops per call: client-side proxy to service-side proxy). CPU and memory overhead per pod is significant at scale. Debugging becomes harder since packet inspection tools show encrypted traffic. Istio, the most popular mesh, is notoriously complex to configure. Cilium offers an eBPF-based alternative that implements mesh policies in the Linux kernel rather than a sidecar, reducing overhead substantially. For teams with fewer than 50 microservices, a service mesh is usually premature optimization.',
    ],
    hasDemo: false,
    references: [
      { title: 'Istio Documentation', url: 'https://istio.io/latest/docs/', type: 'docs' },
      { title: 'Envoy Proxy Architecture', url: 'https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/arch_overview', type: 'docs' },
    ],
  },
  {
    id: 'two-phase-commit',
    title: 'Two-Phase Commit (2PC)',
    category: 'Distributed Systems',
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    tags: ['2pc', 'transactions', 'distributed', 'consensus'],
    summary: 'A distributed atomic commit protocol that ensures all participants in a distributed transaction either all commit or all abort.',
    theory: [
      'Two-Phase Commit coordinates a distributed transaction across multiple resource managers (databases). In Phase 1 (Prepare), the coordinator sends a "prepare" message to all participants. Each participant checks if it can commit (validating constraints, acquiring locks), persists the transaction to its redo log, and responds "vote-yes" or "vote-no". In Phase 2 (Commit/Abort), if all votes are yes, the coordinator sends "commit" to all participants; if any vote is no, it sends "abort". Each participant executes the decision and releases locks.',
      '2PC has a critical blocking problem: if the coordinator crashes after sending "prepare" but before sending "commit", all participants are in a locked state waiting indefinitely. They have voted yes and cannot unilaterally abort (they don\'t know if the coordinator received all votes). This means 2PC is not fault-tolerant in the presence of coordinator failures. Three-Phase Commit (3PC) adds an extra phase to avoid this blocking problem, but introduces its own issues under network partitions.',
      'In practice, 2PC is avoided in high-scale systems due to its latency (two round trips plus disk flushes), coordinator bottleneck, and blocking under failure. The Saga pattern and eventual consistency patterns are usually preferred. However, 2PC remains the right choice for strict ACID guarantees across bounded sets of resources — it\'s used internally in PostgreSQL for distributed transactions (with foreign data wrappers) and is the foundation of XA transactions in Java EE. Google Spanner uses a Paxos-based variant of 2PC that eliminates the coordinator SPOF.',
    ],
    hasDemo: true,
    demoType: 'twopc-animation',
    references: [
      { title: 'Designing Data-Intensive Applications: Chapter 9', url: 'https://dataintensive.net/', type: 'blog' },
      { title: 'Google Spanner: Distributed transactions at global scale', url: 'https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf', type: 'paper' },
    ],
  },
  {
    id: 'replication',
    title: 'Database Replication',
    category: 'Database Design',
    difficulty: 'Intermediate',
    estimatedTime: '25 min',
    tags: ['replication', 'primary-replica', 'failover', 'consistency'],
    summary: 'Copying data from a primary node to one or more replica nodes for redundancy, read scaling, and high availability.',
    theory: [
      'Database replication maintains copies of data on multiple nodes. A primary (leader) node accepts all writes; replica (follower) nodes receive changes from the primary and serve read queries. This separates the write bottleneck from read scaling — you can add replicas cheaply to handle read load without touching the primary. Most relational databases (PostgreSQL, MySQL) and NoSQL systems (MongoDB, Redis) support primary-replica replication natively.',
      'Replication modes differ in how the primary confirms a write. Synchronous replication waits for at least one replica to acknowledge before confirming to the client — zero data loss but higher write latency. Asynchronous replication confirms to the client immediately and propagates to replicas in the background — lowest latency but a brief window where replica data lags behind. Semi-synchronous requires at least one replica to acknowledge but lets others catch up asynchronously, balancing safety and performance.',
      'When the primary fails, a failover process promotes a replica to primary. Automated failover tools (Patroni for PostgreSQL, MHA for MySQL, Redis Sentinel) monitor node health and orchestrate promotion. The key risk is "split-brain": two nodes both believe they are the primary. Fencing mechanisms (STONITH — Shoot The Other Node In The Head) forcibly kill the old primary before promotion to prevent split-brain. Replication lag is the Achilles\' heel of async replication — reads from lagging replicas may return stale data.',
    ],
    hasDemo: true,
    demoType: 'replication',
    references: [
      { title: 'Designing Data-Intensive Applications: Replication (Kleppmann)', url: 'https://dataintensive.net/', type: 'blog' },
      { title: 'PostgreSQL Streaming Replication', url: 'https://www.postgresql.org/docs/current/warm-standby.html', type: 'docs' },
    ],
  },
  {
    id: 'cqrs',
    title: 'CQRS Pattern',
    category: 'Architecture Patterns',
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    tags: ['cqrs', 'commands', 'queries', 'read-write-separation', 'microservices'],
    summary: 'Command Query Responsibility Segregation separates the write model (commands) from the read model (queries), allowing each to be independently scaled and optimized.',
    theory: [
      'CQRS (Command Query Responsibility Segregation) extends CQS (Command Query Separation) from the method level to the service level. Commands (writes) go to one model backed by a normalized write store, while queries (reads) go to a separate model backed by denormalized read stores optimized for each query. This removes the tension in traditional CRUD APIs where a single data model must serve both write validation logic and complex read projections.',
      'In a CQRS system, write commands are handled by a command handler that applies business rules and emits domain events. These events flow through an event bus to read-side projections that maintain denormalized views. For example, a UserUpdated event might update three separate read models: the user profile view, the activity feed, and the search index. Each is optimized for its specific access pattern, using whatever store fits best (PostgreSQL, Elasticsearch, Redis).',
      'The main tradeoff is eventual consistency — queries might return slightly stale data while projections catch up. CQRS pairs naturally with Event Sourcing (the write side stores events instead of current state) but doesn\'t require it. The pattern shines when read and write workloads are dramatically different in scale or structure. It adds significant complexity — two separate models, eventual consistency, and projection management — so it\'s generally inappropriate for simple CRUD applications.',
    ],
    hasDemo: true,
    demoType: 'cqrs',
    references: [
      { title: 'Martin Fowler: CQRS', url: 'https://martinfowler.com/bliki/CQRS.html', type: 'blog' },
      { title: 'Microsoft CQRS Pattern Docs', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs', type: 'docs' },
    ],
  },
];

export const CONCEPT_CATEGORIES = [...new Set(CONCEPTS.map(c => c.category))];
