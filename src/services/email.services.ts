import nodemailer from 'nodemailer';
import { insertLog } from './log.services';

export async function sendEmailWithBase64Image(to: string, qrCodeImage: string, name: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // Hostinger SMTP server
    port: 465, // Secure SMTP port
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const htmlContent = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <title></title>

    <style type="text/css">
      @media only screen and (min-width: 620px) {
        .u-row {
          width: 600px !important;
        }

        .u-row .u-col {
          vertical-align: top;
        }

        .u-row .u-col-100 {
          width: 600px !important;
        }
      }

      @media only screen and (max-width: 620px) {
        .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }

        .u-row {
          width: 100% !important;
        }

        .u-row .u-col {
          display: block !important;
          width: 100% !important;
          min-width: 320px !important;
          max-width: 100% !important;
        }

        .u-row .u-col > div {
          margin: 0 auto;
        }

        .u-row .u-col img {
          max-width: 100% !important;
        }
      }

      body {
        margin: 0;
        padding: 0;
      }
      table,
      td,
      tr {
        border-collapse: collapse;
        vertical-align: top;
      }
      .ie-container table,
      .mso-container table {
        table-layout: fixed;
      }
      * {
        line-height: inherit;
      }
      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }

      table,
      td {
        color: #000000;
      }
    </style>

    <!--[if !mso]><!-->
    <link
      href="https://fonts.googleapis.com/css2?family=Arvo&display=swap"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://fonts.googleapis.com/css?family=Raleway:400,700&display=swap"
      rel="stylesheet"
      type="text/css"
    />
    <!--<![endif]-->
  </head>

  <body
    class="clean-body u_body"
    style="
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      background-color: #f5f5f5;
      color: #000000;
      padding: 24px;
    "
  >
    <!--[if IE]><div class="ie-container"><![endif]-->
    <!--[if mso]><div class="mso-container"><![endif]-->
    <table
      style="
        border-collapse: collapse;
        table-layout: fixed;
        border-spacing: 0;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        vertical-align: top;
        min-width: 320px;
        margin: 0 auto;
        background-color: #f5f5f5;
        width: 100%;
      "
      cellpadding="0"
      cellspacing="0"
    >
      <tbody>
        <tr style="vertical-align: top">
          <td
            style="
              word-break: break-word;
              border-collapse: collapse !important;
              vertical-align: top;
            "
          >
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #FFFFFF;"><![endif]-->
            <div class="u-row-container" style="padding: 0px; background-color: transparent">
              <div
                class="u-row"
                style="
                  margin: 0 auto;
                  min-width: 320px;
                  max-width: 600px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  word-break: break-word;
                  background-color: transparent;
                "
              >
                <div
                  style="
                    border-collapse: collapse;
                    display: table;
                    width: 100%;
                    height: 100%;
                    background-color: transparent;
                  "
                >
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                  <div
                    class="u-col u-col-100"
                    style="
                      max-width: 320px;
                      min-width: 600px;
                      display: table-cell;
                      vertical-align: top;
                    "
                  >
                    <div style="height: 100%; width: 100% !important">
                      <!--[if (!mso)&(!IE)]><!--><div
                        style="
                          box-sizing: border-box;
                          height: 100%;
                          padding: 0px;
                          border-top: 0px solid transparent;
                          border-left: 0px solid transparent;
                          border-right: 0px solid transparent;
                          border-bottom: 0px solid transparent;
                        "
                      ><!--<![endif]-->
                        <table
                          style="font-family: arial, helvetica, sans-serif"
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          border="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                style="
                                  overflow-wrap: break-word;
                                  word-break: break-word;
                                  padding: 0px;
                                  font-family: arial, helvetica, sans-serif;
                                "
                                align="left"
                              >
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td
                                      style="padding-right: 0px; padding-left: 0px"
                                      align="center"
                                    >
                                      <img
                                        align="center"
                                        border="0"
                                        src="https://readiness.vn/wp-content/uploads/2024/12/674e33dd-af9a-4c89-a80e-5aefcac7c3ad-2.jpeg"
                                        alt="image"
                                        title="image"
                                        style="
                                          outline: none;
                                          text-decoration: none;
                                          -ms-interpolation-mode: bicubic;
                                          clear: both;
                                          display: inline-block !important;
                                          border: none;
                                          height: auto;
                                          float: none;
                                          width: 100%;
                                          max-width: 600px;
                                          border-top-left-radius: 5px;
                                          border-top-right-radius: 5px;
                                        "
                                        width="600"
                                      />
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            <div class="u-row-container" style="padding: 0px; background-color: transparent">
              <div
                class="u-row"
                style="
                  margin: 0 auto;
                  min-width: 320px;
                  max-width: 600px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  word-break: break-word;
                  background-color: #ffffff;
                  border-radius: 5px;
                "
              >
                <div
                  style="
                    border-collapse: collapse;
                    display: table;
                    width: 100%;
                    height: 100%;
                    background-color: transparent;
                  "
                >
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->

                  <!--[if (mso)|(IE)]><td align="center" width="580" style="width: 580px;padding: 0px;border-top: 0px solid transparent;border-left: 10px solid #ffffff;border-right: 10px solid #ffffff;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                  <div
                    class="u-col u-col-100"
                    style="
                      max-width: 320px;
                      min-width: 600px;
                      display: table-cell;
                      vertical-align: top;
                    "
                  >
                    <div
                      style="
                        height: 100%;
                        width: 100% !important;
                        border-radius: 0px;
                        -webkit-border-radius: 0px;
                        -moz-border-radius: 0px;
                      "
                    >
                      <!--[if (!mso)&(!IE)]><!--><div
                        style="
                          box-sizing: border-box;
                          height: 100%;
                          padding: 0px;
                          border-top: 0px solid transparent;
                          border-left: 10px solid #ffffff;
                          border-right: 10px solid #ffffff;
                          border-bottom: 0px solid transparent;
                          border-radius: 0px;
                          -webkit-border-radius: 0px;
                          -moz-border-radius: 0px;
                        "
                      ><!--<![endif]-->
                        <table
                          style="font-family: arial, helvetica, sans-serif"
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          border="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                style="
                                  overflow-wrap: break-word;
                                  word-break: break-word;
                                  padding: 20px 50px 0px 30px;
                                  font-family: arial, helvetica, sans-serif;
                                "
                                align="left"
                              >
                                <div
                                  style="
                                    font-family: Arvo;
                                    font-size: 24px;
                                    color: #000000;
                                    line-height: 140%;
                                    text-align: center;
                                    word-wrap: break-word;
                                  "
                                >
                                  <p
                                    style="
                                      line-height: 140%;
                                      margin: 0px;
                                      margin-bottom: 20px;
                                      color: #6e27c5;
                                      font-size: 32px;
                                      text-transform: uppercase;
                                    "
                                  >
                                    Annual Staff Party 2025
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table
                          style="font-family: arial, helvetica, sans-serif"
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          border="0"
                        >
                          <tbody>
                            <tr>
                              <td
                                style="
                                  overflow-wrap: break-word;
                                  word-break: break-word;
                                  padding: 0px 30px 40px 20px;
                                  font-family: arial, helvetica, sans-serif;
                                "
                                align="left"
                              >
                                <div
                                  style="
                                    font-family: 'Raleway', sans-serif;
                                    font-size: 14px;
                                    color: #151515;
                                    line-height: 170%;
                                    text-align: left;
                                    word-wrap: break-word;
                                  "
                                >
                                  <p style="line-height: 170%; margin: 0px">
                                    Xin chào <b>${name || to}</b>
                                  </p>
                                  <br />
                                  <p style="line-height: 170%; margin: 0px"></p>
                                  <p style="line-height: 170%; margin: 0px">
                                    Anh/Chị vừa nhận được một thông điệp chân thành từ một người
                                    đồng đội tại Chubb Life Việt Nam. Đây là món quà đặc biệt dành
                                    riêng cho Anh/Chị.
                                  </p>
                                  <br />
                                  <p style="line-height: 170%; margin: 0px"></p>
                                  <p style="line-height: 170%; margin: 0px">
                                    Mã QR code thông điệp của Anh/Chị:
                                  </p>
                                  <div
                                    style="
                                      text-align: center;
                                      margin-top: 20px;
                                      margin-bottom: 20px;
                                    "
                                  >
                                    <img src="cid:qrcode" alt="QR Code" />
                                  </div>
                                  <p style="line-height: 170%; margin: 0px"></p>
                                  <p style="line-height: 170%; margin: 0px">
                                    Để lắng nghe thông điệp này, Anh/Chị hãy mang mã QR code đến sự
                                    kiện Annual Staff Party 2025 nhé!
                                  </p>
                                  <ul style="padding-left: 16px">
                                    <li style="line-height: 23.8px">
                                      <b>Thời gian sử dụng QR code thông điệp:</b> 17:00 – 18:00,
                                      ngày 10/01/2025
                                    </li>
                                    <li style="line-height: 23.8px">
                                      <b>Thời gian sự kiện:</b> 17:00 – 22:00, ngày 10/01/2025
                                    </li>
                                    <li style="line-height: 23.8px">
                                      <b>Địa điểm:</b> The Adora Center, 431 Hoàng Văn Thụ, Phường
                                      4, Q. Tân Bình, TP.HCM
                                    </li>
                                  </ul>
                                  <p style="line-height: 170%; margin: 0px">
                                    Cùng Chubb Life Việt Nam trải nghiệm khoảnh khắc ý nghĩa này và
                                    lắng nghe những nhịp đập từ trái tim! 💓
                                  </p>
                                  <br />
                                  <p style="line-height: 170%; margin: 0px"></p>
                                  <p style="line-height: 170%; margin: 0px">
                                    Hẹn gặp Anh/Chị tại Annual Staff Party 2025
                                  </p>
                                  <br />
                                  <p style="line-height: 170%; margin: 0px"></p>
                                  <p style="line-height: 170%; margin: 0px">Trân trọng,</p>
                                  <p style="line-height: 170%; margin: 0px">
                                    Ban tổ chức Annual Staff Party 2025.
                                  </p>
                                  <br />
                                  <p style="line-height: 170%; margin: 0px"></p>
                                  <p style="line-height: 170%; margin: 0px">
                                    Mọi thắc mắc hoặc đề xuất vui lòng liên hệ:
                                  </p>
                                  <ul style="padding-left: 16px">
                                    <li style="line-height: 23.8px">
                                      HR – Trần Đức Minh |
                                      <a href="mailto:DucMinh.Tran@chubb.com"
                                        >DucMinh.Tran@chubb.com</a
                                      >
                                    </li>
                                    <li style="line-height: 23.8px">
                                      E&amp;A – Nguyễn Tấn Phát |
                                      <a href="mailto:DucMinh.Tran@chubb.com"
                                        >TanPhat.Nguyen@chubb.com</a
                                      >
                                    </li>
                                  </ul>
                                  <p style="line-height: 170%; margin: 0px"></p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>

            <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          </td>
        </tr>
      </tbody>
    </table>
    <!--[if mso]></div><![endif]-->
    <!--[if IE]></div><![endif]-->
  </body>
</html>
`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Annual Staff Party 2025 - Thông điệp đặc biệt từ đồng đội!',
    html: htmlContent,
    attachments: [
      {
        filename: 'image.png',
        content: qrCodeImage.split('base64,')[1],
        encoding: 'base64',
        cid: 'qrcode', // same cid value as in the html img src
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    insertLog({
      message: 'Error sending email',
      error: error,
      type: 'email',
      data: JSON.stringify({ to }),
    });
    console.error('Error sending email: ', error);
  }
}
