import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import PublishForm from "./publish-form";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import BlogEditor from "../components/blog-editor-component";
import Loader from "../components/loader.component";
import axios from "axios";
import { API_BASE_URL } from "../api/post";

const blogStructure = {
  topic: "",
  banner: "",
  content: {} as OutputData,
  tags: [] as string[],
  des: "",
  author: {},
  visibility: ""
};

interface EditorContextType {
  blog: typeof blogStructure;
  setBlog: React.Dispatch<React.SetStateAction<typeof blogStructure>>;
  editorState: string;
  setEditorState: React.Dispatch<React.SetStateAction<string>>;
  textEditor: EditorJS | null;
  setTextEditor: React.Dispatch<React.SetStateAction<EditorJS | null>>;
}

export const EditorContext = createContext<EditorContextType | undefined>(
  undefined
);

const Editor = () => {
  let { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState<EditorJS | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  useEffect(() => {
    if (!blog_id) {
      return setLoading(false);
    }

    axios
      .post(API_BASE_URL + "/create-blog/get-blog", { blog_id, draft: true, mode: "edit" })
      .then(({ data: { blog } }) => {
        setBlog(blog);
        setLoading(false);
      })
      .catch((err) => {
        setBlog(blogStructure);
        setLoading(false);
      });
  }, []);

  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {/* {editorState === "editor" ? <BlogEditor /> : <PublishForm />} */}
      {access_token === null ? (
        <Navigate to="/singin" />
      ) : loading ? (
        <Loader />
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
};

export default Editor;
