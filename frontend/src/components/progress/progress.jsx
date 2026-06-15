import React, { useState } from "react";
import { Button, Flex, Progress, Space } from "antd";

const ProgressComponent = ({ steps }) => {
  const [step, setStep] = useState(0); // Bắt đầu từ bước 0

  const increase = () => {
    if (step < steps.length - 1) setStep((prev) => prev + 1);
  };

  const decline = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  return (
    <Flex vertical gap="medium">
      {/* Thanh tiến trình */}
      <Progress percent={(step / (steps.length - 1)) * 100} type="line" showInfo={false} />

      {/* Hiển thị form tương ứng với bước hiện tại */}
      <div>{steps[step]}</div>

      {/* Nút điều hướng */}
      <Space>
        <Button onClick={decline} disabled={step === 0}>
          Quay lại
        </Button>
        <Button onClick={increase} type="primary" disabled={step === steps.length - 1}>
          Tiếp tục
        </Button>
      </Space>
    </Flex>
  );
};

export default ProgressComponent;
