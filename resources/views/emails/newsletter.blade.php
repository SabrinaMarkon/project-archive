<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9faf8;">
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 20px auto;">
        <tbody>
            <tr>
                <td>
                    <!-- Main Content -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; padding: 40px 30px;">
                        <tbody>
                            <tr>
                                <td style="color: #333333; font-size: 16px; line-height: 1.6;">
                                    {!! $htmlBody !!}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Footer -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f9faf8; border-top: 1px solid #eeeeee;">
                        <tbody>
                            <tr>
                                <td style="padding: 20px 30px; text-align: center;">
                                    <p style="margin: 0; font-size: 12px; color: #666666;">
                                        <a href="{{ $unsubscribeUrl }}" style="color: #666666; text-decoration: underline;">Unsubscribe from this newsletter</a>
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>
