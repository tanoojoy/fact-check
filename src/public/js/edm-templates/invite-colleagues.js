const inviteColleagueTemplate = `
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<style>
	    @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,700,700i&display=swap");

	    .table-changes thead tr {
	        background-color: #ECEFF1
	    }

	    .table-changes th {
	        color: #626a6d;
	        font-weight: 700;
	        line-height: 14px;
	        padding: 10px 19px;
	        white-space: nowrap;
	    }

	    .table-changes td {
	        color: #2a2d35;
	        border-top: 1px solid #E2E4E6;
	        padding: 10px 19px;
	    }

	    .table-details th {
	        border-top: 1px solid #E2E4E6;
	        font-weight: 600;
	        padding: 10px 19px;
	    }

	    .table-details td {
	        border-top: 1px solid #E2E4E6;
	        padding: 10px 19px;
	    }

	    .table-details tr.first-row td, .table-details tr.first-row th {
	        border-top: none;
	    }
	</style>

	<body style="color: #2A2D35; background-color: #f4f4f4;font-family: 'Source Sans Pro', sans-serif;font-size: 14px;">
		<div>{{ InviteComment }}</div><br />
		<table width="600" cellSpacing="0" cellPadding="0" className="container" align="center">
		    <tr>
		        <td align="center" className="logo-container" style="height: 82px; width:600px; background-color: #FFFFFF; box-shadow: 0 2px 8px 0 rgba(42,45,53,0.1);" >
		            <img alt="Cortellis Supply Chain Network" width="330" height="28"
		                 src={{ LogoLink }}
		                 style="display: block; margin: auto;" />
		        </td>
		    </tr>
		    <tr>
		        <td className="info-container" style="text-align: center;background-color: #EBEBEB;">
		            <table width="435" border="0" cellSpacing="0" cellPadding="5" align="center">
		                <tr>
		                    <td style="text-align: center; padding-top: 24px">
		                            <span style="color: #2A2D35; font-size: 14px; letter-spacing: 0; line-height: 20px; text-align: center;">
		                                This email was sent by {{ InviteUserEmail }}
		                            </span>
		                    </td>
		                </tr>
		                <tr>
		                    <td style="text-align: center; padding-top: 20px">
		                            <span style="color: #2A2D35; font-size: 14px; font-weight: bold; letter-spacing: 0; line-height: 20px;text-align: center;">
		                                Join me on Cortellis Supply Chain Network
		                            </span>
		                    </td>
		                </tr>
		                <tr>
		                    <td width="435" style="text-align: center; padding-top: 20px; display: block; width: 435px">
		                            <span style="color: #2A2D35; font-size: 13px; font-weight: 600; letter-spacing: 0; line-height: 18px; text-align: center;">
		                                It is <a href={{ RegisterLink }}>free to register</a> and allows buyers and sellers along the pharma supply chain to identify potential partners, make contact, negotiate deals and monitor companies of interest.
		                            </span>
		                    </td>
		                </tr>
		                <tr>
		                    <td style="text-align: center; padding: 18px 0 30px 0; display: block; width: 435px">
		                            <span width="435" style="color: #2A2D35; font-size: 13px; font-weight: 600; letter-spacing: 0; line-height: 18px; text-align: center;">
		                               <a href={{ RegisterLink }}>Sign up now for instant access</a>, or if you’re already a Cortellis customer, you can <a
		                                    href={{ AccessLink }}>get access</a> with your existing login credentials.
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
		                                         src={{ FooterLogoLink }} />
		                                </td>
		                            </tr>
		                            <td align="center" width="247" style="text-align: center; padding: 16px 0px; display: block; width: 247px; margin: auto; color: #FFFFFF; font-size: 10px; letter-spacing: 0;line-height: 13px;">
		                                This message has been sent to you from a user within Cortellis Supply Chain Network
		                            </td>
		                            <tr align="top" align="center">
		                                <td style="padding: 0 0 20px 0;font-family: 'Source Sans Pro', sans-serif;">
		                                        <span>
		                                       <a style="text-decoration: none;font-weight:bold; color: white;font-size: 9px;"
		                                          href={{ MainPageLink }}
		                                          target="_blank"><font color="#ffffff">Cortellis Supply Chain Network</font></a>
		                                        </span>
		                                    <span style="text-decoration: none; color: #ffffff;font-size: 12px;padding: 0px 5px">|</span>
		                                    <span>
		                                    	<a style="text-decoration: none; font-weight:bold;color: white;font-size: 9px;"
		                                          href="https://support.clarivate.com/LifeSciences/s/" target="_blank"><font
		                                               color="#ffffff">Customer Care</font>
	                                            </a>
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

export default inviteColleagueTemplate;