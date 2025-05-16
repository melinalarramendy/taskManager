const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  tasks: [{
    title: String,
    description: String,
    dueDate: Date,
    completed: Boolean,
    labels: [String],
    position: Number
  }],
  position: Number
}, { timestamps: true });

const BoardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'El título no puede exceder los 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: [true, 'El workspace es requerido']
  },
  lists: [ListSchema],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El propietario es requerido']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario miembro es requerido']
    },
    role: {
      type: String,
      enum: {
        values: ['viewer', 'editor', 'admin'],
        message: 'Rol no válido. Usa viewer, editor o admin'
      },
      default: 'viewer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  coverImage: String,
  labels: [{
    name: String,
    color: String
  }],
  settings: {
    visibility: {
      type: String,
      enum: ['private', 'workspace', 'public'],
      default: 'private'
    },
    voting: Boolean,
    comments: Boolean
  },
  archived: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


BoardSchema.index({ workspace: 1 });
BoardSchema.index({ owner: 1 });
BoardSchema.index({ 'members.user': 1 });


BoardSchema.pre('remove', async function(next) {

  next();
});

const Board = mongoose.model('Board', BoardSchema);
module.exports = Board;