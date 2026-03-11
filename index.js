const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();
// Render'ın dinamik portunu kullan, yoksa yerelde 3000 portunu aç
const port = process.env.PORT || 3000;

// Uptime Robot'un ping atması için gereken ana sayfa
app.get("/", (req, res) => {
  res.send("Bot 7/24 Aktif!");
});

app.listen(port, () => {
  console.log(`Web server ${port} portunda aktif.`);
});

// Bot ayarları ve Intentler (Hassas izinler dahil)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Mesajları okumak için (Panelden açılmalı)
    GatewayIntentBits.GuildMembers    // Üye katılımını görmek için (Panelden açılmalı)
  ]
});

// Bot hazır olduğunda çalışır
client.once("ready", () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);
});

// ROL IDLERİ (Senin verdiğin ID'ler)
const kayitRolID = "1253313874342711337"; // LÜTFEN KAYIT OLUNUZ
const haramilerRolID = "1253327741063794771"; // Haramiler

// Sunucuya yeni birisi girince
client.on("guildMemberAdd", async (member) => {
  const kanal = member.guild.systemChannel;
  if (!kanal) return;

  try {
    await kanal.send(
      `Hoş geldin ${member}\n\nKayıt olmak için şu komutu kullan:\n\n!kayıt isim nickname yaş\n\nÖrnek:\n!kayıt semih cahsenmay 18`
    );
  } catch (err) {
    console.error("Hoş geldin mesajı gönderilemedi:", err);
  }
});

// Kayıt komutu işleyicisi
client.on("messageCreate", async (message) => {
  // Bot mesajlarını ve !kayıt ile başlamayanları görmezden gel
  if (message.author.bot || !message.content.startsWith("!kayıt")) return;

  // Sadece kayıt rolü olanlar kullanabilir
  if (!message.member.roles.cache.has(kayitRolID)) {
    return message.reply("Zaten kayıtlısın veya kayıt rolüne sahip değilsin.");
  }

  const args = message.content.split(" ");

  // Argüman kontrolü (!kayıt + isim + nick + yaş = 4 parça)
  if (args.length < 4) {
    return message.reply("⚠️ Doğru kullanım: `!kayıt isim nickname yaş` \nÖrnek: `!kayıt semih cahsenmay 18` ");
  }

  let isim = args[1];
  let nickname = args[2];
  let yas = args[3];

  // İlk harfleri büyük yapma
  isim = isim.charAt(0).toUpperCase() + isim.slice(1);
  nickname = nickname.charAt(0).toUpperCase() + nickname.slice(1);

  const yeniNick = `${isim} | ${nickname} #${yas}`;

  try {
    // 1. Nickname değiştir
    await message.member.setNickname(yeniNick);

    // 2. Eski rolü al, yeni rolü ver
    await message.member.roles.remove(kayitRolID);
    await message.member.roles.add(haramilerRolID);

    message.reply(`✅ Kayıt tamamlandı.\n\nHoş geldin, yeni adın: **${yeniNick}**`);

  } catch (err) {
    console.error(err);
    message.reply("❌ Bir hata oluştu! Yetkimin senin rolünden daha üstte olduğundan emin ol.");
  }
});

// Render'daki Environment Variables kısmına 'TOKEN' adıyla eklemeyi unutma
client.login(process.env.TOKEN);