// import io from 'socket.io'
import { SpellManager } from '@magickml/engine'
import { buildMagickInterface } from './buildMagickInterface'

import {v4} from 'uuid'

const handleSockets = (app: any) => {
  return (io: any) => {
    // Another gross 'any' here
    io.on('connection', async function (socket: any) {
      console.log('CONNECTION ESTABLISHED')
      // Disable auth for now
      // const sessionId = socket.handshake.headers.authorization.split(' ')[1]

      // if (!sessionId) throw new Error('No session id provided for handshake')
      // Authenticate with the auth headers here

      // hard coding user for now.
      const id = v4()
      const user = {
        id: id,
      }
      // Attach the user info to the params or use in services
      socket.feathers.user = user

      const magickInterface = buildMagickInterface({})

      // probably need to move interface instantiation into the runner rather than the spell manager.
      // Doing it this way makes the interface shared across all spells
      // Which messes up state stuff.
      const spellManager = new SpellManager({ socket, magickInterface })

      app.userSpellManagers.set(user.id, spellManager)

      socket.emit('connected')
    })
  }
}

export default handleSockets
