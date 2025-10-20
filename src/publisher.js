const redis = require('redis');
const {
  createScene,
  createJob,
  createFrame,
  createRequest,
  createExtractor,
  createAssertion
} = require('./models');

async function sendTestJob() {
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
  });
  
  await client.connect();
  
  const now = new Date().toISOString();
  const userId = 'user_12345'; // Example user ID
  
  // Create request for frame 1
  const request1 = createRequest({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': '${API_KEY}' },
    body: ''
  });
  
  // Create frame 1
  const frame1 = createFrame({
    id: 'frame_1',
    sceneId: 'scene_test123',
    name: 'Get Post Details',
    order: 0,
    timeout: 15000,
    request: request1,
    extractors: [
      createExtractor({
        name: 'POST_ID',
        type: 'json',
        source: '$.id'
      }),
      createExtractor({
        name: 'USER_ID',
        type: 'json',
        source: '$.userId'
      }),
      createExtractor({
        name: 'CONTENT_TYPE',
        type: 'header',
        source: 'content-type'
      })
    ],
    assertions: [
      createAssertion({
        type: 'status',
        operator: 'equals',
        expected: '200'
      }),
      createAssertion({
        type: 'json',
        source: '$.title',
        operator: 'exists'
      })
    ],
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  });
  
  // Create request for frame 2 with JSON body containing variables
  const request2 = createRequest({
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/users/${USER_ID}',
    headers: { 
      'Content-Type': 'application/json', 
      'X-API-Key': '${API_KEY}'
    },
    body: JSON.stringify({
      name: "Updated User ${USER_ID}",
      email: "${USER_EMAIL}",
      api_key: "${API_KEY}",
      metadata: {
        lastAccessed: "2023-01-01",
        postCount: "${POST_ID}"
      }
    })
  });
  
  // Create frame 2
  const frame2 = createFrame({
    id: 'frame_2',
    sceneId: 'scene_test123',
    name: 'Update User Details',
    order: 1,
    timeout: 15000,
    request: request2,
    extractors: [
      createExtractor({
        name: 'USER_EMAIL',
        type: 'json',
        source: '$.email'
      })
    ],
    assertions: [
      createAssertion({
        type: 'status',
        operator: 'equals',
        expected: '200'
      }),
      createAssertion({
        type: 'json',
        source: '$.id',
        operator: 'equals',
        expected: '${USER_ID}'
      })
    ],
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  });
  
  // Create request for frame 3 with form data containing variables
  const request3 = createRequest({
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts/${POST_ID}/comments',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded', 
      'X-API-Key': '${API_KEY}'
    },
    body: 'postId=${POST_ID}&email=${USER_EMAIL}&comment=This is a test comment for post ${POST_ID}'
  });
  
  // Create frame 3
  const frame3 = createFrame({
    id: 'frame_3',
    sceneId: 'scene_test123',
    name: 'Add Post Comment',
    order: 2,
    timeout: 15000,
    request: request3,
    assertions: [
      createAssertion({
        type: 'status',
        operator: 'equals',
        expected: '200'
      }),
      createAssertion({
        type: 'json',
        source: '$.id',
        operator: 'exists'
      })
    ],
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  });
  
  // Create scene with variables
  const scene = createScene({
    id: 'scene_test123',
    name: 'API User-Post Flow',
    description: 'Tests the full user-post-comment flow with variable extraction',
    variables: {
      'API_KEY': 'test-api-key-123',
      'POST_ID': '',
      'USER_ID': '',
      'USER_EMAIL': 'default@example.com' // Added default value for testing
    },
    frameIds: ['frame_1', 'frame_2', 'frame_3'],
    timeout: 300000,
    orgId: 'org_test456',
    cronSchedule: '*/30 * * * *',
    enabled: true,
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  });
  
  // Create job with scene and frames
  const job = createJob({
    scene: scene,
    frames: [frame1, frame2, frame3]
  });
  
  const channel = process.env.CHANNEL_NAME || 'testfleet:jobs';
  
  await client.publish(channel, JSON.stringify(job));
  console.log(`Job published to ${channel} with jobId: ${job.jobId}`);
  
  await client.disconnect();
}

// Run on interval
const intervalSeconds = parseInt(process.env.INTERVAL_SECONDS || '10');
console.log(`Starting simulator - will publish every ${intervalSeconds} seconds`);
setInterval(async () => {
  try {
    await sendTestJob();
    console.log(`Job sent at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error sending job:', error);
  }
}, intervalSeconds * 1000);

// Also send one immediately on startup
sendTestJob().catch(console.error);