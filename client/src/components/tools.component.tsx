import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import InlineCode from "@editorjs/inline-code";
import Marker from "@editorjs/marker";
import { ToolConstructable, ToolSettings } from "@editorjs/editorjs";
import { uploadImage } from "../common/b2";

const uploadImageByFile = (e: File) => {
  return uploadImage(e).then((url) => {
    if (url) {
      return {
        success: 1,
        file: { url },
      };
    }
  });
};

const uploadImageByURL = (e: string) => {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (err) {
      reject(err);
    }
  });

  return link.then((url) => {
    return {
      success: 1,
      file: { url },
    };
  });
};

export const tools: { [key: string]: ToolConstructable | ToolSettings } = {
  embed: Embed as unknown as ToolConstructable,
  list: {
    class: List as unknown as ToolConstructable,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByURL,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  header: {
    class: Header as unknown as ToolConstructable,
    config: {
      placeholder: "เขียนหัวเรื่อง...",
      level: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote as unknown as ToolConstructable,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
};
