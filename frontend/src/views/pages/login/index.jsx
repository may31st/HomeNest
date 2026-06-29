import "./index.css";
import React, { useState } from "react";
import { Button, Form, Input } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import {jwtDecode} from 'jwt-decode';

function Login() {
      const navigate = useNavigate();
      const [values, setValues] = useState({
        email: "",
        password: "",
      });
      const [pass1Error, setPass1Error] = useState('');
          
      const handleMailChange = (e) => {
        const email = e.target.value;
        setValues({ ...values, email });
      };
      const handlePassWordChange = (e) => {
        const password = e.target.value;
        setValues({ ...values,  password });
        };
    const handleSubmit = async (e) => { 
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form
        // Reset lỗi trước khi kiểm tra
        setPass1Error('');
        // Kiểm tra các điều kiện hợp lệ
        if (!values.email) {
          toast.error("Vui lòng nhập email!");
          return;
        }
        if (!values.password) {
            setPass1Error("Vui lòng nhập mật khẩu!");
            toast.error("Vui lòng nhập mật khẩu!");
            return;
            }
        // Gửi dữ liệu lên server
        try {
            const response = await axios.post("http://localhost:8000/api/auth/login",{
                email: values.email,
                password: values.password,
                role: "user",
            });
            if (response.status === 200) {
            toast.success(response.data.message);
            sessionStorage.setItem("authToken", response.data.token);

            const user = jwtDecode(response.data.token);
      
            // Xử lý token
            sessionStorage.setItem("auth", JSON.stringify(user));

            setTimeout(() => {
              navigate("/user/home", {state :user} );
            }, 500);
          }
        } catch (error) {
          // Xử lý lỗi từ server
          console.log(error.response?.data?.error);
          toast.error(error.response?.data?.error || "Đã có lỗi xảy ra, vui lòng thử lại!");
        }
      };
      


    const [form] = Form.useForm();
    const [formLayout, setFormLayout] = useState('horizontal');
    
    const onFormLayoutChange = ({ layout }) => {
      setFormLayout(layout);
    };
    
    return (
        <div className="login">
            <div className="left-element">
                <h1 className="title">WELCOME BACK</h1>
                <p className="sub-title">Welcome back! Please enter your details.</p>
                
                <Form
                    layout={formLayout}
                    form={form}
                    initialValues={{
                        layout: formLayout,
                    }}
                    onValuesChange={onFormLayoutChange}
                    style={{
                        maxWidth: formLayout === 'inline' ? 'none' : 500,
                    }}
                >
                    {/* Email */}
                    <div className="input-group">
                        <h4 className="form-input">Email</h4>
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
                              onChange={handleMailChange}
                        
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

                    {/* Forgot password */}
                    <Form.Item>
                    <Link to="/sign-up" className="forgotpassword" >Forgot the password?</Link>
                    </Form.Item>
                    {/* Submit button */}
                    <Form.Item>
                        <Button type="primary" className ="button2" onClick={handleSubmit}>Sign in</Button>
                    </Form.Item>

                    {/* Social sign-in */}
                    <Form.Item>
                        <Button className="social-button" >
                            <FontAwesomeIcon icon={faGoogle} className="icongg"/>
                            Sign in with Google
                        </Button>
                    </Form.Item>
                    {/* Sign up link */}
                    <Form.Item>
                         <p>
                            Don't have an account? 
                            <Link to="/sign-up" style={{ color: '#3D9C38' }}>Sign up to free!</Link>
                        </p>
                    </Form.Item>
                </Form>
                      <ToastContainer />
            </div>

            {/* Right side image */}
            <div className="right-element">
                <img
                    src={require("../../../assets/images/login.png")}
                    alt="images"
                    className="imagesland"
                />
            </div>
        </div>
    );
}

export default Login;
