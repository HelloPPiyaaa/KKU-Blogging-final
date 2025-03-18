const mjml2html = require("mjml");

const activityNotificationTemplate = (name, userAction, actionBy, targetName,targetLink) => {
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
              สวัสดี ${name}, มีการกระทำบางอย่างในบัญชีของคุณ!
            </mj-text>
            <mj-text font-size="14px" font-family="Kanit, sans-serif" color="#888888" line-height="1.5em" align="center">
              ${actionBy} ${userAction}${targetName}.
            </mj-text>
            <mj-text font-size="14px" font-family="Kanit, sans-serif" color="#888888" line-height="1.5em" align="center">
              หากคุณไม่รู้จักหรือไม่ได้ทำการกระทำนี้ คุณสามารถติดต่อเราหรือเพิกเฉยต่ออีเมลนี้
            </mj-text>

            <!-- Button or action link -->
            <mj-button background-color="#000" color="#ffffff" href="${targetLink}" font-size="16px" padding="15px 30px" border-radius="50px" font-family="Kanit, sans-serif">
              ดูรายละเอียด
            </mj-button>

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

module.exports = activityNotificationTemplate;
