const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = (connection = mongoose) => {
  if (connection.models.Superadmin) {
    return connection.models.Superadmin;
  }

  const superadminSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    access_level: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      enum: [1, 2, 3, 4, 5],
      default: 5
    },
    max_permitted_user_amount: Number,
    max_permitted_resource_amount: Number,
    subscription_type: { type: String, default: 'free' },
    org_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin'
    },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date
  }, {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  });

  superadminSchema.index({ email: 1 }, { unique: true });
  superadminSchema.index({ org_id: 1 });

  superadminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
  });

  superadminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  superadminSchema.methods.generateAuthToken = function () {
    if (!process.env.JWT_TOKEN_KEY) {
      throw new Error('JWT secret is not configured');
    }
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        tenantId: this.org_id,
        role: this.role,
        access_level: this.access_level,
        isGlobalAdmin: true
      },
      process.env.JWT_TOKEN_KEY,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  };

  superadminSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
  };

  superadminSchema.methods.incrementLoginAttempts = function () {
    if (this.lockUntil && this.lockUntil > Date.now()) {
      throw new Error('Account is temporarily locked');
    }
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 30 * 60 * 1000;
    }
    return this.save();
  };

  superadminSchema.methods.resetLoginAttempts = function () {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    return this.save();
  };

  return connection.model('Superadmin', superadminSchema);
};
