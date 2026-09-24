const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed: ${response.status}`)
  }
  return response.json()
}

export const api = {
  profile: () => request('/api/profile'),
  updateProfile: (data) => request('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
  tasks: () => request('/api/tasks'),
  task: (id) => request(`/api/tasks/${id}`),
  startSession: (taskId) => request('/api/sessions', { method: 'POST', body: JSON.stringify({ task_id: taskId }) }),
  session: (id) => request(`/api/sessions/${id}`),
  saveVersion: (sessionId, code, note = '') =>
    request(`/api/sessions/${sessionId}/versions`, { method: 'POST', body: JSON.stringify({ code, note }) }),
  runCode: (sessionId, code) =>
    request(`/api/sessions/${sessionId}/run`, { method: 'POST', body: JSON.stringify({ code }) }),
  mentor: (sessionId, message) =>
    request(`/api/sessions/${sessionId}/mentor`, { method: 'POST', body: JSON.stringify({ message }) }),
  evaluate: (sessionId) =>
    request(`/api/sessions/${sessionId}/evaluate`, { method: 'POST' }),
  submitCheck: (sessionId, answers) =>
    request(`/api/sessions/${sessionId}/understanding-check`, { method: 'POST', body: JSON.stringify({ answers }) }),
  evidence: () => request('/api/evidence')
}
