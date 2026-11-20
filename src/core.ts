/**
 * Pure, dependency-free core for dsh-plugin-handoff-pack (Handoff & Migration Pack).
 * Reads only metadata from session events; never prompts, tool bodies or file contents.
 */

const SECRET_RE = /((?:token|key|secret|password|authorization|bearer)[^\s:=]{0,24}[:=]\s*)[^\s&]+/gi
const QUERY_RE = /([?&](?:token|key|secret|password|auth)=)[^&#\s]+/gi
/** Strip credential-looking substrings before anything is printed. */
export function redact(value: unknown): string {
  const text = value instanceof Error ? value.stack || value.message : String(value)
  return text.replace(SECRET_RE, '$1[redacted]').replace(QUERY_RE, '$1[redacted]')
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function analyze(events: readonly unknown[]): any {
  const list = Array.isArray(events) ? events : []
  const artifacts = new Set()
  const decisions: any[] = []
  const errors: any[] = []
  for (const e of list) {
    if (!isRecord(e) || !isRecord(e.data)) continue
    if (typeof e.data.path === 'string') artifacts.add(e.data.path)
    if (typeof e.type === 'string' && (e.type.includes('error') || e.type.includes('fail'))) {
      errors.push(typeof e.type === 'string' ? e.type : 'error')
    }
    if (typeof e.data.text === 'string' && /\b(decided|chose|agreed)\b/i.test(e.data.text)) {
      decisions.push(e.data.text.slice(0, 120))
    }
  }
  return {
    sampledEvents: list.length,
    brief: 'task handoff generated from ' + list.length + ' event(s)',
    artifacts: [...artifacts].slice(0, 20),
    decisions: decisions.slice(0, 12),
    openItems: errors.slice(0, 12),
    redaction: 'all values passed through the redactor',
  }
}

export function formatReport(a: any, opts: { json?: boolean } = {}): string {
  if (opts.json) return JSON.stringify(a, null, 2)
  const head = '[handoff] ' + a.artifacts.length + ' artifact(s), ' + a.decisions.length +
    ' decision(s), ' + a.openItems.length + ' open item(s)'
  const lines = [
    '  brief: ' + a.brief,
    ...a.artifacts.slice(0, 8).map(p => '  artifact: ' + redact(p)),
    ...a.decisions.slice(0, 6).map(d => '  decision: ' + redact(d)),
    ...a.openItems.slice(0, 6).map(o => '  open: ' + redact(o)),
    '  ' + a.redaction,
  ]
  return [head, ...lines].join('\n')
}
