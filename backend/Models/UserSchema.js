
// User Schema
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
module.exports = (connection) => {
  if (connection.models['User']) {
    return connection.models['User'];
  }
  const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  org_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  personal_number: {
    type: String,
    unique: true,
    sparse: true,
    default: null 
  },
  access_level: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    enum: [1, 2, 3, 4, 5],
    default: 2 // Default to standard user access
  },
 
  max_permitted_user_amount: { type: Number},
  max_permitted_resource_amount: { type: Number},
  subscription_type: { type: String, default: 'free' },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  payroll: {
    rate_type: {
      type: String,
      enum: ['hourly', 'salaried', 'project'],
      default: 'hourly'
    },
    rate: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true
    },
    overtime_multiplier: {
      type: Number,
      default: 1.5 // Standard time-and-a-half
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  confirmationCode: String,
  isConfirmed: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  profilePicture: String,
  phoneNumber: String,
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpire;
      delete ret.confirmationCode;
      return ret;
    }
  }
});

// Virtual for full name
userSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  if (!process.env.JWT_TOKEN_KEY) {
    throw new Error('JWT secret is not configured');
  }
  return jwt.sign(
    { 
      _id: this._id,
      email: this.email,
      tenantId: this.org_id,
      access_level: this.access_level 
    },
    process.env.JWT_TOKEN_KEY,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Account lockout for failed attempts
userSchema.methods.incrementLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil > Date.now()) {
    throw new Error('Account is temporarily locked');
  }
  
  this.loginAttempts += 1;
  
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
  }
};

userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save(); // Make sure to return the save() promise
};

 // Indexes (removed organization-related indexes)
  userSchema.index({ isActive: 1 });
 userSchema.index({ 'teams': 1 });

 return connection.model('User', userSchema);
};