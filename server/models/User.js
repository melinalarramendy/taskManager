const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  defaultWorkspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  },
  workspaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  }],
  sharedWorkspaces: [{
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    }
  }],
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' }],
  sharedBoards: [{
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    }
  }],
  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

UserSchema.methods.ensureWorkspace = async function() {
  if (!this.defaultWorkspace) {
    const Workspace = mongoose.model('Workspace');
    const workspace = await Workspace.create({
      name: `${this.name}'s Workspace`,
      owner: this._id
    });
    
    this.defaultWorkspace = workspace._id;
    this.workspaces.push(workspace._id);
    await this.save();
  }
  return this.defaultWorkspace;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;