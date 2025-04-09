
console.log("✅ JS chargé");

window.showPage = function(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) section.classList.add('active');
  else console.warn("Section introuvable :", id);
};
