export type RefType = 'docs' | 'paper' | 'book' | 'video' | 'article' | 'course';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Reference {
  type: RefType;
  title: string;
  url: string;
  author?: string;
  duration?: string;
  difficulty: Difficulty;
  free: boolean;
}

export const COMPONENT_REFERENCES: Record<string, Reference[]> = {
  'load-balancer': [
    { type: 'docs',    title: 'AWS Elastic Load Balancing Documentation',                          url: 'https://docs.aws.amazon.com/elasticloadbalancing/',                                                      difficulty: 'beginner',      free: true  },
    { type: 'paper',   title: 'Maglev: A Fast and Reliable Software Network Load Balancer (Google)', url: 'https://research.google/pubs/maglev-a-fast-and-reliable-software-network-load-balancer/', author: 'Google Research',    difficulty: 'advanced',      free: true  },
    { type: 'video',   title: 'Load Balancing — System Design Interview',                           url: 'https://www.youtube.com/watch?v=K0Ta65OqQkY',                                                          author: 'Gaurav Sen',         duration: '15 min', difficulty: 'beginner', free: true },
    { type: 'article', title: 'Load Balancing Algorithms Explained',                               url: 'https://www.nginx.com/resources/glossary/load-balancing/',                                              author: 'NGINX',              difficulty: 'intermediate',  free: true  },
  ],
  'redis': [
    { type: 'docs',    title: 'Redis Official Documentation',                                      url: 'https://redis.io/docs/',                                                                                 difficulty: 'beginner',      free: true  },
    { type: 'video',   title: 'Redis Crash Course',                                                url: 'https://www.youtube.com/watch?v=jgpVdJB2sKQ',                                                          author: 'Traversy Media',     duration: '40 min', difficulty: 'beginner', free: true },
    { type: 'article', title: 'How Twitter Uses Redis at Scale',                                   url: 'https://blog.twitter.com/engineering/en_us/topics/infrastructure/2017/the-infrastructure-behind-twitter-scale', author: 'Twitter Engineering', difficulty: 'intermediate', free: true },
    { type: 'paper',   title: 'Redis: In-Memory Data Structure Store — Architecture',              url: 'https://redis.io/papers/',                                                                               difficulty: 'intermediate',  free: true  },
  ],
  'kafka': [
    { type: 'docs',    title: 'Apache Kafka Documentation',                                        url: 'https://kafka.apache.org/documentation/',                                                               difficulty: 'intermediate',  free: true  },
    { type: 'paper',   title: 'Kafka: a Distributed Messaging System for Log Processing (LinkedIn)', url: 'https://notes.stephenholiday.com/Kafka.pdf',                                                         author: 'LinkedIn Engineering', difficulty: 'advanced',    free: true  },
    { type: 'video',   title: 'Apache Kafka in 6 Minutes',                                         url: 'https://www.youtube.com/watch?v=Ch5VhJzaoaI',                                                          duration: '6 min',            difficulty: 'beginner',    free: true  },
    { type: 'book',    title: 'Kafka: The Definitive Guide',                                       url: 'https://www.oreilly.com/library/view/kafka-the-definitive/9781491936153/',                              author: 'Neha Narkhede, Gwen Shapira', difficulty: 'advanced', free: false },
  ],
  'postgres': [
    { type: 'docs',    title: 'PostgreSQL Official Documentation',                                 url: 'https://www.postgresql.org/docs/',                                                                       difficulty: 'beginner',      free: true  },
    { type: 'article', title: 'Sharding & IDs at Instagram',                                       url: 'https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c',                              author: 'Instagram Engineering', difficulty: 'advanced',  free: true  },
    { type: 'video',   title: 'PostgreSQL vs MySQL — Which to Choose?',                            url: 'https://www.youtube.com/watch?v=btjBNKP49Rk',                                                          duration: '12 min',           difficulty: 'beginner',    free: true  },
    { type: 'article', title: 'Use the Index, Luke — SQL Indexing Guide',                          url: 'https://use-the-index-luke.com/',                                                                        author: 'Markus Winand',      difficulty: 'intermediate', free: true },
  ],
  'mongodb': [
    { type: 'docs',    title: 'MongoDB Official Documentation',                                    url: 'https://www.mongodb.com/docs/',                                                                          difficulty: 'beginner',      free: true  },
    { type: 'paper',   title: 'MongoDB Schema Design Patterns',                                    url: 'https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/',              author: 'MongoDB',            difficulty: 'intermediate', free: true  },
    { type: 'video',   title: 'MongoDB in 100 Seconds',                                            url: 'https://www.youtube.com/watch?v=-bt_y4Loofg',                                                          author: 'Fireship',           duration: '2 min', difficulty: 'beginner', free: true },
  ],
  'kubernetes': [
    { type: 'docs',    title: 'Kubernetes Official Documentation',                                 url: 'https://kubernetes.io/docs/',                                                                            difficulty: 'intermediate',  free: true  },
    { type: 'course',  title: 'Kubernetes for Absolute Beginners',                                 url: 'https://www.udemy.com/course/learn-kubernetes/',                                                        author: 'KodeKloud',          difficulty: 'beginner',    free: false },
    { type: 'video',   title: 'Kubernetes Explained in 100 Seconds',                               url: 'https://www.youtube.com/watch?v=PziYflu8cB8',                                                          author: 'Fireship',           duration: '2 min', difficulty: 'beginner', free: true },
    { type: 'article', title: 'Production-Grade Container Orchestration',                          url: 'https://kubernetes.io/case-studies/',                                                                    difficulty: 'intermediate',  free: true  },
  ],
  'elastic': [
    { type: 'docs',    title: 'Elasticsearch Reference Documentation',                             url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/',                                      difficulty: 'beginner',      free: true  },
    { type: 'video',   title: 'Elasticsearch Tutorial for Beginners',                              url: 'https://www.youtube.com/watch?v=C3tlMqaNSaI',                                                          author: 'Academind',          duration: '30 min', difficulty: 'beginner', free: true },
    { type: 'article', title: 'How Uber Uses Elasticsearch for Search',                            url: 'https://www.elastic.co/blog/uber-elasticsearch-new-search-platform',                                    author: 'Elastic Blog',       difficulty: 'intermediate', free: true },
  ],
  'nginx': [
    { type: 'docs',    title: 'NGINX Official Documentation',                                      url: 'https://nginx.org/en/docs/',                                                                             difficulty: 'beginner',      free: true  },
    { type: 'book',    title: 'NGINX Cookbook',                                                    url: 'https://www.oreilly.com/library/view/nginx-cookbook/9781492078470/',                                    author: 'Derek DeJonghe',     difficulty: 'intermediate', free: false },
    { type: 'article', title: 'NGINX as a Reverse Proxy, Load Balancer, and Cache',               url: 'https://docs.nginx.com/nginx/admin-guide/',                                                             author: 'NGINX',              difficulty: 'beginner',    free: true  },
  ],
  'rabbitmq': [
    { type: 'docs',    title: 'RabbitMQ Official Documentation',                                   url: 'https://www.rabbitmq.com/documentation.html',                                                           difficulty: 'beginner',      free: true  },
    { type: 'video',   title: 'RabbitMQ in 15 Minutes',                                            url: 'https://www.youtube.com/watch?v=NQ3fZtyXji0',                                                          duration: '15 min',           difficulty: 'beginner',    free: true  },
    { type: 'article', title: 'RabbitMQ vs Kafka — Which to Choose?',                              url: 'https://www.confluent.io/blog/rabbitmq-vs-apache-kafka/',                                               author: 'Confluent',          difficulty: 'intermediate', free: true },
  ],
  'prometheus': [
    { type: 'docs',    title: 'Prometheus Official Documentation',                                 url: 'https://prometheus.io/docs/',                                                                            difficulty: 'beginner',      free: true  },
    { type: 'video',   title: 'Prometheus & Grafana Tutorial',                                     url: 'https://www.youtube.com/watch?v=h4Sl21AKiDg',                                                          author: 'TechWorld with Nana', duration: '30 min', difficulty: 'intermediate', free: true },
  ],
  'grafana': [
    { type: 'docs',    title: 'Grafana Official Documentation',                                    url: 'https://grafana.com/docs/grafana/latest/',                                                              difficulty: 'beginner',      free: true  },
    { type: 'video',   title: 'Grafana Dashboard Tutorial',                                        url: 'https://www.youtube.com/watch?v=lILY8eSspEo',                                                          author: 'TechWorld with Nana', duration: '35 min', difficulty: 'beginner', free: true },
  ],
  'cdn': [
    { type: 'docs',    title: 'Cloudflare CDN Documentation',                                      url: 'https://developers.cloudflare.com/cache/',                                                              difficulty: 'beginner',      free: true  },
    { type: 'article', title: 'How CDNs Work — A Deep Dive',                                       url: 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/',                                                author: 'Cloudflare',         difficulty: 'beginner',    free: true  },
    { type: 'video',   title: 'CDN Explained — System Design',                                     url: 'https://www.youtube.com/watch?v=RI9np1LWzqw',                                                          author: 'Gaurav Sen',         duration: '10 min', difficulty: 'beginner', free: true },
  ],
  'waf': [
    { type: 'docs',    title: 'AWS WAF Documentation',                                             url: 'https://docs.aws.amazon.com/waf/latest/developerguide/',                                                difficulty: 'intermediate',  free: true  },
    { type: 'article', title: 'OWASP Top 10 Web Application Risks',                               url: 'https://owasp.org/www-project-top-ten/',                                                                author: 'OWASP',              difficulty: 'intermediate', free: true },
  ],
  'api-gateway': [
    { type: 'docs',    title: 'AWS API Gateway Documentation',                                     url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/',                                         difficulty: 'beginner',      free: true  },
    { type: 'article', title: 'API Gateway Pattern — Enterprise Integration Patterns',             url: 'https://microservices.io/patterns/apigateway.html',                                                     author: 'Chris Richardson',   difficulty: 'intermediate', free: true },
  ],
  'microservice': [
    { type: 'book',    title: 'Building Microservices (2nd Edition)',                              url: 'https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/',                        author: 'Sam Newman',         difficulty: 'intermediate', free: false },
    { type: 'article', title: 'Microservices — Martin Fowler',                                    url: 'https://martinfowler.com/articles/microservices.html',                                                  author: 'Martin Fowler',      difficulty: 'intermediate', free: true },
    { type: 'video',   title: 'Microservices Explained in 5 Minutes',                             url: 'https://www.youtube.com/watch?v=lL_j7ilk7rc',                                                          author: 'IBM Technology',     duration: '5 min', difficulty: 'beginner', free: true },
  ],
  's3': [
    { type: 'docs',    title: 'Amazon S3 Documentation',                                           url: 'https://docs.aws.amazon.com/s3/',                                                                        difficulty: 'beginner',      free: true  },
    { type: 'article', title: 'Amazon S3 Performance Optimization',                               url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html',                    author: 'AWS',                difficulty: 'intermediate', free: true },
  ],
  'cassandra': [
    { type: 'docs',    title: 'Apache Cassandra Documentation',                                   url: 'https://cassandra.apache.org/doc/latest/',                                                              difficulty: 'intermediate',  free: true  },
    { type: 'paper',   title: 'Cassandra: A Decentralized Structured Storage System (Facebook)',  url: 'https://www.cs.cornell.edu/projects/ladis2009/papers/lakshman-ladis2009.pdf',                           author: 'Facebook Engineering', difficulty: 'advanced',   free: true  },
    { type: 'article', title: 'How Discord Stores Billions of Messages with Cassandra',           url: 'https://discord.com/blog/how-discord-stores-billions-of-messages',                                     author: 'Discord Engineering', difficulty: 'advanced',   free: true  },
  ],
};

export const GENERAL_REFERENCES: Reference[] = [
  { type: 'book',    title: 'Designing Data-Intensive Applications',                             url: 'https://dataintensive.net/',                                                                              author: 'Martin Kleppmann', difficulty: 'advanced',      free: false },
  { type: 'book',    title: "System Design Interview — An Insider's Guide",                      url: 'https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF',                          author: 'Alex Xu',          difficulty: 'intermediate',  free: false },
  { type: 'course',  title: 'Grokking the System Design Interview',                              url: 'https://www.educative.io/courses/grokking-the-system-design-interview',                                  difficulty: 'intermediate',  free: false },
  { type: 'video',   title: 'MIT 6.824 Distributed Systems (Full Course)',                      url: 'https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB',                             author: 'MIT OpenCourseWare', difficulty: 'advanced',    free: true  },
  { type: 'article', title: 'System Design Primer (GitHub)',                                     url: 'https://github.com/donnemartin/system-design-primer',                                                    author: 'Donne Martin',     difficulty: 'intermediate',  free: true  },
  { type: 'video',   title: 'Gaurav Sen — System Design Playlist',                              url: 'https://www.youtube.com/@gkcs',                                                                          author: 'Gaurav Sen',       difficulty: 'intermediate',  free: true  },
];
