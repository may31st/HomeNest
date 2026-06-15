const db = require("../models");

// Lấy danh sách hợp đồng cho người dùng (chủ trọ hoặc khách thuê)
const getContracts = async (req, res) => {
  try {
    const { email, role } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, error: "Thiếu email người dùng!" });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, error: "Người dùng không tồn tại!" });
    }

    const whereClause = role === 'landlord'
      ? { landlord_id: user.id }
      : { tenant_id: user.id };

    const contracts = await db.Contract.findAll({
      where: whereClause,
      include: [{ model: db.Room, as: 'Room' }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, contracts });
  } catch (error) {
    console.error("Error fetching contracts: ", error);
    res.status(500).json({ success: false, error: "Lỗi server", details: error.message });
  }
};

// Lấy chi tiết một hợp đồng
const getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await db.Contract.findByPk(id, {
      include: [
        { model: db.Room, as: 'Room' },
        { model: db.Deposit, as: 'Deposit' }
      ]
    });

    if (!contract) {
      return res.status(404).json({ success: false, error: "Không tìm thấy hợp đồng!" });
    }

    res.json({ success: true, contract });
  } catch (error) {
    console.error("Error fetching contract details: ", error);
    res.status(500).json({ success: false, error: "Lỗi server", details: error.message });
  }
};

// Ký hợp đồng điện tử
const signContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'tenant' or 'landlord'

    if (!role || (role !== 'tenant' && role !== 'landlord')) {
      return res.status(400).json({ success: false, error: "Vai trò ký kết không hợp lệ!" });
    }

    const contract = await db.Contract.findByPk(id);
    if (!contract) {
      return res.status(404).json({ success: false, error: "Không tìm thấy hợp đồng!" });
    }

    if (role === 'tenant') {
      contract.tenant_signed = true;
    } else {
      contract.landlord_signed = true;
    }

    // Nếu cả hai đã ký → hợp đồng hiệu lực + cập nhật trạng thái phòng
    if (contract.tenant_signed && contract.landlord_signed) {
      contract.status = 'active';
      const room = await db.Room.findByPk(contract.room_id);
      if (room) {
        room.status = 'rented';
        await room.save();
      }
    }

    await contract.save();

    res.json({
      success: true,
      message: `Ký kết hợp đồng thành công với tư cách ${role === 'tenant' ? 'Khách thuê' : 'Chủ nhà'}!`,
      contract
    });
  } catch (error) {
    console.error("Error signing contract: ", error);
    res.status(500).json({ success: false, error: "Lỗi server", details: error.message });
  }
};

module.exports = {
  getContracts,
  getContractById,
  signContract
};
