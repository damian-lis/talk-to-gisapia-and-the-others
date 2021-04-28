import { Gisapia, NullCharacter, Hookin, Reduxon } from './index.js'
import {
  gisapiaScriptTalk,
  gisapiaEmail,
} from '/data/characters/gisapia/index.js'
import { hookinScriptTalk, hookinEmail } from '/data/characters/hookin/index.js'
import {
  reduxonScriptTalk,
  reduxonEmail,
} from '/data/characters/reduxon/index.js'
import { charNames } from '/data/global/names.js'

class CharsFactory {
  constructor(memory) {
    this.gisapia = new Gisapia(gisapiaScriptTalk, gisapiaEmail, memory)
    this.hookin = new Hookin(hookinScriptTalk, hookinEmail, memory)
    this.reduxon = new Reduxon(reduxonScriptTalk, reduxonEmail, memory)
    this.nullCharacter = new NullCharacter()
  }

  getChar(charName) {
    switch (charName) {
      case charNames.Gisapia:
        return this.gisapia
      case charNames.Hookin:
        return this.hookin
      case charNames.Reduxon:
        return this.reduxon
      default:
        return this.nullCharacter
    }
  }
}

export default CharsFactory
