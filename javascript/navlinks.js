'use strict';

function showNavs (navs) {
    navs.forEach(function(item) {
    item.classList.remove('hidden');
  });
};

function hideNavs (navs) {
    navs.forEach(item => item.classList.add('hidden'));
};


try {
  const userName = document.querySelector('.loggedin');
  const logged = document.querySelector('.logged');
  const logOut = document.querySelector('.logout');
  const signIn = document.querySelector('.signin');
  const signUp = document.querySelector('.signup');
  const myPosts = document.querySelector('#mypage');
  const aboutHref = document.querySelector('#about');
  const contactHref = document.querySelector('#contact');
 

  const hiddenNavs = [userName, logOut, myPosts];
  const nonHiddenNavs = [signIn, signUp];

  myPosts.addEventListener('click', (e) => {
    location.href = '/myposts';
  });
  aboutHref.addEventListener('click', (e) => {
    location.href = '/about';
  });
  contactHref.addEventListener('click', (e) => {
    location.href = '/contact';
  });
  signUp.addEventListener('click', (e) => {
    location.href = '/signup';
  });
  signIn.addEventListener('click', (e) => {
    location.href = '/signin';
  });
  logOut.addEventListener('click', (e) => {
    location.href = '/logout';
  });

  console.log(logged);

  if (logged.innerText) {
     showNavs(hiddenNavs);
     hideNavs(nonHiddenNavs);
  } else {
     showNavs(nonHiddenNavs);
     hideNavs(hiddenNavs);
  };
} catch (e){
  console.log(e);
}
