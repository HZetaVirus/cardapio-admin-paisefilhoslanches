// Previne o banner de instalação do Chrome
window.addEventListener('beforeinstallprompt', (e) => {
  // Previne o Chrome de mostrar o prompt automático
  e.preventDefault();
  return false;
});

// Se precisar habilitar a instalação manualmente depois
export const enableInstall = () => {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
  });

  return async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      return outcome;
    }
    return null;
  };
};
