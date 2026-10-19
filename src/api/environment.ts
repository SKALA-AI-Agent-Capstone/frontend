export type Probe = {
  status: 'ok' | 'down'
  reason?: string
  tools?: string[]
}

export type Environment = {
  service: 'api'
  contract_version: string
  mode: 'development-scaffold'
  dependencies: {
    application_database: Probe
    agent: Probe
    agent_environment?: {
      dependencies: {
        agent_database: Probe
        business_mcp: Probe
        rag_mcp: Probe
      }
    }
  }
}

export async function fetchEnvironment(): Promise<Environment> {
  const response = await fetch('/api/dev/status', { signal: AbortSignal.timeout(12000) })
  if (!response.ok) throw new Error('API 요청이 실패했습니다.')
  const data: unknown = await response.json()
  if (
    !data || typeof data !== 'object' ||
    !('service' in data) || data.service !== 'api' ||
    !('dependencies' in data) || !data.dependencies
  ) {
    throw new Error('API 응답 형식을 확인해 주세요.')
  }
  return data as Environment
}
