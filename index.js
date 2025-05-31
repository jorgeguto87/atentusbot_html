const https = require ('https');
const express = require('express');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const cors = require('cors');
const { Client, LocalAuth, MessageTypes, MessageMedia } = require('whatsapp-web.js');

const app = express();
const PORT = 3001;

let qrBase64 = '';
let isConnected = false;

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "atentus" }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

app.use(cors({
  origin: 'https://atentus.com.br',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

//credenciais ssl
const credentials = {
    key: fs.readFileSync('/etc/letsencrypt/live/atentus.com.br/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/atentus.com.br/fullchain.pem')
};

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/index', (req, res) => {
  console.log('🔍 Acessaram a página do QR code');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/status', (req, res) => {
    res.json({
      connected: isConnected,
      qr: qrBase64
    });
  });
  
  client.on('qr', async qr => {
    qrBase64 = await qrcode.toDataURL(qr);
    isConnected = false;
    console.log('📲 Novo QR Code gerado.');
  });
  
  client.on('ready', () => {
    isConnected = true;
    qrBase64 = '';
    console.log('✅ Chatbot conectado com sucesso!');
  });
  
  client.on('auth_failure', msg => {
    isConnected = false;
    console.error('❌ Falha de autenticação:', msg);
  });
  
  client.on('disconnected', reason => {
    isConnected = false;
    qrBase64 = '';
    console.log('🔌 Desconectado do WhatsApp:', reason);
  });
  
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(PORT, () => {
    console.log(`🌐 Servidor iniciado em http://localhost:${PORT}`);
  });
  
  client.initialize();


function saudacao() {
  const data = new Date();
  let hora = data.getHours();
  let str = '';
  if (hora >= 9 && hora < 15) {
      str = '*Bom dia,*';
  } else if (hora >= 15 && hora < 21) {
      str = '*Boa tarde,*';
  } else {
      str = '*Boa noite,*';
  }
  return str;
};

function atendente(){
  const data = new Date();
  const hora = data.getHours();
  const dia = data.getDay();
  let str = '';

  if (dia > 0 && dia < 6 && hora > 11 && hora < 21){
      str = '⏳ *Aguarde um momento, por favor!*\n\n😃 Um de nossos atendentes irá atendê-lo(a) de forma exclusiva em instantes.';
  
  }else if (dia === 6 && hora > 11 && hora < 21){
      str = '⏳ *Aguarde um momento, por favor!*\n\n😃 Um de nossos atendentes irá atendê-lo(a) de forma exclusiva em instantes.';

  }else if(dia === 0){
      str = '🏖️ *Aproveite o Domingo!*\n\n🕗 *Nosso horário de atendimento:*\n*Seg à Sex:* _08:00 às 19:00hs_\n*Sáb:* _08:00hs às 19:00hs_';

  }else{
      str = '😕 *Ops! Nosso expediente já foi encerrado por hoje!*\n\n😃 Mas não se preocupe, assim que retornarmos iremos falar com você!\n\n🕗 *Nosso horário de atendimento:*\n*Seg à Sex:* _08:00 às 19:00hs_\n*Sáb:* _08:00hs às 19:00hs_';
  }
  return str;

};

const delay = ms => new Promise (res => setTimeout(res, ms));

const state = {};

client.on ('message', async msg => {

  if (msg.isGroup || msg.from.endsWith('@g.us')) {
      return;
  };

  // Funções auxiliares para envio de mensagens
  async function enviarMensagemTexto(texto) {
      await delay(3000);
      await chat.sendStateTyping();
      await delay(3000);
      await client.sendMessage(msg.from, texto);
  };

  async function enviarMensagemInicial(img, texto) {
      await delay(3000);
      await chat.sendStateTyping();
      await delay(3000);
      await client.sendMessage(msg.from, img, { caption: texto });
  };

  const from = msg.from;
  const mensagem = msg.body || msg.from.endsWith('@c.us');
  const chat = await msg.getChat();
  const contato = await msg.getContact();
  const nome = contato.pushname;
  const saudacoes = ['oi', 'bom dia', 'boa tarde', 'olá', 'Olá', 'Oi', 'Boa noite', 'Bom Dia', 'Bom dia', 'Boa Tarde', 'Boa tarde', 'Boa Noite', 'boa noite'];
  const logo = MessageMedia.fromFilePath('./assets/logo_atentus.jpg');
  const sauda = saudacao();
  const atendimento = atendente();
  const mensagemInicial = `😃 ${sauda} ${nome}!\n\n*💻 Seja bem vindo a Atentus Cloud!*\n_Soluções tecnológicas e desenvolvimento de sistemas_\n\n🤖 *Como posso ajudar?*\n\n➡️ Por favor, digite o *NÚMERO* de uma das opções abaixo:\n\n1️⃣ *- Soluções*\n2️⃣ *- Já sou cliente*\n3️⃣ *- Falar com um especialista*\n4️⃣ *- Portifólio*\n5️⃣ *- Sair*`;
  const solucoes = MessageMedia.fromFilePath('./assets/img_solucoes.jpg');
  const portifolio = MessageMedia.fromFilePath('./assets/img_portifolio.jpg');
  const souCliente = MessageMedia.fromFilePath('./assets/img_cliente.jpg');
  const especialista = MessageMedia.fromFilePath('./assets/img_atendente.jpg');
  const chatBot = MessageMedia.fromFilePath('./assets/img_chatbots.png');
  const sistemas = MessageMedia.fromFilePath('./assets/img_sistemas.png');
  const sites = MessageMedia.fromFilePath('./assets/img_sites.png');
  const landing = MessageMedia.fromFilePath('./assets/img_landing.png');
  const app = MessageMedia.fromFilePath('./assets/img_app.png');
  const personalizados = MessageMedia.fromFilePath('./assets/img_personalizados.png');
  const suporteTecnico = MessageMedia.fromFilePath('./assets/img_suporte.jpg');
  const upgrade = MessageMedia.fromFilePath('./assets/img_upgrade.jpg');
  const hugoRosa = '5521981764373@c.us';
  const jorgeAugusto = '5521999363578@c.us';
  let mensagemCliente = [];
  const nomeContato = contato.pushname || contato.name || "Sem nome";
  const numeroContato = contato.number || msg.from;
  const MAX_ATTEMPTS = 3;
  
  if (!state[from]) state[from] = { attempts: 0, step: 0 };
  const userState = state[from];

  if (userState.step === 0) {
      if (saudacoes.some(palavra => msg.body.includes(palavra))) {
          state[from].step = 1;
          await enviarMensagemInicial(logo, mensagemInicial);
          return;
      }
  } else if (userState.step === 1) {
      switch (mensagem) {
          case "1":
              await enviarMensagemInicial (solucoes, '🤖 Aqui na *Atentus Cloud* você encontra as melhores soluções tecnológicas para otimizar o seu negócio!\n\nSelecione uma opção *ABAIXO!* 👇\n\n1️⃣ *- Chatbots de atendimento*\n2️⃣ *- Sistemas corporativos*\n3️⃣ *- Aplicativos Android/IOS*\n4️⃣ *- Sites e Lojas Virtuais*\n5️⃣ *- Landing pages para campanhas*\n6️⃣ *- Sistemas personalizados*\n7️⃣ *- Voltar ao menu principal*');
              state[from] = { step: 2 };
              return;

          case "2":
              await enviarMensagemInicial(souCliente, '🤖 *Excelente*\nPara agilizar o seu atendimento, escolha uma das opções *ABAIXO!* 👇\n\n1️⃣ *- Suporte técnico*\n2️⃣ *- Atualização de sistema*\n3️⃣ *- Falar com o desenvolvedor*\n4️⃣ *- Voltar ao menu principal*')
              state[from] = { step: 3 };
              return;

          case "3":
              await enviarMensagemInicial(especialista, '🤖 *Perfeito!*\nAntes de encaminhar a um especialista irei pedir que digite as seguintes informações:\n\n🔹 *- Nome da empresa*\n🔹 *- Tipo de projeto desejado*\n🔹 *- Nome para contato*\n\n*Após escrever as informações solicitadas digite:*\n0️⃣ para enviar\n1️⃣ para retornar ao menu principal.');
              state[from] = { step: 4 };
              return;

          case "4":
              await enviarMensagemInicial(portifolio, '🤖 *Conheça a nossa página exclusiva*\n\nhttp://atentus.cloud');
              await enviarMensagemTexto ('Veja também o nosso Instagram:\n\nhttps://www.instagram.com/atentus.cloud/');
              await enviarMensagemTexto('🤖 - *O que deseja fazer agora?*\n\n1️⃣ *- Falar com um especialista*\n2️⃣ *- Retornar ao menu principal*\n3️⃣ *- Sair*');
              state[from] = { step: 5 };
              return;

          case "5":
              await enviarMensagemTexto('🤖 - *Agradecemos a sua visita*\n_Até a próxima!_ 👋');
              delete state[from];
              return;

          default:
              if (userState.attempts === undefined) userState.attempts = 0;
              userState.attempts++;
              const tentativasRestantes = MAX_ATTEMPTS - userState.attempts;
              if (userState.attempts >= MAX_ATTEMPTS) {
                  await client.sendMessage(
                      msg.from,
                      '❌ *Número de tentativas excedido!*\nAtendimento finalizado!\n\nDigite *Oi* para iniciar.'
                  );
                  state[from] = { step: 0, attempts: 0 };
                  delete state[from]; 
              } else {
                  await client.sendMessage(
                      msg.from,
                      `❌ *Opção inválida!*\nVocê tem mais ${tentativasRestantes} tentativa(s).`
                  );
              }
              return;
      }
  } else if (userState.step === 2) {
      switch (mensagem) {
          case "1":
              await enviarMensagemInicial(chatBot, '🤖 *Chatbots de Atendimento*\n\nAutomatize seu atendimento via *WhatsApp*, *Instagram*, *Telegram* ou *Facebook Messenger*.\n\n💬 Respostas automáticas, geração de leads, integração com sistemas, agendamentos e muito mais!\n\n✅ Ideal para empresas que querem escalar o atendimento com qualidade.\n\nO que deseja?\n\n1️⃣ - Quero esse serviço\n2️⃣ - Voltar às soluções\n3️⃣ - Menu principal\n4️⃣ - Sair');
              state[from] = { step: 6 };
              return;

          case "2":
              await enviarMensagemInicial(sistemas, '🏢 *Sistemas Corporativos Personalizados*\n\nDesenvolvemos sistemas sob medida para automatizar processos internos da sua empresa: *ERP, CRM, controle de estoque, financeiro, gestão de vendas* e muito mais!\n\n🛠️ Integramos com sistemas já existentes ou criamos do zero.\n\nDeseja:\n\n1️⃣ - Quero esse serviço\n2️⃣ - Voltar às soluções\n3️⃣ - Menu principal\n4️⃣ - Sair');
              state[from] = { step: 6 }; 
              return;

          case "3":
              await enviarMensagemInicial(app,'📱 *Aplicativos Android/iOS*\n\nDesenvolvemos apps profissionais com design moderno e funcionalidades exclusivas para o seu negócio.\n\n🚀 Ideal para delivery, agendamento de serviços, vendas, fidelização de clientes, etc.\n\nQuer saber mais?\n\n1️⃣ - Quero esse serviço\n2️⃣ - Voltar às soluções\n3️⃣ - Menu principal\n4️⃣ - Sair');
              state[from] = { step: 6 };
              return;

          case "4":
              await enviarMensagemInicial(sites, '🌐 *Sites e Lojas Virtuais*\n\nCrie sua presença digital com um site profissional ou uma loja virtual completa, segura e fácil de gerenciar.\n\n💡 Otimização SEO, integração com WhatsApp, métodos de pagamento, blog e muito mais!\n\nQual opção você escolhe?\n\n1️⃣ - Quero esse serviço\n2️⃣ - Voltar às soluções\n3️⃣ - Menu principal\n4️⃣ - Sair');
              state[from] = { step: 6 };
              return;

          case "5":
              await enviarMensagemInicial(landing, '📄 *Landing Pages para Campanhas*\n\nAlta conversão e foco em resultados! Criamos páginas otimizadas para campanhas de tráfego pago, lançamentos e geração de leads.\n\n🎯 Design moderno, responsivo e com gatilhos de persuasão.\n\nDeseja:\n\n1️⃣ - Quero esse serviço\n2️⃣ - Voltar às soluções\n3️⃣ - Menu principal\n4️⃣ - Sair');
              state[from] = { step: 6 };
              return;

          case "6":
              await enviarMensagemInicial(personalizados, '🧩 *Sistemas Personalizados*\n\nTem uma ideia específica? Criamos qualquer tipo de sistema do zero, do seu jeito e para sua necessidade.\n\n🚀 Desde automações internas até plataformas completas com múltiplos usuários e painéis de controle.\n\nQual será o próximo passo?\n\n1️⃣ - Quero esse serviço\n2️⃣ - Voltar às soluções\n3️⃣ - Menu principal\n4️⃣ - Sair');
              state[from] = { step: 6 };
              return;

          case "7":
              await enviarMensagemTexto('🔁 Retornando ao menu principal...');
              await enviarMensagemInicial(logo, mensagemInicial);
              state[from] = { step: 1 };
              return;

          default:
              if (userState.attempts === undefined) userState.attempts = 0;
              userState.attempts++;
              const tentativasRestantes = MAX_ATTEMPTS - userState.attempts;
              if (userState.attempts >= MAX_ATTEMPTS) {
                  await client.sendMessage(
                      msg.from,
                      '❌ *Número de tentativas excedido!*\nAtendimento finalizado!\n\nDigite *Oi* para iniciar.'
                  );
                  state[from] = { step: 0, attempts: 0 };
                  delete state[from]; 
              } else {
                  await client.sendMessage(
                      msg.from,
                      `❌ *Opção inválida!*\nVocê tem mais ${tentativasRestantes} tentativa(s).`
                  );
              }
              return;
      }
  }else if (userState.step === 3) {
      switch(mensagem) {
          case "1":
            await enviarMensagemInicial(suporteTecnico, '🤖 *Suporte técnico*\nAntes de encaminhar a um especialista irei pedir que digite as seguintes informações:\n\n🔹 *- Nome da empresa*\n🔹 *- Problema ocorrido*\n🔹 *- Nome para contato*\n\n*Após escrever as informações solicitadas digite:*\n0️⃣ para enviar\n1️⃣ para retornar ao menu principal.');
            state[from] = { step: 4 };
              return;

          case "2":
            await enviarMensagemInicial(upgrade, '🤖 *Atualização de sistema*\nAntes de encaminhar a um especialista irei pedir que digite as seguintes informações:\n\n🔹 *- Nome da empresa*\n🔹 *- Qual sistema precisa de atualização e o tipo de atualização necessária*\n🔹 *- Nome para contato*\n\n*Após escrever as informações solicitadas digite:*\n0️⃣ para enviar\n1️⃣ para retornar ao menu principal.');
            state[from] = { step: 4 };
            return;

          case "3":
            await enviarMensagemInicial(especialista, '🤖 *Perfeito!*\nAntes de encaminhar a um especialista irei pedir que digite as seguintes informações:\n\n🔹 *- Nome da empresa*\n🔹 *- Motivo da solicitação*\n🔹 *- Nome para contato*\n\n*Após escrever as informações solicitadas digite:*\n0️⃣ para enviar\n1️⃣ para retornar ao menu principal.');
            state[from] = { step: 4 };
            return;

          case "4":
            await enviarMensagemTexto('🔁 Retornando ao menu principal...');
            await enviarMensagemInicial(logo, mensagemInicial);
            state[from] = { step: 1 };
            return;
            
          default:
              if (userState.attempts === undefined) userState.attempts = 0;
              userState.attempts++;
              const tentativasRestantes = MAX_ATTEMPTS - userState.attempts;
              if (userState.attempts >= MAX_ATTEMPTS) {
                  await client.sendMessage(
                      msg.from,
                      '❌ *Número de tentativas excedido!*\nAtendimento finalizado!\n\nDigite *Oi* para iniciar.'
                  );
                  state[from] = { step: 0, attempts: 0 };
                  delete state[from]; 
              } else {
                  await client.sendMessage(
                      msg.from,
                      `❌ *Opção inválida!*\nVocê tem mais ${tentativasRestantes} tentativa(s).`
                  );
              }
              return;
      }
  }else if (userState.step === 4) {
    if (!state[from].mensagens) state[from].mensagens = [];

    switch (mensagem) {
        case "1":
            await enviarMensagemTexto('🔁 Retornando ao menu principal...');
            await enviarMensagemInicial(logo, mensagemInicial);
            state[from] = { step: 1 }; 
            return;

        case "0":
            if (state[from].mensagens.length === 0) {
                await enviarMensagemTexto('⚠️ Nenhuma informação foi registrada ainda.');
                return;
            }

            let mensagemFinal = `📩 *Novo pedido Atentus Cloud*\n\n👤 *Contato:* ${nomeContato}\n📱 *Número:* ${numeroContato}\n\n📋 *Informações enviadas:*\n`;
            state[from].mensagens.forEach((linha, index) => {
                mensagemFinal += `\n${index + 1}️⃣ ${linha}`;
            });

            await client.sendMessage(jorgeAugusto, mensagemFinal);
            await client.sendMessage(hugoRosa, mensagemFinal);
            await enviarMensagemTexto('✅ Suas informações foram enviadas com sucesso! Em breve um especialista entrará em contato.');
            await enviarMensagemTexto('🤖 *Obrigado pelo contato!*');

            delete state[from]; 
            return;

        default:
            state[from].mensagens.push(mensagem); 
            await enviarMensagemTexto('✍️ *Informação registrada.*\n\n0️⃣ *- ENVIAR*\n1️⃣ *- CANCELAR*');
            return;
    }
}
else if (userState.step === 5){
    switch (mensagem) {
        case "1":
            await enviarMensagemInicial(especialista, '🤖 *Perfeito!*\nAntes de encaminhar a um especialista irei pedir que digite as seguintes informações:\n\n🔹 *- Nome da empresa*\n🔹 *- Tipo de projeto desejado*\n🔹 *- Nome para contato*\n\n*Após escrever as informações solicitadas digite:*\n0️⃣ para enviar\n1️⃣ para retornar ao menu principal.');
            state[from] = { step: 4 };
            return;

        case "2":
            await enviarMensagemTexto('🔁 Retornando ao menu principal...');
            await enviarMensagemInicial(logo, mensagemInicial);
            state[from] = { step: 1 };
            return;

        case "3":
            await enviarMensagemTexto('🤖 - *Agradecemos a sua visita*\n_Até a próxima!_ 👋');
            delete state[from];
            return;

            default:
                if (userState.attempts === undefined) userState.attempts = 0;
                userState.attempts++;
                const tentativasRestantes = MAX_ATTEMPTS - userState.attempts;
                if (userState.attempts >= MAX_ATTEMPTS) {
                    await client.sendMessage(
                        msg.from,
                        '❌ *Número de tentativas excedido!*\nAtendimento finalizado!\n\nDigite *Oi* para iniciar.'
                    );
                    state[from] = { step: 0, attempts: 0 };
                    delete state[from]; 
                } else {
                    await client.sendMessage(
                        msg.from,
                        `❌ *Opção inválida!*\nVocê tem mais ${tentativasRestantes} tentativa(s).`
                    );
                }
                return;
        }

}else if (userState.step === 6){
switch (mensagem) {

    case "1":
        await enviarMensagemInicial(souCliente, '🤖 *Perfeito!*\nAntes de encaminhar a um especialista irei pedir que digite as seguintes informações:\n\n🔹 *- Nome da empresa*\n🔹 *- Tipo de projeto desejado*\n🔹 *- Nome para contato*\n\n*Após escrever as informações solicitadas digite:*\n0️⃣ para enviar\n1️⃣ para retornar ao menu principal.');
        state[from] = { step: 4 };
        return;

    case "2":
        await enviarMensagemInicial (solucoes, '🤖 Aqui na *Atentus Cloud* você encontra as melhores soluções tecnológicas para otimizar o seu negócio!\n\nSelecione uma opção *ABAIXO!* 👇\n\n1️⃣ *- Chatbots de atendimento*\n2️⃣ *- Sistemas corporativos*\n3️⃣ *- Aplicativos Android/IOS*\n4️⃣ *- Sites e Lojas Virtuais*\n5️⃣ *- Landing pages para campanhas*\n6️⃣ *- Sistemas personalizados*\n7️⃣ *- Voltar ao menu principal*');
        state[from] = { step: 2 };
        return;

    case "3":
        await enviarMensagemTexto('🔁 Retornando ao menu principal...');
        await enviarMensagemInicial(logo, mensagemInicial);
        state[from] = { step: 1 };
        return;

    case "4":
        await enviarMensagemTexto('🤖 - *Agradecemos a sua visita*\n_Até a próxima!_ 👋');
        delete state[from];
        return;

        default:
                if (userState.attempts === undefined) userState.attempts = 0;
                userState.attempts++;
                const tentativasRestantes = MAX_ATTEMPTS - userState.attempts;
                if (userState.attempts >= MAX_ATTEMPTS) {
                    await client.sendMessage(
                        msg.from,
                        '❌ *Número de tentativas excedido!*\nAtendimento finalizado!\n\nDigite *Oi* para iniciar.'
                    );
                    state[from] = { step: 0, attempts: 0 };
                    delete state[from]; 
                } else {
                    await client.sendMessage(
                        msg.from,
                        `❌ *Opção inválida!*\nVocê tem mais ${tentativasRestantes} tentativa(s).`
                    );
                }
                return;    
    
   }
}
});



