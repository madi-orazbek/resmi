const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb+srv://danel:0000@cluster0.avoaf.mongodb.net/RTS?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  // Проверить, существует ли администратор
  const adminExists = await User.findOne({ username: 'admin' });
  
  if (adminExists) {
    console.log('Администратор уже существует');
    process.exit();
  }
  
  // Создать администратора
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  const admin = new User({
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });
  
  await admin.save();
  console.log('Администратор создан:\nЛогин: admin\nПароль: admin123');
  process.exit();
}).catch(err => {
  console.error('Ошибка подключения к MongoDB:', err);
  process.exit(1);
});