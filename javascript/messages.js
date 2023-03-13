'use strict';

const showMessage = function (tag) {

  tag.classList.remove('hidden');
};

const hideMessage = function (tag) {

  tag.classList.add('hidden');
};

try {
  const SignIn = document.querySelector('.errorSignIn');
  if (SignIn.innerText != null) {
    showMessage(SignIn);
  };
} catch (e) {
  console.log(e);
};

try {
  const SignUp = document.querySelector('.errorSignUp');
  if (SignUp.innerText != null) {
    showMessage(SignUp);
  };
} catch (e) {
  console.log(e);
};

try {
  const Searching = document.querySelector('.errorSearch');
  if (Searching.innerText != null) {
    showMessage(Searching);
  };
} catch (e) {
  console.log(e);
};

try {
  const Publish = document.querySelector('.errorCompose');
  if (Publish.innerText != null) {
    showMessage(Publish);
  };
} catch (e) {
  console.log(e);
};

try {
  const Deleting = document.querySelector('.errorDelete');
  if (Deleting.innerText != null) {
    showMessage(Deleting);
  };
} catch (e) {
  console.log(e);
};


