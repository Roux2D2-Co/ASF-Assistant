import { bold, Client, GuildMember } from 'discord.js'
import { GenerateMemberJoinImage } from '../utils/customImages'
import { readFileSync, existsSync } from 'fs'

export default async (
  client: Client,
  newMember: GuildMember,
) => {
  try {
    const guildSettings = client.config[newMember.guild.id];
    if(!guildSettings) return console.error(`Pas de config trouvé pour le serveur ${newMember.guild.name}`)
    const welcomeChannel = await newMember.guild.channels.fetch(guildSettings.NEW_MEMBER_CHANNEL_ID)
    const welcomeImagePath = await GenerateMemberJoinImage(newMember)
    const welcomeImage = readFileSync(welcomeImagePath)
    if (welcomeChannel!.isSendable()) {
      welcomeChannel.send({
        files: [welcomeImage],
        content: bold(
          guildSettings.NEW_MEMBER_WELCOME_MESSAGE.replace("{{member}}", newMember.toString())
        )
      })
    } else {
      console.error(`Can't send message in channel ${welcomeChannel}`)
    }
  } catch (err: any) {
    console.error(err)
  }
}
