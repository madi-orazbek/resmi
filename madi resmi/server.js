const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet'); // Добавлено
const rateLimit = require('express-rate-limit'); // Добавлено
const { v4: uuidv4 } = require('uuid'); // Добавлено
const axios = require('axios'); // Добавлено

const app = express();

// Middleware безопасности
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'",,"www.google.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com","www.google.com","www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com","www.google.com"],
      imgSrc: ["'self'","'unsafe-inline'", "cdnjs.cloudflare.com", "data:","www.google.com","images.unsplash.com"],
      fontSrc: ["'self'","'unsafe-inline'", "cdnjs.cloudflare.com","www.google.com"],
      connectSrc: ["'self'","'unsafe-inline'", "cdnjs.cloudflare.com","www.google.com"],
      frameSrc: ["'none'",,"'unsafe-inline'", "cdnjs.cloudflare.com","www.google.com"],
      objectSrc: ["'none'","'unsafe-inline'", "cdnjs.cloudflare.com","www.google.com"]
    }
  }
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MongoDB
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB подключен успешно');
}).catch(err => {
  console.error('Ошибка подключения к MongoDB:', err);
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 // 1 день
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Модель пользователя
const User = require('./models/User');

// Стратегия аутентификации
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Неверное имя пользователя' });
      }
      
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Неверный пароль' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware для проверки аутентификации
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Роуты аутентификации
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', 
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: false
  })
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Админ-панель
app.get('/admin', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// API для получения данных
app.get('/admin/data/:collection', isAuthenticated, async (req, res) => {
  try {
    const collectionName = req.params.collection;
    let Model;
    
    switch(collectionName) {
      case 'contacts':
        Model = Contact;
        break;
      case 'support-requests':
        Model = SupportRequest;
        break;
      case 'threat-logs':
        Model = ThreatLog;
        break;
      case 'users':
        Model = User;
        break;
      default:
        return res.status(400).json({ error: 'Неверное имя коллекции' });
    }
    
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении данных' });
  }
});

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100,
  message: 'Слишком много запросов с вашего IP, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Импорт дополнительных модулей
const securityMiddleware = require('./middleware/security');
const threatIntelligence = require('./services/threatIntelligence');
app.post('/api/contact', async (req, res) => {
    try {
        // Валидация reCAPTCHA
        const recaptchaResponse = req.body['g-recaptcha-response'];
        if (!recaptchaResponse) {
            return res.status(400).json({ error: 'Пройдите проверку reCAPTCHA' });
        }
        
        // Проверка reCAPTCHA с Google
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaResponse}`;
        const recaptchaResult = await axios.get(verificationUrl);
        
        if (!recaptchaResult.data.success) {
            return res.status(400).json({ error: 'Не пройдена проверка reCAPTCHA' });
        }

        // Обработка формы...
        const { name, email, phone, message } = req.body;
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();
        
        res.status(201).json({ message: 'Сообщение успешно отправлено!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при отправке сообщения' });
    }
});

// Применение middleware безопасности
app.use(securityMiddleware.formProtection);
app.use(securityMiddleware.xssSanitizer);

// Модели
const Contact = require('./models/Contact');
const SupportRequest = require('./models/SupportRequest');
const ThreatLog = require('./models/ThreatLog'); // Добавлено

// API для обработки формы
app.post('/api/contact', async (req, res) => {
  try {

    const { name, email, phone, message } = req.body;
    
    const newContact = new Contact({
      name,
      email,
      phone,
      message
    });
    
    await newContact.save();
    
    res.status(201).json({ message: 'Сообщение успешно отправлено!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});

// API для обработки запросов в поддержку
app.post('/api/help-request', async (req, res) => {
  try {
    // Проверка угроз по IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const isThreat = await threatIntelligence.checkIp(ip);
    
    if (isThreat) {
      await new ThreatLog({
        ip,
        type: 'blocked',
        reason: 'Known malicious IP',
        requestData: req.body
      }).save();
      
      return res.status(403).json({ 
        success: false,
        error: 'Доступ запрещен'
      });
    }

    const { name, email, topic, message } = req.body;
    
    const newRequest = new SupportRequest({
      name,
      email,
      topic,
      message
    });
    
    await newRequest.save();
    
    // Логирование успешного запроса
    console.log(`New support request from ${email}`);
    
    res.status(201).json({ 
      success: true,
      message: 'Запрос успешно отправлен' 
    });
  } catch (error) {
    console.error('Support request error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка при отправке запроса'
    });
  }
});


// Маршруты
app.get('/help', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'help.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

