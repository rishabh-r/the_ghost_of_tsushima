import { useState, useCallback, useRef } from 'react';
import { flags } from '../config/runtimeFlags';

const AGENT_ORDER = ['aria', 'quinn', 'rex', 'sage'];
const MOCKING_STAGE_DELAY = 800;
const AGENT_MOCK_DELAY = 1050;

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}

function summarizeInput(rawInput) {
  const normalized = String(rawInput || '').replace(/\s+/g, ' ').trim();
  return normalized ? normalized.slice(0, 120) : 'Build a polished end-to-end workflow.';
}

function createMockOutput(agentName, rawInput, previousOutputs) {
  const summary = summarizeInput(rawInput);

  if (agentName === 'aria') {
    return {
      summary: `Debug mode mock analysis for: "${summary}"`,
      requirements: [
        {
          id: 'REQ-001',
          title: 'Create project input',
          description: 'Users can submit raw requirements text and optionally upload supporting files.',
          type: 'functional',
          priority: 'high',
          source: 'User launches a project from the home screen.',
        },
        {
          id: 'REQ-002',
          title: 'Run staged AI analysis',
          description: 'The system processes work through Aria, Quinn, Rex, and Sage in sequence.',
          type: 'functional',
          priority: 'high',
          source: 'Pipeline executes one agent at a time.',
        },
        {
          id: 'REQ-003',
          title: 'Display analysis results',
          description: 'The UI shows structured outputs for requirements, QA, tasks, and plan summary.',
          type: 'functional',
          priority: 'medium',
          source: 'Tabbed results panels.',
        },
        {
          id: 'REQ-004',
          title: 'Preserve project state',
          description: 'Project status and analyses are persisted for revisit and export.',
          type: 'non-functional',
          priority: 'medium',
          source: 'Project storage and completion behavior.',
        },
      ],
      stakeholders: ['Product Owner', 'Engineering Team', 'QA Team'],
      scope: 'In scope: submission, staged analysis, and result review. Out of scope: production deployment automation.',
      assumptions: ['This is a debug simulation output generated locally.'],
    };
  }

  if (agentName === 'quinn') {
    const reqs = previousOutputs.aria?.requirements || [];
    return {
      ambiguities: [
        {
          requirementId: reqs[0]?.id || 'REQ-001',
          issue: 'Accepted file formats and maximum upload size are not specified.',
          suggestion: 'Define file-type allowlist and upload size limit in validation rules.',
          severity: 'medium',
        },
        {
          requirementId: reqs[1]?.id || 'REQ-002',
          issue: 'Pipeline retry behavior after partial failure is unclear.',
          suggestion: 'Specify whether to restart from first agent or failed agent.',
          severity: 'high',
        },
        {
          requirementId: reqs[2]?.id || 'REQ-003',
          issue: 'Empty state messaging for incomplete analyses lacks exact copy.',
          suggestion: 'Provide explicit empty/loading/error content guidelines.',
          severity: 'low',
        },
      ],
      testCases: [
        {
          id: 'TC-001',
          requirementId: 'REQ-001',
          title: 'Create project with text input only',
          preconditions: 'User is on Home page.',
          steps: ['Enter project name', 'Paste requirements text', 'Submit form'],
          expectedResult: 'Project is created and user is navigated to project view.',
          type: 'positive',
        },
        {
          id: 'TC-002',
          requirementId: 'REQ-002',
          title: 'Sequential stage completion',
          preconditions: 'Pipeline is idle and project has raw input.',
          steps: ['Launch crew', 'Observe stage transitions'],
          expectedResult: 'Stages complete in order and status becomes completed.',
          type: 'edge-case',
        },
        {
          id: 'TC-003',
          requirementId: 'REQ-003',
          title: 'Render results after completion',
          preconditions: 'Pipeline has completed.',
          steps: ['Open each tab in Results panel'],
          expectedResult: 'Each tab displays data with no runtime errors.',
          type: 'positive',
        },
      ],
      risks: [
        {
          description: 'Ambiguous requirements may produce inconsistent task output.',
          impact: 'medium',
          mitigation: 'Add a mandatory clarification step for high-severity ambiguities.',
        },
      ],
      coverageScore: 84,
    };
  }

  if (agentName === 'rex') {
    return {
      tasks: [
        {
          id: 'TASK-001',
          requirementId: 'REQ-001',
          title: 'Implement project creation form flow',
          description: 'Validate required fields, normalize input, and create project records.',
          acceptanceCriteria: [
            'Given valid input, when user submits, then project is created and route changes to project view.',
            'Given invalid input, when user submits, then action is blocked with clear feedback.',
          ],
          effort: 'M',
          estimatedHours: 10,
          dependencies: [],
          component: 'frontend',
        },
        {
          id: 'TASK-002',
          requirementId: 'REQ-002',
          title: 'Implement staged pipeline orchestration',
          description: 'Run agent calls in sequence and persist intermediate outputs.',
          acceptanceCriteria: [
            'Given pipeline launch, stages execute in fixed order.',
            'Given agent failure, status becomes error and user can retry.',
          ],
          effort: 'M',
          estimatedHours: 12,
          dependencies: ['TASK-001'],
          component: 'integration',
        },
        {
          id: 'TASK-003',
          requirementId: 'REQ-003',
          title: 'Implement tabbed analysis rendering',
          description: 'Render requirement, QA, task, and summary outputs with robust empty states.',
          acceptanceCriteria: [
            'Given completed pipeline, all tabs show structured sections.',
            'Given missing data, UI shows fallback state without errors.',
          ],
          effort: 'S',
          estimatedHours: 6,
          dependencies: ['TASK-002'],
          component: 'frontend',
        },
      ],
      techRecommendations: [
        'Use deterministic output schemas for each agent stage to simplify rendering.',
        'Prefer progressive persistence after each stage for better recovery.',
      ],
      architectureNotes: 'Pipeline orchestrator controls stage state while UI consumes normalized agent outputs.',
    };
  }

  return {
    projectSummary: 'Debug-mode synthetic plan: the app flow demonstrates project intake, staged analysis, and report synthesis.',
    totalEstimatedHours: 28,
    suggestedTimeline: '1-2 weeks with a team of 2',
    milestones: [
      {
        name: 'Milestone 1: Intake + Pipeline',
        description: 'Enable project creation and sequential pipeline orchestration.',
        tasks: ['TASK-001', 'TASK-002'],
        estimatedDuration: '1 week',
        priority: 1,
        deliverables: ['Project intake flow', 'Working stage orchestration'],
      },
      {
        name: 'Milestone 2: Reporting + Polish',
        description: 'Render outputs and finalize UX quality.',
        tasks: ['TASK-003'],
        estimatedDuration: '3-4 days',
        priority: 2,
        deliverables: ['Results dashboard', 'QA-ready polish'],
      },
    ],
    risks: [
      {
        description: 'Schema drift between stages can break rendering.',
        probability: 'medium',
        impact: 'high',
        mitigation: 'Enforce output validation per stage.',
        owner: 'Tech Lead',
      },
      {
        description: 'Scope growth during implementation may delay delivery.',
        probability: 'medium',
        impact: 'medium',
        mitigation: 'Gate new requests into post-MVP backlog.',
        owner: 'Project Manager',
      },
      {
        description: 'Insufficient test coverage can hide integration regressions.',
        probability: 'low',
        impact: 'high',
        mitigation: 'Automate smoke tests across all stage outputs.',
        owner: 'QA Engineer',
      },
    ],
    recommendations: [
      'Keep stage contracts stable and versioned.',
      'Track stage timing metrics for performance tuning.',
      'Use a demo/debug mode for rapid UI validation.',
    ],
    teamSuggestions: '1 frontend engineer, 1 full-stack engineer, and shared QA support.',
  };
}

