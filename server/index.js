const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const UserModel = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/task-manager')
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch((err) => console.error('Error al conectar a MongoDB:', err));

app.post('/register', async (req, res) => {
    try {
        const user = await UserModel.create(req.body);
        const token = 'fake-jwt-token';
        res.status(201).json({ message: 'Usuario registrado con éxito', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }

});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = 'fake-jwt-token';
        res.status(200).json({ message: 'Inicio de sesión exitoso', token, user });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
    user: "c02a9eec0dbd47", 
    pass: "6bf4f8fb0336e6" 
  }
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; 
  
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save(); 
  
      const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Recuperación de contraseña',
        text: `Tu token de recuperación es: ${resetToken}\n\nO haz clic en este enlace: ${resetUrl}\n\nEl token expira en 1 hora.`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ 
        success: true,
        message: 'Token enviado al correo electrónico',
        token: resetToken 
      });
    } catch (error) {
      console.error('Error en forgot-password:', error);
      res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
  });


app.post('/resetpassword', async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;
  
    console.log('Datos recibidos:', { token, newPassword, confirmPassword });
    try {

      if (newPassword !== confirmPassword) {
        console.log('Error: Las contraseñas no coinciden');
        return res.status(400).json({ 
          success: false,
          message: 'Las contraseñas no coinciden',
          errorType: 'password_mismatch'
        });
      }
  
      const user = await UserModel.findOne({ 
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() } 
      });
  
      console.log('Usuario encontrado:', user); 
  
      if (!user) {
        console.log('Error: Token inválido o expirado');
        return res.status(400).json({ 
          success: false,
          message: 'Token inválido o expirado',
          errorType: 'invalid_token'
        });
      }
  
      user.password = newPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
  
      console.log('Contraseña actualizada para usuario:', user.email); 
  
      res.status(200).json({ 
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      console.error('Error en resetpassword:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al resetear la contraseña',
        error: error.message 
      });
    }
  });


app.listen(3001, () => {
    console.log('Server is running on port 3001');
})