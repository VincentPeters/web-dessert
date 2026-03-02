(() => {
  const btn = document.querySelector('.theme-toggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = matchMedia('(prefers-color-scheme:dark)').matches;
  let dark = stored ? stored === 'dark' : prefersDark;
  function apply() {
    document.documentElement.className = dark ? 'dark' : 'light';
    btn.textContent = dark ? 'sun' : 'moon';
  }
  apply();
  btn.addEventListener('click', () => {
    dark = !dark;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    apply();
  });
})();
