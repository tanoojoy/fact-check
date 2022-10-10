export const homepageAuthTemplate = `
<style>
    body {
        margin: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    @keyframes mat-progress-spinner-stroke-rotate-100 {
        0% {
        stroke-dashoffset: 268.60617px;
        transform: rotate(0);
        }
        12.5% {
        stroke-dashoffset: 56.54867px;
        transform: rotate(0);
        }
        12.5001% {
        stroke-dashoffset: 56.54867px;
        transform: rotateX(180deg) rotate(72.5deg);
        }
        25% {
        stroke-dashoffset: 268.60617px;
        transform: rotateX(180deg) rotate(72.5deg);
        }
        25.0001% {
        stroke-dashoffset: 268.60617px;
        transform: rotate(270deg);
        }
        37.5% {
        stroke-dashoffset: 56.54867px;
        transform: rotate(270deg);
        }
        37.5001% {
        stroke-dashoffset: 56.54867px;
        transform: rotateX(180deg) rotate(161.5deg);
        }
        50% {
        stroke-dashoffset: 268.60617px;
        transform: rotateX(180deg) rotate(161.5deg);
        }
        50.0001% {
        stroke-dashoffset: 268.60617px;
        transform: rotate(180deg);
        }
        62.5% {
        stroke-dashoffset: 56.54867px;
        transform: rotate(180deg);
        }
        62.5001% {
        stroke-dashoffset: 56.54867px;
        transform: rotateX(180deg) rotate(251.5deg);
        }
        75% {
        stroke-dashoffset: 268.60617px;
        transform: rotateX(180deg) rotate(251.5deg);
        }
        75.0001% {
        stroke-dashoffset: 268.60617px;
        transform: rotate(90deg);
        }
        87.5% {
        stroke-dashoffset: 56.54867px;
        transform: rotate(90deg);
        }
        87.5001% {
        stroke-dashoffset: 56.54867px;
        transform: rotateX(180deg) rotate(341.5deg);
        }
        100% {
        stroke-dashoffset: 268.60617px;
        transform: rotateX(180deg) rotate(341.5deg);
        }
    }
    .project-name-image {
        margin-top: -15%;
        margin-bottom: 15%;
    }
</style>
<img src="/arcadier_supplychain/assets/images/horizon/logo_clarivate_connect.png" class='project-name-image' alt='cortellis supply chain logo' />
<svg class="spinner" focusable="false" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100" style="width: 100px; height: 100px;">
<circle cx="50%" cy="50%" r="45" style="
            animation-name: mat-progress-spinner-stroke-rotate-100;
            stroke-dasharray: 282.743px;
            stroke-width: 10%;
            fill: transparent;transform-origin: center;
            transition: stroke-dashoffset 225ms linear;
            stroke: #5e33bf;
            transition-property: stroke;
            animation-duration: 4s;
            animation-timing-function: cubic-bezier(.35,0,.25,1);
            animation-iteration-count: infinite;"></circle>
</svg>
<script>
    const isLocalEnv = location?.hostname?.search('localhost') !== -1;

    function redirectToAuthPage() {
        localStorage.removeItem('ls.token');
        if(!isLocalEnv) location.href = 'https://access.' + location.hostname.replace('www.', '') + '/login?app=scn&refferer=%2Farcadier_supplychain';
    }

    async function authorizeUser(lsToken, prefix) {
    const LOGIN_ERROR = 'Login rejected';
    const NO_REQUIRED_FIELDS_ERROR = 'Something is missing';

        try {
          const { userid: userId, token: cgiToken, email } = JSON.parse(lsToken) || {};
         
          if(!userId || !cgiToken) throw Error(NO_REQUIRED_FIELDS_ERROR);
         
          const requestConfig = { headers: { 'content-type': 'application/json'}, body: JSON.stringify({userId, cgiToken, email}), method: 'POST' };
          const cgiAuthResponse = await fetch(prefix + '/accounts/cgi-sign-in', requestConfig);
        
          if (cgiAuthResponse.status === 500) throw Error(LOGIN_ERROR);
        
          const { redirectUrl } = await cgiAuthResponse.json() || {};
          const arcadierAuthResponse = await fetch(redirectUrl);
        } catch (e) {
            if (e.message === LOGIN_ERROR || e.message === NO_REQUIRED_FIELDS_ERROR) redirectToAuthPage();
            console.log('error during authorization', e)
        }
    }

    const lsToken = localStorage.getItem('ls.token');
    const prefix = isLocalEnv ? '' : '/arcadier_supplychain';
    if (lsToken) {
        authorizeUser(lsToken, prefix)
        .then(() => location.reload())
        .catch(() => redirectToAuthPage());
    } else {
        redirectToAuthPage();
    }
</script>`;
