import { useState, useCallback, useRef } from 'react';

const AGENT_ORDER = ['aria', 'quinn', 'rex', 'sage'];

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
