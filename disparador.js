const { Client, Location, List, Buttons, LocalAuth } = require('./index');


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Dados de exemplo (substitua pelo seu banco de dados real)
let posts = [
  { id: 1, chatid: '5511982001060@c.us', body: 'Conteúdo do post 1' },
  { id: 2, chatid: '5511982871523@c.us', body: 'Conteúdo do post 2' },
];


// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});


const client = new Client({
    authStrategy: new LocalAuth(),
    // proxyAuthentication: { username: 'username', password: 'password' },
    puppeteer: { 
        // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
        headless: false
    }
});

client.initialize();

// Rotas da API
app.get('/api/ready', (req, res) => {
    res.json('req');
  });
  
  app.post('/api/send_message', (req, res) => {
    const newMessage = req.body;
    console.log(req)
    try{
        newMessage.id = posts.length + 1;
        client.sendMessage(req.body.chatid,req.body.message)
        posts.push(newMessage);
        res.status(201).json(newMessage);
    }catch(e){console.log(e)}
    
  });
  
  app.put('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const updatedPost = req.body;
    const index = posts.findIndex(post => post.id === postId);
  
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updatedPost };
      res.json(posts[index]);
    } else {
      res.status(404).json({ message: 'Post não encontrado' });
    }
  });
  
  app.delete('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    posts = posts.filter(post => post.id !== postId);
    res.json({ message: 'Post excluído com sucesso' });
  });

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
    client.getChats().then(resultado => {
        console.log('Resultado:', resultado); // Se a Promise for resolvida (resolve), o resultado estará aqui
        app.get('/api/chats', (req, res) => {
        res.json(resultado);
      });
      client.sendMessage('5511982001060@c.us',"um teste de novo...")

      })
      .catch(erro => {
        console.error('Erro:', erro); // Se a Promise for rejeitada (reject), o erro estará aqui
      });
    
});

