import { Client } from "discord.js";
import { Loader } from "../loaders/CommandsLoader";
import { InteractionHandler } from "../handlers/InteractionHandler";
import {readFileSync, readdirSync} from "fs"

export default async (client: Client) => {
	client.config ??= {}
	const guildConfigsFilePath = `assets/configs`
	for(const file of readdirSync(guildConfigsFilePath)){
		client.config[file.split(".")[0]] = JSON.parse(readFileSync(`${guildConfigsFilePath}/${file}`, "utf-8"))
	}
	
	client.user?.setPresence({ activities: [], status: "online" });
	console.log(`Logged in as ${client?.user?.tag} !`);
	await Loader.loadCommands({ deleteUnknownCommands: true }).catch(console.error);
	// await Loader.loadComponents().catch(console.error);
	InteractionHandler.start();
};
