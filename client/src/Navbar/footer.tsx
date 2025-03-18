import "../Navbar/footer.css";
import { MdEmail } from "react-icons/md";
import logoKKU from "../pic/logo-headV2.png";
import { FaFacebookF } from "react-icons/fa6";
import { FaInstagram, FaGithub } from "react-icons/fa";
import { MdOutlineCopyright } from "react-icons/md";

const Footer = () => {
  return (
    <div className="footer">
      <section className="contact">
        <div className="contact-info">
          <div className="first-info">
            <img src={logoKKU} alt="" />

            <p>
              Final Project, <br /> College of Computing Khon Kaen University
            </p>
            <p>Chalita.sak@kkumail.com</p>
            <p>Piyarat.up@kkumail.com</p>

            <div className="social-icon">
              <a href="">
                <FaFacebookF />
              </a>
              <a href="">
                <MdEmail />
              </a>
              <a href="">
                <FaInstagram />
              </a>
              <a href="">
                <FaGithub />
              </a>
            </div>
          </div>

          <div className="second-info">
            <h4>Support</h4>
            <p>Contact us</p>
            <p>About page</p>
            <p>Size Guide</p>
            <p>Privacy</p>
          </div>

          <div className="third-info">
            <h4>Infomation</h4>
            <p>Contact us</p>
            <p>About page</p>
            <p>Size Guide</p>
            <p>Shopping & Resturns</p>
            <p>Privacy</p>
          </div>

          <div className="fourth-info">
            <h4>Categoriest</h4>
            <p>ทั่วไป</p>
            <p>ข่าวประชาสัมพันธ์</p>
            <p>การศึกษา</p>
            <p>น้องใหม่</p>
          </div>

          <div className="five">
            <h4>ติดตามเรา</h4>
            <p>
              สามารถติดตามเราได้ทางที่อยู่, โซเชียลมีเดีย
              หรือแพลตฟอร์มที่เราแจ้งด้านล่าง
            </p>
            <p>Have a good Day!</p>
          </div>
        </div>
      </section>

      <div className="end-text">
        <p>
          Copyright <MdOutlineCopyright /> @2023. All Rights Reserved.Design By
          IT37.
        </p>
      </div>
    </div>
  );
};

export default Footer;
