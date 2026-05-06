import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { v4 as uuid } from './uuid';

const ProjectContext = createContext();
const STORAGE_KEY = 'speccrew_projects';

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

const initialState = {
  projects: loadProjects(),
  currentProject: null,
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload, loading: false };
    case 'ADD_PROJECT': {
      const updated = [action.payload, ...state.projects];
      saveProjects(updated);
      return { ...state, projects: updated };
    }
    case 'UPDATE_PROJECT': {
      const projects = state.projects.map(p =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      );
      saveProjects(projects);
      const current = state.currentProject?.id === action.payload.id
        ? { ...state.currentProject, ...action.payload }
        : state.currentProject;
      return { ...state, projects, currentProject: current };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchProjects = useCallback(() => {
    dispatch({ type: 'SET_PROJECTS', payload: loadProjects() });
  }, []);

  const fetchProject = useCallback((id) => {
    const projects = loadProjects();
    const project = projects.find(p => p.id === id) || null;
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
  }, []);

  const createProject = useCallback(({ name, rawInput }) => {
    const project = {
      id: uuid(),
      name,
      rawInput,
      status: 'draft',
      analyses: {},
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PROJECT', payload: project });
    return project;
  }, []);

  const updateProject = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, ...updates } });
  }, []);

  const value = {
    ...state,
    dispatch,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
