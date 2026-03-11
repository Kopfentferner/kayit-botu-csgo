const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Bot aktif");
});

app.listen(3000, () => {
  console.log("Web server aktif");
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`${client.user.tag} aktif`);
});


// ROL IDLERİ
const kayitRolID = "1253313874342711337"; // LÜTFEN KAYIT OLUNUZ
const haramilerRolID = "1253327741063794771"; // Haramiler


// Sunucuya girince mesaj
client.on("guildMemberAdd", member => {

  const kanal = member.guild.systemChannel;
  if (!kanal) return;

  kanal.send(
`Hoş geldin ${member}

Kayıt olmak için şu komutu kullan:

!kayıt isim nickname yaş

Örnek:
!kayıt semih cahsenmay 18`
  );

});


// kayıt komutu
client.on("messageCreate", async message => {

  if (message.author.bot) return;
  if (!message.content.startsWith("!kayıt")) return;

  // sadece kayıt rolü olanlar kullanabilir
  if (!message.member.roles.cache.has(kayitRolID)) {
    return message.reply("Kayıt rolüne sahip değilsin.");
  }

  const args = message.content.split(" ");

  if (args.length < 4) {
    return message.reply("Doğru kullanım: !kayıt isim nickname yaş");
  }

  let isim = args[1];
  let nickname = args[2];
  let yas = args[3];

  isim = isim.charAt(0).toUpperCase() + isim.slice(1);
  nickname = nickname.charAt(0).toUpperCase() + nickname.slice(1);

  const yeniNick = `${isim} | ${nickname} #${yas}`;

  try {

    await message.member.setNickname(yeniNick);

    await message.member.roles.remove(kayitRolID);
    await message.member.roles.add(haramilerRolID);

    message.reply(`✅ Kayıt tamamlandı.

Yeni adın: ${yeniNick}`);

  } catch (err) {

    message.reply("Nick veya rol değiştirme yetkim yok.");

  }

});

client.login(process.env.TOKEN);