import { Link } from "react-router-dom";
import pageNotFoundImage from "../pic/404.png";
import logoKKU from "../pic/logo-head.jpg";

const PageNotFound = () => {
  return (
    <section className="h-cover position-relative p-5 d-flex flex-column align-items-center gap-3 text-center">
      <img
        src={pageNotFoundImage}
        alt=""
        className="rounded"
        style={{
          userSelect: "none",
          border: "2px solid #f0f0f0",
          width: "15rem",
          aspectRatio: "1/1",
          objectFit: "cover",
        }}
      />
      <h1 className="fs-3" style={{ lineHeight: "1.75" }}>
        Page Not Found
      </h1>
      <p className="m-0 mt-2" style={{ color: "#494949", lineHeight: "1.75" }}>
        ไม่พบหน้าที่คุณกำลังค้นหา มุ่งหน้ากลับไปที่
        <Link to="/" className="underline" style={{ color: "black" }}>
          หน้าหลัก
        </Link>
      </p>

      <div className="mt-auto">
        <img
          src={logoKKU}
          className=" d-block mx-auto"
          style={{ objectFit: "contain", userSelect: "none", height: "3rem" }}
          alt=""
        />
        <p className="m-0 mt-2" style={{ color: "#494949" }}>
          อ่านเรื่องราวและแลกเปลี่ยนประสบการณ์ผ่านเรา
        </p>
      </div>
    </section>
  );
};

export default PageNotFound;
