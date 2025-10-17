const redis = require('redis');
const {
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
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: { 'Content-Type': 'application/json' },
    order: 0,
    extractors: [
      createExtractor({
        name: 'postId',
        type: 'json',
        path: '$.id'
      }),
      createExtractor({
        name: 'userId',
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
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users/{{userId}}',
    headers: { 'Content-Type': 'application/json' },
    order: 1,
    extractors: [
      createExtractor({
        name: 'userEmail',
        type: 'json',
        path: '$.email'
      })
    ],
    assertions: [
      createAssertion({
        type: 'status',
        operator: 'equals',
        expected: '200'
      })
    ]
  });
  
  // Create frame 3
  const frame3 = createFrame({
    id: 'frame_3',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/{{postId}}/comments',
    headers: { 'Content-Type': 'application/json' },
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
  
  // Create job with frames
  const job = createJob({
    sceneId: 'scene_test123',
    orgId: 'org_test456',
    frames: [frame1, frame2, frame3],
    timeout: 300000
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