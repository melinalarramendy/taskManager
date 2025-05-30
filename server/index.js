const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('./models/User');
const Board = require('./models/Board');
const Workspace = require('./models/Workspace');
const Notification = require('./models/Notification');
const FriendRequest = require('./models/FriendRequest');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'tu_secreto_super_seguro';
const JWT_EXPIRES_IN = '1h';

mongoose.connect('mongodb://127.0.0.1:27017/task-manager')
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

app.use(async (req, res, next) => {
  if (req.user && !req.user.defaultWorkspace) {
    try {
      const workspace = await Workspace.create({
        name: `${req.user.name}'s Workspace`,
        owner: req.user._id
      });

      await User.findByIdAndUpdate(req.user._id, {
        defaultWorkspace: workspace._id,
        $push: { workspaces: workspace._id }
      });
    } catch (err) {
      console.error('Error creando workspace:', err);
    }
  }
  next();
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token de autenticación no proporcionado' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token inválido o expirado' });
    req.user = decoded;
    next();
  });
};

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "c02a9eec0dbd47",
    pass: "6bf4f8fb0336e6"
  }
});

const initialLists = [
  { id: 1, title: 'Por hacer', tasks: [] },
  { id: 2, title: 'En progreso', tasks: [] },
  { id: 3, title: 'Hecho', tasks: [] }
];


app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const workspace = await Workspace.create({
      name: `${name}'s Workspace`,
      owner: user._id
    });

    user.defaultWorkspace = workspace._id;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email es requerido' });
    }

    const user = await User.findOne({ email });
    if (!user) {

      return res.status(200).json({
        success: true,
        message: 'Si el email existe, se ha enviado un token de recuperación'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM || 'no-reply@taskmanager.com',
      subject: 'Recuperación de contraseña',
      html: `
        <p>Hola ${user.name},</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Utiliza el siguiente token para restablecer tu contraseña:</p>
        <p><strong>${resetToken}</strong></p>
        <p>O haz clic en este <a href="${resetUrl}">enlace</a>.</p>
        <p>El token expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Si el email existe, se ha enviado un token de recuperación'
    });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
});

app.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al resetear la contraseña'
    });
  }
});

app.get('/user/workspaces', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('defaultWorkspace');

    if (!user.defaultWorkspace) {
      const workspace = await Workspace.create({
        name: `${user.name}'s Workspace`,
        owner: user._id
      });
      user.defaultWorkspace = workspace._id;
      await user.save();
    }

    const boards = await Board.find({ workspace: user.defaultWorkspace._id })
      .select('title description completed updatedAt labels coverImage favorite')

    res.json({
      workspace: user.defaultWorkspace,
      boards
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }

});

app.get('/workspaces/:workspaceId/boards', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const boards = await Board.find({ workspace: workspaceId })
      .select('title description completed updatedAt labels coverImage favorite')
      .sort({ updatedAt: -1 });

    const workspace = await Workspace.findById(workspaceId);

    res.status(200).json({
      boards: boards || [],
      workspace: workspace
        ? { id: workspace._id, name: workspace.name }
        : null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Error al obtener tableros',
      boards: []
    });
  }
});

app.get('/workspaces/boards', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('defaultWorkspace');

    if (!user.defaultWorkspace) {
      return res.status(200).json({
        boards: [],
        workspace: null
      });
    }

    const boards = await Board.find({ workspace: user.defaultWorkspace._id })
      .select('title description completed updatedAt labels coverImage favorite')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      boards: boards || [],
      workspace: {
        id: user.defaultWorkspace._id,
        name: user.defaultWorkspace.name
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Error al obtener tableros',
      boards: []
    });
  }
});

