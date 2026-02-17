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

  // Tokenomics pie chart (Chart.js must be loaded before this script)
  const tokenCanvas = document.getElementById('tokenChart');
  if (tokenCanvas && window.Chart) {
    const ctx = tokenCanvas.getContext('2d');

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Locked 95%', 'Marketing 3%', 'Team 1%', 'Dev 1%'],
        datasets: [{
          data: [95, 3, 1, 1],
          backgroundColor: ['#10B981', '#F97316', '#06B6D4', '#EF4444'],
          borderColor: '#0f172a',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
            }
          }
        },
        cutout: '55%'
      }
    });

    // --- dynamic mini pie using the same data as the chart ---
    (function renderMiniPieFromLegend() {
      const items = Array.from(document.querySelectorAll('.legend-item'));
      const miniPie = document.getElementById('miniPie');
      if (!items.length || !miniPie) return;

      const total = items.reduce((s, it) => s + Number(it.dataset.value || 0), 0) || 100;
      let start = 0;
      const segments = [];

      items.forEach(it => {
        const value = Number(it.dataset.value || 0);
        const deg = (value / total) * 360;
        const color = it.dataset.color || window.getComputedStyle(it.querySelector('span')).backgroundColor;
        const segStart = start;
        const segEnd = start + deg;
        segments.push(`${color} ${segStart}deg ${segEnd}deg`);
        start = segEnd;

        // ensure displayed percentage matches data (safe)
        const valueEl = it.querySelector('.legend-value');
        if (valueEl) valueEl.textContent = `${value}%`;
      });

      const gradient = `conic-gradient(${segments.join(', ')})`;
      miniPie.style.background = gradient;
    })();
  }
});