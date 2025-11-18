const redis = require('redis');
const {
  createScene,
  createJob,
  createFrame,
  createRequest,
  createExtractor,
  createAssertion,
  createVariable
} = require('./models');

async function sendTestJob() {
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
  });
  
  await client.connect();
  
  const now = new Date().toISOString();
  const userId = 'user_12345';
  
  const request1 = createRequest({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: { 
      'Content-Type': 'application/json', 
      'X-API-Key': '${API_KEY}',
      'X-Request-ID': '${REQUEST_ID}'
    },
    body: ''
  });
  
  const frame1 = createFrame({
    id: 'frame_1',
    sceneId: 'scene_test123',
    name: 'Get Post Details - Extract Numbers and Strings',
    order: 0,
    timeout: 15000,
    request: request1,
    extractors: [
      createExtractor({
        name: 'POST_ID',
        type: 'json',
        source: '$.id',
        dataType: 'number'
      }),
      createExtractor({
        name: 'USER_ID',
        type: 'json',
        source: '$.userId',
        dataType: 'number'
      }),
      createExtractor({
        name: 'POST_TITLE',
        type: 'json',
        source: '$.title',
        dataType: 'string'
      }),
      createExtractor({
        name: 'CONTENT_TYPE',
        type: 'header',
        source: 'content-type',
        dataType: 'string'
      }),
      createExtractor({
        name: 'SERVER_NAME',
        type: 'header',
        source: 'server',
        dataType: 'string'
      })
    ],
    assertions: [
      createAssertion({
        type: 'status',
        operator: 'equals',
        expected: '200'
      }),
      createAssertion({
        name: 'title_exists',
        type: 'json',
        source: '$.title',
        operator: 'exists'
      })
    ],
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  });

  const request2 = createRequest({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users/${USER_ID}',
    headers: { 
      'Content-Type': 'application/json',
      'X-API-Key': '${API_KEY}',
      'X-Post-ID': '${POST_ID}',
      'X-Server': '${SERVER_NAME}'
    },
    body: ''
  });
  
  const frame2 = createFrame({
    id: 'frame_2',
    sceneId: 'scene_test123',
    name: 'Get User - Extract Boolean and More Data',
    order: 1,
    timeout: 15000,
    request: request2,
    extractors: [
      createExtractor({
        name: 'USER_EMAIL',
        type: 'json',
        source: '$.email',
        dataType: 'string'
      }),
      createExtractor({
        name: 'USER_PHONE',
        type: 'json',
        source: '$.phone',
        dataType: 'string'
      }),
      createExtractor({
        name: 'IS_ACTIVE',
        type: 'json',
        source: '$.website',
        dataType: 'string'
      }),
      createExtractor({
        name: 'LAT_COORDINATE',
        type: 'json',
        source: '$.address.geo.lat',
        dataType: 'string'
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

  const request3 = createRequest({
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: { 
      'Content-Type': 'application/json',
      'X-API-Key': '${API_KEY}',
      'X-User-Email': '${USER_EMAIL}',
      'X-Active-Status': '${IS_ACTIVE}',
      'X-Coordinate': '${LAT_COORDINATE}'
    },
    body: JSON.stringify({
      title: "Post by User ${USER_ID}: ${POST_TITLE}",
      body: "This post is created by ${USER_EMAIL} with phone ${USER_PHONE}",
      userId: "${USER_ID}",
      metadata: {
        originalPostId: "${POST_ID}",
        isUserActive: "${IS_ACTIVE}",
        userLatitude: "${LAT_COORDINATE}",
        contentType: "${CONTENT_TYPE}",
        serverInfo: "${SERVER_NAME}"
      }
    })
  });
  
  const frame3 = createFrame({
    id: 'frame_3',
    sceneId: 'scene_test123',
    name: 'Create Post - JSON Body with All Variable Types',
    order: 2,
    timeout: 15000,
    request: request3,
    extractors: [
      createExtractor({
        name: 'NEW_POST_ID',
        type: 'json',
        source: '$.id',
        dataType: 'number'
      }),
      createExtractor({
        name: 'RESPONSE_LOCATION',
        type: 'header',
        source: 'location',
        dataType: 'string'
      })
    ],
    assertions: [
      createAssertion({
        type: 'status',
        operator: 'equals',
        expected: '201'
      }),
      createAssertion({
        type: 'json',
        source: '$.userId',
        operator: 'equals',
        expected: '${USER_ID}'
      })
    ],
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  });

  const request4 = createRequest({
    method: 'PUT',
    url: 'https://jsonplaceholder.typicode.com/posts/${POST_ID}',
    headers: { 
      'Content-Type': 'application/json',
      'X-API-Key': '${API_KEY}',
      'X-New-Post-ID': '${NEW_POST_ID}',
      'X-User-Active': '${IS_ACTIVE}'
    },
    body: JSON.stringify({
      id: "${POST_ID}",
      userId: "${USER_ID}",
      title: "Updated: ${POST_TITLE}",
      body: "Updated by ${USER_EMAIL}",
      metadata: {
        phone: "${USER_PHONE}",
        active: "${IS_ACTIVE}",
        latitude: "${LAT_COORDINATE}",
        newPostId: "${NEW_POST_ID}"
      }
    })
  });
  
  const frame4 = createFrame({
    id: 'frame_4',
    sceneId: 'scene_test123',
    name: 'Update Post - JSON Body with Variable Insertion',
    order: 3,
    timeout: 15000,
    request: request4,
    extractors: [
      createExtractor({
        name: 'UPDATE_SUCCESS',
        type: 'json',
        source: '$.id',
        dataType: 'number'
      }),
      createExtractor({
        name: 'RESPONSE_TIME',
        type: 'header',
        source: 'x-response-time',
        dataType: 'number'
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
        expected: '${POST_ID}'
      })
    ],
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  });

  const request5 = createRequest({
    method: 'DELETE',
    url: 'https://jsonplaceholder.typicode.com/posts/${POST_ID}',
    headers: { 
      'Authorization': 'Bearer ${API_KEY}',
      'X-User-ID': '${USER_ID}',
      'X-User-Email': '${USER_EMAIL}',
      'X-Is-Active': '${IS_ACTIVE}',
      'X-Latitude': '${LAT_COORDINATE}',
      'X-New-Post-ID': '${NEW_POST_ID}',
      'If-Match': '${RESPONSE_LOCATION}'
    },
    body: ''
  });
  
  const frame5 = createFrame({
    id: 'frame_5',
    sceneId: 'scene_test123',
    name: 'Delete Post - Header Variable Insertion',
    order: 4,
    timeout: 15000,
    request: request5,
    extractors: [
      createExtractor({
        name: 'DELETE_SUCCESS',
        type: 'json',
        source: '$.success',
        dataType: 'boolean'
      }),
      createExtractor({
        name: 'FINAL_STATUS',
        type: 'header',
        source: 'x-delete-status',
        dataType: 'string'
      })
    ],
    assertions: [
      createAssertion({
        type: 'status',
        operator: 'equals',
        expected: '200'
      })
    ],
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  });
  
  const scene = createScene({
    id: 'scene_test123',
    name: 'Comprehensive API Testing Flow',
    description: 'Tests complete API flow with all variable types: string, number, bool extraction and insertion',
    variables: {
      'API_KEY': createVariable({ type: 'string', value: 'test-api-key-123' }),
      'REQUEST_ID': createVariable({ type: 'string', value: 'req_12345' }),
      'POST_ID': createVariable({ type: 'number', value: null }),
      'USER_ID': createVariable({ type: 'number', value: null }),
      'POST_TITLE': createVariable({ type: 'string', value: '' }),
      'CONTENT_TYPE': createVariable({ type: 'string', value: '' }),
      'SERVER_NAME': createVariable({ type: 'string', value: '' }),
      'USER_EMAIL': createVariable({ type: 'string', value: '' }),
      'USER_PHONE': createVariable({ type: 'string', value: '' }),
      'IS_ACTIVE': createVariable({ type: 'string', value: '' }),
      'LAT_COORDINATE': createVariable({ type: 'string', value: '' }),
      'NEW_POST_ID': createVariable({ type: 'number', value: null }),
      'RESPONSE_LOCATION': createVariable({ type: 'string', value: '' }),
      'UPDATE_SUCCESS': createVariable({ type: 'number', value: 0 }),
      'RESPONSE_TIME': createVariable({ type: 'number', value: 0 }),
      'DELETE_SUCCESS': createVariable({ type: 'boolean', value: false }),
      'FINAL_STATUS': createVariable({ type: 'string', value: '' })
    },
    frameIds: ['frame_1', 'frame_2', 'frame_3', 'frame_4', 'frame_5'],
    timeout: 300000,
    orgId: 'org_test456',
    cronSchedule: '*/30 * * * *',
    enabled: true,
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  });
  
  const job = createJob({
    scene: scene,
    frames: [frame1, frame2, frame3, frame4, frame5]
  });
  
  const channel = process.env.CHANNEL_NAME || 'testfleet:jobs';
  
  await client.publish(channel, JSON.stringify(job));
  console.log(`Job published to ${channel} with jobId: ${job.jobId}`);
  
  await client.disconnect();
}

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

sendTestJob().catch(console.error);