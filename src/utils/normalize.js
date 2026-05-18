export function dig(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined) return obj[key];
  }
  return undefined;
}

export function normalizeAria(raw) {
  if (!raw) return { summary: '', requirements: [], stakeholders: [], scope: '', assumptions: [] };
  return {
    summary: dig(raw, 'summary', 'Summary') || '',
    requirements: dig(raw, 'requirements', 'Requirements') || [],
    stakeholders: dig(raw, 'stakeholders', 'Stakeholders') || [],
    scope: dig(raw, 'scope', 'Scope') || '',
    assumptions: dig(raw, 'assumptions', 'Assumptions') || [],
  };
}

export function normalizeQuinn(raw) {
  if (!raw) return { ambiguities: [], testCases: [], risks: [], coverageScore: 0 };
  return {
    ambiguities: dig(raw, 'ambiguities', 'Ambiguities') || [],
    testCases: dig(raw, 'testCases', 'test_cases', 'TestCases', 'testcases') || [],
    risks: dig(raw, 'risks', 'Risks') || [],
    coverageScore: dig(raw, 'coverageScore', 'coverage_score', 'CoverageScore') || 0,
  };
}

export function normalizeRex(raw) {
  if (!raw) return { tasks: [], techRecommendations: [], architectureNotes: '' };
  return {
    tasks: dig(raw, 'tasks', 'Tasks') || [],
    techRecommendations: dig(raw, 'techRecommendations', 'tech_recommendations', 'TechRecommendations') || [],
    architectureNotes: dig(raw, 'architectureNotes', 'architecture_notes', 'ArchitectureNotes') || '',
  };
}

export function normalizeSage(raw) {
  if (!raw) return { projectSummary: '', totalEstimatedHours: 0, milestones: [], risks: [], recommendations: [], teamSuggestions: '', suggestedTimeline: '' };
  return {
    projectSummary: dig(raw, 'projectSummary', 'project_summary', 'ProjectSummary') || '',
    totalEstimatedHours: dig(raw, 'totalEstimatedHours', 'total_estimated_hours', 'totalHours', 'estimatedHours') || 0,
    suggestedTimeline: dig(raw, 'suggestedTimeline', 'suggested_timeline', 'SuggestedTimeline') || '',
    milestones: dig(raw, 'milestones', 'Milestones') || [],
    risks: dig(raw, 'risks', 'Risks') || [],
    recommendations: dig(raw, 'recommendations', 'Recommendations') || [],
    teamSuggestions: dig(raw, 'teamSuggestions', 'team_suggestions', 'TeamSuggestions') || '',
  };
}
