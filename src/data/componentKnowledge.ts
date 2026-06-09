export interface Algorithm {
  name: string;
  desc: string;
}

export interface Tradeoffs {
  pros: string[];
  cons: string[];
}

export interface Estimations {
  throughput: string;
  latency: string;
  cost: string;
}

export interface ComponentInfo {
  name: string;
  icon: string;
  oneLiner: string;
  whatItDoes: string;
  whenToUse: string[];
  algorithms?: Algorithm[];
  realWorldExamples: string[];
  tradeoffs: Tradeoffs;
  commonMistakes: string[];
  estimations: Estimations;
}

export const componentKnowledge: Record<string, ComponentInfo> = {
  'load-balancer': {
    name: 'Load Balancer',
    icon: '⚖️',
    oneLiner: 'Distributes incoming traffic across multiple servers',
    whatItDoes: `A Load Balancer sits between clients and servers, distributing incoming requests across multiple backend instances. This ensures no single server gets overwhelmed, improves availability, and enables horizontal scaling. Layer-4 LBs route at the TCP level (fast, no HTTP awareness), while Layer-7 LBs inspect HTTP headers and can route by path, host, or cookie.`,
    whenToUse: [
      'When you have multiple instances of the same service',
      'When you need zero-downtime deployments (rolling updates)',
      'When you need health checking — automatically routes away from failed instances',
      'When traffic patterns are unpredictable or spiky',
      'When you need SSL termination in one place',
    ],
    algorithms: [
      { name: 'Round Robin', desc: 'Requests distributed equally in sequence. Simple, works well when servers are identical.' },
      { name: 'Least Connections', desc: 'Sends to server with fewest active connections. Best for long-lived connections like WebSockets.' },
      { name: 'IP Hash', desc: 'Same client always hits same server. Required for stateful apps without shared sessions.' },
      { name: 'Weighted Round Robin', desc: 'Servers with more capacity get proportionally more requests. Good for heterogeneous clusters.' },
      { name: 'Random with Two Choices', desc: 'Pick 2 random servers, route to the less loaded one. Better than pure random, nearly as good as least-connections.' },
    ],
    realWorldExamples: [
      'Netflix uses AWS ALB to distribute streaming requests across thousands of instances',
      'GitHub uses HAProxy to route git operations with least-connections algorithm',
      'Cloudflare acts as a global L7 load balancer for millions of websites',
      'Google uses Maglev — a consistent-hashing software LB handling billions of packets/sec',
    ],
    tradeoffs: {
      pros: [
        'Eliminates single point of failure for compute layer',
        'Enables horizontal scaling — add more servers without changing clients',
        'Health checking built-in — dead instances stop receiving traffic',
        'SSL termination reduces CPU load on backend servers',
      ],
      cons: [
        'Added network hop (1–3ms latency)',
        'Can become bottleneck itself if not scaled or clustered',
        'Stateful apps need sticky sessions or shared state store',
        'More infrastructure to manage and monitor',
      ],
    },
    commonMistakes: [
      'Connecting Load Balancer directly to Database — LBs route to compute only, not data stores',
      'Using only 1 Load Balancer — it becomes a single point of failure itself',
      'Not configuring health checks — dead instances still receive traffic for minutes',
      'Using sticky sessions as a substitute for proper session storage (Redis)',
    ],
    estimations: {
      throughput: 'AWS ALB: 1M+ RPS, HAProxy: 500K+ RPS, Nginx: 100K+ RPS',
      latency: 'Adds ~1–3ms per hop',
      cost: 'AWS ALB: ~$20/month base + $0.008 per LCU',
    },
  },

  'redis': {
    name: 'Redis Cache',
    icon: '⚡',
    oneLiner: 'In-memory data store for sub-millisecond read/write operations',
    whatItDoes: `Redis is an in-memory key-value store that operates at microsecond latency. It dramatically reduces database load by caching frequently accessed data in RAM. A single Redis instance can handle 100,000+ operations per second. Beyond simple caching, Redis supports rich data structures: sorted sets (leaderboards), streams (event logs), pub/sub (messaging), Lua scripting, and distributed locks via SETNX.`,
    whenToUse: [
      'Caching database query results (cache-aside pattern)',
      'Session storage for stateless services',
      'Rate limiting counters (atomic INCR + EXPIRE)',
      'Pub/Sub messaging between services',
      'Leaderboards and sorted sets (gaming, trending feeds)',
      'Distributed locks across multiple service instances',
      'Real-time counters and analytics',
    ],
    algorithms: [
      { name: 'LRU Eviction', desc: 'Removes Least Recently Used keys when memory is full. Best for general cache use cases.' },
      { name: 'LFU Eviction', desc: 'Removes Least Frequently Used. Better for skewed access patterns (hot keys).' },
      { name: 'TTL Expiry', desc: 'Keys auto-delete after N seconds. Essential for session tokens and rate limit windows.' },
      { name: 'Cache-Aside', desc: 'App checks Redis first; on miss, reads DB and writes to Redis. Most common pattern.' },
      { name: 'Write-Through', desc: 'Write to Redis and DB simultaneously. Ensures cache always has latest data.' },
    ],
    realWorldExamples: [
      'Twitter uses Redis Sorted Sets to store per-user timelines — precomputed feeds for O(log N) reads',
      'GitHub uses Redis for caching repository metadata and API rate limiting',
      'Uber uses Redis Sorted Sets for geospatial driver location indexing (Geo commands)',
      'Stack Overflow caches its entire hot question set in Redis — 95%+ of reads never hit SQL Server',
    ],
    tradeoffs: {
      pros: [
        'Sub-millisecond latency — typically <1ms reads and writes',
        '100K–1M+ ops/sec on a single node',
        'Rich data structures: lists, sets, hashes, sorted sets, streams',
        'Pub/Sub and Streams for lightweight messaging',
        'Lua scripting for atomic multi-step operations',
      ],
      cons: [
        'Data lives in RAM — expensive at large scale ($$$)',
        'Persistence is secondary (RDB snapshots or AOF logs can lose data)',
        'Single-threaded command processing (one operation at a time)',
        'No complex queries — only key lookups and data structure operations',
        'Cluster mode adds complexity for horizontal scaling',
      ],
    },
    commonMistakes: [
      'Using Redis as primary database — it is a cache; data can be lost on restart without AOF persistence',
      'Not setting TTL on keys — memory fills up, Redis starts evicting important data',
      'Storing huge values (>100KB) — kills throughput and memory efficiency',
      'Not using connection pooling — too many connections overwhelm Redis (max is ~10K)',
      'Forgetting cache invalidation — stale data served after source DB changes',
    ],
    estimations: {
      throughput: '100,000–1,000,000 ops/sec depending on operation type and payload size',
      latency: '<1ms reads, <1ms writes (same datacenter)',
      cost: 'AWS ElastiCache Redis: ~$15/month for cache.t3.micro, ~$120/month for cache.r6g.large',
    },
  },

  'kafka': {
    name: 'Apache Kafka',
    icon: '📨',
    oneLiner: 'Distributed event streaming platform for high-throughput async messaging',
    whatItDoes: `Kafka is a distributed commit log that enables services to communicate asynchronously via events. Producers write events to topics, consumers read at their own pace. Kafka retains messages for days or weeks (not just until consumed), enabling replay and multiple independent consumer groups reading the same stream. Topics are split into partitions for parallelism — each partition is an ordered, immutable log.`,
    whenToUse: [
      'Decoupling microservices that produce and consume events',
      'High-throughput data ingestion (logs, metrics, clickstreams, IoT)',
      'Event sourcing — rebuilding state from event history',
      'Stream processing pipelines (with Kafka Streams or Flink)',
      'When multiple independent services need to react to the same event',
      'When consumers process at different speeds than producers',
      'Fan-out to multiple downstream systems from one event source',
    ],
    algorithms: [
      { name: 'Partition by Key', desc: 'Same key always goes to same partition. Guarantees ordering per entity (e.g., per user ID).' },
      { name: 'Round-Robin Partition', desc: 'Distributes messages evenly across partitions. Best throughput when ordering not required.' },
      { name: 'Consumer Group Rebalance', desc: 'When a consumer joins/leaves, partitions are reassigned. Enables horizontal consumer scaling.' },
      { name: 'Log Compaction', desc: 'Retains only the latest value per key. Useful for maintaining current state without infinite growth.' },
    ],
    realWorldExamples: [
      'Uber ingests 1 trillion+ events/day through Kafka for driver location updates and trip events',
      'Netflix uses Kafka for real-time monitoring and the data pipeline feeding recommendations',
      'LinkedIn (Kafka was built here) processes 7 trillion messages/day across 1,000+ brokers',
      'Airbnb uses Kafka as the backbone for all data pipelines and service-to-service events',
    ],
    tradeoffs: {
      pros: [
        'Extremely high throughput — millions of messages per second per broker',
        'Message retention enables replay and multiple independent consumers',
        'Horizontal scaling via partitions — add partitions for more parallelism',
        'Guaranteed ordering within a partition',
        'At-least-once or exactly-once delivery semantics',
      ],
      cons: [
        'Operational complexity (KRaft or ZooKeeper, replication factor, ISR)',
        'Not designed for sub-10ms latency — end-to-end is typically 5–20ms',
        'No per-message TTL — only topic-level retention by time or size',
        'Ordering only guaranteed within a partition, not across partitions',
        'Schema evolution requires careful management (Confluent Schema Registry)',
      ],
    },
    commonMistakes: [
      'Connecting Kafka directly to a Database — always have a consumer service between them',
      'Using 1 partition — no parallelism, all messages processed sequentially',
      'Not setting retention policy — disk fills up and brokers crash',
      'Using Kafka for RPC / request-response — use HTTP/gRPC for synchronous calls',
      'Not monitoring consumer lag — consumers falling behind means events are piling up',
    ],
    estimations: {
      throughput: '1–10 million messages/second per broker (depends on message size)',
      latency: '5–20ms end-to-end (not for <5ms use cases)',
      cost: 'AWS MSK: ~$200/month for 3-broker cluster (kafka.m5.large)',
    },
  },

  'api-gateway': {
    name: 'API Gateway',
    icon: '🚪',
    oneLiner: 'Single entry point for all client requests — handles routing, auth, rate limiting',
    whatItDoes: `An API Gateway is the front door to your microservices. Instead of clients knowing about 20 different microservice URLs, they send all requests to the gateway which handles routing, authentication, rate limiting, request/response transformation, and SSL termination. Modern gateways can also do protocol translation (REST to gRPC), circuit breaking, and canary routing.`,
    whenToUse: [
      'Microservices architecture — hide internal service topology from clients',
      'Centralized authentication and authorization (JWT validation, OAuth)',
      'Rate limiting and throttling per client or API key',
      'Request/response transformation (REST to gRPC, field masking)',
      'A/B testing and canary deployments via traffic splitting',
      'Aggregating multiple service responses into one client response (BFF pattern)',
    ],
    realWorldExamples: [
      'Netflix Zuul/API Gateway routes all client requests to 700+ microservices',
      'Amazon API Gateway handles millions of requests/second for AWS serverless apps',
      'Shopify uses a GraphQL gateway to federate data from multiple backend services',
      'Stripe uses an API gateway to enforce rate limits across 5,000+ API key holders',
    ],
    tradeoffs: {
      pros: [
        'Single entry point simplifies client code — no service discovery needed',
        'Centralized cross-cutting concerns: auth, logging, rate limiting, tracing',
        'Can cache responses and reduce downstream service load',
        'SSL termination in one place',
      ],
      cons: [
        'Single point of failure if not clustered',
        'Added latency hop (10–50ms depending on features enabled)',
        'Can become a bottleneck at very high scale',
        'Operational overhead — another system to deploy and monitor',
      ],
    },
    commonMistakes: [
      'Putting business logic in the Gateway — it should only route, auth, and rate-limit',
      'Running a single instance — no redundancy, becomes a single point of failure',
      'Not caching — repeated identical requests hit downstream services unnecessarily',
      'Connecting API Gateway directly to Database — it should only route to compute services',
    ],
    estimations: {
      throughput: 'AWS API Gateway: 10,000 RPS default (can increase), Kong: 100K+ RPS',
      latency: 'Adds 10–50ms depending on auth + features enabled',
      cost: 'AWS API Gateway: $3.50 per million requests + $0.09/GB data transfer',
    },
  },

  'postgres': {
    name: 'PostgreSQL Database',
    icon: '🗄️',
    oneLiner: 'ACID-compliant relational database for structured data with complex queries',
    whatItDoes: `PostgreSQL is a powerful open-source relational database supporting complex SQL queries, ACID transactions, JSON (hybrid NoSQL), full-text search, and advanced indexing (B-tree, Hash, GIN, GiST, BRIN). It is the default choice for applications requiring strong data consistency and complex relational queries. Supports row-level locking, window functions, CTEs, and stored procedures.`,
    whenToUse: [
      'Financial transactions requiring ACID guarantees',
      'Complex relational data with JOINs across multiple tables',
      'When you need strong consistency over availability (CP in CAP theorem)',
      'Applications with complex reporting and analytics queries',
      'When data schema is well-defined and relatively stable',
    ],
    algorithms: [
      { name: 'B-tree Index', desc: 'Default index. Efficient for equality and range queries on sortable data.' },
      { name: 'Hash Index', desc: 'O(1) equality lookups only. Faster than B-tree for exact matches, useless for ranges.' },
      { name: 'GIN Index', desc: 'For composite values (arrays, JSONB, full-text). Handles "contains" queries efficiently.' },
      { name: 'BRIN Index', desc: 'Tiny index for naturally ordered data (timestamps, sequential IDs). Excellent for time-series tables.' },
      { name: 'MVCC', desc: 'Multi-Version Concurrency Control — readers never block writers. Each transaction sees a consistent snapshot.' },
    ],
    realWorldExamples: [
      'Instagram uses PostgreSQL for all user data, posts, and the social graph (follows)',
      'Notion uses PostgreSQL as their primary database for all workspace data',
      'GitLab uses PostgreSQL for all repository metadata, issues, and merge requests',
      'Cloudflare uses PostgreSQL for DNS data serving billions of queries/day',
    ],
    tradeoffs: {
      pros: [
        'ACID transactions with full isolation level control',
        'Complex SQL queries with JOINs, CTEs, window functions',
        'Mature ecosystem — 30+ years of production use',
        'JSONB support enables hybrid relational/document model',
        'Strong consistency — no eventual consistency surprises',
      ],
      cons: [
        'Primarily vertical scaling — sharding is complex (Citus, partitioning)',
        'Schema migrations on large tables require careful online-migration tooling',
        'Not ideal for truly unstructured or schema-free data',
        'Write throughput tops out around 10–50K writes/sec on single node',
      ],
    },
    commonMistakes: [
      'No indexes on frequently queried columns — full table scans kill performance at scale',
      'No read replicas for read-heavy workloads — primary gets overwhelmed',
      'Storing large binary files (BLOBs) in the database — use S3, store only the URL',
      'N+1 query problem — use JOINs or eager loading, not one query per row',
      'Not using connection pooling (PgBouncer) — PostgreSQL has a hard limit on connections',
    ],
    estimations: {
      throughput: '10,000–50,000 queries/sec on a well-tuned instance with good indexes',
      latency: '1–10ms for indexed queries, 100ms–seconds for full table scans',
      cost: 'AWS RDS PostgreSQL: ~$100/month for db.t3.medium, ~$400/month for db.r6g.large',
    },
  },

  'mongodb': {
    name: 'MongoDB',
    icon: '🍃',
    oneLiner: 'Document database for flexible, schema-free JSON data at scale',
    whatItDoes: `MongoDB stores data as BSON documents (binary JSON), making it natural for applications working with object-oriented data. No rigid schema — documents in the same collection can have different fields. Supports sharding natively for horizontal scaling, aggregation pipelines for analytics, and change streams for real-time data.`,
    whenToUse: [
      'Rapidly evolving schemas where structure changes frequently',
      'Hierarchical or nested data that maps naturally to documents',
      'Content management systems, catalogs, or user profiles',
      'When horizontal write scaling is a primary requirement',
      'Aggregation-heavy analytics on document data',
    ],
    realWorldExamples: [
      'LinkedIn uses MongoDB for its activity streams and member profile data',
      'Uber used MongoDB for its driver and trip data in early scaling phases',
      'The New York Times uses MongoDB as the primary backend for articles and content',
    ],
    tradeoffs: {
      pros: [
        'Flexible schema — no migrations needed for adding fields',
        'Native horizontal scaling with sharding',
        'Document model eliminates many JOINs',
        'Rich aggregation pipeline for analytics',
      ],
      cons: [
        'No multi-document ACID transactions (added in v4.0 but with overhead)',
        'No JOINs — data duplication required for relational patterns',
        'Memory-mapped storage means RAM size constrains working set',
        'Eventual consistency by default in sharded setups',
      ],
    },
    commonMistakes: [
      'Treating MongoDB as a relational DB — deeply nested documents kill query performance',
      'No indexes on query fields — full collection scans are extremely slow at scale',
      'Unbounded arrays inside documents — documents can grow to 16MB limit',
      'Using MongoDB for financial data requiring strict ACID guarantees',
    ],
    estimations: {
      throughput: '20,000–100,000 ops/sec on a replica set (depends on write concern)',
      latency: '2–15ms for indexed reads, varies by document size',
      cost: 'MongoDB Atlas M30: ~$200/month, M60: ~$700/month',
    },
  },

  'cdn': {
    name: 'Content Delivery Network',
    icon: '🌐',
    oneLiner: 'Globally distributed cache that serves static assets from edge servers near users',
    whatItDoes: `A CDN replicates your static assets (images, JS, CSS, videos) to hundreds of edge locations worldwide. When a user requests a file, it's served from the nearest edge — reducing latency from 200ms (cross-continent) to <5ms (local edge). CDNs also protect origin servers by absorbing the majority of traffic and provide DDoS mitigation at the edge.`,
    whenToUse: [
      'Serving static assets (images, CSS, JS bundles, fonts)',
      'Streaming video content globally',
      'Reducing origin server load by caching at the edge',
      'DDoS mitigation — absorb attack traffic before it hits origin',
      'When users are geographically distributed across multiple regions',
    ],
    realWorldExamples: [
      'Netflix uses a multi-CDN strategy (their own Open Connect + Akamai + Cloudflare) to serve 250M+ users',
      'Cloudflare serves 25+ million HTTP requests/sec globally across 275+ cities',
      'GitHub uses Fastly CDN for serving git LFS objects and release assets',
    ],
    tradeoffs: {
      pros: [
        'Dramatically reduces latency for static assets (<5ms vs 200ms+)',
        'Offloads 90%+ of static traffic from origin servers',
        'Built-in DDoS protection and WAF capabilities',
        'Global availability even during regional outages',
      ],
      cons: [
        'Cache invalidation complexity — stale content can be served for minutes/hours',
        'Dynamic content cannot be cached (personalized responses)',
        'Additional cost per GB of data transfer',
        'Cache cold-start problem for long-tail URLs',
      ],
    },
    commonMistakes: [
      'Not setting proper Cache-Control headers — CDN uses defaults, often too short or too long',
      'Using CDN for dynamic, personalized API responses — they cannot be cached by key alone',
      'Long TTLs on HTML files — users get stale app versions after deploys',
      'Single CDN provider — multi-CDN provides resilience when one provider has an outage',
    ],
    estimations: {
      throughput: 'Cloudflare: 100Tbps+ network capacity, Akamai: 1.3 petabits/sec globally',
      latency: '<5ms from edge to user (typical), 50–200ms origin pull on cache miss',
      cost: 'AWS CloudFront: $0.0085/GB data transfer (first 10TB/month), ~$5/month minimum',
    },
  },

  'waf': {
    name: 'Web Application Firewall',
    icon: '🛡️',
    oneLiner: 'Filters malicious HTTP traffic before it reaches your application',
    whatItDoes: `A WAF inspects all incoming HTTP/HTTPS traffic and blocks requests matching known attack patterns: SQL injection, XSS, CSRF, path traversal, and OWASP Top 10 vulnerabilities. Modern WAFs use rule sets (OWASP ModSecurity Core Rule Set), bot detection, IP reputation lists, and machine learning to distinguish legitimate traffic from attacks.`,
    whenToUse: [
      'Any internet-facing application that accepts user input',
      'Applications handling sensitive data (financial, healthcare, PII)',
      'When you need DDoS protection at the application layer (L7)',
      'Compliance requirements (PCI DSS requires WAF for cardholder data)',
      'Protecting APIs from scrapers and credential stuffing attacks',
    ],
    realWorldExamples: [
      'AWS WAF protects millions of applications via CloudFront and ALB integrations',
      'Cloudflare WAF blocks 76 billion cyber threats per day across its network',
      'Akamai Kona Site Defender protected against the largest recorded DDoS (3.8Tbps in 2024)',
    ],
    tradeoffs: {
      pros: [
        'Blocks common attacks without application code changes',
        'Centralized security policy across all services',
        'Low false negative rate for known attack signatures',
        'Rate limiting and bot mitigation built-in',
      ],
      cons: [
        'False positives can block legitimate traffic (tuning required)',
        'Cannot stop zero-day attacks not in rule sets',
        'Adds 1–10ms latency per request',
        'Rule maintenance requires security expertise',
      ],
    },
    commonMistakes: [
      'Deploying WAF in monitor-only mode indefinitely — it provides no protection until rules are in blocking mode',
      'Not regularly updating rule sets — new attack patterns emerge constantly',
      'Trusting WAF as the only security layer — defense in depth is essential',
      'Blocking mode with no alerting — attacks are blocked but nobody is notified',
    ],
    estimations: {
      throughput: 'AWS WAF: 100M requests/month base, scales to billions',
      latency: '1–10ms added per request',
      cost: 'AWS WAF: $5/month per web ACL + $1 per million requests',
    },
  },

  'microservice': {
    name: 'Microservice',
    icon: '⚙️',
    oneLiner: 'Small, independently deployable service owning a single business domain',
    whatItDoes: `A microservice is a small, focused service that owns a single business capability end-to-end — its own code, deployment pipeline, and database. Services communicate via HTTP/REST, gRPC, or async messaging (Kafka). The key principle is that each service can be deployed, scaled, and failed independently without affecting others.`,
    whenToUse: [
      'Large teams that need to deploy independently without coordinating',
      'Services with wildly different scaling needs (some need 100x more than others)',
      'When different parts of the system need different technology stacks',
      'Organizations practicing DevOps with CI/CD per service',
    ],
    realWorldExamples: [
      'Netflix has 700+ microservices — recommendations, streaming, billing, search are all separate',
      'Amazon reportedly has thousands of microservices making up their e-commerce platform',
      'Uber splits into ~2000+ microservices across their platform',
    ],
    tradeoffs: {
      pros: [
        'Independent deployability — ship faster without coordination',
        'Scale individual services based on their specific load',
        'Technology heterogeneity — each team picks the right tool',
        'Fault isolation — one service crashing does not take down others',
      ],
      cons: [
        'Distributed systems complexity: network failures, partial failures, latency',
        'Harder debugging: traces span multiple services and logs',
        'Data consistency is difficult — no ACID across service boundaries',
        'Operational overhead: N services to deploy, monitor, and manage',
      ],
    },
    commonMistakes: [
      'Starting with microservices on a greenfield project — monolith first, split when boundaries are clear',
      'Services sharing a database — destroys independent deployability',
      'Chatty services with too many synchronous calls — creates cascading failures',
      'Not implementing circuit breakers — one slow service can back-pressure the entire system',
    ],
    estimations: {
      throughput: 'Varies widely: 1K–50K RPS per instance depending on workload',
      latency: '5–50ms for a typical business logic service',
      cost: 'AWS ECS t3.small: ~$15/month, EKS pod: varies by instance type',
    },
  },

  'kubernetes': {
    name: 'Kubernetes',
    icon: '☸️',
    oneLiner: 'Container orchestration platform for deploying and scaling containerized workloads',
    whatItDoes: `Kubernetes (K8s) automates the deployment, scaling, and management of containerized applications. It schedules containers across a cluster of machines, handles service discovery, load balancing between pods, rolling updates, self-healing (restarting failed containers), and horizontal autoscaling based on CPU/memory metrics or custom metrics.`,
    whenToUse: [
      'Running many containerized microservices that need automated management',
      'When you need autoscaling based on traffic or custom metrics',
      'Zero-downtime rolling deployments are required',
      'Multi-tenant environments where resource isolation matters',
      'When you need service mesh capabilities (Istio, Linkerd)',
    ],
    realWorldExamples: [
      'Google runs billions of containers per week using Borg (K8s predecessor) internally',
      'Spotify runs their entire audio streaming platform on GKE (Google Kubernetes Engine)',
      'Airbnb migrated from a monolith to 1,000+ microservices on Kubernetes',
    ],
    tradeoffs: {
      pros: [
        'Self-healing: automatically restarts failed containers',
        'Horizontal Pod Autoscaler scales based on metrics',
        'Rolling updates with zero downtime',
        'Declarative configuration (GitOps friendly)',
        'Huge ecosystem: Helm, operators, service meshes',
      ],
      cons: [
        'High operational complexity — steep learning curve',
        'Over-engineering for simple deployments (<5 services)',
        'Control plane overhead (master nodes cost money)',
        'Stateful workloads (databases) are tricky to manage well',
      ],
    },
    commonMistakes: [
      'Running databases inside Kubernetes — prefer managed services (RDS, ElastiCache)',
      'Not setting resource requests and limits — pods starve each other',
      'Ignoring Pod Disruption Budgets — rolling updates can take down all replicas',
      'No liveness and readiness probes — K8s cannot detect unhealthy pods',
    ],
    estimations: {
      throughput: 'A single node can run 110 pods; clusters scale to 5,000 nodes',
      latency: 'Pod-to-pod: <1ms (same node), 1–3ms (cross-node same region)',
      cost: 'AWS EKS: ~$144/month control plane + EC2 worker node costs',
    },
  },

  'prometheus': {
    name: 'Prometheus',
    icon: '📊',
    oneLiner: 'Time-series metrics collection and alerting for distributed systems',
    whatItDoes: `Prometheus scrapes metrics from instrumented services via HTTP at configurable intervals, stores them as time-series data with labels, and evaluates alerting rules. It uses a pull model — services expose a /metrics endpoint, Prometheus polls them. PromQL is a powerful query language for slicing, aggregating, and computing rates over metrics.`,
    whenToUse: [
      'Monitoring microservices and Kubernetes workloads',
      'When you need per-request latency histograms and percentiles (p50/p95/p99)',
      'Custom business metrics alongside infrastructure metrics',
      'Alerting based on metric thresholds with AlertManager',
      'Feeding dashboards in Grafana',
    ],
    realWorldExamples: [
      'SoundCloud built Prometheus internally and open-sourced it in 2012',
      'Kubernetes uses Prometheus as the default metrics backend (kube-state-metrics)',
      'GitLab monitors all their infrastructure with Prometheus + Grafana',
    ],
    tradeoffs: {
      pros: [
        'Pull model simplifies security — Prometheus initiates connections',
        'PromQL is extremely powerful for time-series math and aggregation',
        'Native Kubernetes service discovery',
        'Huge ecosystem of exporters (Node exporter, Postgres exporter, etc.)',
      ],
      cons: [
        'Local storage is not durable — data is lost if Prometheus restarts without remote storage',
        'Not designed for long-term storage (use Thanos or Cortex for that)',
        'Push model harder to achieve (use Pushgateway for batch jobs)',
        'High cardinality metrics (e.g., per-user labels) will crash Prometheus',
      ],
    },
    commonMistakes: [
      'High-cardinality labels (user_id, request_id) — causes memory explosion',
      'No remote storage configured — lose all historical data on restart',
      'Scrape interval too short (<10s) — Prometheus cannot keep up at scale',
      'Not setting retention period — disk fills up within days at high metric volume',
    ],
    estimations: {
      throughput: 'Handles millions of time series, ~1M samples/sec per instance',
      latency: '<10ms for PromQL queries on recent data (seconds for long range queries)',
      cost: 'Self-hosted on AWS EC2: ~$50/month for m5.large; Grafana Cloud free tier up to 10K series',
    },
  },

  'rabbitmq': {
    name: 'RabbitMQ',
    icon: '🐇',
    oneLiner: 'Message broker implementing AMQP for reliable point-to-point and pub/sub messaging',
    whatItDoes: `RabbitMQ implements the Advanced Message Queuing Protocol (AMQP). Messages are published to exchanges, which route to queues based on binding rules. Unlike Kafka, RabbitMQ deletes messages once consumed (not a log). It supports complex routing: direct (exact key), fanout (broadcast), topic (wildcard pattern), and headers-based routing.`,
    whenToUse: [
      'Task queues — distribute work across multiple worker processes',
      'Complex routing rules (per-message decisions, not topic-level)',
      'When messages must be acknowledged and retried on failure',
      'RPC-style async patterns (request/reply via temporary queues)',
      'Lower throughput but richer routing than Kafka',
    ],
    realWorldExamples: [
      'Instagram used RabbitMQ for async task processing (image resizing, notifications)',
      'Mozilla uses RabbitMQ for processing telemetry and crash reports',
      'Reddit uses RabbitMQ for job queuing (thumbnail generation, link metadata)',
    ],
    tradeoffs: {
      pros: [
        'Rich routing logic (direct, fanout, topic, headers exchanges)',
        'Message acknowledgment — reliable delivery with automatic retry',
        'Dead letter queues for failed message inspection',
        'Mature protocol (AMQP) with many client libraries',
      ],
      cons: [
        'Lower throughput than Kafka (~50K–100K msgs/sec vs millions)',
        'No built-in message replay — once consumed, messages are gone',
        'Memory pressure can cause broker to start throttling producers',
        'Clustering is complex, especially with network partitions',
      ],
    },
    commonMistakes: [
      'Not setting message TTL or queue max length — queues grow unbounded and crash the broker',
      'No dead letter queue — failed messages are silently dropped',
      'Consumers not acknowledging messages — unacked messages pile up',
      'Not using publisher confirms — producers think messages were delivered when they were not',
    ],
    estimations: {
      throughput: '50,000–100,000 messages/sec (vs. Kafka\'s millions) — right for most apps',
      latency: '1–10ms end-to-end',
      cost: 'AWS Amazon MQ (RabbitMQ) mq.m5.large: ~$100/month',
    },
  },

  'elastic': {
    name: 'Elasticsearch',
    icon: '🔍',
    oneLiner: 'Distributed search engine for full-text search, log analytics, and complex queries',
    whatItDoes: `Elasticsearch indexes documents as JSON and enables sub-second full-text search using inverted indexes, BM25 ranking, and fuzzy matching. It is also the backbone of the ELK Stack (Elasticsearch + Logstash + Kibana) for log aggregation and analytics. Distributed sharding allows horizontal scaling for petabyte-scale search.`,
    whenToUse: [
      'Full-text search with relevance ranking across large document sets',
      'Log aggregation and analysis (ELK Stack)',
      'Complex filtering with aggregations (faceted search)',
      'Autocomplete and fuzzy matching for search-as-you-type',
      'When your primary DB cannot support full-text search efficiently',
    ],
    realWorldExamples: [
      'GitHub uses Elasticsearch to index all code on github.com (billions of files)',
      'Netflix uses Elasticsearch to search across all their content metadata',
      'Wikipedia uses Elasticsearch for its search functionality',
    ],
    tradeoffs: {
      pros: [
        'Full-text search with relevance scoring out of the box',
        'Horizontal scaling via sharding',
        'Rich aggregations for analytics (histogram, terms, date range)',
        'Supports geospatial queries natively',
      ],
      cons: [
        'Not an ACID database — writes are eventually consistent (NRT: near-real-time)',
        'Resource intensive — requires lots of RAM for JVM heap and OS cache',
        'Schema mapping changes require full reindex',
        'Operational complexity increases with cluster size',
      ],
    },
    commonMistakes: [
      'Using Elasticsearch as primary database — it is a search index, not a source of truth',
      'Dynamic field mapping explosion — too many unique field names kills performance',
      'Not tuning shard count — too many small shards or too few large shards both cause problems',
      'Indexing without considering read patterns — wrong analyzer for the use case',
    ],
    estimations: {
      throughput: '10,000–100,000 search queries/sec across a cluster',
      latency: '10–100ms for typical search queries',
      cost: 'AWS OpenSearch (Elasticsearch): ~$150/month for r6g.large.search (2 nodes)',
    },
  },

  's3': {
    name: 'Object Storage (S3)',
    icon: '🗂️',
    oneLiner: 'Infinitely scalable blob storage for files, images, backups, and data lakes',
    whatItDoes: `Amazon S3 (and compatible services) provide object storage — storing arbitrary binary files by key in flat namespaces (buckets). There is no filesystem hierarchy (prefixes simulate directories). S3 offers 11 nines (99.999999999%) durability through automatic multi-AZ replication, versioning, and lifecycle policies for cost management.`,
    whenToUse: [
      'Storing user-uploaded files (images, videos, documents)',
      'Static website hosting (with CloudFront CDN in front)',
      'Database backups and snapshots',
      'Data lake for analytics workloads (Athena, Spark, Redshift Spectrum)',
      'Archiving cold data (S3 Glacier for pennies per GB/month)',
    ],
    realWorldExamples: [
      'Netflix stores all video assets and thumbnails in S3 — exabytes of data',
      'Airbnb stores all listing photos in S3 — billions of objects',
      'Pinterest serves billions of image requests/day via S3 + CloudFront',
    ],
    tradeoffs: {
      pros: [
        'Practically infinite storage — no capacity planning needed',
        '11 nines durability — more durable than on-premises storage',
        'Cheap ($0.023/GB/month vs $0.10+/GB for EBS)',
        'Native integration with every AWS service',
      ],
      cons: [
        'Eventual consistency for overwrites (now strongly consistent as of 2020)',
        'Not a filesystem — no rename, no partial writes, no locking',
        'GET/PUT operations have cost — high-frequency small file access adds up',
        'High latency for small files (50–100ms first byte) vs EBS (<1ms)',
      ],
    },
    commonMistakes: [
      'Storing S3 objects with public access enabled — data exposure is a top AWS security incident',
      'Not enabling versioning — deleted or overwritten objects are unrecoverable',
      'Not using lifecycle policies — cold data accumulates and costs grow',
      'Using S3 as a primary database for high-frequency reads — use EFS or a DB instead',
    ],
    estimations: {
      throughput: '3,500 PUT/COPY/POST/DELETE per second and 5,500 GET/HEAD per prefix',
      latency: '50–100ms first byte (GET), instantly consistent for new objects',
      cost: '$0.023/GB/month (standard), $0.004/GB/month (Glacier), $0.0004 per 1K GET requests',
    },
  },

  'dns': {
    name: 'DNS',
    icon: '🌍',
    oneLiner: 'Translates human-readable domain names into IP addresses',
    whatItDoes: `DNS (Domain Name System) is the internet's phone book. When a user types "myapp.com", DNS resolves it to an IP address (e.g., 52.84.3.195). It enables traffic routing strategies: round-robin for load balancing, geolocation routing (send EU users to EU servers), latency-based routing, and failover routing. TTL controls how long resolvers cache the answer.`,
    whenToUse: [
      'Every internet-facing service needs a DNS record',
      'Geographic routing — serve users from the nearest region',
      'Health-check based failover between regions',
      'Blue/green deployments via DNS cutover',
      'Traffic splitting with weighted records',
    ],
    realWorldExamples: [
      'AWS Route 53 handles DNS for millions of domains with latency-based routing',
      'Cloudflare operates the largest public DNS resolver (1.1.1.1) handling 1T+ queries/day',
      'Netflix uses DNS traffic management for multi-region failover',
    ],
    tradeoffs: {
      pros: [
        'Enables readable domain names for services',
        'Geographic and latency-based routing built into DNS (Route 53, Cloudflare)',
        'Health-check failover between regions in <60 seconds',
        'No code changes needed for traffic routing updates',
      ],
      cons: [
        'DNS propagation delay — TTL means changes take minutes to hours to propagate globally',
        'Clients cache DNS — even low TTLs are cached by OS resolvers',
        'DNS resolution adds latency to cold connections (typically 50–300ms on first lookup)',
        'DNS hijacking is a real attack vector — DNSSEC adoption helps',
      ],
    },
    commonMistakes: [
      'Long TTLs (86400s = 1 day) make traffic shifts during incidents extremely slow',
      'Not using DNSSEC — DNS spoofing attacks redirect users to malicious servers',
      'Single DNS provider — if your DNS provider has an outage, your entire site is unreachable',
      'Hard-coding IP addresses instead of hostnames — breaks when IPs change',
    ],
    estimations: {
      throughput: 'AWS Route 53: handles billions of queries/month, Cloudflare: 1T+ queries/day',
      latency: '1–50ms DNS resolution (cached), 50–300ms on uncached lookup',
      cost: 'AWS Route 53: $0.50/month per hosted zone + $0.40 per million queries',
    },
  },

  'firewall': {
    name: 'Firewall',
    icon: '🔥',
    oneLiner: 'Network-level traffic filter that enforces access control rules between network segments',
    whatItDoes: `A firewall inspects network packets and enforces rules determining which traffic is allowed or blocked based on source IP, destination IP, port, and protocol. Network firewalls operate at L3/L4 (IP and TCP/UDP). Next-Generation Firewalls (NGFW) add L7 inspection: application identification, SSL decryption, and IDS/IPS capabilities.`,
    whenToUse: [
      'Segmenting internal networks (DMZ, private subnets, database tier)',
      'Blocking unauthorized inbound traffic from the internet',
      'Enforcing egress filtering (prevent data exfiltration)',
      'Compliance requirements (PCI DSS, HIPAA mandate network segmentation)',
      'Isolating database tier from direct internet access',
    ],
    realWorldExamples: [
      'AWS Security Groups act as stateful firewalls for EC2, RDS, and Lambda',
      'Palo Alto Networks NGFW protects Fortune 500 networks from advanced threats',
      'Google uses a distributed firewall approach (BeyondCorp) based on identity, not network position',
    ],
    tradeoffs: {
      pros: [
        'Prevents unauthorized access to internal services',
        'Stateful inspection tracks connection state — no need to allow return traffic explicitly',
        'Network segmentation limits blast radius of a breach',
        'Egress filtering prevents malware command-and-control callbacks',
      ],
      cons: [
        'Does not protect against application-layer attacks (use WAF for that)',
        'SSL/TLS traffic is opaque to L4 firewalls',
        'Complex rule sets become unmanageable over time',
        'Legitimate traffic can be blocked by overly strict rules',
      ],
    },
    commonMistakes: [
      'Allowing inbound 0.0.0.0/0 on port 22 (SSH) — use VPN or bastion host instead',
      'No egress filtering — compromised servers can freely communicate with attackers',
      'Firewall rules based on mutable IPs instead of security groups/tags',
      'Not reviewing and auditing rules — stale rules accumulate over years',
    ],
    estimations: {
      throughput: 'AWS Security Groups: no hard throughput limit (enforced in hypervisor)',
      latency: 'Stateful firewall: <1ms added latency for intra-VPC traffic',
      cost: 'AWS Network Firewall: $0.395/hour per endpoint + $0.065 per GB processed',
    },
  },
};
