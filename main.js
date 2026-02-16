// ...existing code...
// Minimal JS: mobile nav, connect-wallet (Phantom/Solana fallback), small UI touches

document.addEventListener('DOMContentLoaded', () => {
  // year in footer
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // mobile menu toggle
  const mobileBtn = document.getElementById('mobileBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // connect wallet (Phantom / Solana) - graceful fallback
  async function connectWallet() {
    try {
      if (window.solana && window.solana.isPhantom) {
        const resp = await window.solana.connect();
        const publicKey = resp.publicKey.toString();
        alert('Connected: ' + publicKey);
        setConnectedUI(publicKey);
      } else if (window.ethereum) {
        // hint for Ethereum wallets (Metamask)
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        alert('Connected: ' + accounts[0]);
        setConnectedUI(accounts[0]);
      } else {
        // fallback: show helpful message
        const url = 'https://phantom.app/'; // user can install Phantom
        if (confirm('No compatible wallet detected. Open wallet install page?')) {
          window.open(url, '_blank');
        }
      }
    } catch (err) {
      console.error('connect error', err);
      alert('Connection failed: ' + (err.message || err));
    }
  }

  function setConnectedUI(addr) {
    const btns = [document.getElementById('connectBtn'), document.getElementById('connectBtnMobile')];
    btns.forEach(b => {
      if (!b) return;
      b.textContent = addr.slice(0, 6) + '...' + addr.slice(-4);
      b.classList.remove('bg-emerald-500');
      b.classList.add('bg-slate-700');
      b.disabled = true;
    });
  }

  const connectBtn = document.getElementById('connectBtn');
  const connectBtnMobile = document.getElementById('connectBtnMobile');
  if (connectBtn) connectBtn.addEventListener('click', connectWallet);
  if (connectBtnMobile) connectBtnMobile.addEventListener('click', connectWallet);
});