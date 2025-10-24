const crypto = require('crypto');

// Helper function to generate a short random ID
function generateShortId(prefix = '') {
  return `${prefix}${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Create a scene object
 */
function createScene({ id, name, description, variables, frameIds, timeout, orgId, cronSchedule, enabled, createdBy, createdAt, updatedAt }) {
  const now = new Date().toISOString();
  return {
    id: id || generateShortId('scene_'),
    name: name || 'Unnamed Scene',
    description: description || '',
    variables: variables || {},
    frameIds: frameIds || [],
    timeout: timeout || 300000,
    orgId: orgId,
    cronSchedule: cronSchedule || '',
    enabled: enabled !== undefined ? enabled : true,
    createdBy: createdBy || 'system',
    createdAt: createdAt || now,
    updatedAt: updatedAt || now
  };
}

/**
 * Create a job for Redis pubsub
 */
function createJob({ scene, frames, status }) {
  const timestamp = Date.now();
  const jobId = `job_${timestamp}_${crypto.randomBytes(4).toString('hex')}`;
  const runId = `exec_${timestamp}`;
  const now = new Date().toISOString();
  
  return {
    jobId,
    type: "execution",
    runId,
    scene,
    frames,
    status: status || 'pending',
    startedAt: now,
    createdAt: now
  };
}

/**
 * Create a frame object for pubsub
 */
function createFrame({ id, sceneId, name, order, timeout, request, extractors, assertions, createdBy, createdAt, updatedAt }) {
  const now = new Date().toISOString();
  return {
    id: id || generateShortId('frame_'),
    sceneId: sceneId || '',
    name: name || 'Unnamed Frame',
    order: order || 0,
    timeout: timeout || 15000,
    request: request || {},
    extractors: extractors || [],
    assertions: assertions || [],
    createdBy: createdBy || 'system',
    createdAt: createdAt || now,
    updatedAt: updatedAt || now
  };
}

/**
 * Create a request object
 */
function createRequest({ method, url, headers, body, timeout }) {
  return {
    method: method,
    url: url || '',
    headers: headers || { 'Content-Type': 'application/json' },
    body: body || '',
    timeout: 15000
  };
}

function createVariable({ type, value }) {
  return {
    type: type || 'string',
    value: value
  }
}

/**
 * Create a variable extractor
 */
function createExtractor({ name, type, source, dataType }) {
  return {
    name: name,
    type: type || '',
    source: source || '',
    dataType: dataType || 'string'
  };
}

/**
 * Create an assertion
 */
function createAssertion({ type, operator, expected, source}) {
  return {
    type: type,
    operator: operator || 'equals',
    expected: expected || '',
    source: source || '',
  };
}

module.exports = {
  createScene,
  createJob,
  createFrame,
  createRequest,
  createExtractor,
  createAssertion,
  createVariable
};