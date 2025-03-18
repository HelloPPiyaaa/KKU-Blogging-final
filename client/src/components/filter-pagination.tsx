import axios from "axios";
import { Post } from "../types/post";

interface FilterPaginationDataProps {
  create_new_arr?: boolean;
  state?: any;
  save?: any;  // เพิ่ม property save (ถ้าจำเป็น)
  data: any[];
  page?: number;
  countRoute?: string;
  data_to_send?: any;
  user?: string;
}

export const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {},
  user = undefined,
}: FilterPaginationDataProps) => {
  let obj;

  const headers: { headers?: { Authorization: string } } = {};

  if (user) {
    headers.headers = {
      Authorization: `Bearer ${user}`,
    };
  }

  if (state && !create_new_arr) {
    obj = { ...state, result: [...state.result, ...data], page: page };
  } else {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}${countRoute}`,
        data_to_send,
        headers
      );
      const totalDocs = response.data.totalDocs; // ใช้ totalDocs จากการตอบกลับ API
      obj = { result: data, page: 1, totalDocs }; // จัดเก็บข้อมูลทั้งหมดใน obj
    } catch (err) {
      console.error(err); // แสดงข้อผิดพลาดหากมี
    }
  }
  return obj;
};