app.get('/boards/:id', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/boards/:id/lists', async (req, res) => {
  try {
    const { lists } = req.body;
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { lists },
      { new: true }
    );
    res.json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/boards', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.defaultWorkspace) {
      const workspace = await Workspace.create({
        name: `${user.name}'s Workspace`,
        owner: user._id
      });
      user.defaultWorkspace = workspace._id;
      await user.save();
    }

    if (!user.defaultWorkspace) {
      return res.status(400).json({ message: 'No se pudo asignar un workspace' });
    }

    const board = new Board({
      title: req.body.title || 'Nuevo tablero',
      description: req.body.description || '',
      coverImage: req.body.coverImage || '',
      workspace: user.defaultWorkspace,
      createdBy: user._id,
      owner: user._id,
      lists: initialLists,
      favorite: false
    });

    await board.save();

    await Workspace.findByIdAndUpdate(
      user.defaultWorkspace,
      { $push: { boards: board._id } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      user._id,
      { $push: { boards: board._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      board: {
        _id: board._id,
        title: board.title,
        description: board.description,
        coverImage: board.coverImage,
        workspace: user.defaultWorkspace,
        favorite: board.favorite,
      }
    });

  } catch (error) {
    console.error('Error al crear tablero:', error);
    res.status(500).json({
      message: 'Error al crear tablero',
      error: error.message
    });
  }
});

app.put('/boards/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, coverImage } = req.body;
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { title, description, coverImage },
      { new: true }
    );
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }
    res.json({ success: true, board });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar el tablero' });
  }
});

app.put('/boards/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { favorite: req.body.favorite },
      { new: true }
    );
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }
    res.json({ success: true, board });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar favorito' });
  }
});

app.delete('/boards/:id', authenticateToken, async (req, res) => {
  try {
    const boardId = req.params.id;
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    await Board.findByIdAndDelete(boardId);

    await Workspace.findByIdAndUpdate(
      board.workspace,
      { $pull: { boards: board._id } }
    );

    await User.findByIdAndUpdate(
      board.createdBy,
      { $pull: { boards: board._id } }
    );

    res.status(200).json({ success: true, message: 'Tablero eliminado' });
  } catch (error) {
    console.error('Error al eliminar tablero:', error);
    res.status(500).json({ message: 'Error al eliminar tablero' });
  }
});

app.post('/boards/share', authenticateToken, async (req, res) => {

  try {
    const { boardId, email, permission } = req.body;

    if (!boardId || !email || !permission) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const ownerId = req.user._id || req.user.id;
    const board = await Board.findOne({
      _id: boardId,
      owner: ownerId
    });

    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado o no tienes permisos' });
    }

    const friend = await User.findOne({ email });
    if (!friend) {
      return res.status(404).json({ message: 'Usuario invitado no existe' });
    }

    const alreadyShared = board.members.some(m =>
      m.user.toString() === friend._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({ message: 'Ya compartiste este tablero con este usuario' });
    }

    board.members.push({
      user: friend._id,
      role: permission,
      joinedAt: new Date()
    });
    await board.save();

    friend.sharedBoards.push({
      board: boardId,
      role: permission
    });
    await friend.save();

    await Notification.create({
      email: friend.email,
      title: 'Invitación a tablero',
      message: `${req.user.name || req.user.email} te invitó al tablero "${board.title}"`,
      link: `/boards/${boardId}`,
      read: false
    });

    return res.json({
      success: true,
      message: 'Tablero compartido exitosamente'
    });
  } catch (error) {
    console.error('Error en /boards/share:', error);
    return res.status(500).json({
      message: 'Error al compartir tablero',
      error: error.message
    });
  }
});

app.get('/boards/shared', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('sharedBoards.board', 'title description coverImage owner members')
      .populate('sharedBoards.board.owner', 'name email');

    const sharedBoards = user.sharedBoards.map(item => ({
      ...item.board.toObject(),
      permission: item.role,
      sharedBy: item.board.owner
    }));

    res.json(sharedBoards);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tableros compartidos' });
  }
});

app.get('/notifications', authenticateToken, async (req, res) => {
  const notifications = await Notification.find({ email: req.user.email }).sort({ createdAt: -1 });
  res.json(notifications);
});

