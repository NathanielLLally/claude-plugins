# claude-plugins

Personal Claude Code plugins.

## phone

Lets Claude send you messages on Discord (and so on your phone): "send me…",
"message me…", "show me on my phone…". Posts through the pipeline's Discord
bot to channel 1559588814262116362.

Install, in a Claude Code session:

```
/plugin install phone --marketplace NathanielLLally/claude-plugins
```

Needs `DISCORD_BOT_TOKEN` in the environment (e.g. exported in `~/.bashrc`),
or `envFile` set with `/plugin configure phone@local` to a dotenv file that
holds it.

Update after a push: `claude plugin update phone@local`, then `/reload-plugins`.
