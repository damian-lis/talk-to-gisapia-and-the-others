import SelectCharUI from './SelectCharUI.js'
import Memory from './Memory.js'

const selectCharUi = new SelectCharUI('body')
const charsFactory = new CharsFactory()
const memory = new Memory()

selectCharUi.subscribe((charName) => {
  const character = charsFactory.getCharacter(charName)
  memory.setSelectedChar(character)
})

const startTalkingBtn = document.querySelector('#start-talking')

startTalkingBtn.addEventListener('click', () => {
  const character = memory.getCharacter()

  if (!character) {
    return alert('Wybierz rozmówcę!')
  }
})
