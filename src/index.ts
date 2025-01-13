import { config } from 'dotenv'
import discord, { ActivityType } from 'discord.js'
import { resolve } from 'path'
// import { init as dbInit } from "./database/databaseConnection";
import { EventLoader } from './loaders/EventLoader'
import './utils/prototypeFunctions'
import { readFileSync } from 'fs'

config({ path: resolve(__dirname, '../.env') })
let clientOptions: discord.ClientOptions = {
  intents: ['GuildMembers', 'Guilds', 'GuildVoiceStates'],
  presence: {
    status: 'dnd',
    activities: [
      {
        type: ActivityType.Watching,
        name: 'Boot Process'
      }
    ]
  }
}

export const client = new discord.Client(clientOptions)
// dbInit().then(async () => {
EventLoader.loadEvents()
  .then(() => {
    client.login(process.env.DISCORD_BOT_TOKEN)
  })
  .catch(console.error)
// });
