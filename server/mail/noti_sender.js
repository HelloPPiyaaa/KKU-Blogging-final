const path = require('path');
const transporter = require('./transporter.js');
const Template = require('./templates/notiMail.js');
const User = require("../models/user");
const Blog = require("../models/blog");

const logoPath = path.join(__dirname, './assets/logo-head.jpg');

const NotiMailer = async (targetId,actionById,userAction,actionId,reason) => {
    // const capUserAction = userAction.charAt(0).toUpperCase() + userAction.slice(1)
    const capUserAction = userAction=='like'?'การกดถูกใจ':userAction=='comment'?'การแสดงความคิดเห็น':userAction=='reply'?'การตอบกลับ':userAction=='follow'?'การติดตาม':userAction=='delete'?'จากผู้ดูแลระบบ':null;

    const findTargetUser = await User.findById(targetId);
    const findActionUser = actionById=='System'?'System':await User.findById(actionById);
    console.log("accept email: ",findTargetUser.notification_email_enable);

    if(findTargetUser.notification_email_enable){
        const to = findTargetUser.email;
        const toName = findTargetUser.username;
        const actionByName = actionById=='System'?'':findActionUser.username;
        let actionTopic = null;
        let actionDirect = null;    
        
        if(actionId && (userAction == 'like' || userAction == 'comment' || userAction == 'reply')){
            const find = await Blog.findById(actionId);
            actionTopic = `บล็อก ${find.topic} ของคุณ`;
            actionDirect = `${process.env.FRONTEND_ENDPOINT}/blog/${find.blog_id}`;
        }
        else if(userAction == 'follow'){
            actionTopic = "โปรไฟล์ของคุณ"
            actionDirect = `${process.env.FRONTEND_ENDPOINT}/user/${actionById}`
        }else if(userAction == 'delete'){
            actionTopic = `ระบบได้ลบบล็อก ${actionId} ของคุณเนื่องจาก ${reason}`
            actionDirect = `${process.env.FRONTEND_ENDPOINT}/dashboard/notifications`
        }
    
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: to,
            subject: `[KKU Blogging] แจ้งเตือน${capUserAction}`,
            html: Template(toName,capUserAction,actionByName,actionTopic,actionDirect),
            attachments: [
                {
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'logo'
                }
            ]
        };
    
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response,"SUCCESS");
            console.log("TO: ",to)
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }else{
        console.log("Not accept email, Cancel send email");
    }

};

module.exports = { NotiMailer };
