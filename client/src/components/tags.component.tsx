import { useContext } from "react";
import { MdClose } from "react-icons/md";
import { EditorContext } from "../Screens/editor-page";

interface TagProps {
  tag: string;
  tagIndex: number;
}

const Tag: React.FC<TagProps> = ({ tag, tagIndex }) => {
  const context = useContext(EditorContext);

  if (!context) {
    return <div>Error: Context not found!</div>;
  }
  let {
    blog,
    blog: { tags },
    setBlog,
  } = context;

  const handleTagEdit = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();

      let currentTag = (e.target as HTMLElement).innerText;
      tags[tagIndex] = currentTag;

      setBlog({ ...blog, tags });
      (e.target as HTMLElement).setAttribute("contentEditable", "false");
    }
  };

  const addEditable = (e: React.MouseEvent<HTMLParagraphElement>) => {
    e.currentTarget.setAttribute("contentEditable", "true");
    e.currentTarget.focus();
  };

  const handleTagDelete = () => {
    tags = tags.filter((t) => t !== tag);
    setBlog({ ...blog, tags });
  };

  return (
    <div className="tags-order">
      <p
        className="outline-none m-0"
        style={{ outline: "none" }}
        onKeyDown={handleTagEdit}
        onClick={addEditable}
      >
        {tag}
      </p>
      <button className="button-tag-del" onClick={handleTagDelete}>
        <MdClose className="text-xl pointer-events-none" />
      </button>
    </div>
  );
};

export default Tag;
