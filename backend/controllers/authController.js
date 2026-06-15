require("dotenv").config();
const {
  createUser,
  checkLogin
} = require("../queries/authQuery");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/index");

const createNewUser = async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await createUser(userData);
    if (newUser.message) {
      return res.status(400).json({ error: newUser.message });
    }
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email, lastName: newUser.lastName },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    res.status(200).json({
      message: "Đăng ký thành công.",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error:
        error.errors && error.errors.length > 0
          ? error.errors[0].message
          : "Đã có vấn đề xảy ra, vui lòng thử lại sau.",
    });
  }
};

const checkingLogin = async (req, res) => {
  try{
    const userData = req.body;
    const existUser = await checkLogin(userData);
    if (!existUser)
      return res
        .status(400)
        .json({ error: "Không tìm thấy địa chỉ email" });
    const checkPassword = await bcrypt.compare(
      userData.password,
      existUser.password
    );
    if (!checkPassword)
      return res.status(400).json({
        error: "Mật khẩu không đúng",
      });

    const token = jwt.sign(
      { id: existUser.id, role: existUser.role, email: existUser.email, lastName: existUser.lastName },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token: token,
    });
  }catch(error){
    console.log(error);
    res.status(400).json({
      error: error.errors && error.errors.length > 0
        ? error.errors[0].message
        : "Đã có vấn đề xảy ra, vui lòng thử lại sau.",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, lastName, phone_number, address, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email không hợp lệ" });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản" });
    }

    const updatedData = {
      lastName,
      phone_number,
      address,
    };

    if (password) {
      const saltRounds = 10;
      updatedData.password = await bcrypt.hash(password, saltRounds);
    }

    await db.User.update(updatedData, { where: { id: user.id } });

    const updatedUser = await db.User.findByPk(user.id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công!",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        lastName: updatedUser.lastName,
        phone_number: updatedUser.phone_number,
        address: updatedUser.address,
        role: updatedUser.role,
      }
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin cá nhân:", error);
    return res.status(500).json({
      error: "Đã xảy ra lỗi khi cập nhật thông tin cá nhân. Vui lòng thử lại sau!"
    });
  }
};

const getAllUsersController = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ["id", "email", "firstName", "lastName", "role", "phone_number", "address", "createdAt"]
    });
    return res.status(200).json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error("Lỗi khi lấy tất cả người dùng:", error);
    return res.status(500).json({
      error: "Đã xảy ra lỗi khi lấy danh sách người dùng. Vui lòng thử lại sau!"
    });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    // Delete all posts and rooms associated with this user
    const posts = await db.RentPost.findAll({ where: { user_id: id } });
    for (const post of posts) {
      await db.Room.destroy({ where: { id: post.room_id } });
      await db.RentPost.destroy({ where: { id: post.id } });
    }
    await db.User.destroy({ where: { id } });
    return res.status(200).json({
      success: true,
      message: "Người dùng đã được xóa thành công!"
    });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    return res.status(500).json({
      error: "Lỗi server khi xóa người dùng. Vui lòng thử lại sau!"
    });
  }
};

module.exports = { createNewUser, checkingLogin, updateProfile, getAllUsersController, deleteUserController };