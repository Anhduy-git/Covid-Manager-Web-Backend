const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
const { BadRequestError, UnauthorizedError } = require('../errors');
const config = require('../config');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	identityCard: {
		type: String,
		trim: true,
		unique: true,
		required: true
	},
	dateOfBirth: {
		type: String,
		trim: true,
		required: true
	},
	address: {
		type: {
			city: {
				type: String,
				required: true
			},
			district: {
				type: String,
				required: true
			},
			ward: {
				type: String,
				required: true
			}
		}
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		validate(value) {
			if (value && value !== '' && !validator.isEmail(value)) {
				throw new Error('Email is invalid');
			}
		}
	},
	state: {
		type: String,
		trim: true,
		required: true,
		enum: ['F0', 'F1', 'F2', 'F3']
	},
	placeOfTreatment: {
		type: String,
		trim: true,
		required: true
	},
	relatedUsers: {
		type: [
			{
				relatedUser: {
					type: String
				}
			}
		]
	},
	debt: {
		type: Number,
		default: 0
	},
	managedProcesses: {
		type: [
			{
				date: {
					type: Date,
					default: Date.now
				},
				activity: {
					type: String,
					required: true
				}
			}
		]
	},
	username: {
		type: String,
		required: true,
		minlength: 5,
		trim: true,
		unique: true,
		validate(value) {
			if (value.toLowerCase().includes('username')) {
				throw new UnauthorizedError('Username cannot contain "username"');
			}
		}
	},
	password: {
		type: String,
		default: '',
		trim: true,
		validate(value) {
			if (value.toLowerCase().includes('password')) {
				throw new UnauthorizedError('Password cannot contain "password"');
			}
		}
	},
	tokens: [
		{
			token: {
				type: String,
				required: true
			}
		}
	],
	avatar: {
		type: String
	}
});

// override toJSON method, call with res.send a user
userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar;

	return userObject;
};

userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, config.jwt_secret);
	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
};

userSchema.statics.checkCredentials = async (user, password) => {
	const isMatch = await bcrypt.compare(password, user.password);
	return isMatch;
};

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
	const user = this;
	user.relatedUsers = _.uniq(user.relatedUsers, (x) => x.relatedUser);
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}

	next(); // go to save the user
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
	const user = this;

	await Task.deleteMany({ owner: user._id });

	next(); // go to save the user
});

const User = mongoose.model('User', userSchema);

module.exports = User;
