'use strict';

try {
  const openWindow = document.querySelector('.openWindow');
  const overlay = document.querySelector('.overlay');
  const btnCloseModal = document.querySelector('.close-modal');
  const divOpenModal = document.querySelectorAll('.show-modal');

  const windowTitle = document.querySelector('.windowTitle');
  const windowConent = document.querySelector('.windowConent');

  const openModal = function () {

    openWindow.classList.remove('hidden');
    overlay.classList.remove('hidden');
  };
  
  const closeModal = function () {
    openWindow.classList.add('hidden');
    overlay.classList.add('hidden');
  };


  for (let i = 0; i < divOpenModal.length; i++) {

    divOpenModal[i].addEventListener('click', openModal);
    
    divOpenModal[i].addEventListener('click', function() {
      const title = divOpenModal[i].childNodes[1].innerText;
      const content = divOpenModal[i].childNodes[3].innerText;
    
      windowTitle.innerText = title;
      windowConent.innerText = content.substring(0,1000) + '...';
    });
  };

  btnCloseModal.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    // console.log(e.key);

    if (e.key === 'Escape' && !openWindow.classList.contains('hidden')) {
      closeModal();
    }
  });
} catch (error) {
  console.log(error);
};
