const {
  registerUser,
  registerAdminUser,
  loginUser,
  logoutUser,
  confirmEmail,
  forgotPassword,
  resetPassword
} = require('../Services/authService');

const registerController = async (req, res) => {
  try {
    const tenantId = req.user.org_id;
    const {  User } = req.tenantModels;
    
    const { email, password, last_name, first_name, personal_number,access_level,
      isConfirmed,
      isActive,
      payroll 
    } = req.body;

    const user = await registerUser({
      email,
      password,
      last_name,
      first_name,
      org_id: tenantId ,
      personal_number,
      access_level,
      isConfirmed: isConfirmed || false, // Default false for normal users
      isActive: isActive || true, // Default true
      payroll: payroll 

    },tenantId,User);

    res.status(201).json({
      success: true,
      data: user,
      message: "User registered successfully. Please check your email to confirm."
    });
  } catch (err) {
    console.error("Registration Error:", err);
    
    const statusCode = err.message.includes('already exists') ? 400 : 500;
    // res.status(statusCode).json({ 
    //   success: false,
    //   error: err.message 
    // });
    res.status(statusCode).json({ 
      success: false,
      message: err.message // Use 'message' instead of 'error'
    });
  }
};
// controllers/authController.js
const registerAdminController = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      last_name, 
      first_name, 
      organizationName,
      personal_number,
      access_level,
      max_permitted_user_amount,
      max_permitted_resource_amount,
      subscription_type
    } = req.body;

    const user = await registerAdminUser({
      email,
      password,
      last_name,
      first_name,
      organizationName,
      personal_number,
      access_level,
      max_permitted_user_amount,
      max_permitted_resource_amount,
      subscription_type
    });

    // Generate token with tenant context
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        tenantId: user.tenantId,
        access_level: user.access_level
      },
      process.env.JWT_TOKEN_KEY,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        access_level: user.access_level
      },
      message: "Admin registered successfully"
    });
  } catch (err) {
    console.error("Admin Registration Error:", err);
    const statusCode = err.message.includes('already exists') ? 400 : 500;
    res.status(statusCode).json({ 
      success: false,
      error: err.message 
    });
  }
};
const loginController = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const result = await loginUser(email, password, rememberMe);

    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined
    });

    res.json({
      success: true,
      data: result.user,
      token: result.token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error.message);

    const statusCode =
      error.message.includes('not found') ||
      error.message.includes('Incorrect') ||
      error.message.includes('locked')
        ? 401
        : 400;

    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};
const confirmEmailController = async (req, res) => {
  try {
    const result = await confirmEmail(req.params.confirmationCode);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPassword(email);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const result = await resetPassword(token, password);

    // Set cookie with new token
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: 'strict',
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

const logoutController = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('jwt', { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Logout failed' 
    });
  }
};

module.exports = {
  registerController,
  registerAdminController,
  loginController,
  logoutController,
  confirmEmailController,
  forgotPasswordController,
  resetPasswordController
};
