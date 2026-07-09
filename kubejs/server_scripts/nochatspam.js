ServerEvents.loaded(event => {
  event.server.runCommandSilent('scoreboard players set #stellarity.config stellarity.config.join_message 0')
  event.server.runCommandSilent('scoreboard players set #stellarity.config stellarity.config.always_generate_egg 1')
})