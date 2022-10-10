const shareProductTemplate = `
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<style>
	    @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,700,700i&display=swap');
	</style>

	<body style="color: #2A2D35; background-color: #F1F1F1;font-family: 'Source Sans Pro', sans-serif;font-size: 14px;">
		<div>{{ ProductComment }}</div><br />
		<table width="600" cellSpacing="0" cellPadding="0" className="container" align="center">
		    <tr>
		        <td align="center" className="logo-container" style="height: 82px; width:600px; background-color: #FFFFFF; box-shadow: 0 2px 8px 0 rgba(42,45,53,0.1);position: relative;" >
		            <img alt="Cortellis Supply Chain Network" width="330" height="28"
		                 src={{ LogoLink }}
		                 style="display: block; margin: auto;">
		        </td>
		    </tr>
		    <tr>
		        <td className="info-container" style="text-align: left;background-color: #F8F8F8;">
		            <table width="520" border="0" cellSpacing="0" cellPadding="5" align="center">
		                <tr>
		                    <td style="text-align: center; padding-top: 24px;width: 480px;margin: 0 auto;display: block;">
		                        <span style="color: #2A2D35; font-size: 16px; letter-spacing: 0; line-height: 20px;font-weight: 600;">Explore <a href="{{ AccessLink }}" target="_blank" style="color: #5E33BF;">{{ ProductName }}</a> ({{ CompanyName }}) product insights on <a href="{{ MainPageLink }}" target="_blank" style="color: #5E33BF;">Cortellis Supply Chain Network</a>
		                        </span>
		                    </td>
		                </tr>
		                <tr>
		                    <td style="text-align: left; padding-top: 12px">
		                            <span style="color: #2A2D35; font-size: 14px; letter-spacing: 0; line-height: 20px; text-align: left;">
		                                This email was sent by <span style="color: #6236FF;text-decoration: underline;">{{ InviteUserEmail }}</span>
		                            </span>
		                    </td>
		                </tr>
		                <tr>
		                    <td style="text-align: left; padding-top: 10px">
		                        <span style="color: #2A2D35; font-size: 14px; letter-spacing: 0; line-height: 20px;text-align: left;">
		                            Visit the <a href={{ AccessLink }} style="color: #6236FF;font-weight: 600;">{{ CompanyName }} {{ ProductName }}</a> product profile to view the data and insights, plus search from 72K+ manufacturers and marketers of:</span>
		                        <ul style="margin-bottom: 0px;font-size: 14px;color: #2A2D35;line-height: 20px;margin-top: 10px;">
		                            <li>APIs</li>
		                            <li>Finished dose products</li>
		                            <li>Inactive ingredients</li>
		                            <li>Intermediates/reagents</li>
		                        </ul>
		                    </td>
		                </tr>                <tr>
		                    <td width="520" style="text-align: left; padding-top: 12px; display: block; width: 520px">
		                            <span style="color: #2A2D35; font-size: 13px; letter-spacing: 0; line-height: 18px; text-align: left;">
		                                <a href={{ MainPageLink }} target="_blank" style="color: #6236FF;font-weight: 600;">Cortellis Supply Chain Network</a> allows buyers and sellers along the pharma supply chain to identify potential partners, make contact, negaotiate deals and monitor companies of interest.
		                            </span>
		                    </td>
		                </tr>
		                <tr>
		                    <td style="text-align: left; padding-top: 12px;padding-bottom: 30px; display: block; width: 520px">
		                        <span width="520px" style="color: #2A2D35; font-size: 13px;letter-spacing: 0; line-height: 18px; text-align: left;">
		                            <a href={{ RegisterLink }} style="color: #6236FF;font-weight: 600;">Sign up now for instant access</a>, or if you’re already a Cortellis or Cortellis Generics Intelligence customer you can <a
		                                href={{ AccessLink }} style="color: #6236FF;font-weight: 600;">login</a> with your existing login credentials.
		                        </span>
		                    </td>
		                </tr>
		            </table>
		        </td>
		    </tr>
		    <tr>
		        <td className="bottom-container"
		            style="font-family: 'Source Sans Pro', sans-serif;background-color: #121314;color: white;font-size: 9px;box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);">
		            <table width="600" border="0" cellSpacing="0" cellPadding="0" align="center">
		                <tr>
		                    <td style="padding: 0 15px;">
		                        <table className="table-footer" width="247" border="0" cellSpacing="0" cellPadding="0" align="center">
		                            <tr valign="top">
		                                <td align="center" style="padding: 23px 0 0 0;">
		                                    <img alt="Clarivate Analytics solution" width="106" height="18"
		                                         style="background-color: transparent!important;width: 106px;height: 18px;"
		                                         src={{ FooterLogoLink }}>
		                                </td>
		                            </tr>
		                            <td align="center" width="247" style="text-align: center; padding: 16px 0px; display: block; width: 247px; margin: auto; color: #FFFFFF; font-size: 10px; letter-spacing: 0;line-height: 13px;">
		                                This message has been sent to you from a user within Cortellis Supply Chain Network
		                            </td>
		                            <tr valign="top" align="center">
		                                <td style="padding: 0 0 20px 0;font-family: 'Source Sans Pro', sans-serif;">
		                                        <span>
		                                       <a style="text-decoration: none;font-weight:bold; color: white;font-size: 10px;"
		                                          href={{ MainPageLink }}
		                                          target="_blank"><font color="#ffffff">Cortellis Supply Chain Network</font></a>
		                                        </span>
		                                    <span
		                                            style="text-decoration: none; color: #ffffff;font-size: 12px;padding: 0px 5px">|</span>
		                                    <span>
		                                       <a style="text-decoration: none; font-weight:bold;color: white;font-size: 10px;"
		                                          href="https://support.clarivate.com/LifeSciences/s/" target="_blank"><font
		                                               color="#ffffff">Customer Care</font></a>
		                                        </span>
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		            </table>
		        </td>
		    </tr>
		</table>
	</body>
`;

export default shareProductTemplate;