app.post('/notifications', authenticateToken, async (req, res) => {
  try {
    const { title, message, link, read, createdAt } = req.body;
    const notification = await Notification.create({
      email: req.user.email,
      title,
      message,
      link,
      read: read ?? false,
      createdAt: createdAt ?? Date.now()
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error creando notificación personalizada' });
  }
});

app.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

// Enviar solicitud de amistad
app.post('/friends/request', authenticateToken, async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ message: 'Falta el email del destinatario' });

  const exists = await FriendRequest.findOne({ from: req.user.email, to, status: 'pending' });
  if (exists) return res.status(400).json({ message: 'Ya enviaste una solicitud a este usuario' });

  const request = await FriendRequest.create({ from: req.user.email, to });

  await Notification.create({
    email: to,
    title: 'Nueva solicitud de amistad',
    message: `${req.user.email} te ha enviado una solicitud de amistad.`,
    link: '/friends'
  });

  res.json({ success: true, request });
});

// Aceptar solicitud de amistad
app.post('/friends/accept', authenticateToken, async (req, res) => {
  const { from } = req.body;

  const request = await FriendRequest.findOneAndUpdate(
    { from, to: req.user.email, status: 'pending' },
    { status: 'accepted' }
  );

  if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });

  await User.updateOne(
    { email: req.user.email },
    { $addToSet: { friends: from } }
  );

  await User.updateOne(
    { email: from },
    { $addToSet: { friends: req.user.email } }
  );

  await Notification.create({
    email: from,
    title: 'Solicitud de amistad aceptada',
    message: `${req.user.email} aceptó tu solicitud de amistad.`,
    link: '/friends'
  });

  res.json({ success: true });
});

app.get('/friends/requests', authenticateToken, async (req, res) => {
  const requests = await FriendRequest.find({ to: req.user.email, status: 'pending' });
  res.json(requests);
});

// Obtener lista de amigos (solicitudes aceptadas)
app.get('/friends', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email })
      .select('friends')
      .populate({
        path: 'friends',
        select: 'name email',
        options: { strictPopulate: false }
      });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(user.friends || []);
  } catch (error) {
    console.error('Error al obtener amigos:', error);
    res.status(500).json({ message: 'Error al obtener amigos' });
  }
});

app.delete('/friends/:friendEmail', authenticateToken, async (req, res) => {
  try {
    const { friendEmail } = req.params;

    await User.updateOne(
      { email: req.user.email },
      { $pull: { friends: friendEmail } }
    );

    await User.updateOne(
      { email: friendEmail },
      { $pull: { friends: req.user.email } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar amigo' });
  }
});

app.get('/friends/:friendEmail/shared-boards', authenticateToken, async (req, res) => {
  try {
    const { friendEmail } = req.params;
    const userEmail = req.user.email;

    // Find both users
    const user = await User.findOne({ email: userEmail });
    const friend = await User.findOne({ email: friendEmail });

    if (!user || !friend) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Find boards where user is owner or member
    const userBoards = await Board.find({
      $or: [
        { owner: user._id },
        { 'members.user': user._id }
      ]
    }).select('_id');

    // Find boards where friend is owner or member
    const friendBoards = await Board.find({
      $or: [
        { owner: friend._id },
        { 'members.user': friend._id }
      ]
    }).select('_id');

    const userBoardIds = userBoards.map(b => b._id.toString());
    const friendBoardIds = friendBoards.map(b => b._id.toString());

    // Intersection of board IDs
    const sharedBoardIds = userBoardIds.filter(id => friendBoardIds.includes(id));

    // Fetch shared boards details
    const sharedBoards = await Board.find({ _id: { $in: sharedBoardIds } })
      .select('title description coverImage owner members');

    res.json({ sharedBoards });
  } catch (error) {
    console.error('Error fetching shared boards:', error);
    res.status(500).json({ message: 'Error al obtener tableros compartidos' });
  }
});

app.listen(3003, () => {
  console.log('Server is running on port 3003');
})
