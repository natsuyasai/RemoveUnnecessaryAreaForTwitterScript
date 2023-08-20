// ==UserScript==
// @name         Twitterの不要領域削除
// @namespace    https://github.com/natsuyasai/
// @version      0.2
// @description 投稿欄とサイドバーをメインタブ以外で非表示にする
// @author       natsuyasai
// @match        https://twitter.com
// @match        https://twitter.com/notifications
// @match        https://twitter.com/home
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @supportURL   https://github.com/natsuyasai/RemoveUnnecessaryAreaForTwitterScript/
// @license MIT
// ==/UserScript==

const EnableTabName = 'main';

/**
 * 有効なタブか
 * @return {boolean} 有効なタブか
 */
function isEnabledTab() {
  // aタグの中からタグ要素かつ現在アクティブになっている要素を取得し、クリックイベントを発火させる
  const tab = document.getElementsByTagName('a');
  for (let i = 0; i < tab.length; i++) {
    const elem = tab[i];
    const isTab = elem.hasAttribute('role') && elem.getAttribute('role') === 'tab';
    if (!isTab) {
      continue;
    }
    const isSelectedTabElement = elem.hasAttribute('aria-selected') && elem.getAttribute('aria-selected') === 'true';
    if (!isSelectedTabElement) {
      continue;
    }
    if (elem.children[0].children[0].children[0].textContent === EnableTabName) {
      return true;
    }
  }
  return false;
}

/**
 * debounce
 * @param {*} func 実行する関数
 * @param {number} delay 遅延時間
 * @return {*} debounce処理
 */
function debounce(func, delay) {
  let timerId;

  return function (...args) {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * URL変更検知
 * DOM要素の変更を検知してURLが変わったかを確認する
 */
function watchURLChange() {
  const debounced = debounce(() => {
    changeTweetInputVisibility();
    changeSidebarVisibility();
  }, 500);
  const observer = new MutationObserver(debounced);
  const mainElement = document.getElementsByTagName('main');
  const config = {childList: true, subtree: true};
  if (mainElement.length > 0) {
    observer.observe(mainElement[0], config);
  } else {
    setTimeout(() => {
      watchURLChange();
    }, 1000);
  }
}

/**
 * 入力欄表示状態更新
 * @return {void} void
 */
function changeTweetInputVisibility() {
  // プログレスバー指定の要素が入力部分しかないため、
  // プログレスバーを探して、その親の表示状態を切り替える
  const divs = document.getElementsByTagName('div');
  let inputRootElement = null;
  for (let index = 0; index < divs.length; index++) {
    const element = divs[index];
    if (element.role !== 'progressbar') {
      continue;
    }
    inputRootElement = element.parentElement;
    break;
  }
  if (inputRootElement === null) {
    return;
  }
  if (isEnabledTab()) {
    inputRootElement.style.display = 'initial';
  } else {
    inputRootElement.style.display = 'none';
  }
}

/**
 * サイドバー表示状態更新
 * @return {void} void
 */
function changeSidebarVisibility() {
  // プログレスバー指定の要素が入力部分しかないため、
  // プログレスバーを探して、その親の表示状態を切り替える
  const header = document.getElementsByTagName('header');
  let sidebarElement = null;
  for (let index = 0; index < header.length; index++) {
    const element = header[index];
    if (element.role !== 'banner') {
      continue;
    }
    sidebarElement = element;
    break;
  }
  if (sidebarElement === null) {
    return;
  }
  if (isEnabledTab()) {
    sidebarElement.style.display = 'initial';
  } else {
    sidebarElement.style.display = 'none';
  }
}

(function() {
  'use strict';
  changeTweetInputVisibility();
  changeSidebarVisibility();
  watchURLChange();
})();
