import React, { useEffect, useState } from "react";
import "../misc/helpcentre.css";
import { fetchQuestionsAPI } from "../api/manageQAPI";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { IoChevronBackOutline } from "react-icons/io5";

const Helpnotlog = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchQuestionsAPI();
        if (Array.isArray(fetchedQuestions)) {
          setQuestions(fetchedQuestions);
        } else {
          console.error("Fetched questions is not an array");
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    };

    loadQuestions();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredFaqs = questions.filter((faq) =>
    faq.topic.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="help-centre">
      {/* ปุ่มย้อนกลับ */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: "10px", left: "10px", margin: "100px" }}
      >
        <IoChevronBackOutline />
      </IconButton>

      {/* FAQ Section */}
      <div className="faq">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div className="faq-item" key={index}>
              <details>
                <summary className="faq-question">{faq.topic}</summary>
                <div className="faq-answer">{faq.answer}</div>
              </details>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default Helpnotlog;
