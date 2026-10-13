import { expect, mock, test } from 'claude-code/testing'
import { chunk, envValue } from '../hooks/discord.ts'

const OK = { value: { status: 200, ok: true, headers: {}, text: '{}' } }

test('posts the message to the configured channel with the bot token', async ($, on) => {
  mock.env(on, { DISCORD_BOT_TOKEN: 'tok' })
  const sent: { url: string, init: any }[] = []
  on('http.fetch', ($, e) => { sent.push(e as any); return OK })

  const r = await $.tool.call({ tool: 'mcp__phone__send', message: 'hello' } as any)

  expect(r.deny).toBeUndefined()
  expect(sent.length).toBe(1)
  expect(sent[0].url).toBe('https://discord.com/api/v10/channels/1559588814262116362/messages')
  expect(sent[0].init.headers.Authorization).toBe('Bot tok')
  expect(JSON.parse(sent[0].init.body).content).toBe('hello')
})

test('falls back to the env file for the token', async ($, on) => {
  mock.env(on, {})
  on('fs.read', () => ({ value: 'export DISCORD_BOT_TOKEN=fromfile\n' }))
  const sent: any[] = []
  on('http.fetch', ($, e) => { sent.push(e); return OK })

  await $.tool.call({ tool: 'mcp__phone__send', message: 'x' } as any)

  expect(sent[0].init.headers.Authorization).toBe('Bot fromfile')
})

test('reports a Discord refusal', async ($, on) => {
  mock.env(on, { DISCORD_BOT_TOKEN: 'tok' })
  on('http.fetch', () => ({ value: { status: 403, ok: false, headers: {}, text: 'Missing Access' } }))

  const r = await $.tool.call({ tool: 'mcp__phone__send', message: 'x' } as any)

  expect(String(r.deny ?? r.text)).toContain('403')
})

test('splits long messages and parses dotenv lines', () => {
  const long = ('a'.repeat(1500) + '\n').repeat(3)
  const pieces = chunk(long)
  expect(pieces.length).toBe(3)
  for (const p of pieces) expect(p.length <= 2000).toBe(true)
  expect(envValue('#export K=old\nexport K="new"\n', 'K')).toBe('new')
  expect(envValue('OTHER=1', 'K')).toBeUndefined()
})
