const {
  NotFoundError,
  AuthorizationError,
  ValidationError,
  ConflictError,
  DatabaseError
} = require('../utils/errors');

class UserService {
  // Get all users (for admin dashboard)
  async getAllUsers(requester, UserModel) {
    try {
      const users = await UserModel.find({})
        .select('-password -confirmationCode -resetPasswordToken -resetPasswordExpire');
        
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new DatabaseError('Failed to fetch users');
    }
  }
  // Get single user
  async getUser(userId, requester,UserModel) {
    try {
      // Users can only view their own profile unless they're admin
      if (userId !== requester.id && requester.access_level < 3) {
        throw new AuthorizationError('Not authorized to view this user');
      }

      const user = await UserModel.findById(userId)
        .select('-password -confirmationCode -resetPasswordToken -resetPasswordExpire')
        .populate('organization', 'name');

      if (!user) throw new NotFoundError('User not found');
      return user;
    } catch (error) {
      if (error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to fetch user');
    }
  }

  // Update user (regular update for own profile)
  async updateUser(userId, updateData, requester,UserModel) {
    try {
      // Users can only update their own profile
      if (userId !== requester.id) {
        throw new AuthorizationError('Not authorized to update this user');
      }

      // Prevent regular users from updating sensitive fields
      if (requester.access_level < 3) {
        delete updateData.email;
        delete updateData.personal_number;
        delete updateData.access_level;
      }

      return await this._updateUser(userId, updateData, UserModel);

    } catch (error) {
      if (error instanceof AuthorizationError) {
        throw error;
      }
      throw new DatabaseError('Failed to update user');
    }
  }

  // Admin update user (for managers/admins)
  async adminUpdateUser(userId, updateData, requester,UserModel) {
    try {
      const userToUpdate = await UserModel.findById(userId);
      if (!userToUpdate) throw new NotFoundError('User not found');

      // Admins can't update super admins
      if (userToUpdate.access_level === 5 && requester.access_level < 5) {
        throw new AuthorizationError('Not authorized to update super admin');
      }

      // Organization admins can only update users in their organization
      if (requester.access_level === 4 && 
          userToUpdate.organization.toString() !== requester.organization.toString()) {
        throw new AuthorizationError('Not authorized to update users outside your organization');
      }

      // Prevent changing certain fields
      if (updateData.password) {
        throw new ValidationError('Password cannot be changed through this endpoint');
      }

      return await this._updateUser(userId, updateData, UserModel);

    } catch (error) {
      if (error instanceof NotFoundError || 
          error instanceof AuthorizationError || 
          error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Failed to perform admin update');
    }
  }

  // Private method for actual update operation
  async _updateUser(userId, updateData,UserModel) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -confirmationCode -resetPasswordToken -resetPasswordExpire');

      if (!user) throw new NotFoundError('User not found during update');
      return user;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError(error.message, error.errors);
      }
      if (error.name === 'MongoError' && error.code === 11000) {
        throw new ConflictError('User with this email or personal number already exists');
      }
      throw new DatabaseError('Failed to update user record');
    }
  }


async deleteUser(userId, requester, UserModel) {
  try {
    const userToDelete = await UserModel.findById(userId);
    if (!userToDelete) {
      throw new NotFoundError('User not found');
    }

    const isSelfDelete = userToDelete._id.toString() === requester._id.toString();
    const isSuperAdmin = requester.access_level === 5;

    if (!isSuperAdmin && !isSelfDelete) {
      throw new AuthorizationError('Not authorized to delete this user');
    }
    
    // Super admins cannot be deleted by anyone but other super admins (and not themselves through this route)
    if (userToDelete.access_level === 5 && !isSuperAdmin) {
       throw new AuthorizationError('Not authorized to delete a super admin account');
    }

    // Prevent a super admin from deleting themselves via the admin panel
    if(userToDelete.access_level === 5 && isSelfDelete){
        throw new AuthorizationError('Super admins cannot delete their own account from this panel.');
    }

    await UserModel.deleteOne({ _id: userId });

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AuthorizationError) {
      throw error;
    }
    // Log the original error for better debugging
    console.error("Underlying delete error:", error);
    throw new DatabaseError('Failed to delete user');
  }
}
}

module.exports = new UserService();
