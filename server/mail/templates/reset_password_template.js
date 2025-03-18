const mjml2html = require("mjml");

const resetPasswordTemplate = (name, resetLink, referenceId) => {
  return mjml2html(`
    <mjml>
      <!-- Import Google Font -->
      <mj-head>
        <mj-font name="Kanit" href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap" />
        <mj-style inline="inline">
          body { font-family: 'Kanit', sans-serif; }
        </mj-style>
      </mj-head>
      <mj-body background-color="#f4f4f4" full-width="full-width">
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-image width="300px" height="80px" src="cid:logo" />
          </mj-column>
        </mj-section>
    
        <!-- Main Content Section with Thai Language -->
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <!-- Greeting in Thai -->
            <mj-text font-size="18px" font-family="Kanit, sans-serif" color="#333333" align="center">
              สวัสดี ${name}, มาทำการตั้งค่ารหัสผ่านของคุณใหม่กันเถอะ
            </mj-text>
            <mj-text font-size="14px" font-family="Kanit, sans-serif" color="#888888" line-height="1.5em" align="center">
              เราได้รับคำขอให้เปลี่ยนรหัสผ่านสำหรับบัญชี KKU Bloging Platform ของคุณ ${name}.
              หากคุณไม่ได้ขอเปลี่ยนรหัสผ่าน คุณสามารถเพิกเฉยต่ออีเมลนี้ได้ รหัสผ่านของคุณจะไม่ถูกเปลี่ยนแปลง
              ลิงก์ด้านล่างจะมีอายุใช้งาน 24 ชั่วโมง.
            </mj-text>
            <mj-button background-color="#000" color="#ffffff" href="${resetLink}" font-size="16px" padding="15px 30px" border-radius="50px" font-family="Kanit, sans-serif">
              ตั้งค่ารหัสผ่านของคุณใหม่
            </mj-button>
            <mj-text font-size="14px" color="#333333" padding="0px 0 24px 0" font-family="Kanit, sans-serif" align="center">
              รหัสอ้างอิง: (${referenceId})
            </mj-text>
            <mj-text font-size="14px" color="#888888" padding="10px 0 0 0" font-family="Kanit, sans-serif" align="center">
              หากปุ่มข้างต้นไม่ทำงาน คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ของคุณ:
            </mj-text>
            <mj-text font-size="14px" color="#333333" word-wrap="break-word" align="center">
              <a href="${resetLink}" style="color: #7353BA;">${resetLink}</a>
            </mj-text>
            <mj-text font-size="12px" color="#888888" padding="20px 0 0 0" font-family="Kanit, sans-serif" align="center">
              หากคุณไม่ได้ร้องขอการตั้งค่ารหัสผ่านใหม่ คุณสามารถเพิกเฉยต่ออีเมลนี้ได้
            </mj-text>
          </mj-column>
        </mj-section>
    
        <!-- Footer Section -->
        <mj-section background-color="#ffffff" padding="10px" border-radius="0 0 8px 8px">
          <mj-column>
            <mj-text font-size="12px" color="#888888" align="center" font-family="Kanit, sans-serif">
              © 2024 KKU Bloging Platform. All rights reserved.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
    `).html;
};

module.exports = resetPasswordTemplate;