export function useSSE() {
  const [pipelineStatus, setPipelineStatus] = useState('idle');
  const [agentOutputs, setAgentOutputs] = useState({});
  const [activeAgent, setActiveAgent] = useState(null);
  const [error, setError] = useState(null);
  const [completedAgents, setCompletedAgents] = useState([]);
  const abortRef = useRef(null);

  const startPipeline = useCallback(async (rawInput) => {
    if (!rawInput) return;

    setAgentOutputs({});
    setActiveAgent(null);
    setCompletedAgents([]);
    setError(null);
    setPipelineStatus('running');

    const abortController = new AbortController();
    abortRef.current = abortController;
    const previousOutputs = {};

    try {
      if (flags.mockPipeline) {
        setActiveAgent({ agent: 'mocking', stage: 1 });
        await wait(MOCKING_STAGE_DELAY, abortController.signal);

        for (const agentName of AGENT_ORDER) {
          if (abortController.signal.aborted) break;

          setActiveAgent({
            agent: agentName,
            stage: AGENT_ORDER.indexOf(agentName) + 2,
          });

          await wait(AGENT_MOCK_DELAY, abortController.signal);
          const output = createMockOutput(agentName, rawInput, previousOutputs);
          const data = { agent: agentName, output };
          previousOutputs[agentName] = output;
          setAgentOutputs(prev => ({ ...prev, [agentName]: data }));
          setCompletedAgents(prev => [...prev, agentName]);
        }

        setPipelineStatus('completed');
        setActiveAgent(null);
        return;
      }

      for (const agentName of AGENT_ORDER) {
        if (abortController.signal.aborted) break;

        setActiveAgent({
          agent: agentName,
          stage: AGENT_ORDER.indexOf(agentName) + 1,
        });

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawInput, agentName, previousOutputs }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Agent ${agentName} failed`);
        }

        const data = await res.json();
        previousOutputs[agentName] = data.output;

        setAgentOutputs(prev => ({ ...prev, [agentName]: data }));
        setCompletedAgents(prev => [...prev, agentName]);
      }

      setPipelineStatus('completed');
      setActiveAgent(null);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      setPipelineStatus('error');
      setActiveAgent(null);
    }
  }, []);

  const stopPipeline = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setAgentOutputs({});
    setCompletedAgents([]);
    setActiveAgent(null);
    setError(null);
    setPipelineStatus('idle');
  }, []);

  return {
    startPipeline,
    stopPipeline,
    pipelineStatus,
    agentOutputs,
    activeAgent,
    completedAgents,
    error,
    setPipelineStatus,
  };
}
