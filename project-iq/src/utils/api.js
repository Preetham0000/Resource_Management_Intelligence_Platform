// API Service Layer
import { authFetch } from './auth';

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api';

// ==================== PROJECTS ====================
export const getProjects = async () => {
  const response = await authFetch(`${API_BASE_URL}/projects`);
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

export const createProject = async (projectData) => {
  const response = await authFetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
  if (!response.ok) throw new Error('Failed to create project');
  return response.json();
};

export const updateProject = async (id, projectData) => {
  const response = await authFetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  });
  if (!response.ok) throw new Error('Failed to update project');
  return response.json();
};

export const deleteProject = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete project');
  return response.json();
};

// ==================== SPRINTS ====================
export const getSprints = async () => {
  const response = await authFetch(`${API_BASE_URL}/sprints`);
  if (!response.ok) throw new Error('Failed to fetch sprints');
  return response.json();
};

export const createSprint = async (sprintData) => {
  const response = await authFetch(`${API_BASE_URL}/sprints`, {
    method: 'POST',
    body: JSON.stringify(sprintData),
  });
  if (!response.ok) throw new Error('Failed to create sprint');
  return response.json();
};

export const updateSprint = async (id, sprintData) => {
  const response = await authFetch(`${API_BASE_URL}/sprints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sprintData),
  });
  if (!response.ok) throw new Error('Failed to update sprint');
  return response.json();
};

export const deleteSprint = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/sprints/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete sprint');
  return response.json();
};

// ==================== TASKS ====================
export const getTasks = async () => {
  const response = await authFetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
};

export const createTask = async (taskData) => {
  const response = await authFetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
};

export const updateTask = async (id, taskData) => {
  const response = await authFetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};

export const deleteTask = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete task');
  return response.json();
};

// ==================== RESOURCES ====================
export const getResources = async () => {
  const response = await authFetch(`${API_BASE_URL}/resources`);
  if (!response.ok) throw new Error('Failed to fetch resources');
  return response.json();
};

// ==================== ANALYTICS ====================
export const getAtRiskProjects = async () => {
  const response = await authFetch(`${API_BASE_URL}/analytics/at-risk-projects`);
  if (!response.ok) throw new Error('Failed to fetch at-risk projects');
  return response.json();
};

export const getSprintVelocity = async () => {
  const response = await authFetch(`${API_BASE_URL}/analytics/sprint-velocity`);
  if (!response.ok) throw new Error('Failed to fetch sprint velocity');
  return response.json();
};

// ==================== RISK ====================
export const getRiskData = async () => {
  const response = await authFetch(`${API_BASE_URL}/risk`);
  if (!response.ok) throw new Error('Failed to fetch risk data');
  return response.json();
};

export const predictRisk = async (input) => {
  const response = await authFetch(`${API_BASE_URL}/risk/predict`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error('Failed to run risk prediction');
  return response.json();
};

export const predictProjectRisk = async (projectId, predictionData) => {
  const response = await authFetch(`${API_BASE_URL}/predict/${projectId}`, {
    method: 'POST',
    body: JSON.stringify(predictionData),
  });
  if (!response.ok) throw new Error('Failed to run project prediction');
  return response.json();
};
