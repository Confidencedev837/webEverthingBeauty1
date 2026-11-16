// services/navigationState.ts
// Robust navigation context and state persistence for Everything Beauty

import { useState, useEffect } from 'react';

const LAST_AGENT_KEY = 'eb_nav_last_agent_id';
const LAST_SERVICE_KEY = 'eb_nav_last_service_id';
const AGENTS_FILTER_KEY = 'eb_nav_agents_filter';
const SERVICES_FILTER_KEY = 'eb_nav_services_filter';

export interface AgentsFilterState {
  search: string;
  specialty: string;
  sortBy: string;
  visibleCount: number;
}

export interface ServicesFilterState {
  search: string;
  category: string;
  sortBy: string;
  priceRange: string;
  page: number;
}

export function getLastAgentId(): string | null {
  try {
    return sessionStorage.getItem(LAST_AGENT_KEY);
  } catch {
    return null;
  }
}

export function setLastAgentId(id: string): void {
  if (!id) return;
  try {
    sessionStorage.setItem(LAST_AGENT_KEY, id);
    window.dispatchEvent(new CustomEvent('eb:nav-updated', { detail: { lastAgentId: id } }));
  } catch {}
}

export function clearLastAgentId(): void {
  try {
    sessionStorage.removeItem(LAST_AGENT_KEY);
    window.dispatchEvent(new CustomEvent('eb:nav-updated', { detail: { lastAgentId: null } }));
  } catch {}
}

export function getLastServiceId(): string | null {
  try {
    return sessionStorage.getItem(LAST_SERVICE_KEY);
  } catch {
    return null;
  }
}

export function setLastServiceId(id: string): void {
  if (!id) return;
  try {
    sessionStorage.setItem(LAST_SERVICE_KEY, id);
    window.dispatchEvent(new CustomEvent('eb:nav-updated', { detail: { lastServiceId: id } }));
  } catch {}
}

export function clearLastServiceId(): void {
  try {
    sessionStorage.removeItem(LAST_SERVICE_KEY);
    window.dispatchEvent(new CustomEvent('eb:nav-updated', { detail: { lastServiceId: null } }));
  } catch {}
}

export function getAgentsFilterState(): AgentsFilterState | null {
  try {
    const raw = sessionStorage.getItem(AGENTS_FILTER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAgentsFilterState(state: AgentsFilterState): void {
  try {
    sessionStorage.setItem(AGENTS_FILTER_KEY, JSON.stringify(state));
  } catch {}
}

export function getServicesFilterState(): ServicesFilterState | null {
  try {
    const raw = sessionStorage.getItem(SERVICES_FILTER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setServicesFilterState(state: ServicesFilterState): void {
  try {
    sessionStorage.setItem(SERVICES_FILTER_KEY, JSON.stringify(state));
  } catch {}
}

export function useNavigationState() {
  const [lastAgentId, setAgentIdState] = useState<string | null>(getLastAgentId());
  const [lastServiceId, setServiceIdState] = useState<string | null>(getLastServiceId());

  useEffect(() => {
    const handleUpdate = () => {
      setAgentIdState(getLastAgentId());
      setServiceIdState(getLastServiceId());
    };

    window.addEventListener('eb:nav-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('eb:nav-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    lastAgentId,
    lastServiceId,
    setLastAgent: setLastAgentId,
    clearLastAgent: clearLastAgentId,
    setLastService: setLastServiceId,
    clearLastService: clearLastServiceId
  };
}
