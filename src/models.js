const crypto = require('crypto');

// Helper function to generate a short random ID
function generateShortId(prefix = '') {
  return `${prefix}${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Create a job for Redis pubsub
 */
function createJob({ sceneId, orgId, frames, timeout }) {
  const timestamp = Date.now();
  const jobId = `job_${timestamp}_${crypto.randomBytes(4).toString('hex')}`;
  const runId = `exec_${timestamp}`;
  
  return {
    jobId,                         // unique job identifier
    type: "execution",             // job type
    runId,                         // execution run identifier
    sceneId,                       // scene identifier
    orgId,                         // organization identifier
    frames,                        // array of frames to execute
    timeout: timeout || 300000,    // global timeout in ms (default 5min)
    createdAt: new Date().toISOString() // creation timestamp
  };
}

/**
 * Create a frame object for pubsub
 */
function createFrame({ id, method, url, headers, body, extractors, assertions, order }) {
  return {
    id: id || generateShortId('frame_'),      // string
    method: method || 'GET',                  // string
    url: url || '',                           // string
    headers: headers || { 'Content-Type': 'application/json' }, // {}string
    body: body || '',                         // string
    extractors: extractors || [],             // []{}extractor
    assertions: assertions || [],             // []{}assertion
    order: order || 0                         // number for execution order
  };
}

/**
 * Create a variable extractor
 */
function createExtractor({ name, type, path }) {
  return {
    name: name,                    // string - variable name
    type: type || 'json',          // string: json, header
    path: path || ''               // string - $.token
  };
}

/**
 * Create an assertion
 */
function createAssertion({ type, expected, path, operator }) {
  return {
    type: type || 'status',         // string: json, status, header
    expected: expected || '',       // string: 200, 'success'
    path: path,                     // string (optional)
    operator: operator || 'equals'  // string: equals, notEquals, contains, greaterThan, lessThan
  };
}

module.exports = {
  createJob,
  createFrame,
  createExtractor,
  createAssertion
};