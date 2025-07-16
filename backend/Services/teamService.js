
exports.createTeam = async (teamData,TeamModel,UserModel) => {

  // Check if team name already exists in this organization
  const existingTeam = await TeamModel.findOne({
    name: teamData.name,
    organization: teamData.organization
  });
  
  if (existingTeam) {
    throw new Error('Team with this name already exists in the organization');
  }
  const team = new TeamModel(teamData);
  return await team.save();
};

exports.getTeamById = async (teamId, organizationId,TeamModel) => {
  const team = await TeamModel.findOne({
    _id: teamId,
    organization: organizationId
  })
  .populate('members.user', 'first_name last_name email')
  .populate('organization', 'name');
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  return team;
};

exports.getTeamsByOrganization = async (organizationId, options = {},TeamModel) => {
  const { page = 1, limit = 10, search } = options;
  
  const query = { organization: organizationId };
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  const teams = await TeamModel.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('members.user', 'first_name last_name email')
    .populate('name');
    
  const count = await TeamModel.countDocuments(query);
  
  return {
    teams,
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: page
  };
};

exports.updateTeam = async (teamId, updateData, organizationId,TeamModel,UserModel) => {
  // Don't allow changing organization
  if (updateData.organization) {
    throw new Error('Cannot change team organization');
  }
  
  // Validate members if being updated
  if (updateData.members) {
    const memberIds = updateData.members.map(m => m.user);
    const users = await UserModel.find({
      _id: { $in: memberIds },
      organization: organizationId
    });
    
    if (users.length !== memberIds.length) {
      throw new Error('One or more members not found or belong to different organization');
    }
  }
  
  const team = await TeamModel.findOneAndUpdate(
    { _id: teamId, organization: organizationId },
    updateData,
    { new: true, runValidators: true }
  )
  .populate('members.user', 'first_name last_name');
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  return team;
};

exports.deleteTeam = async (teamId, organizationId,TeamModel,UserModel) => {
  const team = await TeamModel.findOneAndDelete({
    _id: teamId,
    organization: organizationId
  });
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  // Optional: Remove team references from users
  await UserModel.updateMany(
    { 'teams': teamId },
    { $pull: { teams: teamId } }
  );
};

exports.addTeamMember = async (teamId, userId, role, organizationId,TeamModel,UserModel) => {
  // Verify user belongs to the same organization
  const user = await UserModel.findOne({
    _id: userId,
    organization: organizationId
  });
  
  if (!user) {
    throw new Error('User not found or belongs to different organization');
  }
  
  const team = await TeamModel.findOneAndUpdate(
    { 
      _id: teamId,
      organization: organizationId,
      'members.user': { $ne: userId } // Ensure user not already in team
    },
    { $addToSet: { members: { user: userId, role } } },
    { new: true, runValidators: true }
  )
  .populate('members.user', 'first_name last_name');
  
  if (!team) {
    throw new Error('Team not found or user already in team');
  }
  
  // Add team to user's teams array
  await UserModel.findByIdAndUpdate(userId, { $addToSet: { teams: teamId } });
  
  return team;
};

exports.removeTeamMember = async (teamId, userId, organizationId,TeamModel,UserModel) => {
  const team = await TeamModel.findOneAndUpdate(
    { _id: teamId, organization: organizationId },
    { $pull: { members: { user: userId } } },
    { new: true }
  );
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  // Remove team from user's teams array
  await UserModel.findByIdAndUpdate(userId, { $pull: { teams: teamId } });
  
  return team;
};

exports.updateMemberRole = async (teamId, userId, role, organizationId,TeamModel) => {
  const team = await TeamModel.findOneAndUpdate(
    { 
      _id: teamId, 
      organization: organizationId,
      'members.user': userId
    },
    { $set: { 'members.$.role': role } },
    { new: true, runValidators: true }
  )
  .populate('members.user', 'first_name last_name');
  
  if (!team) {
    throw new Error('Team not found or user not in team');
  }
  
  return team;
};