import { VscKey } from "react-icons/vsc";
import "../misc/InputBox.css";
import { FaUser } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { IoEyeOffOutline } from "react-icons/io5";
import { useState } from "react";
import { IoEyeOutline } from "react-icons/io5";

interface InputBoxProps {
  name: string;
  type: string;
  id?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: string;
  className?: string;
  disabled?: boolean;
}
const iconMap: { [key: string]: React.ElementType } = {
  FaUser: FaUser,
  MdOutlineMail: MdOutlineMail,
  VscKey: VscKey,
};

const InputBox: React.FC<InputBoxProps> = ({
  name,
  type,
  id,
  value,
  onChange,
  placeholder,
  icon,
  disabled = false,
}) => {
  const IconComponent = icon ? iconMap[icon] : null;
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div
      className="Box"
      style={{ position: "relative", width: "100%", marginBottom: "1rem" }}
    >
      {icon && (
        <i
          className={icon}
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        ></i>
      )}
      {IconComponent && (
        <IconComponent
          className="input-icon"
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      )}
      <input
        name={name}
        type={
          type === "password" ? (passwordVisible ? "text" : "password") : type
        }
        placeholder={placeholder}
        defaultValue={value}
        onChange={onChange}
        id={id}
        className="input-box"
        disabled={disabled}
        style={{ paddingLeft: "48px" }}
      />

      {type === "password" &&
        (passwordVisible ? (
          <IoEyeOutline
            className="input-icon"
            style={{ left: "auto", right: "1rem", cursor: "pointer" }}
            onClick={() => setPasswordVisible((currentVal) => !currentVal)}
          />
        ) : (
          <IoEyeOffOutline
            className="input-icon"
            style={{ left: "auto", right: "1rem", cursor: "pointer" }}
            onClick={() => setPasswordVisible((currentVal) => !currentVal)}
          />
        ))}
    </div>
  );
};

export default InputBox;
