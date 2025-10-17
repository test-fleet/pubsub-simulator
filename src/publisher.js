const redis = require('redis');
const {
  createScene,
  createJob,
  createFrame,
  createExtractor,
  createAssertion
} = require('./models');

async function sendTestJob() {
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
  });
  
  await client.connect();
  
  // Create frame 1
  const frame1 = createFrame({
    id: 'frame_1',
    sceneId: 'scene_test123',
    name: 'Get Post Details',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': '${API_KEY}' },
    order: 0,
    extractors: [
      createExtractor({
        name: 'POST_ID',
        type: 'json',
        path: '$.id'
      }),
      createExtractor({
        name: 'USER_ID',
        type: 'json',
        path: '$.userId'
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
        path: '$.title',
        operator: 'exists'
      })
    ]
  });
  
  // Create frame 2
  const frame2 = createFrame({
    id: 'frame_2',
    sceneId: 'scene_test123',
    name: 'Get User Details',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users/${USER_ID}',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': '${API_KEY}' },
    order: 1,
    extractors: [
      createExtractor({
        name: 'USER_EMAIL',
        type: 'json',
        path: '$.email'
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
        path: '$.email',
        operator: 'contains',
        expected: '@'
      })
    ]
  });
  
  // Create frame 3
  const frame3 = createFrame({
    id: 'frame_3',
    sceneId: 'scene_test123',
    name: 'Get Post Comments',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/${POST_ID}/comments',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': '${API_KEY}' },
    order: 2,
    assertions: [
      createAssertion({
        type: 'status',
        operator: 'equals',
        expected: '200'
      }),
      createAssertion({
        type: 'json',
        path: '$[0].email',
        operator: 'contains',
        expected: '@'
      })
    ]
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
      'USER_EMAIL': ''
    },
    frameIds: ['frame_1', 'frame_2', 'frame_3'],
    timeout: 300000,
    orgId: 'org_test456'
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