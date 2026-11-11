(() => {
  const dialog=document.createElement('dialog');dialog.className='image-lightbox';dialog.setAttribute('aria-label','Imagem do projeto ampliada');
  const header=document.createElement('header'),title=document.createElement('span'),close=document.createElement('button'),img=document.createElement('img'),download=document.createElement('a');
  close.type='button';close.textContent='Fechar ×';download.textContent='Abrir imagem original ↗';download.target='_blank';download.rel='noopener noreferrer';header.append(title,close);dialog.append(header,img,download);document.body.append(dialog);
  let opener;
  document.querySelectorAll('[data-enlarge]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();opener=link;const source=link.querySelector('img');img.src=link.href;img.alt=source.alt;title.textContent=source.alt;download.href=link.href;dialog.showModal();}));
  close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
})();
