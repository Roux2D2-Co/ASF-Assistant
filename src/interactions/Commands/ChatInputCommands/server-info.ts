import {
  ChatInputApplicationCommandData,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  InteractionContextType,
  Snowflake,
  EmbedBuilder
} from 'discord.js'

export default {
  name: 'server-info',
  description: 'Donne des informations sur le serveur',
  contexts: [InteractionContextType.Guild],

  async execute (interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      interaction.reply({
        content:
          "Erreur, il semblerait que vous n'exécutiez pas cette commande dans un serveur",
        ephemeral: true
      })
      return
    }

    await interaction.deferReply({ ephemeral: true })

    const guildMembers = await interaction.guild.members.fetch()

    const botEmojis = {
      serverMute: await interaction.client.application.emojis.fetch(
        '1328058647519035456'
      ),
      serverDeaf: await interaction.client.application.emojis.fetch(
        '1328058614392426506'
      ),
      selfMute: await interaction.client.application.emojis.fetch(
        '1328058536198144020'
      ),
      selfDeaf: await interaction.client.application.emojis.fetch(
        '1328058479927103552'
      ),
      streaming: await interaction.client.application.emojis.fetch(
        '1328058583807557726'
      ),
      selfVideo: await interaction.client.application.emojis.fetch(
        '1328058454941761649'
      )
    }

    let voiceChannels: { [key: Snowflake]: string[] } = {}
    for (const [, member] of guildMembers) {
      if (!member.voice || !member.voice.channelId) continue

      let memberVoiceStatus = member.toString()

      if (member.voice.selfMute) memberVoiceStatus += ` ${botEmojis.selfMute}`
      if (member.voice.serverMute)
        memberVoiceStatus += ` ${botEmojis.serverMute}`
      if (member.voice.selfDeaf) memberVoiceStatus += ` ${botEmojis.selfDeaf}`
      if (member.voice.serverDeaf)
        memberVoiceStatus += ` ${botEmojis.serverDeaf}`
      if (member.voice.streaming) memberVoiceStatus += ` ${botEmojis.streaming}`
      if (member.voice.selfVideo) memberVoiceStatus += ` ${botEmojis.selfVideo}`

      voiceChannels[member.voice.channelId] ??= []
      voiceChannels[member.voice.channelId].push(memberVoiceStatus)
    }

    if (Object.keys(voiceChannels).length === 0) {
      interaction.editReply({
        content: "Il semblerait qu'aucun membre ne soit en vocal en ce moment"
      })
      return
    }

    const embed = new EmbedBuilder()
    embed.setAuthor({
      name: interaction.guild.name,
      iconURL: interaction.guild.iconURL()!
    })
    embed.setTitle('Récapitulatif des gens en vocal')

    const totalMemberInVoiceChannel = Object.values(voiceChannels)
      .map(members => members.length)
      .reduce((sum, mLength) => sum + mLength)
    embed.setFooter({
      text: `Total : ${totalMemberInVoiceChannel}`
    })

    for (const [voiceChannelId, voiceChannelMembers] of Object.entries(
      voiceChannels
    )) {
      const voiceChannel = interaction.guild.channels.resolve(voiceChannelId)
      if (!voiceChannel) continue

      embed.addFields({
        name: voiceChannel.name,
        value: voiceChannelMembers.join('\n'),
        inline: true
      })
    }

    interaction.editReply({
      content: '_ _',
      embeds: [embed]
    })
  },
  type: ApplicationCommandType.ChatInput
} as ChatInputApplicationCommandData
