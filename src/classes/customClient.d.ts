import {
  ApplicationCommandType,
  Client,
  Collection,
  InteractionType
} from 'discord.js'

declare module 'discord.js' {
  export interface Client {
    localComponents: Collection<string, BaseComponentData>
    localCommands: Collection<
      ApplicationCommandType,
      Collection<string, ApplicationCommandData>
    >
    config: { [key: GuildResolvable]: CustomConfig }
  }
}

type CustomConfig = {
  NEW_MEMBER_CHANNEL_ID: string
  NEW_MEMBER_WELCOME_MESSAGE: string
  VOICE_CHANNEL_GENERATORS?: VoiceChannelGenerator[]
}

type VoiceChannelGenerator = {
  generatorId: string
  nameTemplate: string
  childs: boolean[]
}
