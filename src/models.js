// Create an Extractor
function createExtractor({ name, type, path }) {
  return {
    name,      // variable name to store
    type,      // 'json' or 'header'
    path       // JSONPath for json, header name for header
  };
}

// Create an Assertion
function createAssertion({ type, operator, path, expected }) {
  const assertion = {
    type,      // 'status', 'json', 'header'
    operator   // 'equals', 'contains', 'exists'
  };
  
  if (path !== undefined) assertion.path = path;
  if (expected !== undefined) assertion.expected = expected;
  
  return assertion;
}

// Create a Frame
function createFrame({ id, method, url, headers, body, extractors, assertions }) {
  return {
    id: id || `frame_${Date.now()}`,
    method,
    url,
    headers: headers || {},
    body: body || '',
    extractors: extractors || [],
    assertions: assertions || []
  };
}

// Create a Scene
function createScene({ sceneId, orgId, name, frames }) {
  return {
    sceneId: sceneId || `scene_${Date.now()}`,
    orgId,
    name,
    frames: frames || []
  };
}

// Create a Job
function createJob(scene, runId) {
  return {
    jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'execution',
    runId,
    sceneId: scene.sceneId,
    orgId: scene.orgId,
    frames: scene.frames,
    timeout: 300000,
    createdAt: new Date().toISOString()
  };
}

module.exports = {
  createExtractor,
  createAssertion,
  createFrame,
  createScene,
  createJob
};
