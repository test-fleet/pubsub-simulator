const crypto = require('crypto');

// Helper function to generate a short random ID
function generateShortId(prefix = '') {
  return `${prefix}${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Create a scene object
 */
function createScene({ id, name, description, variables, frameIds, timeout, orgId, cronSchedule, enabled }) {
  return {
    id: id || generateShortId('scene_'),
    name: name || 'Unnamed Scene',
    description: description || '',
    variables: variables || {},
    frameIds: frameIds || [],
    timeout: timeout || 300000,
    orgId: orgId,
    cronSchedule: cronSchedule || '',
    enabled: enabled !== undefined ? enabled : true
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
    jobId,
    type: "execution",
    runId,
    scene,
    frames,
    createdAt: new Date().toISOString()
  };
}

/**
 * Create a frame object for pubsub
 */
function createFrame({ id, sceneId, name, order, timeout, request, extractors, assertions }) {
  return {
    id: id || generateShortId('frame_'),
    sceneId: sceneId || '',
    name: name || 'Unnamed Frame',
    order: order || 0,
    timeout: timeout || 15000,
    request: request || {},
    extractors: extractors || [],
    assertions: assertions || []
  };
}

/**
 * Create a request object
 */
function createRequest({ method, url, headers, body }) {
  return {
    method: method || 'GET',
    url: url || '',
    headers: headers || { 'Content-Type': 'application/json' },
    body: body || ''
  };
}

/**
 * Create a variable extractor
 */
function createExtractor({ name, type, path }) {
  return {
    name: name,
    type: type || 'json',
    path: path || ''
  };
}

/**
 * Create an assertion
 */
function createAssertion({ type, expected, path, operator }) {
  return {
    type: type || 'status',
    expected: expected || '',
    path: path,
    operator: operator || 'equals'
  };
}

module.exports = {
  createScene,
  createJob,
  createFrame,
  createRequest,
  createExtractor,
  createAssertion
};