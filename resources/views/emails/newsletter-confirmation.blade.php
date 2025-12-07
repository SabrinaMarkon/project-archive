<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #3d3d3d;
            background-color: #f9faf8;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #7a9d7a;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 40px 30px;
        }
        .content p {
            margin: 0 0 20px 0;
            color: #5a5a5a;
        }
        .button {
            display: inline-block;
            background-color: #7a9d7a;
            color: white !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            padding: 20px 30px;
            background-color: #f9faf8;
            border-top: 1px solid #e5e3df;
            text-align: center;
            font-size: 12px;
            color: #7a7a7a;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 Confirm Your Subscription</h1>
        </div>

        <div class="content">
            <p>Thanks for subscribing to the Sabrina Markon newsletter!</p>

            <p>Click the button below to confirm your subscription and start receiving updates about new projects, tutorials, and insights:</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="{{ $confirmationUrl }}" class="button">Confirm Subscription</a>
            </p>

            <p style="color: #7a7a7a; font-size: 14px;">
                This link expires in 24 hours. If you didn't subscribe, you can safely ignore this email.
            </p>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} Sabrina Markon. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
