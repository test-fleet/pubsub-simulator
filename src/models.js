const crypto = require('crypto');

// Helper function to generate a short random ID
function generateShortId(prefix = '') {
  return `${prefix}${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Create a scene object
 */
function createScene({ id, name, description, variables, frameIds, timeout, orgId }) {
  return {
    id: id || generateShortId('scene_'),           // string
    name: name || 'Unnamed Scene',                 // string 
    description: description || '',                // string
    variables: variables || {},                    // {key: value, ...}
    frameIds: frameIds || [],                      // []string
    timeout: timeout || 300000,                    // number
    orgId: orgId                                   // string
  };
}

/**
 * Create a job for Redis pubsub
 */
function createJob({ scene, frames }) {
  const timestamp = Date.now();
  const jobId = `job_${timestamp}_${crypto.randomBytes(4).toString('hex')}`;
  const runId = `exec_${timestamp}`;
  
  return {
    jobId,                         // unique job identifier
    type: "execution",             // job type
    runId,                         // execution run identifier
    scene,                         // full scene object
    frames,                        // array of frames to execute
    createdAt: new Date().toISOString() // creation timestamp
  };
}

/**
 * Create a frame object for pubsub
 */
function createFrame({ id, sceneId, name, method, url, headers, body, extractors, assertions, order, timeout }) {
  return {
    id: id || generateShortId('frame_'),           // string
    sceneId: sceneId || '',                        // string
    name: name || 'Unnamed Frame',                 // string
    method: method || 'GET',                       // string
    url: url || '',                                // string
    headers: headers || { 'Content-Type': 'application/json' }, // {}string
    body: body || '',                              // string
    extractors: extractors || [],                  // []{}extractor
    assertions: assertions || [],                  // []{}assertion
    order: order || 0,                             // number for execution order
    timeout: timeout || 15000                      // number (optional frame-specific timeout)
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
  createScene,
  createJob,
  createFrame,
  createExtractor,
  createAssertion
};