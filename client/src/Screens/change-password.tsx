import InputBox from "../components/input.component";
import AnimationWrapper from "./page-animation";
import "../misc/blogpage.css";
import { useContext, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";
import { Link } from "react-router-dom";

const ChangPassword = () => {
    let {
        userAuth: { access_token }
    } = useContext(UserContext);
    const changePasswordForm = useRef<HTMLFormElement | null>(null);

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!changePasswordForm.current) {
            return toast.error("ไม่สามารถเข้าถึงฟอร์มได้");
        }

        let form = new FormData(changePasswordForm.current as HTMLFormElement);
        let formData: { [key: string]: string } = {};

        form.forEach((value, key) => {
            if (typeof value === "string") {
                formData[key] = value;
            }
        });

        let { currentPassword, newPassword, ChecknewPassword } = formData;

        if (!currentPassword.length || !newPassword.length || !ChecknewPassword) {
            return toast.error("กรอกข้อมูลให้ครบทุกช่อง");
        }

        if (
            !passwordRegex.test(currentPassword) ||
            !passwordRegex.test(newPassword) ||
            !passwordRegex.test(ChecknewPassword)
        ) {
            return toast.error(
                "รหัสผ่านควรมีความยาว 6-20 ตัวอักษร พร้อมตัวเลข ตัวพิมพ์เล็ก 1 ตัว ตัวพิมพ์ใหญ่ 1 ตัว"
            );
        }

        const target = e.target as HTMLFormElement;
        target.setAttribute("disabled", "true");
        let loadingToast = toast.loading("กำลังอัพเดต...");

        axios
            .post(`${process.env.REACT_APP_API_ENDPOINT}/create-blog/change-password`, formData, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
            .then(() => {
                toast.dismiss(loadingToast);
                target.removeAttribute("disabled");
                return toast.success("อัพเดตรหัสผ่านแล้ว");
            })
            .catch(({ response }) => {
                toast.dismiss(loadingToast);
                target.removeAttribute("disabled");
                return toast.error(response.data.error);
            });
    };

    return (
        <AnimationWrapper>
            <Toaster />
            <form ref={changePasswordForm} className="m-3" onSubmit={handleSubmit}>
                <h1 className="topic-ChangePass fs-5">เปลี่ยนรหัสผ่าน</h1>

                <div className="inputChangpassword">
                    <InputBox
                        name="currentPassword"
                        type="password"
                        className="profile-edit-input"
                        placeholder="รหัสผ่านปัจจุบัน"
                        icon="SlLockOpen"
                    />

                    <InputBox
                        name="newPassword"
                        type="password"
                        className="profile-edit-input"
                        placeholder="รหัสผ่านใหม่"
                        icon="SlLockOpen"
                    />

                    <InputBox
                        name="ChecknewPassword"
                        type="password"
                        className="profile-edit-input"
                        placeholder="ยืนยันรหัสผ่านใหม่"
                        icon="SlLockOpen"
                    />
                    <p className="text text-r">
                        หรือ <Link to="/forgot-password-user">เปลี่ยนรหัสผ่าน</Link> ผ่านอีเมล
                    </p>
                    <button className="btn-dark px-5" type="submit">
                        เปลี่ยนรหัสผ่าน
                    </button>
                </div>
            </form>
        </AnimationWrapper>
    );
};

export default ChangPassword;
