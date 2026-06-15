import "./index.css";
import React, { useState } from "react";
import { Button, Form, Input } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
function SignUp() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    lastname: "",
    password: "",
    confirmPassword: "",
  });
  const [pass1Error, setPass1Error] = useState('');
  const [pass2Error, setPass2Error] = useState('');
      
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setValues({ ...values, email });
  };

    const handlePassWordChange = (e) => {
      const password = e.target.value;
      setValues({ ...values,  password }); 
    };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setValues({ ...values,  confirmPassword }); 
    };

  const handleNameChange = (e) => {
      const lastname = e.target.value;
      setValues({ ...values, lastname });
      };

      const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form
      
        // Reset lỗi trước khi kiểm tra
        setPass1Error('');
        setPass2Error('');
      
        // Kiểm tra các điều kiện hợp lệ
        if (!values.email) {
          toast.error("Vui lòng nhập email!");
          return;
        }
      
        if (!values.lastname) {
          toast.error("Vui lòng nhập họ và tên!");
          return;
        }
      
        if (!values.password) {
          setPass1Error("Vui lòng nhập mật khẩu!");
          toast.error("Vui lòng nhập mật khẩu!");
          return;
        }
      
        if (values.password.length < 6) {
          setPass1Error("Mật khẩu phải có ít nhất 6 ký tự!");
          toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
          return;
        }
      
        if (!/(?=.*[A-Z])(?=.*[0-9])/.test(values.password)) {
          setPass1Error("Mật khẩu phải chứa ít nhất một chữ hoa và một số!");
          toast.error("Mật khẩu phải chứa ít nhất một chữ hoa và một số!");
          return;
        }
      
        if (!values.confirmPassword) {
          setPass2Error("Vui lòng xác nhận mật khẩu!");
          toast.error("Vui lòng xác nhận mật khẩu!");
          return;
        }
      
        if (values.password !== values.confirmPassword) {
          setPass2Error("Mật khẩu xác nhận không khớp!");
          toast.error("Mật khẩu xác nhận không khớp!");
          return;
        }
      
        try {
          console.log(values.email);
          const response = await axios.post("http://localhost:8000/api/auth/register", {
            email: values.email,
            password: values.password,
            lastName: values.lastname,
            role: "user",
          });
      
          // Xử lý khi đăng ký thành công
          if (response.status === 200) {
            toast.success(response.data.message);
            sessionStorage.setItem("authToken", response.data.token);
      
            // Xử lý token
            const parts = response.data.token.split('.'); // Tách token thành 3 phần
            const payload = parts[1];
            const decodedPayload = JSON.parse(atob(payload)); // Giải mã Base64
            sessionStorage.setItem("auth", JSON.stringify(decodedPayload));
      
            setTimeout(() => {
              navigate("/user/home");
            }, 500);
          }
        } catch (error) {
          // Xử lý lỗi từ server
          console.log(error.response?.data?.error);
          toast.error(error.response?.data?.error || "Đã có lỗi xảy ra, vui lòng thử lại!");
        }
      };
      

  const [form] = Form.useForm();
  const [formLayout, setFormLayout] = useState("horizontal");

  const onFormLayoutChange = ({ layout }) => {
    setFormLayout(layout);
  };

  return (
    <div className="signup">
      {/* Right side image */}
      <div className="right-element">
        <img
          src={require("../../../assets/images/signup.png")}
          alt="images"
          className="imagesland"
        />
      </div>
      <div className="left-element">
        <h1 className="title">CREATE AN ACCOUNT</h1>
        <Form
          layout={formLayout}
          form={form}
          initialValues={{
            layout: formLayout,
          }}
          onValuesChange={onFormLayoutChange}
          style={{
            maxWidth: formLayout === "inline" ? "none" : 500,
          }}
        >
          {/* Email */}
          <div className="input-group">
            <h4 className="form-input">Email Address</h4>
            <Form.Item
      name="email"
      rules={[
        {
          required: true,
          message: 'Vui lòng nhập email!',
        },
        {
          type: 'email',
          message: 'Email không hợp lệ!',
        },
        {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Regex kiểm tra email hợp lệ
          message: 'Email phải có định dạng hợp lệ (vd: example@mail.com)',
        },
        {
          min: 6,
          message: 'Email phải có ít nhất 6 ký tự!',
        },
        {
          max: 50,
          message: 'Email không được dài quá 50 ký tự!',
        },
      ]}
      validateTrigger="onBlur" // Kiểm tra khi rời khỏi ô nhập
    >
      <Input 
      placeholder="Enter your email"
      name ="email"
      value={values.email}
      onChange={handleEmailChange}

       />
    </Form.Item>
          </div>

          {/* Password */}
          <div className="input-group">
            <h4 className="form-input">Full name</h4>
            <Form.Item>
              <Input
                placeholder="Enter your password"
                name="lastname"
                value={values.lastname}
                onChange={handleNameChange}
              />
            </Form.Item>
          </div>

          {/* Password */}
          <div className="input-group">
            <h4 className="form-input">Password</h4>
            <Form.Item
  name="password"
  rules={[
    { required: true, message: "Vui lòng nhập mật khẩu!" },
    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
    {
      validator: (_, value) => {
        if (!value) return Promise.resolve();
        if (!/(?=.*[A-Z])/.test(value)) {
          return Promise.reject(new Error("Mật khẩu phải chứa ít nhất một chữ hoa!"));
        }
        if (!/(?=.*[0-9])/.test(value)) {
          return Promise.reject(new Error("Mật khẩu phải chứa ít nhất một số!"));
        }
        return Promise.resolve();
      },
    },
  ]}
>
  <Input.Password
    placeholder="Create your password"
    value={values.password}
    onChange={handlePassWordChange}
  />
</Form.Item>


          </div>
         
          {/* Password */}
          <div className="input-group">
            <h4 className="form-input">Confirm Password</h4>
            <Form.Item
    name="confirmPassword"
    dependencies={["password"]}
    rules={[
      { required: true, message: "Vui lòng xác nhận mật khẩu!" },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue("password") === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
        },
      }),
    ]}
  >
    <Input.Password
      placeholder="Confirm your password"
      value={values.confirmPassword}
      onChange={handleConfirmPasswordChange}
    />
  </Form.Item>
          </div>
          

          {/* Submit button */}
          <Form.Item>
            <Button type="primary" className="button2" onClick={handleSubmit}> 
              Sign up
            </Button>
          </Form.Item>

          {/* Sign up link */}
          <Form.Item>
            <p>
              Already have an account?
              <Link to="/login" style={{ color: "#3D9C38" }}>
                Login
              </Link>
            </p>
          </Form.Item>
        </Form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default SignUp;
