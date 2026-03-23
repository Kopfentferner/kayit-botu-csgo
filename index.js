const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require("discord.js");

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot 7/24 Aktif!");
});

app.listen(port, () => {
  console.log(`Web server ${port} portunda aktif.`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);
});

// IDLER
const kayitRolID = "1253313874342711337";
const haramilerRolID = "1253327741063794771";
const kayitKanalID = "1253302712431284306";
const hosgeldinKanalID = "1253308165790109788";
const logKanalID = "1466030876709359680";

// 🔥 DUPLICATE ENGELLEME
const processedMembers = new Set();

client.on("guildMemberAdd", async (member) => {

  // Eğer zaten işlendi ise tekrar yapma
  if (processedMembers.has(member.id)) return;

  processedMembers.add(member.id);

  // 10 saniye sonra listeden sil (hafıza dolmasın)
  setTimeout(() => {
    processedMembers.delete(member.id);
  }, 10000);

  const hosgeldin = member.guild.channels.cache.get(hosgeldinKanalID);
  const kayitKanal = member.guild.channels.cache.get(kayitKanalID);

  // HOŞ GELDİN
  if (hosgeldin) {
    hosgeldin.send(`🎉 **Sunucumuza hoş geldin ${member}!**

🔹 Kırk Haramiler ailesine katıldın!
🔹 Kayıt olmak için aşağıdaki butona tıkla

🎮 İyi eğlenceler!`);
  }

  // BUTON
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("kayit_baslat")
      .setLabel("Kayıt Ol")
      .setStyle(ButtonStyle.Success)
  );

  if (kayitKanal) {
    kayitKanal.send({
      content: `👋 ${member} kayıt olmak için butona bas!`,
      components: [row]
    });
  }
});

// BUTON & MODAL
client.on(Events.InteractionCreate, async (interaction) => {

  if (interaction.isButton() && interaction.customId === "kayit_baslat") {

    const modal = new ModalBuilder()
      .setCustomId("kayit_modal")
      .setTitle("Kayıt Formu");

    const isimInput = new TextInputBuilder()
      .setCustomId("isim")
      .setLabel("İsim")
      .setStyle(TextInputStyle.Short);

    const nickInput = new TextInputBuilder()
      .setCustomId("nick")
      .setLabel("Nickname")
      .setStyle(TextInputStyle.Short);

    const yasInput = new TextInputBuilder()
      .setCustomId("yas")
      .setLabel("Yaş")
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder().addComponents(isimInput),
      new ActionRowBuilder().addComponents(nickInput),
      new ActionRowBuilder().addComponents(yasInput)
    );

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === "kayit_modal") {

    let isim = interaction.fields.getTextInputValue("isim");
    let nick = interaction.fields.getTextInputValue("nick");
    let yas = interaction.fields.getTextInputValue("yas");

    isim = isim.charAt(0).toUpperCase() + isim.slice(1);
    nick = nick.charAt(0).toUpperCase() + nick.slice(1);

    const yeniNick = `${isim} | ${nick} #${yas}`;

    try {
      await interaction.member.setNickname(yeniNick);

      await interaction.member.roles.remove(kayitRolID).catch(() => {});
      await interaction.member.roles.add(haramilerRolID);

      await interaction.reply({
        content: `✅ Kayıt tamamlandı!\nYeni adın: **${yeniNick}**`,
        ephemeral: true
      });

      const logKanal = interaction.guild.channels.cache.get(logKanalID);
      if (logKanal) {
        logKanal.send(`📥 **Yeni Kayıt**
👤 Kullanıcı: ${interaction.user}
📝 İsim: ${isim}
🎮 Nick: ${nick}
🎂 Yaş: ${yas}`);
      }

    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "❌ Hata oluştu! Yetkileri kontrol et.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);