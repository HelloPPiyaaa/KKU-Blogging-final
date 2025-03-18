import { Link, useNavigate, useParams } from "react-router-dom";
import logoKKU from "../pic/logo-head.jpg";
import "../misc/blogEdit.css";
import defaultBanner from "../pic/blog banner.png";
import { uploadImage } from "../common/b2";
import { useContext, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { tools } from "../components/tools.component";
import { UserContext } from "../App";
import AnimationWrapper from "../Screens/page-animation";
import { EditorContext } from "../Screens/editor-page";
import axios from "axios";
import { MdClose } from "react-icons/md";
import VisibilitySelector from "./visibility-selector.component";
import Tag from "./tags.component";
import "../misc/publish-form.css";

const BlogEditor = () => {
  const [visibility, setVisibility] = useState("public");
  const characterLimit = 200;
  const tagLimit = 10;

  const API_URL =
    process.env.REACT_APP_API_ENDPOINT ||
    "https://kku-blog-server-ak2l.onrender.com";
  const editorContext = useContext(EditorContext);
  let { blog_id } = useParams();

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const navigate = useNavigate();

  if (!editorContext) {
    throw new Error("EditorContext must be used within an EditorProvider");
  }

  const {
    blog,
    blog: { topic, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = editorContext;

  useEffect(() => {
    if (!textEditor?.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "มาเขียนเรื่องราวสุดเจ๋งกันเถอะ!",
        })
      );
    }
  }, []);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e.target.files?.[0];
    const loadingToast = toast.loading("Uploading...");
    if (img) {
      uploadImage(img) // ถ้ามีไฟล์เรียกใช้ uploadImage
        .then((url) => {
          console.log("Uploaded URL:", url);
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded!");
            setBlog({ ...blog, banner: url });
            console.log("Uploaded URL:", url);
            console.log("Updated Blog Banner:", { ...blog, banner: url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          return toast.error(err.message || "Error uploading image.");
        });
    } else {
      toast.dismiss(loadingToast);
      toast.error("Please select an image."); // แจ้งเตือนถ้าไม่มีการเลือกไฟล์
    }
    console.log("Banner URL:", banner);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target;

    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, topic: input.value });
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    let img = e.currentTarget;
    img.src = defaultBanner;
  };

  const handleSaveDraft = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLButtonElement;

    if (target.className.includes("disable")) {
      return;
    }

    if (!topic.length) {
      return toast.error("เขียนชื่อบล็อกก่อนบันทึกฉบับร่าง");
    }

    let loadingToast = toast.loading("กำลังบันทึกฉบับร่าง...");
    target.classList.add("disable");

    if (textEditor?.isReady) {
      textEditor.save().then(async (content) => {
        let blogObj = {
          topic,
          banner,
          des,
          content,
          tags,
          draft: true,
          visibility,
        };
        axios
          .post(
            API_URL + "/create-blog",
            { ...blogObj, id: blog_id },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          )
          .then(() => {
            (e.target as HTMLButtonElement).classList.remove("disable");

            toast.dismiss(loadingToast);
            toast.success("บันทึกแล้ว");

            setTimeout(() => {
              navigate("/dashboard/blogs?tab=draft");
            }, 500);
          })
          .catch((err) => {
            toast.dismiss(loadingToast);
            toast.error(err.response.data.error);
            target.classList.remove("disable");
          });
      });
    }
  };

  const handleBlogTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlog({ ...blog, topic: e.target.value });
  };
  const handleBlogDesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBlog({ ...blog, des: e.target.value });
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      let tag = e.currentTarget.value;

      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        } else {
          toast.error(`คุณเพิ่มสูงสุดแล้ว ${tagLimit}`);
        }
      }
      e.currentTarget.value = "";
    }
  };

  const publishBlog = (e: any) => {
    const target = e.target as HTMLButtonElement;
    if (target.className.includes("disable")) {
      return;
    }
    if (!banner.length) {
      return toast.error("อัพโหลดแบนเนอร์เพื่อเผยแพร่");
    }
    if (!topic.length) {
      return toast.error("เขียนชื่อบล็อกก่อนเผยแพร่");
    }

    if (textEditor?.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (!des.length || des.length > characterLimit) {
      return toast.error(
        `เขียนรายละเอียดเกี่ยวกับบล็อกของคุณภายใน ${characterLimit} ตัวอักษรก่อนเผยแพร่`
      );
    }
    if (!tags.length) {
      return toast.error("กรอกอย่างน้อย 1 แท็ก เพื่อช่วยจัดอันดับบล็อกของคุณ");
    }

    let loadingToast = toast.loading("กำลังเผยแพร่...");
    target.classList.add("disable");

    if (textEditor?.isReady) {
      textEditor.save().then(async (content) => {
        let blogObj = {
          topic,
          banner,
          des,
          content,
          tags,
          draft: false,
          visibility,
        };
        axios
          .post(
            API_URL + "/create-blog",
            { ...blogObj, id: blog_id },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          )
          .then(() => {
            target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("เผยแพร่แล้ว");
            setTimeout(() => {
              navigate("/homepage");
            }, 500);
          })
          .catch(({ response }) => {
            target.classList.remove("disable");
            toast.dismiss(loadingToast);
            return toast.error(response.data.error);
          });
      });
    }
  };

  return (
    <>
      <nav className="navbar-navbar">
        <Link to="/" className="logo-link">
          <img src={logoKKU} alt="" className="logo-img" />
        </Link>

        <p className=" new-blog">{topic.length ? topic : ""}</p>

        <div className="d-flex gap-4" style={{ marginLeft: "auto" }}>
          <button className="btn-dark py-2" onClick={publishBlog}>
            เผยแพร่
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            บันทึกร่าง
          </button>
        </div>
      </nav>
      <Toaster />

      <AnimationWrapper>
        <section>
          <div className="Banner-divhost">
            <div className="Banner-div ">
              <label htmlFor="uploadBanner" style={{width:"100%", height:"100%", objectFit:"cover", overflow:"hidden"}}>
                <img
                  src={banner}
                  alt=""
                  style={{ zIndex: "20" }}
                  onError={handleError}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <div className="div-p-text" style={{ margin: "1rem 0" }}>
              <VisibilitySelector
                visibility={visibility}
                onChange={setVisibility}
              />

              <p className="p-text">ชื่อบล็อก</p>
              <input
                type="text"
                placeholder="ชื่อบล็อก..."
                defaultValue={topic}
                className="input-box pl-4"
                onChange={handleBlogTitleChange}
              />

              <p className="p-text">รายละเอียดเกี่ยวกับบล็อกของคุณ</p>
              <textarea
                maxLength={characterLimit}
                defaultValue={des}
                className="textarea-input-box input-box"
                onChange={handleBlogDesChange}
                onKeyDown={handleTitleKeyDown}
                placeholder="รายละเอียด"
              />

              <p className="p-characters">
                เหลือ {characterLimit - des.length} ตัวอักษร
              </p>

              <p className="topic-p">
                เพิ่มแท็กเพื่อช่วยค้นหาและจัดอันดับบล็อกของคุณ
              </p>

              <div className="position-relative input-box pl-2 pb-4">
                <input
                  type="text"
                  placeholder="Enter เพื่อเพิ่มแท็ก"
                  className="sticky-bg input-box"
                  onKeyDown={handleKeyDown}
                />
                {tags.map((tag, i) => (
                  <Tag tag={tag} tagIndex={i} key={i} />
                ))}
              </div>
              <p className="p-tagLimit">เหลือ {tagLimit - tags.length} แท็ก</p>
            </div>

            <hr className="w-100 my-1" style={{ opacity: "0.1" }} />
          </div>

          <div id="textEditor"></div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;