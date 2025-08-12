const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'facility_owner', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'banned', 'pending'],
        default: 'active'
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    
    dateOfBirth: Date,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    preferences: {
        favoriteSports: [String],
        notificationSettings: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            push: { type: Boolean, default: true }
        }
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' }]
}, {
    timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { return next(); }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    this.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return verificationToken;
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
