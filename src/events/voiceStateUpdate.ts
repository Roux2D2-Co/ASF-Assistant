import {
  BaseGuildVoiceChannel,
  ChannelType,
  Client,
  VoiceState
} from 'discord.js'
import { intToRoman, romanToInt } from '../utils/utils'

export default async (
  client: Client,
  oldState: VoiceState,
  newState: VoiceState
) => {
  if (!!oldState.channelId) {
    //if member disconnected from a channel loop through generator and delete empty channels matching the name pattern
    const guildVoiceChannels = (await oldState.guild.channels.fetch()).filter(
      channel => channel?.type === ChannelType.GuildVoice
    )

    for (const voiceChannelGenerator of client.config[oldState.guild.id]
      .VOICE_CHANNEL_GENERATORS ?? []) {
      const generatorChannel = oldState.guild.channels.resolve(
        voiceChannelGenerator.generatorId
      )
      if (!generatorChannel) {
        console.error(
          `VoiceChannelGenerator ${voiceChannelGenerator.generatorId} n'est pas disponible sur le serveur ${oldState.guild.id}`
        )
        continue
      }

      const templateNameRegex = new RegExp(
        voiceChannelGenerator.nameTemplate.replace(
          '{{number}}',
          '(?<number>[\ud835\udc0c\udc02\udc03\udc17\udc0b\udc08\udc15]+)'
        )
      )

      const generatorEmptyChildChannels = guildVoiceChannels
        .values()
        .filter(chan => !!chan.name.match(templateNameRegex) && chan.members.size === 0)

      for (const emptyChannel of generatorEmptyChildChannels) {
        //More verifications to be sure to not delete wrong channels
        if (emptyChannel.parentId === generatorChannel.parentId) {
          const emptyChannelRomanNumber = templateNameRegex.exec(
            emptyChannel.name
          )?.groups?.number
          if (!!emptyChannelRomanNumber) {
            const emptyChannelNumber = romanToInt(emptyChannelRomanNumber)
            voiceChannelGenerator.childs ??= [true]
            voiceChannelGenerator.childs[emptyChannelNumber] = false
          }
          emptyChannel.deletable && emptyChannel.delete()
        }
      }
    }
  }

  if (!!newState.channelId) {
    //if a member joined a channel
    for (const voiceChannelGenerator of client.config[newState.guild.id]
      .VOICE_CHANNEL_GENERATORS ?? []) {
      if (voiceChannelGenerator.generatorId === newState.channelId) {
        const generatorChannel = newState.guild.channels.resolve(
          voiceChannelGenerator.generatorId
        ) as BaseGuildVoiceChannel

        if (!generatorChannel) continue

        //Create childs array if it doesn't exists
        voiceChannelGenerator.childs ??= [true]
        
        let newChannelNumber = voiceChannelGenerator.childs.findIndex(
          bool => !bool
        )
        if (newChannelNumber < 0) {
          newChannelNumber = voiceChannelGenerator.childs.length
          voiceChannelGenerator.childs.push(true)
        }

        const newChannelName = voiceChannelGenerator.nameTemplate.replace(
          '{{number}}',
          intToRoman(newChannelNumber)
        )

        newState.guild.channels
          .create({
            name: newChannelName,
            type: ChannelType.GuildVoice,
            position: generatorChannel.rawPosition,
            parent: generatorChannel.parentId,
            permissionOverwrites: generatorChannel.permissionOverwrites.cache
          })
          .then(async newChannel => {
            await newState.setChannel(newChannel.id)
          })
      }
    }
  }
}
