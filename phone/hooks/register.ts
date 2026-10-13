import type { Register } from 'claude-code'
import { chunk, envValue } from './discord.ts'

const DESCRIPTION = [
  "Sends a message to the user's phone, as a Discord message from their bot.",
  'Use it whenever the user asks to send them something, message them, text',
  'them, ping them, notify them, or show or view something on their phone.',
  'Put the content itself in `message` (Discord markdown; long text is split',
  'into several messages), not a pointer to it.',
].join(' ')

export const register: Register = (on, options) => {
  const channelId = String(options.channelId)
  const envFile = String(options.envFile)

  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: 'send',
      description: DESCRIPTION,
      isDeferred: false,
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'What to send' },
        },
        required: ['message'],
      },
    })
    return next(e)
  })

  on('tool.call', { tool: 'mcp__phone__send' }, async ($, e) => {
    const message = String((e as { message?: unknown }).message ?? '')
    const pieces = chunk(message)
    if (pieces.length === 0) return { deny: 'message is empty' }

    const token = (await $.env.get('DISCORD_BOT_TOKEN')) ||
      envValue(await $.fs.read(envFile).catch(() => ''), 'DISCORD_BOT_TOKEN')
    if (!token) return { deny: `DISCORD_BOT_TOKEN is not set or in ${envFile}` }

    for (const [i, content] of pieces.entries()) {
      const res = await $.http.fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bot ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
        })
      if (!res.ok) {
        return { deny: `Discord refused message ${i + 1}/${pieces.length}: ` +
          `${res.status} ${res.text.slice(0, 300)}` }
      }
    }
    return { result: `Sent to Discord channel ${channelId} ` +
      `(${pieces.length} message${pieces.length === 1 ? '' : 's'}).` }
  }).catch(($, e, next, err) =>
    ({ deny: `phone: sending failed: ${String(err)}` }))
}
