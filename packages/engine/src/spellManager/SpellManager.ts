import io from 'socket.io'

import { EngineContext, Spell } from '../types'
import SpellRunner from './SpellRunner'

type SpellManagerArgs = {
  magickInterface: EngineContext
  socket?: io.Socket
  cache?: boolean
}

export default class SpellManager {
  spellRunnerMap: Map<string, SpellRunner> = new Map()
  socket?: io.Socket
  cache: boolean
  magickInterface: EngineContext

  constructor({
    magickInterface,
    socket = undefined,
    cache = false,
  }: SpellManagerArgs) {
    this.socket = socket
    this.magickInterface = magickInterface

    this.cache = cache
  }

  // This getter will overwrite the standard runSpell with a new one.
  // this runSpell will add spells to the cache
  processMagickInterface(magickInterface): EngineContext {
    if (!this.cache) return magickInterface

    const runSpell: EngineContext['runSpell'] = async (
      flattenedInputs,
      spellId
    ) => {
      if (this.getSpellRunner(spellId)) {
        const outputs = await this.run(spellId, flattenedInputs)
        return outputs
      }

      const spell = await magickInterface.getSpell(spellId)

      if (!spell) {
        throw new Error(`No spell found with name ${spellId}`)
      }

      await this.load(spell)

      const outputs = await this.run(spellId, flattenedInputs)

      return outputs
    }

    return {
      ...magickInterface,
      runSpell,
    }
  }

  getSpellRunner(spellId: string) {
    return this.spellRunnerMap.get(spellId)
  }

  hasSpellRunner(spellId: string) {
    return this.spellRunnerMap.has(spellId)
  }

  clear() {
    this.spellRunnerMap = new Map()
  }

  async load(spell: Spell, overload = false) {
    if (!spell) throw new Error('No spell provided to load')
    if (this.spellRunnerMap.has(spell.name) && !overload)
      return this.getSpellRunner(spell.name)

    const spellRunner = new SpellRunner({
      magickInterface: this.magickInterface,
      socket: this.socket,
    })

    await spellRunner.loadSpell(spell)

    this.spellRunnerMap.set(spell.name, spellRunner)

    return spellRunner
  }

  async run(spellId: string, inputs: Record<string, any>) {
    const runner = this.getSpellRunner(spellId)
    const result = await runner?.defaultRun(inputs)

    return result
  }
}
