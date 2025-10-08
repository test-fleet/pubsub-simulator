const redis = require('redis');
const {
  createExtractor,
  createAssertion,
  createFrame,
  createScene,
  createJob
} = require('./models');

async function sendTestJob() {
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
  });

  await client.connect();

  const frame1 = createFrame({
    id: 'frame_1',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: { 'Content-Type': 'application/json' },
    extractors: [
      createExtractor({
        name: 'postId',
        type: 'json',
        path: '$.id'
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

  const frame2 = createFrame({
    id: 'frame_2',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/{{postId}}/comments',
    headers: { 'Content-Type': 'application/json' },
    assertions: [
      createAssertion({
        type: 'status',
        operator: 'equals',
        expected: '200'
      })
    ]
  });

  const scene = createScene({
    sceneId: 'scene_test123',
    orgId: 'org_test456',
    name: 'Test API Flow',
    frames: [frame1, frame2]
  });

  const runId = `exec_${Date.now()}`;
  const job = createJob(scene, runId);

  const channel = process.env.CHANNEL_NAME || 'testfleet:jobs';
  
  await client.publish(channel, JSON.stringify(job));


  await client.disconnect();
}

// Run on interval
const intervalSeconds = parseInt(process.env.INTERVAL_SECONDS || '10');

console.log(`Starting simulator - will publish every ${intervalSeconds} seconds`);

setInterval(async () => {
  try {
    await sendTestJob();
  } catch (error) {
    console.error('Error sending job:', error);
  }
}, intervalSeconds * 1000);

// Also send one immediately on startup
sendTestJob().catch(console.error);