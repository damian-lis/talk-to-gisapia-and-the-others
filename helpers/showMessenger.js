export default () => {
  const messenger = document.querySelector('.messenger')
  console.log(messenger)
  // messenger.classList.add('fallFromAbove')
  messenger.style.animation = 'fallFromAbove 2s forwards'
}
