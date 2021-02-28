import { sendAboutUser } from './actions/dataActions.js'
import {
  memory,
  SelectCharUI,
  CharsFactory,
  InputPanelUI,
  Screen,
} from './objects/index.js'

import {
  showReloadButton,
  pageReload,
  showMessenger,
  hideMessenger,
} from '../helpers/index.js'
import {
  charNames,
  answerVariants,
  categories,
  buttons,
  communiques,
  subscriberTypes,
} from './data/globalNames.js'

document.addEventListener('DOMContentLoaded', function () {
  const selectCharUi = new SelectCharUI(charNames, '.selectCharUI-container')
  const charsFactory = new CharsFactory()
  const inputPanelUI = new InputPanelUI('.messenger-input-container')
  const screen = new Screen('.messenger-screen-container')

  //Select character part
  const handleSelectChar = (charName) => {
    const chosenChar = charsFactory.getChar(charName)
    memory.setSelectedChar(chosenChar)
  }

  selectCharUi.subscribe(handleSelectChar, subscriberTypes.selectChar)

  const checkSelectedChar = () => {
    const chosenChar = memory.getChar()

    if (!chosenChar) {
      return alert(communiques.selectChar)
    } else if (chosenChar.name === null) {
      memory.setSelectedChar(null)
      alert('Dostepna w przyszłości')
      return selectCharUi.removeActive(selectCharUi.getCharButtons())
    }

    selectCharUi.deleteButton(buttons.types.start)

    showMessenger()
    handleCharTalking()
  }

  //Character talking process
  const handleCharTalking = async () => {
    let userMessage = memory.getUserMessage()
    const conversationStep = memory.getConversationStep()
    const chosenChar = memory.getChar()
    const currentCategory = chosenChar.getCurrentCategory(conversationStep)

    if (memory.getIsFinish()) {
      if (userMessage === 'zapisz') {
        sendAboutUser(chosenChar.getMemoryAboutUser())
      }
      return setTimeout(() => {
        hideMessenger()
        showReloadButton(pageReload)
      }, 2000)
    }

    if (currentCategory === categories.summary) {
      memory.setIsFinish(true)
      const scriptCategories = chosenChar.getScriptCategories()
      chosenChar.addAboutUserToMessages(scriptCategories, conversationStep)
    }

    let charMessages = chosenChar.getScriptMessages(conversationStep)

    //Part when character wants to save new word in his memory
    if (memory.getIsListening()) {
      userMessage = chosenChar.setUpperLetter(userMessage)
      chosenChar.addToMemoryAboutUser(currentCategory, userMessage)
      if (currentCategory === categories.origin) {
        chosenChar.addUserMessageToAnswer(userMessage, conversationStep, {
          place: 'start',
          where: answerVariants.isInMemory,
        })
      } else {
        chosenChar.addUserMessageToAnswer(userMessage, conversationStep, {
          place: 'end',
          where: answerVariants.addedToMemory,
        })
      }
      charMessages = chosenChar.getScriptAnswers(conversationStep, {
        from: answerVariants.addedToMemory,
      })
      memory.setUserMessage('')
      memory.setIsCallAgain(true)
      memory.setIsListening(false)
    }
    // Part where character checks typed word in his memory
    else {
      if (userMessage) {
        const elementFromMemory = chosenChar.checkUserMessageInMemory(
          currentCategory,
          userMessage
        )

        if (elementFromMemory) {
          chosenChar.addToMemoryAboutUser(currentCategory, elementFromMemory)
          if (
            currentCategory === categories.origin ||
            currentCategory === categories.hobby
          ) {
            chosenChar.addUserMessageToAnswer(
              elementFromMemory,
              conversationStep,
              {
                place: 'start',
                where: answerVariants.isInMemory,
              }
            )
          } else {
            chosenChar.addUserMessageToAnswer(
              elementFromMemory,
              conversationStep,
              {
                place: 'end',
                where: answerVariants.isInMemory,
              }
            )
          }

          charMessages = chosenChar.getScriptAnswers(conversationStep, {
            from: answerVariants.isInMemory,
          })
          memory.setUserMessage('')
          memory.setIsCallAgain(true)
        } else {
          charMessages = chosenChar.getScriptAnswers(conversationStep, {
            from: answerVariants.isNotInMemory,
          })
          memory.setIsListening(true)
        }
      }
    }

    //Part about character typing

    for (let i = 0; i < charMessages.length; i++) {
      const charMessage = charMessages[i]

      let timeForTyping = chosenChar.countTimeForTyping(charMessage.length, 80)
      const typingQuantity = chosenChar.countTypingQuantity(charMessage.length)

      for (let i = 0; i < typingQuantity; i++) {
        if (i >= 1) {
          timeForTyping = chosenChar.changeTimeForTyping(timeForTyping)
        }

        await chosenChar.mustThink(500)
        await screen.showTyping(timeForTyping)
      }

      const messageContainer = screen.createMessageContainer()
      const message = screen.createMessage(charMessage, chosenChar.name)
      const avatar = screen.createAvatar(chosenChar.avatar)

      screen.attachToMessageContainer(messageContainer, message, avatar)
      screen.attachToScreen(messageContainer)
    }

    if (memory.getIsCallAgain()) {
      memory.setIsCallAgain(false)
      memory.increaseConversationStep()
      return handleCharTalking()
    }

    inputPanelUI.activatePanel()
  }

  selectCharUi.subscribe(checkSelectedChar, subscriberTypes.charTalking)

  //User talking process
  const handleUserTalking = (userMessage) => {
    memory.setUserMessage(userMessage)

    const messageContainer = screen.createMessageContainer()
    const message = screen.createMessage(userMessage, 'user')
    screen.attachToMessageContainer(messageContainer, message)
    screen.attachToScreen(messageContainer)

    inputPanelUI.deactivatePanel()
    handleCharTalking()
  }

  inputPanelUI.subscribe(handleUserTalking)
})
